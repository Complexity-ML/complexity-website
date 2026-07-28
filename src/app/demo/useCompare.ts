"use client";

import { useState, useRef, useCallback } from "react";
import type { SamplingParams } from "./useChat";
import { ENDPOINTS, MAINTENANCE } from "./config";
import { useEndpointHealth } from "./useEndpointHealth";
import type { HealthStatus } from "./useEndpointHealth";

export interface CompareMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompareResult {
  prompt: string;
  dense: { content: string; tokens: number; elapsed: number };
  chat: { content: string; tokens: number; elapsed: number };
}

const DEFAULT_PARAMS: SamplingParams = {
  temperature: 0.7,
  maxTokens: 512,
  topK: 50,
  topP: 0.9,
  repetitionPenalty: 1.3,
  frequencyPenalty: 0.3,
};

const COMPARE_BASE = ENDPOINTS.compare.replace(/\/+$/, "");
const DENSE_BASE = ENDPOINTS.dense.replace(/\/+$/, "");
const ROUTED_BASE = ENDPOINTS["TR-MoE"].replace(/\/+$/, "");
const PROXY_TIMEOUT_MS = 8_000;

interface CompareChunk {
  type: "tr_moe" | "dense";
  text?: string;
  error?: string;
}

/** Parse the comparison proxy SSE stream. */
async function* readSSE(response: Response): AsyncGenerator<CompareChunk> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") return;
        try {
          const data = JSON.parse(payload) as CompareChunk;
          if (data.type === "tr_moe" || data.type === "dense") yield data;
        } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Parse the OpenAI-compatible SSE stream exposed by each model Space. */
async function* readModelSSE(response: Response): AsyncGenerator<string> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") return;
        try {
          const data = JSON.parse(payload);
          const content = data.choices?.[0]?.delta?.content ?? data.choices?.[0]?.text ?? "";
          if (content) yield content;
        } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function useCompare() {
  const [results, setResults] = useState<CompareResult[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SamplingParams>(DEFAULT_PARAMS);
  const proxyHealth = useEndpointHealth(ENDPOINTS.compare, MAINTENANCE.compare);
  const routedHealth = useEndpointHealth(ENDPOINTS["TR-MoE"], MAINTENANCE.compare);
  const denseHealth = useEndpointHealth(ENDPOINTS.dense, MAINTENANCE.compare);
  const healthStatus: HealthStatus = routedHealth === "offline" || denseHealth === "offline"
    ? "offline"
    : routedHealth === "ok" && denseHealth === "ok"
      ? "ok"
      : "degraded";

  const [denseContent, setDenseContent] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [denseTokens, setDenseTokens] = useState(0);
  const [chatTokens, setChatTokens] = useState(0);

  const abortRef = useRef<AbortController | null>(null);


  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setLoading(false);
  }, []);

  const clearResults = useCallback(() => {
    stopGeneration();
    setResults([]);
    setError(null);
    setDenseContent("");
    setChatContent("");
    setDenseTokens(0);
    setChatTokens(0);
  }, [stopGeneration]);

  const sendMessage = useCallback(async (directText?: string, inferenceText?: string) => {
    const text = (directText ?? input).trim();
    if (!text || loading || streaming || MAINTENANCE.compare || healthStatus === "offline") return;
    const prompt = (inferenceText ?? text).trim();

    setError(null);
    setInput("");
    setLoading(true);
    setDenseContent("");
    setChatContent("");
    setDenseTokens(0);
    setChatTokens(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(false);
      setStreaming(true);

      const body = {
        prompt,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_k: params.topK,
        top_p: params.topP,
        repetition_penalty: params.repetitionPenalty,
        frequency_penalty: params.frequencyPenalty,
        stream: true,
      };

      let denseAccum = "";
      let moeAccum = "";
      let finalDenseTokens = 0;
      let finalMoeTokens = 0;
      let denseElapsed = 0;
      let moeElapsed = 0;

      const t0 = performance.now();
      let proxyCompleted = false;
      let proxyProducedOutput = false;

      if (proxyHealth !== "offline") {
        const proxyController = new AbortController();
        const cancelProxy = () => proxyController.abort();
        controller.signal.addEventListener("abort", cancelProxy, { once: true });
        const proxyTimeout = setTimeout(cancelProxy, PROXY_TIMEOUT_MS);
        try {
          const response = await fetch(`${COMPARE_BASE}/v1/compare`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: proxyController.signal,
          });
          if (response.ok) {
            for await (const chunk of readSSE(response)) {
              if (controller.signal.aborted) break;
              // The timeout protects only the connection/first-token phase.
              // Once either model starts streaming, allow the SSE generation
              // to continue for as long as the user keeps it running.
              if (!proxyProducedOutput) clearTimeout(proxyTimeout);
              if (chunk.error) throw new Error(`${chunk.type}: ${chunk.error}`);
              if (!chunk.text) continue;
              proxyProducedOutput = true;
              if (chunk.type === "dense") {
                denseAccum += chunk.text;
                finalDenseTokens++;
                setDenseContent(denseAccum);
                setDenseTokens(finalDenseTokens);
                denseElapsed = (performance.now() - t0) / 1000;
              } else {
                moeAccum += chunk.text;
                finalMoeTokens++;
                setChatContent(moeAccum);
                setChatTokens(finalMoeTokens);
                moeElapsed = (performance.now() - t0) / 1000;
              }
            }
            proxyCompleted = denseAccum.length > 0 && moeAccum.length > 0;
          }
        } catch (proxyError) {
          if (controller.signal.aborted) throw proxyError;
          if (proxyProducedOutput) throw proxyError;
        } finally {
          clearTimeout(proxyTimeout);
          controller.signal.removeEventListener("abort", cancelProxy);
        }
      }

      if (!proxyCompleted) {
        const streamDirect = async (tag: "dense" | "tr_moe", base: string) => {
          const response = await fetch(`${base}/v1/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          if (!response.ok) {
            const detail = (await response.text()).slice(0, 300).trim();
            throw new Error(
              `${tag === "dense" ? "Dense-306" : "TR-MOE-306"} unavailable `
              + `(HTTP ${response.status})${detail ? `: ${detail}` : ""}`,
            );
          }
          for await (const content of readModelSSE(response)) {
            if (controller.signal.aborted) break;
            if (tag === "dense") {
              denseAccum += content;
              finalDenseTokens++;
              setDenseContent(denseAccum);
              setDenseTokens(finalDenseTokens);
              denseElapsed = (performance.now() - t0) / 1000;
            } else {
              moeAccum += content;
              finalMoeTokens++;
              setChatContent(moeAccum);
              setChatTokens(finalMoeTokens);
              moeElapsed = (performance.now() - t0) / 1000;
            }
          }
        };
        await Promise.all([
          denseAccum ? Promise.resolve() : streamDirect("dense", DENSE_BASE),
          moeAccum ? Promise.resolve() : streamDirect("tr_moe", ROUTED_BASE),
        ]);
      }

      setResults((prev) => [
        ...prev,
        {
          prompt: text,
          dense: { content: denseAccum, tokens: finalDenseTokens, elapsed: denseElapsed },
          chat: { content: moeAccum, tokens: finalMoeTokens, elapsed: moeElapsed },
        },
      ]);

      setStreaming(false);
      abortRef.current = null;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStreaming(false);
        abortRef.current = null;
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to reach models.");
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, loading, streaming, params, healthStatus, proxyHealth]);

  const updateParam = useCallback(<K extends keyof SamplingParams>(key: K, value: SamplingParams[K]) => {
    setParams((p) => ({ ...p, [key]: value }));
  }, []);

  return {
    results,
    input,
    setInput,
    loading,
    streaming,
    error,
    params,
    updateParam,
    healthStatus,
    denseContent,
    chatContent,
    denseTokens,
    chatTokens,
    sendMessage,
    stopGeneration,
    clearResults,
  };
}

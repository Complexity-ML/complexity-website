"use client";

import { useState, useRef, useCallback } from "react";
import type { SamplingParams } from "./useChat";
import { ENDPOINTS } from "./config";

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
  maxTokens: 2048,
  topK: 50,
  topP: 0.9,
  repetitionPenalty: 1.3,
  frequencyPenalty: 0.3,
};

const DENSE_BASE = ENDPOINTS.dense.replace(/\/+$/, "");
const MOE_BASE = ENDPOINTS["TR-MoE"].replace(/\/+$/, "");

/** Parse an SSE stream and yield text chunks */
async function* readSSE(response: Response): AsyncGenerator<string> {
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
  const [healthStatus] = useState<"ok" | "degraded" | "offline">("offline");

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

  const sendMessage = useCallback(async (directText?: string) => {
    const text = (directText ?? input).trim();
    if (!text || loading || streaming) return;

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
        prompt: text,
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

      // Stream both models in parallel
      await Promise.all([
        (async () => {
          const t0 = performance.now();
          const response = await fetch(`${DENSE_BASE}/v1/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          for await (const chunk of readSSE(response)) {
            if (controller.signal.aborted) break;
            denseAccum += chunk;
            finalDenseTokens++;
            setDenseContent(denseAccum);
            setDenseTokens(finalDenseTokens);
          }
          denseElapsed = (performance.now() - t0) / 1000;
        })(),
        (async () => {
          const t0 = performance.now();
          const response = await fetch(`${MOE_BASE}/v1/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          for await (const chunk of readSSE(response)) {
            if (controller.signal.aborted) break;
            moeAccum += chunk;
            finalMoeTokens++;
            setChatContent(moeAccum);
            setChatTokens(finalMoeTokens);
          }
          moeElapsed = (performance.now() - t0) / 1000;
        })(),
      ]);

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
  }, [input, loading, streaming, params]);

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

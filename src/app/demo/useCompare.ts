"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
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
  maxTokens: 200,
};

export function useCompare() {
  const [results, setResults] = useState<CompareResult[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SamplingParams>(DEFAULT_PARAMS);
  const [healthStatus, setHealthStatus] = useState<"ok" | "degraded" | "offline">("offline");

  const [denseContent, setDenseContent] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [denseTokens, setDenseTokens] = useState(0);
  const [chatTokens, setChatTokens] = useState(0);
  const [expertDist, setExpertDist] = useState<number[] | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Health polling
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        await axios.get(`${ENDPOINTS.dense}/health`);
        if (cancelled) return;
        setHealthStatus("ok");
      } catch {
        if (!cancelled) setHealthStatus("offline");
      }
    };
    poll();
    const interval = setInterval(poll, 10_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

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

      const denseStart = performance.now();
      const chatStart = performance.now();

      const body = {
        prompt: text,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        stream: true,
      };

      // Helper to consume an SSE stream from a vllm-i64 Space
      async function consumeStream(
        url: string,
        onChunk: (text: string) => void,
      ) {
        const res = await fetch(`${url}/v1/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`${url}: status ${res.status}`);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let tokenCount = 0;

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
            if (payload === "[DONE]") return tokenCount;
            try {
              const data = JSON.parse(payload);
              const chunk = data.choices?.[0]?.text ?? "";
              if (chunk) {
                tokenCount++;
                onChunk(chunk);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
        return tokenCount;
      }

      let finalDenseTokens = 0;
      let finalMoeTokens = 0;
      let denseAccum = "";
      let moeAccum = "";

      const [denseCount, moeCount] = await Promise.all([
        consumeStream(ENDPOINTS.dense, (chunk) => {
          denseAccum += chunk;
          finalDenseTokens++;
          setDenseContent(denseAccum);
          setDenseTokens(finalDenseTokens);
        }),
        consumeStream(ENDPOINTS["TR-MoE"], (chunk) => {
          moeAccum += chunk;
          finalMoeTokens++;
          setChatContent(moeAccum);
          setChatTokens(finalMoeTokens);
        }),
      ]);

      const denseElapsed = (performance.now() - denseStart) / 1000;
      const chatElapsed = (performance.now() - chatStart) / 1000;

      setResults((prev) => [
        ...prev,
        {
          prompt: text,
          dense: { content: denseAccum, tokens: denseCount ?? finalDenseTokens, elapsed: denseElapsed },
          chat: { content: moeAccum, tokens: moeCount ?? finalMoeTokens, elapsed: chatElapsed },
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
    expertDist,
    sendMessage,
    stopGeneration,
    clearResults,
  };
}

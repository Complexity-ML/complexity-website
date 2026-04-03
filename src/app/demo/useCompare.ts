"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { I64Client } from "vllm-i64";
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
  maxTokens: 1024,
};

const denseClient = new I64Client(ENDPOINTS.dense);
const moeClient = new I64Client(ENDPOINTS["TR-MoE"]);

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

  // Health polling via SDK
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const ok = await denseClient.monitor.isReady();
        if (!cancelled) setHealthStatus(ok ? "ok" : "offline");
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

      const streamOpts = {
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      };

      let denseAccum = "";
      let moeAccum = "";
      let finalDenseTokens = 0;
      let finalMoeTokens = 0;

      // Stream both models in parallel via SDK
      await Promise.all([
        (async () => {
          for await (const chunk of denseClient.completions.stream(text, streamOpts)) {
            if (controller.signal.aborted) break;
            denseAccum += chunk;
            finalDenseTokens++;
            setDenseContent(denseAccum);
            setDenseTokens(finalDenseTokens);
          }
        })(),
        (async () => {
          for await (const chunk of moeClient.completions.stream(text, streamOpts)) {
            if (controller.signal.aborted) break;
            moeAccum += chunk;
            finalMoeTokens++;
            setChatContent(moeAccum);
            setChatTokens(finalMoeTokens);
          }
        })(),
      ]);

      // Fetch expert distribution from MoE model
      try {
        const stats = await moeClient.monitor.experts();
        if (stats.distribution) setExpertDist(stats.distribution);
      } catch { /* ignore */ }

      const denseElapsed = (performance.now() - denseStart) / 1000;
      const chatElapsed = (performance.now() - chatStart) / 1000;

      setResults((prev) => [
        ...prev,
        {
          prompt: text,
          dense: { content: denseAccum, tokens: finalDenseTokens, elapsed: denseElapsed },
          chat: { content: moeAccum, tokens: finalMoeTokens, elapsed: chatElapsed },
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

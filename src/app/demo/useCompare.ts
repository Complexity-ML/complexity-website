"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
        const res = await fetch(`${ENDPOINTS.dense}/health`);
        if (cancelled) return;
        setHealthStatus(res.ok ? "ok" : "offline");
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

      // Call both models in parallel via fetch
      const [denseRes, moeRes] = await Promise.all([
        fetch(`${ENDPOINTS.dense}/v1/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            max_tokens: params.maxTokens,
            temperature: params.temperature,
          }),
          signal: controller.signal,
        }),
        fetch(`${ENDPOINTS["TR-MoE"]}/v1/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            max_tokens: params.maxTokens,
            temperature: params.temperature,
          }),
          signal: controller.signal,
        }),
      ]);

      const denseData = await denseRes.json();
      const moeData = await moeRes.json();

      const denseText = denseData.choices?.[0]?.text ?? "No response.";
      const moeText = moeData.choices?.[0]?.text ?? "No response.";
      const denseCount = denseData.usage?.completion_tokens ?? 0;
      const moeCount = moeData.usage?.completion_tokens ?? 0;

      setDenseContent(denseText);
      setChatContent(moeText);
      setDenseTokens(denseCount);
      setChatTokens(moeCount);

      const denseElapsed = (performance.now() - denseStart) / 1000;
      const chatElapsed = (performance.now() - chatStart) / 1000;

      setResults((prev) => [
        ...prev,
        {
          prompt: text,
          dense: { content: denseText, tokens: denseCount, elapsed: denseElapsed },
          chat: { content: moeText, tokens: moeCount, elapsed: chatElapsed },
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

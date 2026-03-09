"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { I64Client } from "vllm-i64";
import type { SamplingParams } from "./useChat";
import { COMPARE_ENDPOINTS } from "./config";

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
  topK: 50,
  topP: 0.9,
  minP: 0.05,
  typicalP: 0.92,
  repetitionPenalty: 1.4,
  minTokens: 8,
  maxTokens: 256,
};

export function useCompare() {
  const [results, setResults] = useState<CompareResult[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SamplingParams>(DEFAULT_PARAMS);
  const [healthStatus, setHealthStatus] = useState<"ok" | "degraded" | "offline">("offline");

  // Live streaming content for current generation
  const [denseContent, setDenseContent] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [denseTokens, setDenseTokens] = useState(0);
  const [chatTokens, setChatTokens] = useState(0);

  // Expert distribution from i64 backend (4 experts)
  const [expertDist, setExpertDist] = useState<number[] | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const expertsAvailable = useRef(true);

  const denseClient = useMemo(
    () => new I64Client(COMPARE_ENDPOINTS.dense, { timeoutMs: 120_000 }),
    [],
  );
  const chatClient = useMemo(
    () => new I64Client(COMPARE_ENDPOINTS.chat, { timeoutMs: 120_000 }),
    [],
  );
  const healthClient = useMemo(
    () => new I64Client(COMPARE_ENDPOINTS.dense, { timeoutMs: 5_000 }),
    [],
  );

  // Health + expert distribution polling
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const [healthRes, expertsRes] = await Promise.allSettled([
          fetch(`${COMPARE_ENDPOINTS.dense}/../health`),
          expertsAvailable.current ? chatClient.monitor.experts() : Promise.reject("skipped"),
        ]);
        if (cancelled) return;

        if (healthRes.status === "fulfilled" && healthRes.value.ok) {
          const data = await healthRes.value.json();
          setHealthStatus(data.status === "ok" ? "ok" : "degraded");
        } else {
          setHealthStatus("offline");
        }

        if (expertsRes.status === "fulfilled") {
          const dist = (expertsRes.value as { distribution: number[] }).distribution;
          if (dist && dist.length > 0) setExpertDist(dist);
        } else if (expertsAvailable.current) {
          expertsAvailable.current = false;
        }
      } catch {
        if (!cancelled) setHealthStatus("offline");
      }
    };
    poll();
    const interval = setInterval(poll, 2_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [chatClient]);

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

    const streamOpts = {
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_k: params.topK,
      top_p: params.topP,
      min_p: params.minP,
      typical_p: params.typicalP,
      repetition_penalty: params.repetitionPenalty,
      min_tokens: params.minTokens,
      signal: controller.signal,
    };

    try {
      setLoading(false);
      setStreaming(true);

      // Stream both models in parallel — raw completions (pre-train, no chat template)
      const denseStart = performance.now();
      const chatStart = performance.now();
      let denseResult = "";
      let chatResult = "";
      let denseCount = 0;
      let chatCount = 0;

      const denseStream = denseClient.completions.stream(text, {
        model: "pacific-i64",
        ...streamOpts,
      });

      const chatStream = chatClient.completions.stream(text, {
        model: "pacific-chat",
        ...streamOpts,
      });

      // Run both streams concurrently
      const densePromise = (async () => {
        for await (const token of denseStream) {
          denseResult += token;
          denseCount++;
          setDenseContent(denseResult);
          setDenseTokens(denseCount);
        }
        return { content: denseResult, tokens: denseCount, elapsed: (performance.now() - denseStart) / 1000 };
      })();

      const chatPromise = (async () => {
        for await (const token of chatStream) {
          chatResult += token;
          chatCount++;
          setChatContent(chatResult);
          setChatTokens(chatCount);
        }
        return { content: chatResult, tokens: chatCount, elapsed: (performance.now() - chatStart) / 1000 };
      })();

      const [denseRes, chatRes] = await Promise.all([densePromise, chatPromise]);

      setResults((prev) => [
        ...prev,
        { prompt: text, dense: denseRes, chat: chatRes },
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
  }, [input, loading, streaming, params, denseClient, chatClient]);

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

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { I64Client } from "vllm-i64";
import type { Mode, Message } from "./config";
import { ENDPOINTS, MAINTENANCE } from "./config";

export interface SamplingParams {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
  frequencyPenalty: number;
}

export interface TokenStats {
  tokens: number;
  elapsed: number;
  streaming: boolean;
}

export interface MonitorData {
  tokPerS: number;
  gpuUtil: number;
  gpuFreeMb: number;
  gpuTotalMb: number;
  kvUsagePct: number;
  activeRequests: number;
  totalTokens: number;
}

const DEFAULT_PARAMS: SamplingParams = {
  temperature: 0.7,
  maxTokens: 2048,
  topK: 50,
  topP: 0.9,
  repetitionPenalty: 1.3,
  frequencyPenalty: 0.3,
};

// Lazily-created clients per mode
const clients: Partial<Record<Mode, I64Client>> = {};
function getClient(mode: Mode): I64Client {
  if (!clients[mode]) {
    clients[mode] = new I64Client(ENDPOINTS[mode]);
  }
  return clients[mode]!;
}

export function useChat(initialMode: Mode) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SamplingParams>(DEFAULT_PARAMS);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<"ok" | "degraded" | "offline">("offline");
  const [snapshot, setSnapshot] = useState<MonitorData | null>(null);
  const [expertDist, setExpertDist] = useState<number[] | null>(null);

  const streamStartRef = useRef(0);
  const tokenCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Health polling via SDK
  useEffect(() => {
    let cancelled = false;
    const client = getClient(mode);
    const poll = async () => {
      try {
        const ok = await client.monitor.isReady();
        if (!cancelled) setHealthStatus(ok ? "ok" : "offline");
      } catch {
        if (!cancelled) setHealthStatus("offline");
      }
    };
    poll();
    const interval = setInterval(poll, 5_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [mode]);

  useEffect(() => {
    const onUnload = () => {
      abortControllerRef.current?.abort();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      abortControllerRef.current?.abort();
    };
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
    setLoading(false);
    if (streamStartRef.current > 0) {
      const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
      setTokenStats({ tokens: tokenCountRef.current, elapsed: finalElapsed, streaming: false });
    }
  }, []);

  const switchMode = useCallback((newMode: Mode) => {
    if (newMode === mode) return;
    if (MAINTENANCE[newMode]) return;
    if (streaming || loading) stopGeneration();
    setMode(newMode);
    setMessages([]);
    setError(null);
    setInput("");
    setTokenStats(null);
  }, [mode, streaming, loading, stopGeneration]);

  const clearChat = useCallback(() => {
    if (streaming || loading) stopGeneration();
    setMessages([]);
    setError(null);
    setTokenStats(null);
    setExpertDist(null);
  }, [streaming, loading, stopGeneration]);

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
    setError(null);
    setTokenStats(null);
  }, []);

  const sendMessage = useCallback(async (directText?: string) => {
    const text = (directText ?? input).trim();
    if (!text || loading || streaming || MAINTENANCE[mode]) return;

    setError(null);
    setExpertDist(null);
    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const client = getClient(mode);

    try {
      streamStartRef.current = performance.now();
      tokenCountRef.current = 0;
      setTokenStats({ tokens: 0, elapsed: 0, streaming: true });
      setLoading(false);
      setStreaming(true);

      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      // Poll expert distribution live during streaming
      const expertPollInterval = setInterval(async () => {
        try {
          const stats = await client.monitor.experts();
          if (stats.distribution) setExpertDist(stats.distribution);
        } catch { /* ignore */ }
      }, 500);

      // Stream via SDK
      for await (const chunk of client.completions.stream(text, {
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_k: params.topK,
        top_p: params.topP,
        ...({ repetition_penalty: params.repetitionPenalty, frequency_penalty: params.frequencyPenalty } as Record<string, unknown>),
      })) {
        if (controller.signal.aborted) break;
        assistantContent += chunk;
        tokenCountRef.current++;
        const elapsed = (performance.now() - streamStartRef.current) / 1000;
        setTokenStats({ tokens: tokenCountRef.current, elapsed, streaming: true });
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      }

      clearInterval(expertPollInterval);

      const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
      setTokenStats({ tokens: tokenCountRef.current, elapsed: finalElapsed, streaming: false });

      // Final expert distribution
      try {
        const stats = await client.monitor.experts();
        if (stats.distribution) setExpertDist(stats.distribution);
      } catch { /* ignore */ }

      setStreaming(false);
      abortControllerRef.current = null;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStreaming(false);
        abortControllerRef.current = null;
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to reach the model.");
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }, [input, loading, streaming, mode, messages, params]);

  const updateParam = useCallback(<K extends keyof SamplingParams>(key: K, value: SamplingParams[K]) => {
    setParams((p) => ({ ...p, [key]: value }));
  }, []);

  return {
    mode,
    messages,
    input,
    setInput,
    loading,
    streaming,
    error,
    params,
    updateParam,
    tokenStats,
    totalRequests,
    healthStatus,
    snapshot,
    expertDist,
    switchMode,
    clearChat,
    loadMessages,
    sendMessage,
    stopGeneration,
  };
}

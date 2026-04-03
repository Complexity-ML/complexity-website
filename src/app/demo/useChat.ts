"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Mode, Message } from "./config";
import { ENDPOINTS, MAINTENANCE } from "./config";

export interface SamplingParams {
  temperature: number;
  maxTokens: number;
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
  maxTokens: 200,
};

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

  // Health polling
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`${ENDPOINTS[mode]}/health`);
        if (cancelled) return;
        if (res.ok) {
          setHealthStatus("ok");
        } else {
          setHealthStatus("offline");
        }
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

    try {
      streamStartRef.current = performance.now();
      tokenCountRef.current = 0;
      setTokenStats({ tokens: 0, elapsed: 0, streaming: true });

      const res = await fetch(`${ENDPOINTS[mode]}/v1/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const assistantContent = data.choices?.[0]?.text ?? "No response.";
      const completionTokens = data.usage?.completion_tokens ?? assistantContent.split(" ").length;

      const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
      tokenCountRef.current = completionTokens;
      setTokenStats({ tokens: completionTokens, elapsed: finalElapsed, streaming: false });

      setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      setLoading(false);
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

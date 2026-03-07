"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Mode, Message } from "./config";
import { MODEL_NAMES, MAINTENANCE } from "./config";

export interface SamplingParams {
  temperature: number;
  topK: number;
  topP: number;
  minP: number;
  typicalP: number;
  repetitionPenalty: number;
  minTokens: number;
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
  temperature: 0.6,
  topK: 40,
  topP: 0.9,
  minP: 0.05,
  typicalP: 0.92,
  repetitionPenalty: 1.15,
  minTokens: 8,
  maxTokens: 512,
};

async function fetchMonitor(mode: string, endpoint: string): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/inference/monitor?mode=${mode}&endpoint=${endpoint}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function* streamFromProxy(
  mode: string,
  messages: { role: string; content: string }[],
  options: Record<string, unknown>,
  signal?: AbortSignal,
): AsyncGenerator<string, void, undefined> {
  const res = await fetch("/api/inference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, messages, stream: true, ...options }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed SSE
      }
    }
  }
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
  const snapshotAvailable = useRef(true);
  const expertsAvailable = useRef(true);

  // Health + metrics + snapshot + experts polling (via proxy)
  useEffect(() => {
    let cancelled = false;
    snapshotAvailable.current = true;
    expertsAvailable.current = true;

    const poll = async () => {
      try {
        const [healthRes, metricsResults, snapRes, expertsRes] = await Promise.allSettled([
          fetchMonitor(mode, "health"),
          Promise.allSettled(
            (["python", "chat", "ros2"] as Mode[]).map((m) => fetchMonitor(m, "metrics"))
          ),
          snapshotAvailable.current ? fetchMonitor(mode, "snapshot") : Promise.reject("skipped"),
          expertsAvailable.current ? fetchMonitor(mode, "experts") : Promise.reject("skipped"),
        ]);

        if (cancelled) return;

        if (healthRes.status === "fulfilled") {
          const h = healthRes.value as Record<string, string>;
          setHealthStatus(h.status === "ok" ? "ok" : "degraded");
        } else {
          setHealthStatus("offline");
        }

        if (metricsResults.status === "fulfilled") {
          let total = 0;
          for (const r of metricsResults.value) {
            if (r.status === "fulfilled") total += (r.value as Record<string, number>)?.requests_served ?? 0;
          }
          setTotalRequests(total);
        }

        if (snapRes.status === "fulfilled") {
          const s = snapRes.value as Record<string, Record<string, number>>;
          setSnapshot({
            tokPerS: s.perf?.tok_per_s ?? 0,
            gpuUtil: s.gpu?.utilization_pct ?? 0,
            gpuFreeMb: s.gpu?.free_mb ?? 0,
            gpuTotalMb: s.gpu?.total_mb ?? 0,
            kvUsagePct: s.kv_cache?.usage_pct ?? 0,
            activeRequests: (s as unknown as Record<string, number>).active_requests ?? 0,
            totalTokens: s.engine?.total_tokens_generated ?? 0,
          });
        } else if (snapshotAvailable.current) {
          snapshotAvailable.current = false;
        }

        if (expertsRes.status === "fulfilled") {
          const dist = (expertsRes.value as Record<string, number[]>).distribution;
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
      let assistantContent = "";

      streamStartRef.current = performance.now();
      tokenCountRef.current = 0;
      setTokenStats({ tokens: 0, elapsed: 0, streaming: true });

      setMessages([...newMessages, { role: "assistant", content: "" }]);
      setLoading(false);
      setStreaming(true);

      const stream = streamFromProxy(
        mode,
        [{ role: "user", content: text }],
        {
          model: MODEL_NAMES[mode],
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          top_k: params.topK,
          top_p: params.topP,
          min_p: params.minP,
          typical_p: params.typicalP,
          repetition_penalty: params.repetitionPenalty,
          min_tokens: params.minTokens,
        },
        controller.signal,
      );

      for await (const token of stream) {
        assistantContent += token;
        tokenCountRef.current++;
        const elapsed = (performance.now() - streamStartRef.current) / 1000;
        setTokenStats({ tokens: tokenCountRef.current, elapsed, streaming: true });
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      }

      setStreaming(false);
      abortControllerRef.current = null;
      const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
      setTokenStats({ tokens: tokenCountRef.current, elapsed: finalElapsed, streaming: false });

      if (!assistantContent.trim()) {
        setMessages([...newMessages, { role: "assistant", content: "No response." }]);
      }
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

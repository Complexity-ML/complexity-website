"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { I64Client } from "vllm-i64";
import type { Mode, Message } from "./config";
import { ENDPOINTS, MODEL_NAMES, MAINTENANCE } from "./config";

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

export function useChat(initialMode: Mode) {
  const clients = useMemo<Record<Mode, I64Client>>(() => ({
    python: new I64Client(ENDPOINTS.python),
    chat: new I64Client(ENDPOINTS.chat),
    ros2: new I64Client(ENDPOINTS.ros2),
  }), []);

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

  // Health + metrics + snapshot + experts polling
  useEffect(() => {
    let cancelled = false;
    snapshotAvailable.current = true;
    expertsAvailable.current = true;

    const poll = async () => {
      const client = clients[mode];
      try {
        const [healthRes, metricsResults, snapRes, expertsRes] = await Promise.allSettled([
          client.monitor.health(),
          Promise.allSettled(
            (["python", "chat", "ros2"] as Mode[]).map((m) => clients[m].monitor.metrics())
          ),
          snapshotAvailable.current ? client.monitor.snapshot() : Promise.reject("skipped"),
          expertsAvailable.current ? client.monitor.experts() : Promise.reject("skipped"),
        ]);

        if (cancelled) return;

        // Health
        if (healthRes.status === "fulfilled") {
          setHealthStatus(healthRes.value.status === "ok" ? "ok" : "degraded");
        } else {
          setHealthStatus("offline");
        }

        // Total requests
        if (metricsResults.status === "fulfilled") {
          let total = 0;
          for (const r of metricsResults.value) {
            if (r.status === "fulfilled") total += (r.value as Record<string, number>)?.requests_served ?? 0;
          }
          setTotalRequests(total);
        }

        // Snapshot — stop polling if endpoint unavailable
        if (snapRes.status === "fulfilled") {
          const s = snapRes.value;
          setSnapshot({
            tokPerS: s.perf?.tok_per_s ?? 0,
            gpuUtil: s.gpu?.utilization_pct ?? 0,
            gpuFreeMb: s.gpu?.free_mb ?? 0,
            gpuTotalMb: s.gpu?.total_mb ?? 0,
            kvUsagePct: s.kv_cache?.usage_pct ?? 0,
            activeRequests: s.active_requests ?? 0,
            totalTokens: s.engine?.total_tokens_generated ?? 0,
          });
        } else if (snapshotAvailable.current) {
          snapshotAvailable.current = false;
        }

        // Experts — stop polling if endpoint unavailable
        if (expertsRes.status === "fulfilled") {
          setExpertDist(expertsRes.value.distribution ?? null);
        } else if (expertsAvailable.current) {
          expertsAvailable.current = false;
        }
      } catch {
        if (!cancelled) setHealthStatus("offline");
      }
    };
    poll();
    const interval = setInterval(poll, 10_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [clients, mode]);

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
  }, [streaming, loading, stopGeneration]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || streaming || MAINTENANCE[mode]) return;

    setError(null);
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

      const stream = clients[mode].chat.stream(
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
          signal: controller.signal,
        },
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
  }, [input, loading, streaming, mode, messages, clients, params]);

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
    sendMessage,
    stopGeneration,
  };
}

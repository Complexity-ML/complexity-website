"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  maxTokens: 512,
  topK: 50,
  topP: 0.9,
  repetitionPenalty: 1.3,
  frequencyPenalty: 0.3,
};

function getBaseUrl(mode: Mode): string {
  return ENDPOINTS[mode].replace(/\/+$/, "");
}

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

export function useChat(initialMode: Mode) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SamplingParams>(DEFAULT_PARAMS);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [totalRequests] = useState<number | null>(null);
  const [healthStatus] = useState<"ok" | "degraded" | "offline">("ok");
  const [snapshot] = useState<MonitorData | null>(null);

  const streamStartRef = useRef(0);
  const tokenCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);


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
    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const base = getBaseUrl(mode);

    try {
      streamStartRef.current = performance.now();
      tokenCountRef.current = 0;
      setTokenStats({ tokens: 0, elapsed: 0, streaming: true });
      setLoading(false);
      setStreaming(true);

      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      // Stream via fetch (axios doesn't support ReadableStream)
      const response = await fetch(`${base}/v1/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          top_k: params.topK,
          top_p: params.topP,
          repetition_penalty: params.repetitionPenalty,
          frequency_penalty: params.frequencyPenalty,
          stream: true,
        }),
        signal: controller.signal,
      });

      for await (const chunk of readSSE(response)) {
        if (controller.signal.aborted) break;
        assistantContent += chunk;
        tokenCountRef.current++;
        const elapsed = (performance.now() - streamStartRef.current) / 1000;
        setTokenStats({ tokens: tokenCountRef.current, elapsed, streaming: true });
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      }

      const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
      setTokenStats({ tokens: tokenCountRef.current, elapsed: finalElapsed, streaming: false });

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
    switchMode,
    clearChat,
    loadMessages,
    sendMessage,
    stopGeneration,
  };
}

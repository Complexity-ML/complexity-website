"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Mode, Message } from "./config";
import { ENDPOINTS, MAINTENANCE, MODEL_NAMES } from "./config";
import { useEndpointHealth } from "./useEndpointHealth";
import { useExpertActivity } from "./useExpertActivity";

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

export interface ResearchActivityEvent {
  id: string;
  label: string;
  detail: string;
  active: boolean;
}

interface ResearchResponse {
  status: "ready" | "empty";
  selected: Array<{
    key: string;
    kind: string;
    name: string;
  }>;
  context: string;
  error?: string;
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
  const [researchEvents, setResearchEvents] = useState<ResearchActivityEvent[]>([]);
  const [totalRequests] = useState<number | null>(null);
  const healthStatus = useEndpointHealth(ENDPOINTS[mode], MAINTENANCE[mode]);
  const [snapshot] = useState<MonitorData | null>(null);

  const streamStartRef = useRef(0);
  const tokenCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasTokenStats = tokenStats !== null;
  const expertActivity = useExpertActivity(
    mode === "TR-MoE" && (streaming || hasTokenStats),
  );

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
    setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
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
    setResearchEvents([]);
  }, [mode, streaming, loading, stopGeneration]);

  const clearChat = useCallback(() => {
    if (streaming || loading) stopGeneration();
    setMessages([]);
    setError(null);
    setTokenStats(null);
    setResearchEvents([]);
  }, [streaming, loading, stopGeneration]);

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
    setError(null);
    setTokenStats(null);
    setResearchEvents([]);
  }, []);

  const sendMessage = useCallback(async (
    directText?: string,
    options: { research?: boolean } = {},
  ) => {
    const text = (directText ?? input).trim();
    if (!text || loading || streaming || MAINTENANCE[mode] || healthStatus === "offline") return;

    setError(null);
    setResearchEvents([]);
    const userMessage: Message = { role: "user", content: text, createdAt: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const base = getBaseUrl(mode);

    try {
      let modelPrompt = text;
      if (options.research) {
        const searchEvent: ResearchActivityEvent = {
          id: `research-search-${Date.now()}`,
          label: "Searching the fantasy catalog…",
          detail: "The research worker is matching the question against canonical entity cards.",
          active: true,
        };
        setResearchEvents([searchEvent]);

        const researchResponse = await fetch("/api/agent/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text }),
          cache: "no-store",
          signal: controller.signal,
        });
        const research = await researchResponse.json() as ResearchResponse;
        if (!researchResponse.ok) {
          throw new Error(research.error || "The fantasy research agent is unavailable.");
        }
        if (research.status !== "ready" || !research.selected.length || !research.context) {
          setResearchEvents([
            {
              id: `research-empty-${Date.now()}`,
              label: "No verified card selected",
              detail: "The catalog does not contain enough evidence to answer this question.",
              active: false,
            },
            { ...searchEvent, active: false },
          ]);
          throw new Error("No verified fantasy card matched this question.");
        }

        const selectionEvent: ResearchActivityEvent = {
          id: `research-selected-${Date.now()}`,
          label: `${research.selected.length} fantasy card${research.selected.length === 1 ? "" : "s"} selected`,
          detail: research.selected.map((card) => `${card.name} · ${card.kind}`).join(" · "),
          active: false,
        };
        const analysisEvent: ResearchActivityEvent = {
          id: `research-analysis-${Date.now()}`,
          label: "Analyzing the selected cards…",
          detail: "The main model will answer from this bounded canonical context.",
          active: true,
        };
        setResearchEvents([
          analysisEvent,
          selectionEvent,
          { ...searchEvent, active: false },
        ]);

        modelPrompt = [
          "Answer the question using only the canonical fantasy catalog records below.",
          "Do not invent facts. If the records are insufficient, say so explicitly.",
          "Answer in the same language as the question and name the records you use.",
          "",
          `QUESTION:\n${text}`,
          "",
          `CANONICAL RECORDS:\n${research.context}`,
          "",
          "ANSWER:",
        ].join("\n");
      }
      const modelMessages = options.research
        ? [{ role: "user" as const, content: modelPrompt }]
        : newMessages.map(({ role, content }) => ({ role, content }));

      streamStartRef.current = performance.now();
      tokenCountRef.current = 0;
      setTokenStats({ tokens: 0, elapsed: 0, streaming: true });
      setLoading(false);
      setStreaming(true);

      let assistantContent = "";
      const assistantCreatedAt = Date.now();
      setMessages([...newMessages, { role: "assistant", content: "", createdAt: assistantCreatedAt }]);

      // Stream via fetch (axios doesn't support ReadableStream)
      const response = await fetch(`${base}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: modelMessages,
          context_management: "auto",
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

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300).trim();
        throw new Error(
          `${MODEL_NAMES[mode]} unavailable (HTTP ${response.status})${detail ? `: ${detail}` : ""}`,
        );
      }

      let receivedFirstChunk = false;
      for await (const chunk of readSSE(response)) {
        if (controller.signal.aborted) break;
        if (!receivedFirstChunk) {
          receivedFirstChunk = true;
          setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
        }
        assistantContent += chunk;
        tokenCountRef.current++;
        const elapsed = (performance.now() - streamStartRef.current) / 1000;
        setTokenStats({ tokens: tokenCountRef.current, elapsed, streaming: true });
        setMessages([...newMessages, { role: "assistant", content: assistantContent, createdAt: assistantCreatedAt }]);
      }

      const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
      setTokenStats({ tokens: tokenCountRef.current, elapsed: finalElapsed, streaming: false });

      setStreaming(false);
      setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
      abortControllerRef.current = null;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setLoading(false);
        setStreaming(false);
        setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
        abortControllerRef.current = null;
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to reach the model.");
      setLoading(false);
      setStreaming(false);
      setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
      abortControllerRef.current = null;
    }
  }, [input, loading, streaming, mode, messages, params, healthStatus]);

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
    expertActivity,
    researchEvents,
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

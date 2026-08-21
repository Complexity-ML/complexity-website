"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Mode, Message } from "./config";
import { ENDPOINTS, MAINTENANCE, MODEL_NAMES } from "./config";
import { DEFAULT_SAMPLING_PARAMS, type SamplingParams } from "./sampling";
import { useEndpointHealth } from "./useEndpointHealth";
import { useExpertActivity } from "./useExpertActivity";

export interface TokenStats {
  tokens: number;
  elapsed: number;
  streaming: boolean;
}

export interface ContextMetrics {
  policy: string;
  compressed: boolean;
  max_seq_len: number;
  reserved_output_tokens: number;
  available_prompt_tokens: number;
  compact_at_tokens: number | null;
  original_messages: number;
  retained_messages: number;
  summarized_messages: number;
  dropped_messages: number;
  original_tokens: number;
  prompt_tokens: number;
  summary_tokens: number;
  tokens_saved: number;
}

interface SSEChunk {
  content: string;
  contextMetrics: ContextMetrics | null;
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

function newConversationCacheId(): string {
  return `conversation-${crypto.randomUUID()}`;
}

function getBaseUrl(): string {
  return ENDPOINTS["TR-MoE"].replace(/\/+$/, "");
}

const PUBLIC_SYSTEM_PROMPT =
  "Think carefully before answering, then give the final answer.";

/** Parse an SSE stream and yield text chunks */
async function* readSSE(response: Response): AsyncGenerator<SSEChunk> {
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
          const contextMetrics = data.context_metrics ?? null;
          if (content || contextMetrics) yield { content, contextMetrics };
        } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function useChat() {
  const mode: Mode = "TR-MoE";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SamplingParams>(DEFAULT_SAMPLING_PARAMS);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [contextMetrics, setContextMetrics] = useState<ContextMetrics | null>(null);
  const [researchEvents, setResearchEvents] = useState<ResearchActivityEvent[]>([]);
  const [totalRequests] = useState<number | null>(null);
  const healthStatus = useEndpointHealth(ENDPOINTS[mode], MAINTENANCE[mode]);
  const [snapshot] = useState<MonitorData | null>(null);

  const streamStartRef = useRef(0);
  const tokenCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  // React state updates are asynchronous. Keep an eagerly synchronized copy
  // so a prompt sent immediately after "New chat" cannot capture messages
  // from the conversation that was just closed.
  const messagesRef = useRef<Message[]>([]);
  const conversationCacheIdRef = useRef(newConversationCacheId());
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

  const clearChat = useCallback(() => {
    if (streaming || loading) stopGeneration();
    messagesRef.current = [];
    conversationCacheIdRef.current = newConversationCacheId();
    setMessages([]);
    setError(null);
    setTokenStats(null);
    setContextMetrics(null);
    setResearchEvents([]);
  }, [streaming, loading, stopGeneration]);

  const loadMessages = useCallback((msgs: Message[]) => {
    messagesRef.current = msgs;
    conversationCacheIdRef.current = newConversationCacheId();
    setMessages(msgs);
    setError(null);
    setTokenStats(null);
    setContextMetrics(null);
    setResearchEvents([]);
  }, []);

  const sendMessage = useCallback(async (
    directText?: string,
    options: { research?: boolean } = {},
  ) => {
    const text = (directText ?? input).trim();
    if (!text || loading || streaming || MAINTENANCE[mode] || healthStatus === "offline") return;

    setError(null);
    setContextMetrics(null);
    setResearchEvents([]);
    const userMessage: Message = { role: "user", content: text, createdAt: Date.now() };
    const newMessages = [...messagesRef.current, userMessage];
    messagesRef.current = newMessages;
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const base = getBaseUrl();

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
      streamStartRef.current = performance.now();
      tokenCountRef.current = 0;
      setTokenStats({ tokens: 0, elapsed: 0, streaming: true });
      setLoading(false);
      setStreaming(true);

      let assistantContent = "";
      const assistantCreatedAt = Date.now();
      const initialAssistantMessages: Message[] = [
        ...newMessages,
        { role: "assistant", content: "", createdAt: assistantCreatedAt },
      ];
      messagesRef.current = initialAssistantMessages;
      setMessages(initialAssistantMessages);

      const publishAssistantContent = (content: string) => {
        const previous = messagesRef.current[messagesRef.current.length - 1];
        if (
          previous?.role === "assistant"
          && previous.createdAt === assistantCreatedAt
          && previous.content.length > content.length
        ) {
          return;
        }
        const nextMessages: Message[] = [...newMessages, {
          role: "assistant",
          content,
          createdAt: assistantCreatedAt,
        }];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
      };

      const chatMessages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
        { role: "system", content: PUBLIC_SYSTEM_PROMPT },
        ...newMessages.map(({ role, content }) => ({ role, content })),
      ];
      chatMessages[chatMessages.length - 1] = { role: "user", content: modelPrompt };

      // The deployed model is instruction/chat tuned. Send the full
      // conversation through the server-side chat template instead of
      // treating the latest user message as an unformatted base completion.
      const response = await fetch(`${base}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          top_k: params.topK,
          top_p: params.topP,
          repetition_penalty: params.repetitionPenalty,
          frequency_penalty: params.frequencyPenalty,
          user: conversationCacheIdRef.current,
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
        if (chunk.contextMetrics) {
          setContextMetrics(chunk.contextMetrics);
        }
        if (!receivedFirstChunk) {
          receivedFirstChunk = true;
          setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
        }
        if (!chunk.content) continue;
        assistantContent += chunk.content;
        tokenCountRef.current++;
        const elapsed = (performance.now() - streamStartRef.current) / 1000;
        setTokenStats({ tokens: tokenCountRef.current, elapsed, streaming: true });
        publishAssistantContent(assistantContent);
      }

      // Publish the exact accumulated buffer once more before changing the
      // rendering state. A late React render can never replace it with a
      // shorter conversation snapshot.
      publishAssistantContent(assistantContent);

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
  }, [input, loading, streaming, mode, params, healthStatus]);

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
    contextMetrics,
    expertActivity,
    researchEvents,
    totalRequests,
    healthStatus,
    snapshot,
    clearChat,
    loadMessages,
    sendMessage,
    stopGeneration,
  };
}

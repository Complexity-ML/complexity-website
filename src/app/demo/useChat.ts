"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentToolName, Mode, Message } from "./config";
import {
  DEFAULT_MODE,
  ENDPOINTS,
  MAINTENANCE,
  MODEL_NAMES,
  TOOL_DEFINITION_MATRIX,
  modeQueryValue,
} from "./config";
import {
  DEFAULT_SAMPLING_PARAMS,
  DEFAULT_V2_SAMPLING_PARAMS,
  type SamplingParams,
} from "./sampling";
import { useEndpointHealth } from "./useEndpointHealth";
import { useExpertActivity } from "./useExpertActivity";
import { routeDemoAgentTools } from "@/lib/demo-tool-router";

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

interface ApiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

interface ToolCallResponse {
  function?: {
    name?: string;
    arguments?: string;
  };
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: ToolCallResponse[];
    };
    finish_reason?: string;
  }>;
  usage?: {
    completion_tokens?: number;
  };
  context_metrics?: ContextMetrics;
}

interface CalculatorResponse {
  expression?: string;
  result?: string;
  error?: string;
}

interface KnowledgeSearchResponse {
  status?: "ready" | "empty";
  matches?: Array<{
    id: string;
    title: string;
    score: number;
  }>;
  context?: string;
  passage?: string;
  error?: string;
}

interface DateTimeResponse {
  instant_utc?: string;
  utc?: DateTimeValue;
  paris?: DateTimeValue;
  requested?: DateTimeValue;
  error?: string;
}

interface DateTimeValue {
  timezone: string;
  date: string;
  time: string;
  weekday: string;
  utc_offset: string;
}

function formatDateTimeAnswer(dateTime: Required<Omit<DateTimeResponse, "error">>, text: string): string {
  const instant = new Date(dateTime.instant_utc);
  const french = /\b(?:quelle?|heure|actuellement|maintenant|aujourd['’]hui)\b/i.test(text);
  const locale = french ? "fr-FR" : "en-GB";
  const format = (timezone: string) => new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    dateStyle: "full",
    timeStyle: "medium",
  }).format(instant);
  const paris = `${format("Europe/Paris")} (${dateTime.paris.utc_offset})`;
  const utc = `${format("UTC")} (${dateTime.utc.utc_offset})`;
  return french
    ? `À Paris : ${paris}. En UTC : ${utc}.`
    : `Paris: ${paris}. UTC: ${utc}.`;
}

function normalizeCalculatorExpression(proposed: string): string {
  return proposed
    .replace(/\\(?:times|cdot)/g, "*")
    .replace(/\\div/g, "/")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\*\*/g, "^");
}

function requestedTimezone(text: string): string {
  const explicitIana = text.match(/\b[A-Za-z]+\/[A-Za-z_+-]+\b/)?.[0];
  if (explicitIana) return explicitIana;
  if (/\bparis\b/i.test(text)) return "Europe/Paris";
  if (/\b(?:utc|gmt)\b/i.test(text)) return "UTC";
  return "Europe/Paris";
}

function extractPlanningReasoning(content: string | null | undefined): string {
  if (!content) return "";
  const startTag = "<|think_start|>";
  const endTag = "<|think_end|>";
  const start = content.indexOf(startTag);
  const end = content.indexOf(endTag, start + startTag.length);
  if (start < 0 || end < 0) return "";
  return content.slice(start, end + endTag.length);
}

function visiblePlanningReasoning(content: string): string {
  const startTag = "<|think_start|>";
  const endTag = "<|think_end|>";
  const start = content.indexOf(startTag);
  if (start < 0) return "";
  const end = content.indexOf(endTag, start + startTag.length);
  return end < 0
    ? content.slice(start)
    : content.slice(start, end + endTag.length);
}

function firstJsonObject(content: string): string | null {
  const start = content.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < content.length; index++) {
    const char = content[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return content.slice(start, index + 1);
    }
  }
  return null;
}

function parseStreamedToolCall(
  content: string,
  expectedName: string,
): ToolCallResponse | null {
  const thinkEnd = content.lastIndexOf("<|think_end|>");
  const toolStart = content.lastIndexOf("<|tool_call_start|>");
  const payload = toolStart >= 0
    ? content.slice(toolStart + "<|tool_call_start|>".length)
    : thinkEnd >= 0
      ? content.slice(thinkEnd + "<|think_end|>".length)
      : content;
  const json = firstJsonObject(payload);
  if (json) {
    try {
      const parsed = JSON.parse(json) as { name?: unknown; arguments?: unknown };
      if (parsed.name === expectedName && parsed.arguments && typeof parsed.arguments === "object") {
        return {
          function: {
            name: expectedName,
            arguments: JSON.stringify(parsed.arguments),
          },
        };
      }
    } catch {
      // Fall through to the fragment parser below.
    }
  }

  // Small models sometimes close the outer object before emitting `name`, for
  // example: {"arguments":{"expression":"2+2"}},"name":"calculator"}.
  // Recover the model-generated fields without deriving or replacing values.
  const name = payload.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
  const argumentsMarker = /"arguments"\s*:/.exec(payload);
  if (name !== expectedName || !argumentsMarker) return null;
  const argumentsJson = firstJsonObject(
    payload.slice(argumentsMarker.index + argumentsMarker[0].length),
  );
  if (!argumentsJson) return null;
  try {
    const parsedArguments = JSON.parse(argumentsJson) as unknown;
    if (!parsedArguments || typeof parsedArguments !== "object" || Array.isArray(parsedArguments)) {
      return null;
    }
    return {
      function: {
        name: expectedName,
        arguments: JSON.stringify(parsedArguments),
      },
    };
  } catch {
    return null;
  }
}

function newConversationCacheId(): string {
  return `conversation-${crypto.randomUUID()}`;
}

function planningTokenBudget(tool: AgentToolName): number {
  if (tool === "search_knowledge_base") return 512;
  if (tool === "calculator") return 192;
  return 160;
}

function getBaseUrl(mode: Mode): string {
  return ENDPOINTS[mode].replace(/\/+$/, "");
}

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

export function useChat(initialMode: Mode = DEFAULT_MODE) {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paramsByMode, setParamsByMode] = useState<Record<Mode, SamplingParams>>(() => ({
    "TR-MoE-v2": { ...DEFAULT_V2_SAMPLING_PARAMS },
    "TR-MoE-v1": { ...DEFAULT_SAMPLING_PARAMS },
  }));
  const params = paramsByMode[mode];
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
  const expertActivity = useExpertActivity(
    ENDPOINTS[mode],
    streaming,
  );

  useEffect(() => {
    setModeState(initialMode);
  }, [initialMode]);

  const setMode = useCallback((nextMode: Mode) => {
    setModeState(nextMode);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("model", modeQueryValue(nextMode));
    window.history.replaceState(window.history.state, "", url);
  }, []);

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

      const publishAssistantContent = (content: string, replace = false) => {
        const previous = messagesRef.current[messagesRef.current.length - 1];
        if (
          !replace
          && previous?.role === "assistant"
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

      const conversationMessages: ApiMessage[] = newMessages.map(({ role, content }) => ({ role, content }));
      conversationMessages[conversationMessages.length - 1] = { role: "user", content: modelPrompt };
      const routedTools = mode === "TR-MoE-v2" && !options.research
        ? routeDemoAgentTools(text)
        : [];
      let chatMessages: ApiMessage[] = conversationMessages;

      const completionBody = (requestMessages: ApiMessage[], stream: boolean) => ({
        messages: requestMessages,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_k: params.topK,
        top_p: params.topP,
        repetition_penalty: params.repetitionPenalty,
        frequency_penalty: params.frequencyPenalty,
        user: conversationCacheIdRef.current,
        stream,
      });

      // Execute a bounded plan one tool at a time. Each request carries the
      // single active schema learned by the 500K checkpoint. TR-Hash-i64 turns
      // it into the short native `Available tools` system message.
      const seenToolCalls = new Set<string>();
      let completedToolTokens = 0;
      let toolReasoning = "";
      for (let toolIndex = 0; toolIndex < routedTools.length; toolIndex++) {
        const activeTool: { name: AgentToolName } = { name: routedTools[toolIndex] };
        const isLastTool = toolIndex === routedTools.length - 1;
        const planningMessages: ApiMessage[] = chatMessages;
        const planningResponse = await fetch(`${base}/v1/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...completionBody(planningMessages, true),
            max_tokens: Math.min(params.maxTokens, planningTokenBudget(activeTool.name)),
            temperature: 0,
            top_k: 0,
            top_p: 1,
            repetition_penalty: 1,
            frequency_penalty: 0,
            tools: TOOL_DEFINITION_MATRIX[activeTool.name],
            // The deterministic router already selected this tool from strong
            // intent evidence. Requiring a call prevents the 500K checkpoint
            // from ending after its planning envelope without emitting JSON.
            tool_choice: "required",
          }),
          signal: controller.signal,
        });

        if (!planningResponse.ok) {
          const detail = (await planningResponse.text()).slice(0, 300).trim();
          throw new Error(
            `${MODEL_NAMES[mode]} unavailable (HTTP ${planningResponse.status})${detail ? `: ${detail}` : ""}`,
          );
        }

        let planningContent = "";
        let planningTokens = 0;
        let planningContextMetrics: ContextMetrics | undefined;
        for await (const chunk of readSSE(planningResponse)) {
          if (controller.signal.aborted) break;
          if (chunk.contextMetrics) {
            planningContextMetrics = chunk.contextMetrics;
            setContextMetrics(chunk.contextMetrics);
          }
          if (!chunk.content) continue;
          planningContent += chunk.content;
          planningTokens++;
          const visibleReasoning = visiblePlanningReasoning(planningContent);
          const looksLikeToolCall = planningContent.includes("<|tool_call_start|>")
            || /^\s*\{\s*"(?:arguments|name)"\s*:/.test(planningContent);
          const visiblePlanning = visibleReasoning
            || (looksLikeToolCall ? "" : planningContent);
          if (visiblePlanning) {
            assistantContent = `${toolReasoning}${visiblePlanning}`;
            tokenCountRef.current = completedToolTokens + planningTokens;
            const elapsed = (performance.now() - streamStartRef.current) / 1000;
            setTokenStats({ tokens: tokenCountRef.current, elapsed, streaming: true });
            publishAssistantContent(assistantContent);
          }
        }

        const streamedToolCall = parseStreamedToolCall(planningContent, activeTool.name);
        const planning: ChatCompletionResponse = {
          choices: [{
            message: {
              content: planningContent,
              tool_calls: streamedToolCall ? [streamedToolCall] : [],
            },
          }],
          usage: { completion_tokens: planningTokens },
          context_metrics: planningContextMetrics,
        };
        const choice = planning.choices?.[0];
        const parsedToolCall = streamedToolCall;

        if (!parsedToolCall) {
          assistantContent = extractPlanningReasoning(choice?.message?.content)
            || choice?.message?.content
            || "";
          tokenCountRef.current = planning.usage?.completion_tokens ?? 0;
          publishAssistantContent(assistantContent);
          const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
          setTokenStats({ tokens: tokenCountRef.current, elapsed: finalElapsed, streaming: false });
          setStreaming(false);
          setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
          abortControllerRef.current = null;
          return;
        }

        const toolCall = parsedToolCall;

        const planningReasoning = visiblePlanningReasoning(choice?.message?.content ?? "");
        if (planningReasoning) {
          toolReasoning += planningReasoning;
          assistantContent = toolReasoning;
          publishAssistantContent(assistantContent);
        }
        completedToolTokens += planningTokens;
        tokenCountRef.current = completedToolTokens;

        let toolArguments: Record<string, unknown>;
        try {
          const parsed = JSON.parse(toolCall.function?.arguments ?? "{}");
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
          toolArguments = parsed as Record<string, unknown>;
        } catch {
          throw new Error(`The model returned invalid ${activeTool.name} arguments.`);
        }

        let toolResult: string;
        if (activeTool.name === "calculator") {
          const proposedExpression = toolArguments.expression;
          if (typeof proposedExpression !== "string") {
            throw new Error("The model did not provide a calculator expression.");
          }
          const expression = normalizeCalculatorExpression(proposedExpression);
          toolArguments = { expression };
          const callSignature = `${activeTool.name}:${JSON.stringify(toolArguments)}`;
          if (seenToolCalls.has(callSignature)) throw new Error("A repeated tool call was blocked.");
          seenToolCalls.add(callSignature);

          const calculatorEvent: ResearchActivityEvent = {
            id: `calculator-${Date.now()}`,
            label: `Calculator · ${expression}`,
            detail: "Evaluating the arithmetic expression…",
            active: true,
          };
          setResearchEvents((events) => [calculatorEvent, ...events]);
          const calculatorResponse = await fetch("/api/tools/calculator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression }),
            cache: "no-store",
            signal: controller.signal,
          });
          const calculation = await calculatorResponse.json() as CalculatorResponse;
          if (!calculatorResponse.ok || typeof calculation.result !== "string") {
            throw new Error(calculation.error || "The calculator could not evaluate the expression.");
          }
          toolResult = calculation.result;

          setResearchEvents((events) => events.map((event) => (
            event.id === calculatorEvent.id
              ? { ...event, detail: `Result · ${calculation.result}`, active: false }
              : event
          )));

          if (isLastTool) {
            const unit = /\bmib\b/i.test(text) ? " MiB"
              : /\bgib\b/i.test(text) ? " GiB"
                : /\b(?:bytes?|octets?)\b/i.test(text) ? " bytes"
                  : "";
            assistantContent = `${toolReasoning}<|final_start|>${calculation.result}${unit}<|final_end|>`;
            publishAssistantContent(assistantContent, true);
            const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
            setTokenStats({ tokens: completedToolTokens, elapsed: finalElapsed, streaming: false });
            setStreaming(false);
            setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
            abortControllerRef.current = null;
            return;
          }
        } else if (activeTool.name === "search_knowledge_base") {
          const query = toolArguments.query;
          if (typeof query !== "string") {
            throw new Error("The model did not provide a knowledge-base query.");
          }
          const callSignature = `${activeTool.name}:${JSON.stringify({ query })}`;
          if (seenToolCalls.has(callSignature)) throw new Error("A repeated tool call was blocked.");
          seenToolCalls.add(callSignature);

          const searchEvent: ResearchActivityEvent = {
            id: `knowledge-search-${Date.now()}`,
            label: `Knowledge search · ${query}`,
            detail: "Retrieving relevant TR-HASH passages…",
            active: true,
          };
          setResearchEvents((events) => [searchEvent, ...events]);
          const searchResponse = await fetch("/api/tools/knowledge-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: `${text}\n${query}` }),
            cache: "no-store",
            signal: controller.signal,
          });
          const search = await searchResponse.json() as KnowledgeSearchResponse;
          if (!searchResponse.ok) {
            throw new Error(search.error || "The knowledge search is unavailable.");
          }
          if (search.status !== "ready" || !search.context || !search.matches?.length) {
            throw new Error("The TR-HASH knowledge base contains no relevant passage.");
          }

          toolResult = search.context;
          setResearchEvents((events) => events.map((event) => (
            event.id === searchEvent.id
              ? {
                ...event,
                detail: `${search.matches!.length} passage${search.matches!.length === 1 ? "" : "s"} · ${search.matches!.map((match) => match.title).join(" · ")}`,
                active: false,
              }
              : event
          )));

          if (isLastTool) {
            const passage = search.passage?.trim();
            if (!passage) throw new Error("The retrieved TR-HASH passage is empty.");
            assistantContent = `${toolReasoning}<|final_start|>${passage}<|final_end|>`;
            publishAssistantContent(assistantContent, true);
            const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
            setTokenStats({ tokens: completedToolTokens, elapsed: finalElapsed, streaming: false });
            setStreaming(false);
            setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
            abortControllerRef.current = null;
            return;
          }
        } else {
          // The model chooses whether to call the tool; the runtime resolves
          // the requested zone from the user's words so a tiny model cannot
          // silently substitute an unrelated zone in otherwise valid JSON.
          const timezone = requestedTimezone(text);
          toolArguments = { timezone };
          const callSignature = `${activeTool.name}:${JSON.stringify(toolArguments)}`;
          if (seenToolCalls.has(callSignature)) throw new Error("A repeated tool call was blocked.");
          seenToolCalls.add(callSignature);
          const dateTimeEvent: ResearchActivityEvent = {
            id: `date-time-${Date.now()}`,
            label: `Date & time · ${timezone}`,
            detail: "Reading the current instant…",
            active: true,
          };
          setResearchEvents((events) => [dateTimeEvent, ...events]);
          const dateTimeResponse = await fetch("/api/tools/date-time", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timezone }),
            cache: "no-store",
            signal: controller.signal,
          });
          const dateTime = await dateTimeResponse.json() as DateTimeResponse;
          if (
            !dateTimeResponse.ok
            || !dateTime.instant_utc
            || !dateTime.utc
            || !dateTime.paris
            || !dateTime.requested
          ) {
            throw new Error(dateTime.error || "The date and time tool is unavailable.");
          }

          toolResult = JSON.stringify(dateTime);
          setResearchEvents((events) => events.map((event) => (
            event.id === dateTimeEvent.id
              ? {
                ...event,
                detail: `${dateTime.requested!.date} · ${dateTime.requested!.time} · ${dateTime.requested!.utc_offset}`,
                active: false,
              }
              : event
          )));

          if (isLastTool) {
            const exactAnswer = formatDateTimeAnswer({
              instant_utc: dateTime.instant_utc,
              utc: dateTime.utc,
              paris: dateTime.paris,
              requested: dateTime.requested,
            }, text);
            assistantContent = `${toolReasoning}<|final_start|>${exactAnswer}<|final_end|>`;
            publishAssistantContent(assistantContent, true);
            const finalElapsed = (performance.now() - streamStartRef.current) / 1000;
            setTokenStats({ tokens: completedToolTokens, elapsed: finalElapsed, streaming: false });
            setStreaming(false);
            setResearchEvents((events) => events.map((event) => ({ ...event, active: false })));
            abortControllerRef.current = null;
            return;
          }
        }

        const canonicalToolCall = `<|tool_call_start|>${JSON.stringify({ name: activeTool.name, arguments: toolArguments })}<|tool_call_end|>`;
        const rawToolCall = parsedToolCall
          ? choice?.message?.content || canonicalToolCall
          : canonicalToolCall;
        chatMessages = [
          ...chatMessages,
          { role: "assistant", content: rawToolCall },
          { role: "tool", content: toolResult },
        ];
      }

      // The deployed model is instruction/chat tuned. Send the full
      // conversation through the server-side chat template instead of
      // treating the latest user message as an unformatted base completion.
      const response = await fetch(`${base}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completionBody(chatMessages, true)),
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
    setParamsByMode((current) => ({
      ...current,
      [mode]: { ...current[mode], [key]: value },
    }));
  }, [mode]);

  return {
    mode,
    setMode,
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

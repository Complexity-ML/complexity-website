"use client";

import { useState, useRef, useCallback } from "react";
import { ENDPOINTS } from "./config";

// ---------------------------------------------------------------------------
// Types for SSE events from vllm-i64 /v1/agent/events
// ---------------------------------------------------------------------------
export interface AgentToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface AgentToolResult {
  name: string;
  result: string;
}

export interface AgentStep {
  step: number;
  type: "sandbox" | "rag_search" | "rag_index" | "completion";
  status: "running" | "done";
  toolCall: AgentToolCall | null;
  toolResult: AgentToolResult | null;
  data: Record<string, unknown>;
}

export interface AgentState {
  steps: AgentStep[];
  connected: boolean;
  running: boolean;
  error: string | null;
}

const INITIAL_STATE: AgentState = {
  steps: [],
  connected: false,
  running: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Hook — connects to vllm-i64 /v1/agent/events SSE
// ---------------------------------------------------------------------------
export function useAgent() {
  const [state, setState] = useState<AgentState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const connect = useCallback(async (sessionId?: string) => {
    // Disconnect previous
    abortRef.current?.abort();

    setState({ steps: [], connected: false, running: true, error: null });

    const controller = new AbortController();
    abortRef.current = controller;

    const baseUrl = ENDPOINTS.agent;
    const params = new URLSearchParams();
    if (sessionId) params.set("session_id", sessionId);
    params.set("history", "50");
    const url = `${baseUrl}/v1/agent/events?${params}`;

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        setState((s) => ({
          ...s,
          running: false,
          error: `Connection failed: HTTP ${res.status}`,
        }));
        return;
      }

      setState((s) => ({ ...s, connected: true }));

      const reader = res.body?.getReader();
      if (!reader) {
        setState((s) => ({ ...s, running: false, connected: false, error: "No response body" }));
        return;
      }

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
          // Skip keepalives and empty lines
          if (!trimmed.startsWith("data: ")) continue;
          const json = trimmed.slice(6);
          if (!json) continue;

          try {
            const event = JSON.parse(json) as {
              type: string;
              session_id: string;
              timestamp: number;
              event_id: string;
              data: Record<string, unknown>;
            };

            // Filter by session if needed
            if (sessionId && event.session_id !== sessionId) continue;

            setState((prev) => applyEvent(prev, event));
          } catch {
            // skip malformed
          }
        }
      }

      setState((s) => ({ ...s, connected: false, running: false }));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setState((s) => ({ ...s, connected: false, running: false }));
        return;
      }
      setState((s) => ({
        ...s,
        connected: false,
        running: false,
        error: e instanceof Error ? e.message : "Connection failed",
      }));
    } finally {
      abortRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((s) => ({ ...s, connected: false, running: false }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return { ...state, connect, disconnect, reset };
}

// ---------------------------------------------------------------------------
// State reducer for vllm-i64 agent events
// ---------------------------------------------------------------------------
function applyEvent(
  state: AgentState,
  event: { type: string; session_id: string; timestamp: number; event_id: string; data: Record<string, unknown> },
): AgentState {
  const steps = [...state.steps];
  const data = event.data;
  const status = (data.status as string) || "done";
  const eventType = event.type as AgentStep["type"];

  if (status === "running") {
    // New step starting
    const step: AgentStep = {
      step: steps.length + 1,
      type: eventType,
      status: "running",
      toolCall: null,
      toolResult: null,
      data,
    };

    // Build tool call info
    if (eventType === "sandbox") {
      step.toolCall = {
        name: "execute_code",
        args: { code: data.code, language: data.language },
      };
    } else if (eventType === "rag_search") {
      step.toolCall = {
        name: "rag_search",
        args: { query: data.query, k: data.k },
      };
    }

    steps.push(step);
    return { ...state, steps };
  }

  if (status === "done") {
    // Find matching running step to complete
    const idx = steps.findLastIndex(
      (s) => s.type === eventType && s.status === "running",
    );

    if (idx >= 0) {
      const step = { ...steps[idx] };
      step.status = "done";
      step.data = data;

      // Build tool result
      if (eventType === "sandbox") {
        step.toolResult = {
          name: "execute_code",
          result: [
            data.stdout ? `stdout:\n${data.stdout}` : "",
            data.stderr ? `stderr:\n${data.stderr}` : "",
            `exit_code: ${data.exit_code ?? "?"}`,
          ].filter(Boolean).join("\n"),
        };
      } else if (eventType === "rag_search") {
        step.toolResult = {
          name: "rag_search",
          result: `${data.count ?? 0} results`,
        };
      }

      steps[idx] = step;
    } else {
      // No matching running step — add as completed
      steps.push({
        step: steps.length + 1,
        type: eventType,
        status: "done",
        toolCall: null,
        toolResult: null,
        data,
      });
    }

    return { ...state, steps };
  }

  return state;
}

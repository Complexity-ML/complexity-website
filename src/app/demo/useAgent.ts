"use client";

import { useState, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types for SSE events from /api/proxy/agent
// ---------------------------------------------------------------------------
export interface AgentToolCall {
  step: number;
  name: string;
  args: Record<string, unknown>;
}

export interface AgentToolResult {
  step: number;
  name: string;
  result: string;
}

export interface AgentEvent {
  type: "thinking" | "text" | "tool_call" | "tool_result" | "answer" | "error" | "done";
  step?: number;
  name?: string;
  args?: Record<string, unknown>;
  result?: string;
  content?: string;
  message?: string;
}

export interface AgentStep {
  step: number;
  thinking: boolean;
  text: string | null;
  toolCalls: AgentToolCall[];
  toolResults: AgentToolResult[];
}

export interface AgentState {
  steps: AgentStep[];
  answer: string | null;
  running: boolean;
  error: string | null;
}

const INITIAL_STATE: AgentState = {
  steps: [],
  answer: null,
  running: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAgent() {
  const [state, setState] = useState<AgentState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    options: { model: string; apiKey: string },
  ) => {
    // Reset
    setState({ steps: [], answer: null, running: true, error: null });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/proxy/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model,
          messages,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: "Request failed" } }));
        setState((s) => ({ ...s, running: false, error: err.error?.message || `HTTP ${res.status}` }));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setState((s) => ({ ...s, running: false, error: "No response body" }));
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
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;

          let event: AgentEvent;
          try {
            event = JSON.parse(json);
          } catch {
            continue;
          }

          setState((prev) => applyEvent(prev, event));
        }
      }

      // Process remaining buffer
      if (buffer.startsWith("data: ")) {
        const json = buffer.slice(6).trim();
        if (json) {
          try {
            const event: AgentEvent = JSON.parse(json);
            setState((prev) => applyEvent(prev, event));
          } catch { /* ignore */ }
        }
      }

      setState((s) => ({ ...s, running: false }));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setState((s) => ({ ...s, running: false }));
        return;
      }
      setState((s) => ({
        ...s,
        running: false,
        error: e instanceof Error ? e.message : "Agent request failed",
      }));
    } finally {
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((s) => ({ ...s, running: false }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return { ...state, run, stop, reset };
}

// ---------------------------------------------------------------------------
// State reducer for SSE events
// ---------------------------------------------------------------------------
function applyEvent(state: AgentState, event: AgentEvent): AgentState {
  const steps = [...state.steps];

  function getOrCreateStep(stepNum: number): AgentStep {
    let step = steps.find((s) => s.step === stepNum);
    if (!step) {
      step = { step: stepNum, thinking: false, text: null, toolCalls: [], toolResults: [] };
      steps.push(step);
    }
    return step;
  }

  switch (event.type) {
    case "thinking": {
      const step = getOrCreateStep(event.step || 1);
      step.thinking = true;
      return { ...state, steps };
    }
    case "text": {
      const step = getOrCreateStep(event.step || 1);
      step.thinking = false;
      step.text = event.content || null;
      return { ...state, steps };
    }
    case "tool_call": {
      const step = getOrCreateStep(event.step || 1);
      step.thinking = false;
      step.toolCalls.push({
        step: event.step || 1,
        name: event.name || "unknown",
        args: event.args || {},
      });
      return { ...state, steps };
    }
    case "tool_result": {
      const step = getOrCreateStep(event.step || 1);
      step.toolResults.push({
        step: event.step || 1,
        name: event.name || "unknown",
        result: event.result || "",
      });
      return { ...state, steps };
    }
    case "answer":
      return { ...state, answer: event.content || "" };
    case "error":
      return { ...state, error: event.message || "Unknown error" };
    case "done":
      return { ...state, running: false };
    default:
      return state;
  }
}

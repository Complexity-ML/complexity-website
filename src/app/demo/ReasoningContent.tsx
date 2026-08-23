"use client";

import { Brain, Loader2 } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import { cn } from "@/lib/utils";
import { normalizeAssistantMarkdown } from "@/lib/assistant-markdown";

type ReasoningState = "plain" | "think" | "final";

export interface ReasoningEnvelope {
  reasoning: string;
  answer: string;
  hasEnvelope: boolean;
  thinking: boolean;
}

const ENVELOPE_TAG_RE = /(<\|(?:think|final)_(?:start|end)\|>)/g;
const ENVELOPE_TAGS = [
  "<|think_start|>",
  "<|think_end|>",
  "<|final_start|>",
  "<|final_end|>",
];

function holdTrailingTagFragment(content: string): string {
  const lower = content.toLowerCase();
  for (const tag of ENVELOPE_TAGS) {
    for (let length = tag.length - 1; length > 0; length--) {
      if (lower.endsWith(tag.slice(0, length))) {
        return content.slice(0, -length);
      }
    }
  }
  return content;
}

/** Parse a complete or partially streamed think/final response. */
export function parseReasoningEnvelope(content: string): ReasoningEnvelope {
  const parts = holdTrailingTagFragment(content).split(ENVELOPE_TAG_RE);
  let state: ReasoningState = "plain";
  let hasEnvelope = false;
  let thinking = false;
  const reasoning: string[] = [];
  const answer: string[] = [];

  for (const part of parts) {
    const tag = part.toLowerCase();
    if (tag === "<|think_start|>") {
      hasEnvelope = true;
      state = "think";
      thinking = true;
      continue;
    }
    if (tag === "<|think_end|>") {
      hasEnvelope = true;
      state = "plain";
      thinking = false;
      continue;
    }
    if (tag === "<|final_start|>") {
      hasEnvelope = true;
      state = "final";
      thinking = false;
      continue;
    }
    if (tag === "<|final_end|>") {
      hasEnvelope = true;
      state = "plain";
      thinking = false;
      continue;
    }

    if (state === "think") reasoning.push(part);
    else answer.push(part);
  }

  return {
    reasoning: reasoning.join("").trim(),
    answer: answer.join("").trim(),
    hasEnvelope,
    thinking,
  };
}

export function visibleAssistantText(content: string): string {
  const normalizedContent = normalizeAssistantMarkdown(content);
  const envelope = parseReasoningEnvelope(normalizedContent);
  if (!envelope.hasEnvelope) return normalizedContent;
  return envelope.answer || envelope.reasoning;
}

export function ReasoningContent({
  content,
  streaming = false,
  className,
}: {
  content: string;
  streaming?: boolean;
  className?: string;
}) {
  const envelope = parseReasoningEnvelope(normalizeAssistantMarkdown(content));

  if (!envelope.hasEnvelope) {
    return (
      <div className={className}>
        <CodeBlock content={content} />
        {streaming && <StreamingCursor />}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {(envelope.reasoning || envelope.thinking) && (
        <div className="rounded-r-xl border-l-2 border-violet-400/35 bg-violet-400/[0.04] px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-violet-300/65">
            {streaming && envelope.thinking ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Brain className="size-3" />
            )}
            {streaming && envelope.thinking ? "Thinking" : "Reasoning"}
          </div>
          {envelope.reasoning && (
            <p className="whitespace-pre-wrap break-words text-[13px] italic leading-6 text-[#9aa8bc] [overflow-wrap:anywhere]">
              {envelope.reasoning}
              {streaming && envelope.thinking && <StreamingCursor subtle />}
            </p>
          )}
        </div>
      )}

      {envelope.answer && (
        <div>
          <CodeBlock content={envelope.answer} />
          {streaming && !envelope.thinking && <StreamingCursor />}
        </div>
      )}
    </div>
  );
}

function StreamingCursor({ subtle = false }: { subtle?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-0.5 inline-block h-[1em] w-px animate-pulse align-[-0.12em]",
        subtle ? "bg-violet-300/60" : "bg-violet-300",
      )}
    />
  );
}

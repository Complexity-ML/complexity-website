"use client";

import { useEffect } from "react";
import { CornerDownLeft, SendHorizonal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Mode } from "./config";
import { FOOTERS } from "./config";
import type { TokenStats } from "./useChat";

interface ChatInputProps {
  mode: Mode;
  input: string;
  loading: boolean;
  streaming: boolean;
  maxTokens: number;
  tokenStats: TokenStats | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  mode,
  input,
  loading,
  streaming,
  maxTokens,
  tokenStats,
  onInputChange,
  onSend,
  onStop,
  inputRef,
}: ChatInputProps) {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && streaming) {
      e.preventDefault();
      onStop();
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative border-t border-border/50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-border/60 bg-card/45 p-2 shadow-2xl shadow-black/20 transition-colors focus-within:border-primary/40">
          <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "compare" ? "Send one prompt to both models…" : "Ask the demo model for a continuation…"}
            rows={1}
            className="min-h-[48px] max-h-[140px] resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          {streaming || loading ? (
            <Button
              onClick={onStop}
              size="icon"
              className="size-11 shrink-0 rounded-xl bg-accent-purple-deep text-white shadow-[0_0_20px_var(--accent-purple-deep),0_0_60px_var(--accent-purple-bg)] hover:bg-accent-purple"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={onSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="size-11 shrink-0 rounded-xl"
            >
              <SendHorizonal className="size-4" />
            </Button>
          )}
        </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <p className="truncate font-mono text-[10px] text-muted-foreground/45">{FOOTERS[mode]}</p>
          <p className="hidden items-center gap-1 font-mono text-[10px] text-muted-foreground/35 sm:flex">
            <CornerDownLeft className="size-3" /> send · shift enter newline
          </p>
          {tokenStats && tokenStats.tokens > 0 && (
            <TokenStatsDisplay stats={tokenStats} maxTokens={maxTokens} />
          )}
        </div>
      </div>
    </div>
  );
}

function TokenStatsDisplay({ stats, maxTokens }: { stats: TokenStats; maxTokens: number }) {
  return (
    <div className="flex items-center gap-3">
      {stats.streaming && (
        <Progress
          value={Math.min((stats.tokens / maxTokens) * 100, 100)}
          className="w-16 h-1 bg-border/30 [&>[data-slot=progress-indicator]]:bg-accent-purple"
        />
      )}
      <p className={cn(
        "text-[10px] font-mono flex items-center gap-2",
        stats.streaming ? "text-accent-purple" : "text-accent-green/60",
      )}>
        {stats.streaming && (
          <span className="inline-block size-1.5 rounded-full animate-pulse bg-accent-purple" />
        )}
        <span>{stats.tokens} tokens</span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span>{stats.elapsed.toFixed(1)}s</span>
        {stats.elapsed > 0 && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span className={stats.streaming ? "text-accent-purple-light" : "text-accent-green/80"}>
              {(stats.tokens / stats.elapsed).toFixed(1)} tok/s
            </span>
          </>
        )}
      </p>
    </div>
  );
}

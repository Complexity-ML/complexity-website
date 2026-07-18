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
    <div className="relative bg-gradient-to-t from-[#07090d] via-[#07090d]/96 to-transparent px-3 pb-3 pt-5 sm:px-6 sm:pb-5">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/[0.1] bg-[#0d1016]/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,.42)] backdrop-blur-2xl transition-colors focus-within:border-emerald-300/30">
          <div className="flex items-center justify-between gap-3 px-2 pb-1.5">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">{mode === "compare" ? "dual inference" : "model input"}</span>
            <span className="flex items-center gap-1.5 font-mono text-[8px] text-emerald-300/55"><span className="size-1.5 rounded-full bg-emerald-300" /> ready</span>
          </div>
          <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "compare" ? "Send one prompt to both models…" : "Ask the demo model for a continuation…"}
            rows={1}
            className="min-h-[48px] max-h-[140px] resize-none border-0 bg-transparent px-2 text-sm shadow-none placeholder:text-white/22 focus-visible:ring-0"
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
              className="size-11 shrink-0 rounded-xl bg-emerald-300 text-black hover:bg-emerald-200"
            >
              <SendHorizonal className="size-4" />
            </Button>
          )}
        </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <p className="hidden truncate font-mono text-[9px] text-white/22 lg:block">{FOOTERS[mode]}</p>
          <p className="flex items-center gap-1 font-mono text-[9px] text-white/22">
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

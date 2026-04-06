"use client";

import { useEffect } from "react";
import { SendHorizonal, Square } from "lucide-react";
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
    <div className="relative border-t border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-end gap-3">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="min-h-[44px] max-h-[120px] resize-none rounded-xl text-sm"
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
              className="shrink-0 size-11 rounded-xl bg-accent-purple-deep hover:bg-accent-purple text-white shadow-[0_0_20px_var(--accent-purple-deep),0_0_60px_var(--accent-purple-bg)]"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={onSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="shrink-0 size-11 rounded-xl"
            >
              <SendHorizonal className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground/40 font-mono truncate">{FOOTERS[mode]}</p>
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

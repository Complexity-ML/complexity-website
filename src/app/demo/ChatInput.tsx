"use client";

import { useEffect } from "react";
import { SendHorizonal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TokenStats } from "./useChat";

interface ChatInputProps {
  input: string;
  loading: boolean;
  streaming: boolean;
  maxTokens: number;
  tokenStats: TokenStats | null;
  unavailableReason?: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  input,
  loading,
  streaming,
  maxTokens,
  tokenStats,
  unavailableReason,
  onInputChange,
  onSend,
  onStop,
  inputRef,
}: ChatInputProps) {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    if (!input && inputRef.current) {
      inputRef.current.style.height = "38px";
    }
  }, [input, inputRef]);

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
    <div className="relative z-10 bg-gradient-to-t from-[#111722] via-[#111722]/96 to-transparent px-3 pb-2 pt-10 sm:px-6">
      <div className="mx-auto w-full max-w-[720px] min-w-0">
        <div className="rounded-[15px] border border-[#40516d] bg-[#1b2433]/98 p-2 shadow-[0_18px_44px_rgba(0,0,0,.3)] backdrop-blur-2xl transition-colors focus-within:border-violet-300/50">
          <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={unavailableReason || "Continue the text…"}
            disabled={!!unavailableReason}
            rows={1}
            className="field-sizing-fixed h-[38px] min-h-[38px] max-h-[88px] resize-none overflow-x-hidden overflow-y-auto break-words border-0 bg-transparent px-2 py-2.5 text-[11px] text-[#e8eef7] shadow-none [overflow-wrap:anywhere] placeholder:text-[#738198] focus-visible:ring-0"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 88)}px`;
            }}
          />
          {streaming || loading ? (
            <Button
              onClick={onStop}
              size="icon"
              className="size-[38px] shrink-0 rounded-[10px] bg-violet-500 text-white shadow-[0_7px_18px_rgba(124,108,242,.25)] hover:bg-violet-400"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={onSend}
              disabled={!input.trim() || loading || !!unavailableReason}
              size="icon"
              className="size-[38px] shrink-0 rounded-[10px] bg-gradient-to-br from-[#7c6cf2] to-[#9a80ff] text-white shadow-[0_7px_18px_rgba(124,108,242,.25)] hover:brightness-110"
            >
              <SendHorizonal className="size-4" />
            </Button>
          )}
        </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-3 px-1">
          {unavailableReason && (
            <p className="mr-auto font-mono text-[9px] text-amber-300/75">
              {unavailableReason}
            </p>
          )}
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
        "flex items-center gap-2 font-mono text-[9px]",
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

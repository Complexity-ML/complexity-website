"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Mode } from "./config";
import { FOOTERS } from "./config";
import type { TokenStats } from "./useChat";

const EXPERT_COLORS = [
  { bar: "var(--expert-0-deep)", tip: "var(--expert-0-light)", glow: "var(--expert-0)" },
  { bar: "var(--expert-1-deep)", tip: "var(--expert-1-light)", glow: "var(--expert-1)" },
  { bar: "var(--expert-2-deep)", tip: "var(--expert-2-light)", glow: "var(--expert-2)" },
  { bar: "var(--expert-3-deep)", tip: "var(--expert-3-light)", glow: "var(--expert-3)" },
];

interface ChatInputProps {
  mode: Mode;
  input: string;
  loading: boolean;
  streaming: boolean;
  maxTokens: number;
  tokenStats: TokenStats | null;
  expertDist: number[] | null;
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
  expertDist,
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

  const hasExperts = expertDist && expertDist.length > 0;

  return (
    <div className="relative border-t border-border/50 bg-background/80 backdrop-blur-lg">
      {/* Desktop: absolute in left margin */}
      {hasExperts && <ExpertBarsDesktop distribution={expertDist} />}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4">
        {/* Mobile: inline above textarea */}
        {hasExperts && <ExpertBarsMobile distribution={expertDist} />}
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

function ExpertBarsDesktop({ distribution }: { distribution: number[] }) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
      <span className="text-[9px] font-mono text-muted-foreground/40">experts</span>
      <div className="flex items-end gap-2">
        {distribution.map((pct, i) => {
          const colors = EXPERT_COLORS[i % EXPERT_COLORS.length];
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    {(pct * 100).toFixed(0)}%
                  </span>
                  <div
                    className="w-5 rounded-sm transition-all duration-700"
                    style={{
                      height: `${Math.max(pct * 100 * 0.6, 4)}px`,
                      background: `linear-gradient(to top, ${colors.bar}, ${colors.tip})`,
                      boxShadow: `0 0 6px color-mix(in oklch, ${colors.glow}, transparent 60%)`,
                    }}
                  />
                  <span className="text-[9px] font-mono text-muted-foreground/30">E{i}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Expert {i}: {(pct * 100).toFixed(1)}%
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function ExpertBarsMobile({ distribution }: { distribution: number[] }) {
  return (
    <div className="flex lg:hidden items-center justify-center gap-3 pb-3">
      <span className="text-[9px] font-mono text-muted-foreground/40">experts</span>
      {distribution.map((pct, i) => {
        const colors = EXPERT_COLORS[i % EXPERT_COLORS.length];
        return (
          <div key={i} className="flex items-center gap-1">
            <div
              className="size-3 rounded-sm"
              style={{ background: colors.glow }}
            />
            <span className="text-[10px] font-mono text-muted-foreground/50">
              {(pct * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
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

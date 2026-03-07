"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
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

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur-lg relative">
      {expertDist && expertDist.length > 0 && (
        <div className="absolute left-4 bottom-4 hidden lg:flex items-end gap-1">
          <span className="text-[9px] font-mono text-muted-foreground/30 mr-1">experts</span>
          <div className="flex items-end gap-0.5 h-8">
            {expertDist.map((pct, i) => (
              <div
                key={i}
                className="w-2.5 rounded-sm transition-all duration-700"
                style={{
                  height: `${Math.max(pct * 100, 12)}%`,
                  background: `linear-gradient(to top, oklch(0.55 0.25 ${300 + i * 30}), oklch(0.7 0.2 ${300 + i * 30}))`,
                  boxShadow: `0 0 4px oklch(0.65 0.2 ${300 + i * 30} / 30%)`,
                  opacity: 0.7 + pct * 0.3,
                }}
                title={`Expert ${i}: ${(pct * 100).toFixed(1)}%`}
              />
            ))}
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/30 ml-1">
            {expertDist.map((pct) => `${(pct * 100).toFixed(0)}%`).join(" ")}
          </span>
        </div>
      )}
      <div className="container mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>
          {streaming || loading ? (
            <button
              onClick={onStop}
              className="shrink-0 group relative rounded-xl px-4 text-sm font-medium transition-all duration-300 overflow-hidden"
              style={{
                height: "44px",
                background: "linear-gradient(135deg, oklch(0.55 0.25 300), oklch(0.45 0.3 280))",
                boxShadow: "0 0 20px oklch(0.55 0.25 300 / 40%), 0 0 60px oklch(0.45 0.3 280 / 15%)",
              }}
            >
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, oklch(0.6 0.25 300), oklch(0.5 0.3 280))" }} />
              <span className="relative flex items-center gap-2 text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2.5} strokeLinecap="round" />
                </svg>
                <span className="text-xs font-mono tracking-wide">stop</span>
              </span>
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!input.trim() || loading}
              className="shrink-0 rounded-xl bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ height: "44px" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground/40 font-mono">{FOOTERS[mode]}</p>
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
        <div className="w-16 h-1 rounded-full bg-border/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, oklch(0.65 0.2 300), oklch(0.7 0.22 280))" }}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min((stats.tokens / maxTokens) * 100, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      <p className="text-[10px] font-mono flex items-center gap-2" style={{ color: stats.streaming ? "oklch(0.65 0.2 300)" : "oklch(0.75 0.18 142 / 60%)" }}>
        {stats.streaming && (
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.65 0.2 300)" }} />
        )}
        <span>{stats.tokens} tokens</span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span>{stats.elapsed.toFixed(1)}s</span>
        {stats.elapsed > 0 && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span style={{ color: stats.streaming ? "oklch(0.7 0.22 300)" : "oklch(0.75 0.18 142 / 80%)" }}>
              {(stats.tokens / stats.elapsed).toFixed(1)} tok/s
            </span>
          </>
        )}
      </p>
    </div>
  );
}

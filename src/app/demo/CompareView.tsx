"use client";

import { motion } from "framer-motion";
import CodeBlock from "@/components/CodeBlock";
import type { CompareResult } from "./useCompare";

interface CompareViewProps {
  results: CompareResult[];
  denseContent: string;
  chatContent: string;
  denseTokens: number;
  chatTokens: number;
  streaming: boolean;
}

function StatBadge({ tokens, elapsed }: { tokens: number; elapsed: number }) {
  if (tokens === 0) return null;
  const tokPerS = elapsed > 0 ? (tokens / elapsed).toFixed(1) : "—";
  return (
    <span className="font-mono text-[10px] text-muted-foreground">
      {tokens} tok · {elapsed.toFixed(1)}s · {tokPerS} tok/s
    </span>
  );
}

function ModelColumn({
  label,
  labelColor,
  content,
  tokens,
  elapsed,
  streaming,
}: {
  label: string;
  labelColor: string;
  content: string;
  tokens: number;
  elapsed: number;
  streaming: boolean;
}) {
  return (
    <section className="min-w-0 flex-1 border-l border-[#40516d] pl-4">
      <header className="mb-3 border-b border-[#2c3a50] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${labelColor}`}>
            {label}
          </span>
          {streaming && tokens > 0 && (
            <span className="font-mono text-[8px] text-violet-300">
              streaming
            </span>
          )}
          <StatBadge tokens={tokens} elapsed={elapsed} />
        </div>
      </header>
      <div className="min-h-[120px]">
        {content ? (
          <CodeBlock content={content} />
        ) : streaming ? (
          <div className="flex h-8 items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-primary/60"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">Waiting…</p>
        )}
      </div>
    </section>
  );
}

function CompareRun({
  prompt,
  dense,
  routed,
}: {
  prompt?: string;
  dense: { content: string; tokens: number; elapsed: number };
  routed: { content: string; tokens: number; elapsed: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {prompt && (
        <div className="ml-auto max-w-[86%] rounded-[14px] border border-[#394961] bg-[#222d3f]/92 px-[15px] py-3 text-xs leading-5 text-[#dce5f2]">
          {prompt}
        </div>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        <ModelColumn
          label="dense baseline"
          labelColor="border-orange-400/30 text-orange-400"
          content={dense.content}
          tokens={dense.tokens}
          elapsed={dense.elapsed}
          streaming={false}
        />
        <ModelColumn
          label="token-routed"
          labelColor="border-green-400/30 text-green-400"
          content={routed.content}
          tokens={routed.tokens}
          elapsed={routed.elapsed}
          streaming={false}
        />
      </div>
    </motion.div>
  );
}

export function CompareView({
  results,
  denseContent,
  chatContent,
  denseTokens,
  chatTokens,
  streaming,
}: CompareViewProps) {
  return (
    <div className="space-y-6">
      {results.map((r, i) => (
        <CompareRun key={i} prompt={r.prompt} dense={r.dense} routed={r.chat} />
      ))}

      {streaming && (
        <div className="grid gap-3 lg:grid-cols-2">
          <ModelColumn
            label="dense baseline"
            labelColor="border-orange-400/30 text-orange-400"
            content={denseContent}
            tokens={denseTokens}
            elapsed={0}
            streaming
          />
          <ModelColumn
            label="token-routed"
            labelColor="border-green-400/30 text-green-400"
            content={chatContent}
            tokens={chatTokens}
            elapsed={0}
            streaming
          />
        </div>
      )}
    </div>
  );
}

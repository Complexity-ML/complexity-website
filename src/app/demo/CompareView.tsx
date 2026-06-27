"use client";

import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    <Card className="min-w-0 flex-1 border-border/60 bg-card/50 shadow-none">
      <CardHeader className="border-b border-border/45 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("font-mono text-[10px]", labelColor)}>
            {label}
          </Badge>
          {streaming && tokens > 0 && (
            <Badge className="border-accent-purple/30 bg-accent-purple/15 font-mono text-[10px] text-accent-purple">
              streaming
            </Badge>
          )}
          <StatBadge tokens={tokens} elapsed={elapsed} />
        </div>
      </CardHeader>
      <CardContent className="min-h-[120px] p-4">
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
      </CardContent>
    </Card>
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
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">
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
      <div className="rounded-2xl border border-border/55 bg-card/40 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-primary">
            <GitCompareArrows className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Qualitative model comparison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Same prompt, two decoding paths. Use this to inspect behavior, not as a benchmark table.
            </p>
          </div>
        </div>
      </div>

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

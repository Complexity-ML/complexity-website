"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompareResult } from "./useCompare";

const EXPERT_COLORS = [
  { bar: "var(--expert-0-deep)", tip: "var(--expert-0-light)", glow: "var(--expert-0)" },
  { bar: "var(--expert-1-deep)", tip: "var(--expert-1-light)", glow: "var(--expert-1)" },
  { bar: "var(--expert-2-deep)", tip: "var(--expert-2-light)", glow: "var(--expert-2)" },
  { bar: "var(--expert-3-deep)", tip: "var(--expert-3-light)", glow: "var(--expert-3)" },
];

interface CompareViewProps {
  results: CompareResult[];
  denseContent: string;
  chatContent: string;
  denseTokens: number;
  chatTokens: number;
  streaming: boolean;
  expertDist: number[] | null;
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
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className={cn("font-mono text-[10px]", labelColor)}>
          {label}
        </Badge>
        {streaming && tokens > 0 && (
          <Badge className="bg-accent-purple/15 text-accent-purple border-accent-purple/30 font-mono text-[10px]">
            streaming
          </Badge>
        )}
        <StatBadge tokens={tokens} elapsed={elapsed} />
      </div>
      <Card className="rounded-xl py-3 gap-0 shadow-none bg-card border-border/50 min-h-[60px]">
        <CardContent className="px-4 py-0">
          {content ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : streaming ? (
            <div className="flex items-center gap-1 h-5">
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
            <p className="text-sm text-muted-foreground italic">Waiting...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExpertDistBar({ distribution }: { distribution: number[] }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <span className="text-[9px] font-mono text-muted-foreground/40">experts</span>
      <div className="flex items-end gap-2">
        {distribution.map((pct, i) => {
          const colors = EXPERT_COLORS[i % EXPERT_COLORS.length];
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-muted-foreground/50">
                {(pct * 100).toFixed(0)}%
              </span>
              <div
                className="w-5 rounded-sm transition-all duration-700"
                style={{
                  height: `${Math.max(pct * 100 * 0.5, 4)}px`,
                  background: `linear-gradient(to top, ${colors.bar}, ${colors.tip})`,
                  boxShadow: `0 0 6px color-mix(in oklch, ${colors.glow}, transparent 60%)`,
                }}
              />
              <span className="text-[9px] font-mono text-muted-foreground/30">E{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompareView({
  results,
  denseContent,
  chatContent,
  denseTokens,
  chatTokens,
  streaming,
  expertDist,
}: CompareViewProps) {
  const hasExperts = expertDist && expertDist.length > 0;

  return (
    <div className="space-y-6">
      {/* Expert distribution bar — i64 model (4 experts) */}
      {hasExperts && <ExpertDistBar distribution={expertDist} />}

      {/* Past results */}
      {results.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* User prompt */}
          <div className="flex justify-end">
            <Card className="max-w-[85%] rounded-xl py-3 gap-0 shadow-none bg-primary/15 border-primary/20">
              <CardContent className="px-4 py-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.prompt}</p>
              </CardContent>
            </Card>
          </div>

          {/* Side by side responses */}
          <div className="flex gap-3">
            <ModelColumn
              label="dense"
              labelColor="text-orange-400 border-orange-400/30"
              content={r.dense.content}
              tokens={r.dense.tokens}
              elapsed={r.dense.elapsed}
              streaming={false}
            />
            <ModelColumn
              label="i64"
              labelColor="text-green-400 border-green-400/30"
              content={r.chat.content}
              tokens={r.chat.tokens}
              elapsed={r.chat.elapsed}
              streaming={false}
            />
          </div>
        </motion.div>
      ))}

      {/* Current streaming result */}
      {streaming && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <ModelColumn
              label="dense"
              labelColor="text-orange-400 border-orange-400/30"
              content={denseContent}
              tokens={denseTokens}
              elapsed={0}
              streaming={true}
            />
            <ModelColumn
              label="i64"
              labelColor="text-green-400 border-green-400/30"
              content={chatContent}
              tokens={chatTokens}
              elapsed={0}
              streaming={true}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, GitCompareArrows, Route, Scale, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Mode, SuggestionGroup } from "./config";
import { DESCRIPTIONS, SUGGESTIONS } from "./config";

const MODE_TITLES: Record<Mode, string> = {
  "TR-MoE": "Try deterministic lexical routing",
  compare: "Compare routed vs dense generation",
  dense: "Probe the dense baseline",
};

const MODE_DISCLAIMERS: Record<Mode, string> = {
  "TR-MoE": "Public demo: 187M serving stack. Paper scaling claim: corrected 306.5M iso-parameter run over 8B tokens.",
  compare: "Qualitative side-by-side demo. Treat it as inspection, not a benchmark table.",
  dense: "Dense baseline for qualitative comparison with token-routed generation.",
};

const proof = [
  { icon: Route, label: "routing", value: "fixed lexical table" },
  { icon: Scale, label: "scaling", value: "306.5M / 8B tokens" },
  { icon: Zap, label: "serving", value: "8,078 tok/s reported" },
];

function SuggestionGroupBlock({
  group,
  onSelect,
}: {
  group: SuggestionGroup;
  onSelect: (prompt: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/60">
        {group.label}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {group.prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="group min-h-16 rounded-2xl border border-border/50 bg-card/45 px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground transition-all hover:border-primary/35 hover:bg-card/70 hover:text-foreground"
          >
            <span>{prompt}</span>
            <ArrowRight className="mt-2 size-3 text-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function WelcomeScreen({
  mode,
  totalRequests,
  onSelectPrompt,
}: {
  mode: Mode;
  totalRequests: number | null;
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
      >
        <div>
          <Badge className="mb-5 gap-2 border-primary/30 bg-primary/10 text-primary">
            <GitCompareArrows className="size-3.5" />
            {mode}
          </Badge>
          <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">
            {MODE_TITLES[mode]}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {DESCRIPTIONS[mode]}
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {proof.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-border/55 bg-card/45">
                  <CardContent className="p-4">
                    <Icon className="mb-3 size-4 text-primary" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="border-border/60 bg-card/45 backdrop-blur">
          <CardContent className="space-y-6 p-5 sm:p-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">starter prompts</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with a short continuation prompt, then inspect latency, tokens, and output shape.
              </p>
            </div>
            <div className="max-h-[36vh] space-y-6 overflow-y-auto pr-1 scrollbar-none">
              {SUGGESTIONS[mode].map((group) => (
                <SuggestionGroupBlock key={group.label} group={group} onSelect={onSelectPrompt} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground/45">
        {MODE_DISCLAIMERS[mode]}
        {totalRequests !== null && ` · ${totalRequests.toLocaleString()} saved requests`}
      </p>
    </div>
  );
}

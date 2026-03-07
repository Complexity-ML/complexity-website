"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Mode } from "./config";
import { DESCRIPTIONS, SUGGESTIONS } from "./config";

const STATS = [
  { label: "params", value: "1.58B" },
  { label: "routing", value: "i64 bit-mask" },
  { label: "experts", value: "4" },
  { label: "kv-cache", value: "paged + LRU" },
  { label: "engine", value: "vllm-i64" },
];

const MODE_TITLES: Record<Mode, string> = {
  python: "Pacific-i64",
  chat: "Chat-Node",
  ros2: "ROS2-Node",
};

const MODE_DISCLAIMERS: Record<Mode, string> = {
  python: "1.58B parameter model \u2014 outputs may require review",
  chat: "1.58B parameter model \u2014 responses are creative and may be unpredictable",
  ros2: "1.58B parameter model \u2014 ROS2 specialist, outputs may require review",
};

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
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
  const allStats = [
    ...STATS,
    { label: "requests", value: totalRequests !== null ? totalRequests.toLocaleString() : "\u2014" },
  ];

  // Pick 4 random suggestions across all groups
  const suggestions = useMemo(() => {
    const all = SUGGESTIONS[mode].flatMap((g) => g.prompts);
    return pickRandom(all, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-xl"
      >
        <p className="font-mono text-4xl text-primary mb-3">//</p>
        <h2 className="text-xl font-bold mb-1">{MODE_TITLES[mode]}</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {DESCRIPTIONS[mode]}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {allStats.map((stat) => (
            <Badge
              key={stat.label}
              variant="outline"
              className="gap-1.5 font-mono text-[10px] py-1 px-2.5 bg-card/30"
            >
              <span className="text-muted-foreground/60">{stat.label}</span>
              <span className="text-primary/80">{stat.value}</span>
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Suggestion cards — 2x2 grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-xl"
      >
        {suggestions.map((prompt) => (
          <Card
            key={prompt}
            className="group cursor-pointer py-3 px-4 gap-2 hover:border-primary/40 transition-colors"
            onClick={() => onSelectPrompt(prompt)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-left leading-snug">
                {prompt}
              </p>
              <ArrowRight className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/0 group-hover:text-primary transition-colors" />
            </div>
          </Card>
        ))}
      </motion.div>

      <p className="text-[10px] text-muted-foreground/30 text-center mt-6 font-mono">
        {MODE_DISCLAIMERS[mode]}
      </p>
    </div>
  );
}

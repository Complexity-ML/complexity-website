"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Mode, SuggestionGroup } from "./config";
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

/* ── Stat Badges ── */
function StatBadges({ totalRequests }: { totalRequests: number | null }) {
  const allStats = [
    ...STATS,
    { label: "requests", value: totalRequests !== null ? totalRequests.toLocaleString() : "\u2014" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {allStats.map((stat) => (
          <Badge
            key={stat.label}
            variant="outline"
            className="gap-1.5 font-mono text-xs py-1.5 px-3 bg-card/30"
          >
            <span className="text-muted-foreground/60">{stat.label}</span>
            <span className="text-primary/80">{stat.value}</span>
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Suggestion Group ── */
function SuggestionGroupBlock({
  group,
  onSelect,
}: {
  group: SuggestionGroup;
  onSelect: (prompt: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-mono text-primary/50 uppercase tracking-widest mb-3">
        {group.label}
      </p>
      {/* mobile: vertical grid | desktop: horizontal flex wrap */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-2 max-h-48 sm:max-h-none overflow-y-auto sm:overflow-visible scrollbar-none">
        {group.prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            onClick={() => onSelect(prompt)}
            className="text-xs font-normal text-muted-foreground hover:text-foreground hover:border-primary/30 text-left sm:text-center whitespace-normal h-auto py-2"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ── Suggestions Panel ── */
function SuggestionsPanel({
  mode,
  onSelect,
}: {
  mode: Mode;
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="mt-8 space-y-6">
      {SUGGESTIONS[mode].map((group) => (
        <SuggestionGroupBlock key={group.label} group={group} onSelect={onSelect} />
      ))}
      <p className="text-[10px] text-muted-foreground/30 text-center mt-4 font-mono">
        {MODE_DISCLAIMERS[mode]}
      </p>
    </div>
  );
}

/* ── Welcome Screen (main export) ── */
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
    <div className="flex items-center justify-center h-full min-h-[60vh] px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-5xl"
      >
        <p className="font-mono text-4xl text-primary mb-4">//</p>
        <h2 className="text-2xl font-bold mb-2">{MODE_TITLES[mode]}</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {DESCRIPTIONS[mode]}
        </p>

        <StatBadges totalRequests={totalRequests} />
        <SuggestionsPanel mode={mode} onSelect={onSelectPrompt} />
      </motion.div>
    </div>
  );
}

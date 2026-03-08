"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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
  agent: "Agent",
};

const MODE_DISCLAIMERS: Record<Mode, string> = {
  python: "1.58B parameter model \u2014 outputs may require review",
  chat: "1.58B parameter model \u2014 responses are creative and may be unpredictable",
  ros2: "1.58B parameter model \u2014 ROS2 specialist, outputs may require review",
  agent: "Connects to vllm-i64 event stream \u2014 run agents from VSCode or CLI",
};

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
      <div className="flex flex-wrap justify-center gap-2">
        {group.prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="rounded-full bg-card/50 border border-border/50 px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:border-primary/30 transition-all cursor-pointer"
          >
            {prompt}
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
  const agentStats = [
    { label: "source", value: "vllm-i64 SSE" },
    { label: "events", value: "sandbox, RAG, completions" },
    { label: "sandbox", value: "L2 isolated" },
    { label: "mode", value: "live viewer" },
  ];

  const allStats = mode === "agent" ? agentStats : [
    ...STATS,
    { label: "requests", value: totalRequests !== null ? totalRequests.toLocaleString() : "\u2014" },
  ];

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-6">
      {/* Hero — compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-xl mb-6"
      >
        <p className="font-mono text-3xl text-primary mb-2">//</p>
        <h2 className="text-xl font-bold mb-1">{MODE_TITLES[mode]}</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {DESCRIPTIONS[mode]}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
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

      {/* All suggestions — contained with max-height scroll */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-2xl space-y-4 max-h-[50vh] overflow-y-auto scrollbar-none pr-1"
      >
        {SUGGESTIONS[mode].map((group) => (
          <SuggestionGroupBlock key={group.label} group={group} onSelect={onSelectPrompt} />
        ))}
      </motion.div>

      <p className="text-[10px] text-muted-foreground/30 text-center mt-4 font-mono">
        {MODE_DISCLAIMERS[mode]}
      </p>
    </div>
  );
}

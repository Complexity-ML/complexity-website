"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GitCompareArrows, Route, Scale, Zap } from "lucide-react";
import type { Mode } from "./config";
import { DESCRIPTIONS, MODEL_NAMES, SUGGESTIONS } from "./config";

const MODE_TITLES: Record<Mode, string> = {
  "TR-MoE-v2": "Chat with TR-HASH MoE 100M Agentic SFT",
  "TR-MoE-v1": "Chat with TR-HASH MoE SFT v1",
};

const MODE_DISCLAIMERS: Record<Mode, string> = {
  "TR-MoE-v2": "Public chat inference from the released 100M Agentic SFT checkpoint. Answers remain experimental.",
  "TR-MoE-v1": "Public chat inference from the released 32,000-token full-SFT checkpoint cited by the preprint. Answers remain experimental.",
};

const proof: Record<Mode, Array<{ icon: typeof Route; label: string; value: string }>> = {
  "TR-MoE-v2": [
    { icon: Route, label: "routing", value: "token-ID hash top-2" },
    { icon: Scale, label: "training", value: "100.4M / 1,007,473 SFT examples" },
    { icon: Zap, label: "serving", value: "2,048 context · 32K vocab · TR-Hash-i64" },
  ],
  "TR-MoE-v1": [
    { icon: Route, label: "routing", value: "token-ID hash top-2" },
    { icon: Scale, label: "scaling", value: "201.2M / ≈162B source tokens" },
    { icon: Zap, label: "serving", value: "32,000 tokens · TR-Hash-i64" },
  ],
};

export function WelcomeScreen({
  mode,
  totalRequests,
  onSelectPrompt,
}: {
  mode: Mode;
  totalRequests: number | null;
  onSelectPrompt: (prompt: string) => void;
}) {
  const prompts = SUGGESTIONS[mode].flatMap((group) => group.prompts.slice(0, 2).map((prompt) => ({ prompt, group: group.label }))).slice(0, 6);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center"
      >
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.055] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-200">
            <GitCompareArrows className="size-3.5" />
            {MODEL_NAMES[mode]}
          </div>
          <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {MODE_TITLES[mode]}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/42 sm:text-base">
            {DESCRIPTIONS[mode]}
          </p>

          <div className="mt-8 grid grid-cols-3 divide-x divide-white/[0.08] border-y border-white/[0.08] py-5">
            {proof[mode].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="px-3 first:pl-0 last:pr-0">
                    <Icon className="mb-3 size-4 text-emerald-300/75" />
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/24">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-white/65 sm:text-xs">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lab-surface rounded-3xl p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="font-mono text-[9px] uppercase tracking-[0.22em] text-violet-300/70">start a run</p><p className="mt-2 text-sm text-white/42">Pick a prompt or write your own below.</p></div>
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/20">public inference</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {prompts.map(({ prompt, group }) => (
              <button key={`${group}-${prompt}`} onClick={() => onSelectPrompt(prompt)} className="group min-h-24 rounded-2xl border border-white/[0.08] bg-black/15 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-emerald-300/[0.035]">
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/22">{group}</span>
                <span className="mt-2 block text-xs leading-5 text-white/55 transition-colors group-hover:text-white/85">{prompt}</span>
                <ArrowUpRight className="ml-auto mt-2 size-3.5 text-emerald-300/0 transition-colors group-hover:text-emerald-300/70" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="mt-7 text-center font-mono text-[9px] leading-5 text-white/22">
        {MODE_DISCLAIMERS[mode]}
        {totalRequests !== null && ` · ${totalRequests.toLocaleString()} saved requests`}
      </p>
    </div>
  );
}

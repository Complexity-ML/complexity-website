"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExpertActivityData } from "./useExpertActivity";

interface ExpertActivationProps {
  activity: ExpertActivityData;
  streaming: boolean;
}

const EXPERT_COLORS = [
  "rgb(129 140 248)",
  "rgb(167 139 250)",
  "rgb(196 181 253)",
  "rgb(244 114 182)",
];

export function ExpertActivation({ activity, streaming }: ExpertActivationProps) {
  const latestExperts = new Set(
    activity.latest?.routes.flatMap((route) => route.experts) ?? [],
  );
  const routeColumns = activity.latest?.routes ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 border-y border-[#2c3a50]/80 py-3"
      aria-label="Live TR-MoE expert activation"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[#9aa8bc]">
          <Activity className={cn("size-3 text-violet-300", streaming && "animate-pulse")} />
          Expert activation
        </span>
        <span className="font-mono text-[8px] text-[#718096]">
          {activity.latest
            ? `token ${activity.latest.token_id} · ${activity.num_layers} layers · top-${activity.top_k}`
            : streaming
              ? "waiting for first token"
              : "last route"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: activity.num_experts }, (_, expert) => {
          const share = activity.distribution[expert] ?? 0;
          const isActive = latestExperts.has(expert);
          const color = EXPERT_COLORS[expert % EXPERT_COLORS.length];
          return (
            <div key={expert} className="flex min-w-0 items-center gap-2">
              <motion.span
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] font-bold"
                animate={{
                  scale: streaming && isActive ? [1, 1.08, 1] : 1,
                  borderColor: isActive ? color : "rgb(64 81 109)",
                  color: isActive ? color : "rgb(113 128 150)",
                  boxShadow: streaming && isActive
                    ? `0 0 18px color-mix(in srgb, ${color} 38%, transparent)`
                    : "0 0 0 transparent",
                }}
                transition={{ duration: 0.48, repeat: streaming && isActive ? Infinity : 0 }}
              >
                E{expert}
                <motion.span
                  className="absolute inset-1 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{ opacity: isActive ? 0.14 + share * 0.5 : 0.025 }}
                />
              </motion.span>
              <span className="min-w-0">
                <strong className="block font-mono text-[9px] text-[#dce5f2]">
                  {(share * 100).toFixed(0)}%
                </strong>
                <small className="block truncate font-mono text-[7px] text-[#53647c]">
                  {activity.counts[expert] ?? 0} routes
                </small>
              </span>
            </div>
          );
        })}
      </div>

      {routeColumns.length > 0 && (
        <div className="mt-3 flex items-end gap-1 overflow-hidden" aria-label="Layer routing trace">
          {routeColumns.map((route) => (
            <div
              key={route.layer}
              className="grid h-8 min-w-1 flex-1 grid-rows-4 gap-px"
              title={`Layer ${route.layer + 1}: ${route.experts.map((expert) => `E${expert}`).join(" + ")}`}
            >
              {Array.from({ length: activity.num_experts }, (_, expert) => {
                const selected = route.experts.includes(expert);
                return (
                  <motion.span
                    key={expert}
                    className="rounded-[1px]"
                    style={{ backgroundColor: EXPERT_COLORS[expert % EXPERT_COLORS.length] }}
                    animate={{
                      opacity: selected ? 0.9 : 0.07,
                      scaleY: selected && streaming ? [0.72, 1, 0.72] : 1,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: route.layer * 0.018,
                      repeat: selected && streaming ? Infinity : 0,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

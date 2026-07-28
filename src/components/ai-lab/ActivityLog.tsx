"use client";

import { Bot, CheckCircle2, CircleDot, MessageSquareText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityLogEvent {
  id: string;
  label: string;
  detail: string;
  kind: "prompt" | "model" | "system";
  active?: boolean;
}

export function ActivityLog({ events }: { events: ActivityLogEvent[] }) {
  return (
    <div>
      <div className="mb-4 rounded-2xl border border-violet-300/22 bg-violet-300/[0.06] p-4">
        <div className="flex items-center gap-3">
          <Radio className="size-4 text-violet-200" />
          <div>
            <p className="text-xs font-semibold text-white/82">AI LAB is listening</p>
            <p className="mt-1 text-[10px] text-white/36">Newest event first</p>
          </div>
        </div>
      </div>
      <div className="relative space-y-1 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-white/[0.08]">
        {events.length === 0 ? (
          <div className="relative flex gap-3 rounded-xl p-2.5">
            <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#111a2a]">
              <CircleDot className="size-3 text-white/40" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-white/58">Waiting for the first inference</p>
              <p className="mt-1 text-[9px] leading-4 text-white/28">Choose a prompt or write your own.</p>
            </div>
          </div>
        ) : events.map((event) => {
          const Icon = event.kind === "prompt" ? MessageSquareText : event.kind === "model" ? Bot : CheckCircle2;
          return (
            <div key={event.id} className="relative flex gap-3 rounded-xl p-2.5 hover:bg-white/[0.025]">
              <span className={cn(
                "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-[#111a2a]",
                event.active ? "border-violet-300/35 text-violet-200" : "border-white/[0.1] text-white/42",
              )}>
                <Icon className={cn("size-3", event.active && "animate-pulse")} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-4 text-white/66">{event.label}</p>
                <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-white/28">{event.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

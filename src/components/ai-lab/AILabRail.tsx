"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AILabRailItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface AILabRailProps {
  side: "left" | "right";
  items: AILabRailItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function AILabRail({ side, items, activeId, onSelect }: AILabRailProps) {
  return (
    <aside
      className={cn(
        "absolute top-14 z-30 flex w-[108px] flex-col gap-2 max-md:w-[92px]",
        side === "left" ? "left-3.5 max-md:left-2" : "right-3.5 max-md:right-2",
      )}
    >
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={active}
              className={cn(
                "flex h-[34px] w-full items-center justify-between gap-2 rounded-[9px] border px-2.5 text-left shadow-[0_7px_20px_rgba(0,0,0,.12)] transition-all",
                active
                  ? "border-violet-300/48 bg-[#28294a] text-violet-200"
                  : "border-[#40516d] bg-[#1b2433]/96 text-[#d4deeb] hover:-translate-y-px hover:border-[#66799a] hover:bg-[#253146]",
              )}
            >
              {side === "left" && <Icon className={cn("size-3.5 shrink-0 text-[#aebcd0]", active && "text-violet-200")} />}
              <span className={cn("min-w-0 truncate text-[9px] font-bold", side === "left" && "flex-1 text-right")}>{item.label}</span>
              {side === "right" && <Icon className={cn("size-3.5 shrink-0 text-[#aebcd0]", active && "text-violet-200")} />}
              {item.badge && <span className="font-mono text-[8px] text-white/30">{item.badge}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

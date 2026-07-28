"use client";

import type { ReactNode } from "react";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

interface AILabPanelProps {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
}

export function AILabPanel({ eyebrow, title, onClose, children, side = "left" }: AILabPanelProps) {
  return (
    <aside className={cn(
      "absolute inset-y-0 z-40 flex w-[min(88vw,310px)] shrink-0 flex-col bg-[#1b2433]/98 backdrop-blur-2xl lg:static lg:z-20",
      side === "left"
        ? "left-0 border-r border-[#2c3a50] shadow-[14px_0_32px_rgba(0,0,0,.12)] lg:w-[250px]"
        : "right-0 border-l border-[#2c3a50] shadow-[-14px_0_32px_rgba(0,0,0,.12)] lg:w-[310px]",
    )}>
      <div className="flex items-start justify-between border-b border-[#2c3a50] px-[18px] py-5">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[#8f82ff]">{eyebrow}</p>
          <h2 className="mt-1.5 text-[17px] font-semibold tracking-[-0.03em]">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-lg border border-[#40516d] bg-[#222d3f] text-[#9aa8bc] transition-colors hover:bg-[#29364a] hover:text-white"
          aria-label={`Close ${title}`}
        >
          {side === "left" ? <PanelLeftClose className="size-4" /> : <PanelRightClose className="size-4" />}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { Settings2, Activity, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Mode } from "./config";
import { MODEL_NAMES, MAINTENANCE } from "./config";
import LogoMark from "@/components/LogoMark";

interface ChatHeaderProps {
  mode: Mode;
  streaming: boolean;
  showParams: boolean;
  showMonitor: boolean;
  health: "ok" | "degraded" | "offline";
  onSwitchMode: (mode: Mode) => void;
  onToggleParams: () => void;
  onToggleMonitor: () => void;
  onClear: () => void;
}

export function ChatHeader({
  mode,
  streaming,
  showParams,
  showMonitor,
  health,
  onSwitchMode,
  onToggleParams,
  onToggleMonitor,
  onClear,
}: ChatHeaderProps) {
  const modelLabel = MODEL_NAMES[mode];

  return (
    <header className="z-50 shrink-0 border-b border-white/[0.07] bg-[#090b10]/94 backdrop-blur-xl">
      <div className="flex min-h-16 flex-col gap-3 px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex min-w-0 items-center justify-between gap-2 lg:shrink-0 lg:justify-start lg:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/45 transition-colors hover:text-white"
          >
            <LogoMark className="size-8 rounded-lg" />
            <span className="hidden text-sm font-semibold tracking-[0.06em] sm:inline">COMPLEXITY</span>
          </Link>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <Link href="/dashboard" className="hidden font-mono text-[10px] text-white/30 transition-colors hover:text-white sm:inline">
            workspace
          </Link>
          <span className="rounded-full border border-violet-400/15 bg-violet-400/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-violet-200/70">model demo</span>
          <Link href="/" aria-label="Back to website" className="text-white/35 hover:text-white sm:hidden"><ArrowLeft className="size-4" /></Link>
        </div>

        <div className="scrollbar-none flex min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5 lg:justify-end lg:overflow-visible lg:pb-0">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => { if (v) onSwitchMode(v as Mode); }}
            variant="outline"
            size="sm"
          >
            {(["TR-MoE", "compare", "dense"] as Mode[]).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                disabled={!!MAINTENANCE[m]}
                className="shrink-0 px-2 font-mono text-[10px] sm:px-3"
              >
                {m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 font-mono text-xs">
              <span
                className={cn(
                  "size-2 rounded-full",
                  streaming && "animate-pulse",
                )}
                style={{
                  background: streaming
                    ? "var(--accent-purple)"
                    : `var(--health-${health})`,
                  boxShadow: health !== "offline" || streaming
                    ? `0 0 6px ${streaming ? "var(--accent-purple)" : `var(--health-${health})`}`
                    : "none",
                }}
              />
              {modelLabel}
            </Badge>
            {streaming && (
              <Badge className="bg-accent-purple/15 text-accent-purple border-accent-purple/30 font-mono text-[10px]">
                streaming
              </Badge>
            )}
          </div>

          <span
            className={cn(
              "size-2 rounded-full md:hidden shrink-0",
              streaming && "animate-pulse",
            )}
            style={{
              background: streaming
                ? "var(--accent-purple)"
                : `var(--health-${health})`,
              boxShadow: health !== "offline" || streaming
                ? `0 0 6px ${streaming ? "var(--accent-purple)" : `var(--health-${health})`}`
                : "none",
            }}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                size="sm"
                pressed={showParams}
                onPressedChange={onToggleParams}
                className="font-mono text-xs"
              >
                <Settings2 className="size-4 sm:hidden" />
                <span className="hidden sm:inline">params</span>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">params</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                size="sm"
                pressed={showMonitor}
                onPressedChange={onToggleMonitor}
                className="font-mono text-xs"
              >
                <Activity className="size-4 sm:hidden" />
                <span className="hidden sm:inline">monitor</span>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">monitor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="font-mono text-xs"
              >
                <Trash2 className="size-4 sm:hidden" />
                <span className="hidden sm:inline">clear</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">clear</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

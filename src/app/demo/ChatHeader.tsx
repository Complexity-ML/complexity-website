"use client";

import Link from "next/link";
import { Settings2, Activity, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Mode } from "./config";
import { MODEL_NAMES, MAINTENANCE } from "./config";

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
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        {/* Logo — hide text on mobile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-primary font-mono text-lg">//</span>
            <span className="font-bold text-lg hidden sm:inline">COMPLEXITY</span>
          </Link>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <Link href="/dashboard" className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            dashboard
          </Link>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <span className="font-mono text-sm text-primary hidden sm:inline">demo</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => { if (v) onSwitchMode(v as Mode); }}
            variant="outline"
            size="sm"
          >
            {(["python", "compare", "ros2", "agent"] as Mode[]).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                disabled={!!MAINTENANCE[m]}
                className="font-mono text-xs px-2 sm:px-3"
              >
                {m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Health + model name — hidden on small screens */}
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

          {/* Health dot only on small screens */}
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

          {/* Text labels on md+, icons on mobile */}
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

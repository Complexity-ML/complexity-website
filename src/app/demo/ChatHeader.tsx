"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
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
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-primary font-mono text-lg">//</span>
            <span className="font-bold text-lg">COMPLEXITY</span>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-mono text-sm text-primary">demo</span>
        </div>

        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => { if (v) onSwitchMode(v as Mode); }}
            variant="outline"
            size="sm"
          >
            {(["python", "chat", "ros2"] as Mode[]).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                disabled={!!MAINTENANCE[m]}
                className="font-mono text-xs"
              >
                {m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="hidden sm:flex items-center gap-2">
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

          <Toggle
            variant="outline"
            size="sm"
            pressed={showParams}
            onPressedChange={onToggleParams}
            className="font-mono text-xs"
          >
            params
          </Toggle>

          <Toggle
            variant="outline"
            size="sm"
            pressed={showMonitor}
            onPressedChange={onToggleMonitor}
            className="font-mono text-xs"
          >
            monitor
          </Toggle>

          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="font-mono text-xs"
          >
            clear
          </Button>
        </div>
      </div>
    </header>
  );
}

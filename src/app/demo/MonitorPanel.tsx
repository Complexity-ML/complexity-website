"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MonitorData } from "./useChat";

interface MonitorPanelProps {
  health: "ok" | "degraded" | "offline";
  snapshot: MonitorData | null;
  expertDist: number[] | null;
}

export function MonitorPanel({ health, snapshot, expertDist }: MonitorPanelProps) {
  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-lg px-6 py-3">
      <div className="flex flex-wrap items-center gap-6">
        <Badge
          variant="outline"
          className="gap-1.5 font-mono text-[10px]"
        >
          <span
            className="size-2 rounded-full"
            style={{
              background: `var(--health-${health})`,
              boxShadow: health !== "offline"
                ? `0 0 6px var(--health-${health})`
                : "none",
            }}
          />
          {health}
        </Badge>

        {snapshot && (
          <>
            <Stat label="tok/s" value={snapshot.tokPerS.toFixed(1)} />

            {snapshot.gpuTotalMb > 0 && (
              <MetricBar
                label="gpu"
                value={snapshot.gpuUtil}
                variant={snapshot.gpuUtil > 90 ? "danger" : snapshot.gpuUtil > 70 ? "warning" : "ok"}
              />
            )}

            <MetricBar
              label="kv"
              value={snapshot.kvUsagePct}
              variant={snapshot.kvUsagePct > 90 ? "danger" : snapshot.kvUsagePct > 70 ? "warning" : "accent"}
            />

            <Stat label="active" value={String(snapshot.activeRequests)} />
          </>
        )}

        {expertDist && expertDist.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/60">experts</span>
            <div className="flex items-end gap-0.5 h-4">
              {expertDist.map((pct, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn("w-2 rounded-sm transition-all duration-500")}
                      style={{
                        height: `${Math.max(pct * 100, 8)}%`,
                        background: `var(--expert-${i % 4})`,
                        opacity: 0.7 + pct * 0.3,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    Expert {i}: {(pct * 100).toFixed(1)}%
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "ok" | "warning" | "danger" | "accent";
}) {
  const indicatorColor = {
    ok: "[&>[data-slot=progress-indicator]]:bg-health-ok",
    warning: "[&>[data-slot=progress-indicator]]:bg-health-degraded",
    danger: "[&>[data-slot=progress-indicator]]:bg-health-offline",
    accent: "[&>[data-slot=progress-indicator]]:bg-accent-purple",
  }[variant];

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-muted-foreground/60">{label}</span>
      <Progress
        value={value}
        className={cn("w-16 h-1.5 bg-border/30", indicatorColor)}
      />
      <span className="text-[10px] font-mono text-primary/70">{value.toFixed(0)}%</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono text-muted-foreground/60">{label}</span>
      <span className="text-[10px] font-mono text-primary/80">{value}</span>
    </div>
  );
}

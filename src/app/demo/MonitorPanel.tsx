"use client";

import type { MonitorData } from "./useChat";

interface MonitorPanelProps {
  health: "ok" | "degraded" | "offline";
  snapshot: MonitorData | null;
  expertDist: number[] | null;
}

export function MonitorPanel({ health, snapshot, expertDist }: MonitorPanelProps) {
  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-lg px-6 py-3">
      <div className="container mx-auto max-w-7xl flex flex-wrap items-center gap-6">
        {/* Health dot */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background:
                health === "ok" ? "oklch(0.75 0.18 142)" :
                health === "degraded" ? "oklch(0.75 0.18 85)" :
                "oklch(0.55 0.2 25)",
              boxShadow:
                health === "ok" ? "0 0 6px oklch(0.75 0.18 142 / 50%)" :
                health === "degraded" ? "0 0 6px oklch(0.75 0.18 85 / 50%)" :
                "0 0 6px oklch(0.55 0.2 25 / 50%)",
            }}
          />
          <span className="text-[10px] font-mono text-muted-foreground">
            {health}
          </span>
        </div>

        {snapshot && (
          <>
            {/* tok/s */}
            <Stat label="tok/s" value={snapshot.tokPerS.toFixed(1)} />

            {/* GPU */}
            {snapshot.gpuTotalMb > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/60">gpu</span>
                <div className="w-16 h-1.5 rounded-full bg-border/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${snapshot.gpuUtil}%`,
                      background: snapshot.gpuUtil > 90
                        ? "oklch(0.65 0.2 25)"
                        : snapshot.gpuUtil > 70
                        ? "oklch(0.75 0.18 85)"
                        : "oklch(0.75 0.18 142)",
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-primary/70">{snapshot.gpuUtil.toFixed(0)}%</span>
              </div>
            )}

            {/* KV cache */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground/60">kv</span>
              <div className="w-16 h-1.5 rounded-full bg-border/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${snapshot.kvUsagePct}%`,
                    background: snapshot.kvUsagePct > 90
                      ? "oklch(0.65 0.2 25)"
                      : snapshot.kvUsagePct > 70
                      ? "oklch(0.75 0.18 85)"
                      : "oklch(0.65 0.2 300)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-primary/70">{snapshot.kvUsagePct.toFixed(0)}%</span>
            </div>

            {/* Active requests */}
            <Stat label="active" value={String(snapshot.activeRequests)} />
          </>
        )}

        {/* Expert routing distribution */}
        {expertDist && expertDist.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/60">experts</span>
            <div className="flex items-end gap-0.5 h-4">
              {expertDist.map((pct, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(pct * 100, 8)}%`,
                    background: `oklch(0.65 0.2 ${300 + i * 30})`,
                    opacity: 0.7 + pct * 0.3,
                  }}
                  title={`Expert ${i}: ${(pct * 100).toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
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

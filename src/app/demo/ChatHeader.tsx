"use client";

import Link from "next/link";
import type { Mode } from "./config";
import { MODEL_NAMES, MAINTENANCE } from "./config";

interface ChatHeaderProps {
  mode: Mode;
  streaming: boolean;
  temperature: number;
  showParams: boolean;
  showMonitor: boolean;
  rtl: boolean;
  health: "ok" | "degraded" | "offline";
  expertDist: number[] | null;
  onSwitchMode: (mode: Mode) => void;
  onSetTemperature: (t: number) => void;
  onToggleParams: () => void;
  onToggleMonitor: () => void;
  onToggleRtl: () => void;
  onClear: () => void;
}

export function ChatHeader({
  mode,
  streaming,
  temperature,
  showParams,
  showMonitor,
  rtl,
  health,
  expertDist,
  onSwitchMode,
  onSetTemperature,
  onToggleParams,
  onToggleMonitor,
  onToggleRtl,
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
          <span className="text-border">/</span>
          <span className="font-mono text-sm text-primary">demo</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            {(["python", "chat", "ros2"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => onSwitchMode(m)}
                disabled={!!MAINTENANCE[m]}
                className={`text-xs px-3 py-1.5 font-mono transition-colors ${
                  mode === m
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span
              className="w-2 h-2 rounded-full transition-colors duration-500"
              style={streaming
                ? { background: "oklch(0.65 0.2 300)", boxShadow: "0 0 8px oklch(0.65 0.2 300 / 50%)", animation: "pulse 2s infinite" }
                : {
                    background: health === "ok" ? "oklch(0.75 0.18 142)" : health === "degraded" ? "oklch(0.75 0.18 85)" : "oklch(0.55 0.2 25)",
                    boxShadow: health === "ok" ? "0 0 6px oklch(0.75 0.18 142 / 50%)" : health === "degraded" ? "0 0 6px oklch(0.75 0.18 85 / 50%)" : "none",
                  }
              }
            />
            {modelLabel}
            {streaming && (
              <span className="text-[10px] font-mono tracking-wider" style={{ color: "oklch(0.65 0.2 300)" }}>
                streaming
              </span>
            )}
          </div>
          {expertDist && expertDist.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-border/40 bg-card/20">
              <span className="text-[10px] font-mono text-muted-foreground/50">experts</span>
              <div className="flex items-end gap-0.5 h-6">
                {expertDist.map((pct, i) => (
                  <div
                    key={i}
                    className="w-2.5 rounded-sm transition-all duration-700"
                    style={{
                      height: `${Math.max(pct * 100, 12)}%`,
                      background: `linear-gradient(to top, oklch(0.55 0.25 ${300 + i * 30}), oklch(0.7 0.2 ${300 + i * 30}))`,
                      boxShadow: `0 0 4px oklch(0.65 0.2 ${300 + i * 30} / 30%)`,
                      opacity: 0.7 + pct * 0.3,
                    }}
                    title={`Expert ${i}: ${(pct * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-muted-foreground/40">
                {expertDist.map((pct) => `${(pct * 100).toFixed(0)}%`).join(" ")}
              </span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-[10px] font-mono text-muted-foreground">temp</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => onSetTemperature(parseFloat(e.target.value))}
              className="w-20 h-1 accent-primary cursor-pointer"
            />
            <span className="text-[10px] font-mono text-primary w-6 text-right">
              {temperature.toFixed(2)}
            </span>
          </div>
          <ToggleButton active={showParams} onClick={onToggleParams} label="params" />
          <ToggleButton active={showMonitor} onClick={onToggleMonitor} label="monitor" />
          <ToggleButton active={rtl} onClick={onToggleRtl} label="RTL" />
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors font-mono"
          >
            clear
          </button>
        </div>
      </div>
    </header>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-md border transition-colors font-mono ${
        active
          ? "border-primary/40 text-primary bg-primary/10"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
      }`}
    >
      {label}
    </button>
  );
}

"use client";

import { Slider } from "@/components/ui/slider";
import type { SamplingParams } from "./useChat";

interface ParamPanelProps {
  params: SamplingParams;
  onUpdate: <K extends keyof SamplingParams>(key: K, value: SamplingParams[K]) => void;
}

export function ParamPanel({ params, onUpdate }: ParamPanelProps) {
  return (
    <div className="border-b border-border/50 bg-card/50 backdrop-blur-lg px-6 py-4">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <ParamControl label="temperature" value={params.temperature} min={0} max={1.5} step={0.1} onChange={(v) => onUpdate("temperature", v)} />
        <ParamControl label="max_tokens" value={params.maxTokens} min={16} max={4096} step={16} onChange={(v) => onUpdate("maxTokens", v)} />
      </div>
    </div>
  );
}

function ParamControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono text-muted-foreground">{label}</label>
        <span className="text-[10px] font-mono text-primary/80">
          {Number.isInteger(step) ? value : value.toFixed(2)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

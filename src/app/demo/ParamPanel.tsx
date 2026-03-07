"use client";

import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { SamplingParams } from "./useChat";

interface ParamPanelProps {
  params: SamplingParams;
  onUpdate: <K extends keyof SamplingParams>(key: K, value: SamplingParams[K]) => void;
}

export function ParamPanel({ params, onUpdate }: ParamPanelProps) {
  return (
    <div className="border-b border-border/50 bg-card/50 backdrop-blur-lg px-6 py-4">
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <ParamControl label="top_k" value={params.topK} min={0} max={200} step={1} onChange={(v) => onUpdate("topK", v)} />
          <ParamControl label="top_p" value={params.topP} min={0} max={1} step={0.05} onChange={(v) => onUpdate("topP", v)} />
          <ParamControl label="min_p" value={params.minP} min={0} max={0.5} step={0.01} onChange={(v) => onUpdate("minP", v)} />
          <ParamControl label="typical_p" value={params.typicalP} min={0} max={1} step={0.05} onChange={(v) => onUpdate("typicalP", v)} />
          <ParamControl label="rep_penalty" value={params.repetitionPenalty} min={1} max={2} step={0.05} onChange={(v) => onUpdate("repetitionPenalty", v)} />
          <ParamControl label="min_tokens" value={params.minTokens} min={0} max={128} step={1} onChange={(v) => onUpdate("minTokens", v)} />
          <ParamControl label="max_tokens" value={params.maxTokens} min={16} max={1024} step={16} onChange={(v) => onUpdate("maxTokens", v)} />
        </div>
        <Separator className="my-3 opacity-30" />
        <p className="text-[10px] font-mono text-muted-foreground/40">
          min_p: dynamic threshold relative to top token probability &middot; typical_p: entropy-based selection (Meister et al. 2022) &middot; min_tokens: suppress EOS until N tokens generated
        </p>
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

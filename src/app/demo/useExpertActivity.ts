"use client";

import { useEffect, useState } from "react";
export interface ExpertActivityData {
  num_experts: number;
  num_layers: number;
  top_k: number;
  active: boolean;
  total_tokens: number;
  total_activations: number;
  distribution: number[];
  counts: number[];
  imbalance?: number;
  latest: {
    token_id: number;
    routes: Array<{
      layer: number;
      experts: number[];
    }>;
  } | null;
}

const EXPERT_POLL_INTERVAL_MS = 1_000;

/** Poll the routed model telemetry only while a visible generation needs it. */
export function useExpertActivity(endpoint: string, enabled: boolean): ExpertActivityData | null {
  const [activity, setActivity] = useState<ExpertActivityData | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActivity(null);
      return;
    }

    let cancelled = false;
    let requestInFlight = false;
    const load = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const response = await fetch(
          `${endpoint.replace(/\/+$/, "")}/v1/experts`,
          { cache: "no-store" },
        );
        if (response.ok && !cancelled) {
          setActivity(await response.json() as ExpertActivityData);
        }
      } catch {
        // Telemetry is decorative and must never interrupt generation.
      } finally {
        requestInFlight = false;
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), EXPERT_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled, endpoint]);

  return activity;
}

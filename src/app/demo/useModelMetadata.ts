"use client";

import { useEffect, useMemo, useState } from "react";
import type { Mode } from "./config";
import { ENDPOINTS, MODEL_NAMES } from "./config";

interface PublicModelMetadata {
  id: string;
  parameter_count: number;
  architecture?: "token-routed" | "dense";
  quantization?: string;
}

function formatParameterCount(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

async function readModel(endpoint: string): Promise<PublicModelMetadata | null> {
  const response = await fetch(`${endpoint.replace(/\/+$/, "")}/v1/models`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = await response.json() as { data?: Partial<PublicModelMetadata>[] };
  const model = payload.data?.[0];
  if (
    !model
    || typeof model.id !== "string"
    || typeof model.parameter_count !== "number"
    || !Number.isFinite(model.parameter_count)
  ) {
    return null;
  }
  return model as PublicModelMetadata;
}

export function useModelMetadata() {
  const [model, setModel] = useState<PublicModelMetadata | null>(null);

  useEffect(() => {
    let disposed = false;
    void readModel(ENDPOINTS["TR-MoE"]).then((loadedModel) => {
      if (!disposed) setModel(loadedModel);
    }).catch(() => {
      // A sleeping or maintained Space keeps the stable model ID fallback.
    });
    return () => {
      disposed = true;
    };
  }, []);

  const labels = useMemo<Record<Mode, string>>(() => {
    const routed = model
      ? `${MODEL_NAMES["TR-MoE"]} · ${formatParameterCount(model.parameter_count)}`
      : MODEL_NAMES["TR-MoE"];
    return {
      "TR-MoE": routed,
    };
  }, [model]);

  return { model, labels };
}

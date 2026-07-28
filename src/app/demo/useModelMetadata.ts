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

type ModelPair = {
  routed: PublicModelMetadata | null;
  dense: PublicModelMetadata | null;
};

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
  const [models, setModels] = useState<ModelPair>({ routed: null, dense: null });

  useEffect(() => {
    let disposed = false;
    void Promise.all([
      readModel(ENDPOINTS["TR-MoE"]),
      readModel(ENDPOINTS.dense),
    ]).then(([routed, dense]) => {
      if (!disposed) setModels({ routed, dense });
    }).catch(() => {
      // A sleeping or maintained Space keeps the stable model ID fallback.
    });
    return () => {
      disposed = true;
    };
  }, []);

  const labels = useMemo<Record<Mode, string>>(() => {
    const routed = models.routed
      ? `${MODEL_NAMES["TR-MoE"]} · ${formatParameterCount(models.routed.parameter_count)}`
      : MODEL_NAMES["TR-MoE"];
    const dense = models.dense
      ? `${MODEL_NAMES.dense} · ${formatParameterCount(models.dense.parameter_count)}`
      : MODEL_NAMES.dense;
    return {
      "TR-MoE": routed,
      dense,
      compare: `${routed} vs ${dense}`,
    };
  }, [models]);

  return { models, labels };
}

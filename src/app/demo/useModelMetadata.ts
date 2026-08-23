"use client";

import { useEffect, useMemo, useState } from "react";
import type { Mode } from "./config";
import { ENDPOINTS, MODEL_NAMES } from "./config";

interface PublicModelMetadata {
  id: string;
  parameter_count: number;
  architecture?: string;
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
  const [models, setModels] = useState<Partial<Record<Mode, PublicModelMetadata>>>({});

  useEffect(() => {
    let disposed = false;
    for (const [mode, endpoint] of Object.entries(ENDPOINTS) as [Mode, string][]) {
      void readModel(endpoint).then((loadedModel) => {
        if (!disposed && loadedModel) {
          setModels((current) => ({ ...current, [mode]: loadedModel }));
        }
      }).catch(() => {
        // A sleeping or maintained Space keeps the stable model ID fallback.
      });
    }
    return () => {
      disposed = true;
    };
  }, []);

  const labels = useMemo<Record<Mode, string>>(() => {
    return {
      "TR-MoE-v2": models["TR-MoE-v2"]
        ? `${MODEL_NAMES["TR-MoE-v2"]} · ${formatParameterCount(models["TR-MoE-v2"].parameter_count)}`
        : MODEL_NAMES["TR-MoE-v2"],
      "TR-MoE-v1": models["TR-MoE-v1"]
        ? `${MODEL_NAMES["TR-MoE-v1"]} · ${formatParameterCount(models["TR-MoE-v1"].parameter_count)}`
        : MODEL_NAMES["TR-MoE-v1"],
    };
  }, [models]);

  return { models, labels };
}

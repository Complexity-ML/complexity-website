"use client";

import { useEffect, useState } from "react";

export type HealthStatus = "ok" | "degraded" | "offline";

const HEALTH_INTERVAL_MS = 20_000;
const HEALTH_TIMEOUT_MS = 10_000;

export function useEndpointHealth(endpoint: string, maintenance?: string): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>(maintenance ? "offline" : "degraded");

  useEffect(() => {
    if (maintenance) {
      setStatus("offline");
      return;
    }

    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
      try {
        const response = await fetch(`${endpoint.replace(/\/+$/, "")}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });
        let payload: { status?: string } | null = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        if (!disposed) {
          setStatus(
            response.ok && payload?.status !== "degraded"
              ? "ok"
              : response.ok
                ? "degraded"
                : "offline",
          );
        }
      } catch {
        if (!disposed) setStatus("offline");
      } finally {
        clearTimeout(timeout);
        if (!disposed) timer = setTimeout(check, HEALTH_INTERVAL_MS);
      }
    };

    void check();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
    };
  }, [endpoint, maintenance]);

  return status;
}

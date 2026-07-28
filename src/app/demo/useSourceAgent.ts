"use client";

import { useCallback, useEffect, useState } from "react";

export type ResearchAgentStatus = "checking" | "online" | "offline";

export function useSourceAgent(enabled = true) {
  const [status, setStatus] = useState<ResearchAgentStatus>("checking");
  const [subagentEnabled, setSubagentEnabled] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!enabled) {
      setStatus("offline");
      return;
    }
    setStatus("checking");
    try {
      const response = await fetch("/api/agent/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Source MCP unavailable.");
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) void refreshStatus();
    else setStatus("offline");
  }, [enabled, refreshStatus]);

  return {
    status,
    subagentEnabled,
    setSubagentEnabled,
    refreshStatus,
  };
}

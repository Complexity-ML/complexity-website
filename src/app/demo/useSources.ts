"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface GroundedSource {
  id: string;
  uri: string;
  title: string;
  mediaType: string;
  retrievedAt: string;
  sha256: string;
  content: string;
  offset: number;
  nextOffset: number | null;
  totalChars: number;
  truncated: boolean;
  enabled: boolean;
}

export type SourceServerStatus = "checking" | "online" | "offline";

// Leave room for instructions, the user prompt and generated output inside
// the current 2k-token inference window.
const MAX_CONTEXT_CHARS = 4_500;

function sourceId(source: Pick<GroundedSource, "uri" | "sha256">) {
  return `${source.uri}#${source.sha256}`;
}

export function buildGroundedPrompt(prompt: string, sources: GroundedSource[]) {
  const active = sources.filter((source) => source.enabled);
  if (active.length === 0) return prompt;

  let remaining = MAX_CONTEXT_CHARS;
  const excerpts: string[] = [];
  for (const [index, source] of active.entries()) {
    if (remaining <= 0) break;
    const header = `[S${index + 1}] ${source.title}\nURI: ${source.uri}\nSHA-256: ${source.sha256}\n`;
    const content = source.content.slice(0, Math.max(0, remaining - header.length));
    excerpts.push(`${header}${content}`);
    remaining -= header.length + content.length;
  }

  return [
    "Answer the question using the supplied sources for factual claims.",
    "Cite supporting claims inline as [S1], [S2], and say when the sources do not contain enough information.",
    "Do not invent source content or citations.",
    "",
    "SOURCES",
    excerpts.join("\n\n"),
    "",
    "QUESTION",
    prompt,
    "",
    "ANSWER",
  ].join("\n");
}

export function useSources() {
  const [sources, setSources] = useState<GroundedSource[]>([]);
  const [status, setStatus] = useState<SourceServerStatus>("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setStatus("checking");
    try {
      const response = await fetch("/api/sources", { cache: "no-store" });
      setStatus(response.ok ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const addSource = useCallback(async (input: string) => {
    const url = input.trim();
    if (!url || loading) return false;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json() as {
        source?: Omit<GroundedSource, "id" | "enabled">;
        error?: string;
      };
      if (!response.ok || !payload.source) {
        throw new Error(payload.error || "The source could not be read.");
      }
      const next: GroundedSource = {
        ...payload.source,
        id: sourceId(payload.source),
        enabled: true,
      };
      setSources((current) => {
        const withoutDuplicate = current.filter((source) => source.uri !== next.uri);
        return [next, ...withoutDuplicate].slice(0, 6);
      });
      setStatus("online");
      return true;
    } catch (sourceError) {
      setError(sourceError instanceof Error ? sourceError.message : "The source could not be read.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const removeSource = useCallback((id: string) => {
    setSources((current) => current.filter((source) => source.id !== id));
  }, []);

  const toggleSource = useCallback((id: string) => {
    setSources((current) => current.map((source) => (
      source.id === id ? { ...source, enabled: !source.enabled } : source
    )));
  }, []);

  const clearSources = useCallback(() => {
    setSources([]);
    setError(null);
  }, []);

  const activeSources = useMemo(
    () => sources.filter((source) => source.enabled),
    [sources],
  );

  const buildPrompt = useCallback(
    (prompt: string) => buildGroundedPrompt(prompt, sources),
    [sources],
  );

  return {
    sources,
    activeSources,
    status,
    loading,
    error,
    addSource,
    removeSource,
    toggleSource,
    clearSources,
    refreshStatus,
    buildPrompt,
  };
}

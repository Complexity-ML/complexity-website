"use client";

import { useState } from "react";
import {
  Check,
  ExternalLink,
  FileCheck2,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { GroundedSource, SourceServerStatus } from "./useSources";

interface SourcesPanelProps {
  sources: GroundedSource[];
  status: SourceServerStatus;
  loading: boolean;
  error: string | null;
  onAdd: (url: string) => Promise<boolean>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onRefreshStatus: () => void;
}

function statusCopy(status: SourceServerStatus) {
  if (status === "online") return "Source MCP connected";
  if (status === "checking") return "Checking Source MCP…";
  return "Source MCP unavailable";
}

export function SourcesPanel({
  sources,
  status,
  loading,
  error,
  onAdd,
  onToggle,
  onRemove,
  onClear,
  onRefreshStatus,
}: SourcesPanelProps) {
  const [url, setUrl] = useState("");

  const submit = async () => {
    if (await onAdd(url)) setUrl("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#33435b] bg-[#202b3d] p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`size-2 shrink-0 rounded-full ${
              status === "online"
                ? "bg-emerald-400"
                : status === "checking"
                  ? "animate-pulse bg-amber-300"
                  : "bg-rose-400"
            }`} />
            <span className="truncate text-[10px] font-semibold text-[#dbe5f2]">{statusCopy(status)}</span>
          </div>
          <button
            type="button"
            onClick={onRefreshStatus}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#40516d] text-[#9aa8bc] transition-colors hover:bg-[#2a374b] hover:text-white"
            aria-label="Check Source MCP connection"
          >
            <RefreshCw className={`size-3.5 ${status === "checking" ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="mt-2 text-[9px] leading-4 text-[#7f8da1]">
          Public pages and GitHub files are read through the official MCP protocol with URL, timestamp and SHA-256 provenance.
        </p>
      </div>

      <div>
        <label htmlFor="ai-lab-source-url" className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#718096]">
          Add a source
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="ai-lab-source-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit();
            }}
            placeholder="https://…"
            className="min-w-0 flex-1 rounded-lg border border-[#40516d] bg-[#151e2c] px-3 py-2 text-[10px] text-[#e8eef7] outline-none placeholder:text-[#53647c] focus:border-violet-400/70"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!url.trim() || loading}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add source"
          >
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </button>
        </div>
        {error && <p className="mt-2 text-[9px] leading-4 text-rose-300">{error}</p>}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#718096]">
          Grounding · {sources.filter((source) => source.enabled).length} active
        </p>
        {sources.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[8px] font-semibold text-[#7f8da1] hover:text-rose-300"
          >
            Clear
          </button>
        )}
      </div>

      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#40516d] px-4 py-7 text-center">
          <ShieldCheck className="mx-auto size-5 text-violet-300/80" />
          <p className="mt-2 text-[10px] font-semibold text-[#cbd6e5]">No source attached</p>
          <p className="mt-1 text-[9px] leading-4 text-[#718096]">
            Add a public page or a GitHub file. AI LAB will cite it as [S1].
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <article
              key={source.id}
              className={`rounded-xl border p-3 transition-colors ${
                source.enabled
                  ? "border-violet-400/35 bg-violet-400/[0.07]"
                  : "border-[#33435b] bg-[#202b3d] opacity-60"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggle(source.id)}
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    source.enabled
                      ? "border-violet-300/60 bg-violet-400/20 text-violet-200"
                      : "border-[#53647c] text-transparent"
                  }`}
                  aria-label={source.enabled ? `Disable ${source.title}` : `Enable ${source.title}`}
                >
                  <Check className="size-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[10px] font-semibold leading-4 text-[#dbe5f2]">{source.title}</p>
                  <p className="mt-1 truncate font-mono text-[8px] text-[#718096]">
                    {source.totalChars.toLocaleString()} chars · {source.sha256.slice(0, 10)}
                  </p>
                </div>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-[#718096] hover:bg-white/5 hover:text-white"
                  aria-label={`Open ${source.title}`}
                >
                  <ExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(source.id)}
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-[#718096] hover:bg-rose-400/10 hover:text-rose-300"
                  aria-label={`Remove ${source.title}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 border-t border-white/[0.06] pt-2 font-mono text-[8px] text-emerald-300/75">
                <FileCheck2 className="size-3" />
                verified excerpt · {new Date(source.retrievedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

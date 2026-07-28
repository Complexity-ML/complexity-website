import {
  Bot,
  BrainCircuit,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import type { ResearchAgentStatus } from "./useSourceAgent";

interface AgentPanelProps {
  status: ResearchAgentStatus;
  subagentEnabled: boolean;
  onSubagentChange: (enabled: boolean) => void;
  onRefreshStatus: () => void;
}

function statusCopy(status: ResearchAgentStatus) {
  if (status === "online") return "Research agent ready";
  if (status === "checking") return "Waking the research agent…";
  return "Research agent unavailable";
}

export function AgentPanel({
  status,
  subagentEnabled,
  onSubagentChange,
  onRefreshStatus,
}: AgentPanelProps) {
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
            aria-label="Check research agent"
          >
            <RefreshCw className={`size-3.5 ${status === "checking" ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="mt-2 text-[9px] leading-4 text-[#7f8da1]">
          A managed, read-only agent gives AI LAB access to verified source material when research is required.
        </p>
      </div>

      <div className="rounded-xl border border-violet-400/25 bg-violet-400/[0.06] p-3">
        <div className="flex items-center gap-2 text-violet-100">
          <BrainCircuit className="size-4" />
          <p className="text-[10px] font-semibold">Source-first research</p>
        </div>
        <p className="mt-2 text-[9px] leading-4 text-[#8e9bb0]">
          The agent favors retrieved evidence over unsupported factual answers and retains provenance for the application.
        </p>
      </div>

      <div className="rounded-xl border border-[#33435b] bg-[#202b3d] p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-2">
            <Workflow className="mt-0.5 size-4 shrink-0 text-violet-300" />
            <div>
              <p className="text-[10px] font-semibold text-[#dbe5f2]">Subagent delegation</p>
              <p className="mt-1 text-[9px] leading-4 text-[#7f8da1]">
                Allow one bounded research worker before the main agent answers.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={subagentEnabled}
            onClick={() => onSubagentChange(!subagentEnabled)}
            className={`relative mt-0.5 h-5 w-9 shrink-0 overflow-hidden rounded-full border p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/50 ${
              subagentEnabled
                ? "border-violet-300/60 bg-violet-500"
                : "border-[#53647c] bg-[#151e2c]"
            }`}
            aria-label="Subagent delegation"
          >
            <span className={`pointer-events-none absolute left-0.5 top-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform ${
              subagentEnabled ? "translate-x-4" : "translate-x-0"
            }`} />
          </button>
        </div>
        <p className={`mt-3 border-t border-white/[0.06] pt-2 font-mono text-[8px] ${
          subagentEnabled ? "text-emerald-300/80" : "text-[#718096]"
        }`}>
          {subagentEnabled ? "subagent permission enabled" : "main agent only"}
        </p>
      </div>

      <div className="rounded-xl border border-[#33435b] bg-[#202b3d] p-3">
        <div className="flex items-center gap-2 text-[#cbd6e5]">
          <LockKeyhole className="size-4 text-emerald-300" />
          <p className="text-[10px] font-semibold">Controlled by AI LAB</p>
        </div>
        <p className="mt-2 text-[9px] leading-4 text-[#7f8da1]">
          Visitors cannot add tools, endpoints or source URLs. Agent infrastructure and credentials stay behind the application.
        </p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.06] pt-2 font-mono text-[8px] text-emerald-300/75">
          <ShieldCheck className="size-3" />
          managed · read-only · provenance retained
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#40516d] px-3 py-3 text-[#7f8da1]">
        <Bot className="size-4 shrink-0 text-violet-300/80" />
        <p className="text-[9px] leading-4">Agent activity appears in Live logs when a research step runs.</p>
      </div>
    </div>
  );
}

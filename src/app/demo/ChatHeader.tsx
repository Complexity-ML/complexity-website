"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Settings2, Activity, Trash2, CircleUserRound, Network, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Mode } from "./config";
import { MODEL_NAMES, MAINTENANCE } from "./config";
import LogoMark from "@/components/LogoMark";

const MODE_META = {
  "TR-MoE": { label: "TR-HASH MoE 200M", detail: "full SFT · hash top-2", icon: Network },
} satisfies Record<Mode, { label: string; detail: string; icon: typeof Network }>;

interface ChatHeaderProps {
  mode: Mode;
  streaming: boolean;
  showParams: boolean;
  showMonitor: boolean;
  health: "ok" | "degraded" | "offline";
  onSwitchMode: (mode: Mode) => void;
  onToggleParams: () => void;
  onToggleMonitor: () => void;
  onClear: () => void;
}

export function ChatHeader({
  mode,
  streaming,
  showParams,
  showMonitor,
  health,
  onSwitchMode,
  onToggleParams,
  onToggleMonitor,
  onClear,
}: ChatHeaderProps) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const modelLabel = MODEL_NAMES[mode];

  return (
    <header className="z-50 shrink-0 border-b border-white/[0.08] bg-[#09111d]/96 backdrop-blur-2xl">
      <div className="flex min-h-16 items-center gap-2 px-3 sm:px-4 lg:px-5">
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
          >
            <LogoMark className="size-8 rounded-lg" />
            <span className="hidden text-sm font-semibold tracking-[0.06em] sm:inline">COMPLEXITY</span>
          </Link>
          <span className="hidden rounded-md border border-violet-400/20 bg-violet-400/[0.08] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-violet-100/78 md:inline">AI LAB</span>
        </div>

        <div className="scrollbar-none mx-auto flex min-w-0 items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-black/20 p-1">
          {(["TR-MoE"] as Mode[]).map((m) => {
            const meta = MODE_META[m];
            const Icon = meta.icon;
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                disabled={!!MAINTENANCE[m]}
                onClick={() => onSwitchMode(m)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-lg px-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-35 sm:px-3",
                  active ? "bg-white/[0.09] text-white shadow-sm" : "text-white/38 hover:bg-white/[0.04] hover:text-white/75",
                )}
              >
                <Icon className={cn("size-3.5", active && "text-emerald-300")} />
                <span>
                  <span className="block text-[11px] font-medium leading-none">{meta.label}</span>
                  <span className="mt-1 hidden font-mono text-[8px] leading-none text-white/28 xl:block">{meta.detail}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="mr-1 hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 2xl:flex" title={modelLabel}>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  streaming && "animate-pulse",
                )}
                style={{
                  background: streaming
                    ? "var(--accent-purple)"
                    : `var(--health-${health})`,
                  boxShadow: health !== "offline" || streaming
                    ? `0 0 6px ${streaming ? "var(--accent-purple)" : `var(--health-${health})`}`
                    : "none",
                }}
              />
              <span className="font-mono text-[9px] text-white/45">{streaming ? "streaming" : health}</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                size="sm"
                pressed={showParams}
                onPressedChange={onToggleParams}
                className="size-9 border-white/[0.08] p-0 text-white/45 hover:text-white"
              >
                <Settings2 className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">params</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                size="sm"
                pressed={showMonitor}
                onPressedChange={onToggleMonitor}
                className="hidden size-9 border-white/[0.08] p-0 text-white/45 hover:text-white sm:inline-flex"
              >
                <Activity className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">monitor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="hidden size-9 border-white/[0.08] p-0 text-white/45 hover:text-white sm:inline-flex"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">clear</TooltipContent>
          </Tooltip>

          {status === "authenticated" ? (
            <Button variant="ghost" className="ml-1 h-10 gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.045] px-2 text-left" asChild>
              <Link href="/dashboard/settings" aria-label="Open account">
                {user?.image ? <Image src={user.image} alt="" width={26} height={26} className="size-6.5 rounded-lg" /> : <CircleUserRound className="size-5 text-emerald-300" />}
                <span className="hidden max-w-24 truncate text-[11px] text-white/70 xl:inline">{user?.name || "Account"}</span>
                <span className="size-1.5 rounded-full bg-emerald-300" />
              </Link>
            </Button>
          ) : status === "unauthenticated" ? (
            <Button variant="outline" size="sm" className="ml-1 h-9 border-white/10 px-2.5 text-[11px]" asChild>
              <Link href="/auth/signin?callbackUrl=%2Fai-lab"><LogIn className="size-3.5" /><span className="hidden sm:inline">Sign in</span></Link>
            </Button>
          ) : <span className="ml-1 size-9 animate-pulse rounded-xl bg-white/[0.04]" />}
        </div>
      </div>
    </header>
  );
}

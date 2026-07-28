"use client";

import { memo } from "react";
import Link from "next/link";
import { Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Conversation } from "./useConversations";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  authenticated: boolean;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onToggle: () => void;
  embedded?: boolean;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export const ChatSidebar = memo(function ChatSidebar({
  conversations,
  activeId,
  collapsed,
  authenticated,
  onSelect,
  onNew,
  onDelete,
  onToggle,
  embedded = false,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col transition-all duration-200",
        embedded ? "w-full bg-transparent" : "border-r border-white/[0.07] bg-[#090b10]/78 backdrop-blur-xl",
        collapsed && !embedded ? "w-14" : embedded ? "w-full" : "w-72",
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center gap-1 border-b border-white/[0.06] p-3", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 rounded-lg bg-white/[0.04] font-mono text-[10px] uppercase tracking-[0.12em] text-white/65 hover:bg-white/[0.07]"
            onClick={onNew}
          >
            <Plus className="size-4" />
            {embedded ? "New inference" : "New chat"}
          </Button>
        )}
        {collapsed && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onNew} title="New chat">
            <Plus className="size-4" />
          </Button>
        )}
        {!embedded && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={onToggle}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        )}
      </div>

      {/* Conversation list */}
      {!collapsed && (
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="mb-3 px-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/22">Saved threads</p>
          {!authenticated && (
            <div className="rounded-xl border border-violet-300/12 bg-violet-300/[0.035] p-3">
              <LockKeyhole className="size-4 text-violet-300/70" />
              <p className="mt-3 text-xs font-medium text-white/70">Keep your conversations</p>
              <p className="mt-1 text-[10px] leading-5 text-white/32">The model demo is public. Sign in only if you want saved history and account controls.</p>
              <Link href="/auth/signin?callbackUrl=%2Fai-lab" className="mt-3 inline-flex text-[10px] font-medium text-violet-200 hover:text-white">Sign in →</Link>
            </div>
          )}
          {authenticated && conversations.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/[0.08] px-3 py-7 text-center text-xs text-white/28">No saved threads yet</p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2.5 transition-colors",
                activeId === conv.id
                  ? "border-emerald-300/15 bg-emerald-300/[0.055] text-white"
                  : "border-transparent text-white/38 hover:border-white/[0.06] hover:bg-white/[0.035] hover:text-white/75",
              )}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="size-3.5 shrink-0" />
              <span className="text-xs truncate flex-1">{conv.title}</span>
              <span className="text-[10px] text-muted-foreground shrink-0 hidden group-hover:hidden">
                {timeAgo(conv.updatedAt)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </nav>
      )}
    </aside>
  );
});

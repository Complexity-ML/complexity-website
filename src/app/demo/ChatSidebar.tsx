"use client";

import { memo } from "react";
import { Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Conversation } from "./useConversations";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onToggle: () => void;
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
  onSelect,
  onNew,
  onDelete,
  onToggle,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "h-full border-r border-border/50 bg-background/50 flex flex-col transition-all duration-200",
        collapsed ? "w-12" : "w-64",
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center p-2 gap-1", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 font-mono text-xs"
            onClick={onNew}
          >
            <Plus className="size-4" />
            New chat
          </Button>
        )}
        {collapsed && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onNew} title="New chat">
            <Plus className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      {/* Conversation list */}
      {!collapsed && (
        <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
                activeId === conv.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground",
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

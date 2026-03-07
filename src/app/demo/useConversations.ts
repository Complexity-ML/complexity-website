"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Mode, Message } from "./config";

export interface Conversation {
  id: string;
  title: string;
  mode: Mode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const MAX_CONVERSATIONS = 10;

function generateTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  const text = first.content.slice(0, 50);
  return text.length < first.content.length ? text + "..." : text;
}

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isAuthenticated = !!userId;

  // Load conversations on mount
  useEffect(() => {
    loaded.current = false;
    if (!isAuthenticated) {
      setConversations([]);
      loaded.current = true;
      return;
    }

    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        if (data.conversations) {
          setConversations(
            data.conversations.map((c: Record<string, unknown>) => ({
              id: c.id,
              title: c.title,
              mode: c.mode as Mode,
              messages: [], // loaded on select
              createdAt: new Date(c.createdAt as string).getTime(),
              updatedAt: new Date(c.updatedAt as string).getTime(),
            })),
          );
        }
        loaded.current = true;
      })
      .catch(() => {
        loaded.current = true;
      });
  }, [isAuthenticated]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback(
    (mode: Mode): string => {
      if (!isAuthenticated) return "";

      if (conversations.length >= MAX_CONVERSATIONS) {
        return "";
      }

      // Optimistic local ID, replaced by server ID
      const tempId = `temp_${Date.now()}`;
      const conv: Conversation = {
        id: tempId,
        title: "New chat",
        mode,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(tempId);

      fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.conversation) {
            const serverId = data.conversation.id;
            setConversations((prev) =>
              prev.map((c) => (c.id === tempId ? { ...c, id: serverId } : c)),
            );
            setActiveId((prev) => (prev === tempId ? serverId : prev));
          }
        })
        .catch(() => {
          // Rollback
          setConversations((prev) => prev.filter((c) => c.id !== tempId));
          setActiveId(null);
        });

      return tempId;
    },
    [isAuthenticated, conversations.length],
  );

  const updateMessages = useCallback(
    (id: string, messages: Message[]) => {
      if (!isAuthenticated || id.startsWith("temp_")) return;

      const title = generateTitle(messages);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const newTitle = c.title === "New chat" && messages.length > 0 ? title : c.title;
          return { ...c, messages, title: newTitle, updatedAt: Date.now() };
        }),
      );

      // Debounced save to DB
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/conversations/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages }),
        }).catch(() => {});
      }, 2000);
    },
    [isAuthenticated],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);

      if (isAuthenticated && !id.startsWith("temp_")) {
        fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
      }
    },
    [activeId, isAuthenticated],
  );

  const selectConversation = useCallback(
    (id: string | null) => {
      setActiveId(id);

      // Lazy-load messages if not yet loaded
      if (id && isAuthenticated && !id.startsWith("temp_")) {
        const conv = conversations.find((c) => c.id === id);
        if (conv && conv.messages.length === 0) {
          fetch(`/api/conversations/${id}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.conversation?.messages) {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === id ? { ...c, messages: data.conversation.messages } : c,
                  ),
                );
              }
            })
            .catch(() => {});
        }
      }
    },
    [isAuthenticated, conversations],
  );

  const isFull = conversations.length >= MAX_CONVERSATIONS;

  return {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateMessages,
    deleteConversation,
    selectConversation,
    isFull,
  };
}

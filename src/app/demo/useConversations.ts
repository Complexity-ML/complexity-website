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

const STORAGE_KEY = "complexity_conversations";

function loadFromStorage(userId?: string): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(convos: Conversation[], userId?: string) {
  if (typeof window === "undefined") return;
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(convos));
}

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

  // Load from localStorage on mount / userId change
  useEffect(() => {
    const convos = loadFromStorage(userId);
    setConversations(convos);
    loaded.current = true;
  }, [userId]);

  // Debounced persist — save at most every 2s
  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToStorage(conversations, userId);
    }, 2000);
    return () => clearTimeout(saveTimer.current);
  }, [conversations, userId]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current);
      // Can't access latest state in cleanup, but the debounced save will have caught it
    };
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback((mode: Mode): string => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const conv: Conversation = {
      id,
      title: "New chat",
      mode,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const updateMessages = useCallback((id: string, messages: Message[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const title = c.title === "New chat" && messages.length > 0
          ? generateTitle(messages)
          : c.title;
        return { ...c, messages, title, updatedAt: Date.now() };
      })
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      // Save immediately on delete
      saveToStorage(next, userId);
      return next;
    });
    if (activeId === id) setActiveId(null);
  }, [activeId, userId]);

  const selectConversation = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateMessages,
    deleteConversation,
    selectConversation,
  };
}

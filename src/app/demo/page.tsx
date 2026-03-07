"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Mode } from "./config";
import { useChat } from "./useChat";
import { useConversations } from "./useConversations";
import { ChatHeader } from "./ChatHeader";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, LoadingBubble, ErrorBanner } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MonitorPanel } from "./MonitorPanel";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatSidebar } from "./ChatSidebar";

export default function DemoPage() {
  return (
    <Suspense>
      <TooltipProvider>
        <DemoContent />
      </TooltipProvider>
    </Suspense>
  );
}

function DemoContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialMode = (searchParams.get("mode") as Mode) || "python";
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;

  const chat = useChat(initialMode === "ros2" ? "ros2" : "python", userId);
  const convos = useConversations(userId);

  const [showParams, setShowParams] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  // When active conversation changes, load its messages
  useEffect(() => {
    if (convos.activeConversation) {
      chat.loadMessages(convos.activeConversation.messages);
      if (convos.activeConversation.mode !== chat.mode) {
        chat.switchMode(convos.activeConversation.mode);
      }
    } else {
      chat.loadMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convos.activeId]);

  // Save messages to active conversation when they change
  useEffect(() => {
    if (convos.activeId && chat.messages.length > 0) {
      convos.updateMessages(convos.activeId, chat.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages]);

  // Auto-scroll
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      userScrolledUp.current = !atBottom;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages]);

  // When user sends first message in a new chat, auto-create conversation
  const handleSend = useCallback(() => {
    if (!convos.activeId && chat.input.trim()) {
      convos.createConversation(chat.mode);
    }
    chat.sendMessage();
  }, [convos, chat]);

  const handleNewChat = useCallback(() => {
    if (chat.streaming || chat.loading) chat.stopGeneration();
    chat.clearChat();
    convos.selectConversation(null);
    inputRef.current?.focus();
  }, [chat, convos]);

  const handleSelectConvo = useCallback((id: string | null) => {
    if (chat.streaming || chat.loading) chat.stopGeneration();
    convos.selectConversation(id);
  }, [chat, convos]);

  const handleClear = useCallback(() => {
    chat.clearChat();
    if (convos.activeId) {
      convos.deleteConversation(convos.activeId);
    }
    inputRef.current?.focus();
  }, [chat, convos]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader
        mode={chat.mode}
        streaming={chat.streaming}
        showParams={showParams}
        showMonitor={showMonitor}
        health={chat.healthStatus}
        onSwitchMode={(m) => { chat.switchMode(m); inputRef.current?.focus(); }}
        onToggleParams={() => setShowParams(!showParams)}
        onToggleMonitor={() => setShowMonitor(!showMonitor)}
        onClear={handleClear}
      />

      {showParams && <ParamPanel params={chat.params} onUpdate={chat.updateParam} />}
      {showMonitor && (
        <MonitorPanel
          health={chat.healthStatus}
          snapshot={chat.snapshot}
          expertDist={chat.expertDist}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <ChatSidebar
            conversations={convos.conversations}
            activeId={convos.activeId}
            collapsed={sidebarCollapsed}
            onSelect={handleSelectConvo}
            onNew={handleNewChat}
            onDelete={convos.deleteConversation}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main ref={mainRef} className="flex-1 overflow-y-auto">
            {chat.messages.length === 0 ? (
              <WelcomeScreen
                mode={chat.mode}
                totalRequests={chat.totalRequests}
                onSelectPrompt={(prompt) => { chat.setInput(prompt); inputRef.current?.focus(); }}
              />
            ) : (
              <div className="container mx-auto max-w-7xl px-6 py-6 space-y-6">
                {chat.messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} mode={chat.mode} />
                ))}
                {chat.loading && <LoadingBubble mode={chat.mode} />}
                {chat.error && <ErrorBanner message={chat.error} />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          <ChatInput
            mode={chat.mode}
            input={chat.input}
            loading={chat.loading}
            streaming={chat.streaming}
            maxTokens={chat.params.maxTokens}
            tokenStats={chat.tokenStats}
            expertDist={chat.expertDist}
            onInputChange={chat.setInput}
            onSend={handleSend}
            onStop={chat.stopGeneration}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}

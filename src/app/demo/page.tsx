"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Mode } from "./config";
import { useChat } from "./useChat";
import { useCompare } from "./useCompare";
import { useConversations } from "./useConversations";
import { ChatHeader } from "./ChatHeader";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, LoadingBubble, ErrorBanner } from "./ChatMessage";
import { CompareView } from "./CompareView";
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
  const initialMode = (searchParams.get("mode") as Mode) || "TR-MoE";
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;

  const chat = useChat(initialMode === "dense" ? "dense" : initialMode === "compare" ? "TR-MoE" : initialMode);
  const compare = useCompare();
  const convos = useConversations(userId);

  const [activeMode, setActiveMode] = useState<Mode>(initialMode);

  const [showParams, setShowParams] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  const isCompare = activeMode === "compare";

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

  // Save messages only when streaming/loading finishes (not on every token)
  const prevStreaming = useRef(false);
  useEffect(() => {
    const wasActive = prevStreaming.current;
    prevStreaming.current = chat.streaming || chat.loading;
    if (convos.activeId && chat.messages.length > 0) {
      if ((wasActive && !chat.streaming && !chat.loading) || chat.messages.length <= 2) {
        convos.updateMessages(convos.activeId, chat.messages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages, chat.streaming, chat.loading]);

  // Auto-scroll
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      userScrolledUp.current = !atBottom;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: chat.streaming ? "instant" : "smooth" });
    }
  }, [chat.messages, chat.streaming]);

  // Mode switching
  const handleSwitchMode = useCallback((m: Mode) => {
    if (m === activeMode) return;
    chat.switchMode(m);
    setActiveMode(m);
    inputRef.current?.focus();
  }, [activeMode, chat]);

  const handleSend = useCallback(() => {
    if (isCompare) {
      compare.sendMessage();
      return;
    }

    if (!convos.activeId && chat.input.trim()) {
      if (convos.isFull) return;
      convos.createConversation(chat.mode);
    }
    chat.sendMessage();
  }, [isCompare, compare, convos, chat]);

  const handleNewChat = useCallback(() => {
    if (isCompare) {
      compare.clearResults();
      inputRef.current?.focus();
      return;
    }
    if (chat.streaming || chat.loading) chat.stopGeneration();
    chat.clearChat();
    convos.selectConversation(null);
    inputRef.current?.focus();
  }, [isCompare, compare, chat, convos]);

  const handleSelectConvo = useCallback((id: string | null) => {
    if (chat.streaming || chat.loading) chat.stopGeneration();
    convos.selectConversation(id);
  }, [chat, convos]);

  const handleClear = useCallback(() => {
    if (isCompare) {
      compare.clearResults();
      inputRef.current?.focus();
      return;
    }
    chat.clearChat();
    if (convos.activeId) {
      convos.deleteConversation(convos.activeId);
    }
    inputRef.current?.focus();
  }, [isCompare, compare, chat, convos]);

  const handleStop = useCallback(() => {
    if (isCompare) {
      compare.stopGeneration();
    } else {
      chat.stopGeneration();
    }
  }, [isCompare, compare, chat]);

  const showCompareWelcome = isCompare && compare.results.length === 0 && !compare.loading && !compare.streaming;
  const showChatWelcome = !isCompare && chat.messages.length === 0 && !chat.loading && !chat.streaming;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader
        mode={activeMode}
        streaming={isCompare ? compare.streaming : chat.streaming}
        showParams={showParams}
        showMonitor={showMonitor}
        health={isCompare ? compare.healthStatus : chat.healthStatus}
        onSwitchMode={handleSwitchMode}
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
        {/* Sidebar — hidden on mobile, hidden in compare mode */}
        {!isCompare && (
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
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main ref={mainRef} className="flex-1 overflow-y-auto">
            {(showCompareWelcome || showChatWelcome) ? (
              <WelcomeScreen
                mode={activeMode}
                totalRequests={isCompare ? null : chat.totalRequests}
                onSelectPrompt={(prompt) => {
                  if (isCompare) {
                    compare.sendMessage(prompt);
                  } else {
                    if (!convos.activeId) {
                      if (convos.isFull) return;
                      convos.createConversation(chat.mode);
                    }
                    chat.sendMessage(prompt);
                  }
                }}
              />
            ) : (
              <div className={`mx-auto px-4 sm:px-6 py-4 space-y-4 ${isCompare ? "max-w-6xl" : "max-w-4xl"}`}>
                {isCompare ? (
                  <>
                    <CompareView
                      results={compare.results}
                      denseContent={compare.denseContent}
                      chatContent={compare.chatContent}
                      denseTokens={compare.denseTokens}
                      chatTokens={compare.chatTokens}
                      streaming={compare.streaming}
                      expertDist={compare.expertDist}
                    />
                    {compare.error && <ErrorBanner message={compare.error} />}
                  </>
                ) : (
                  <>
                    {chat.messages.map((msg, i) => (
                      <ChatMessage key={i} message={msg} mode={chat.mode} />
                    ))}
                    {chat.loading && <LoadingBubble mode={chat.mode} />}
                    {chat.error && <ErrorBanner message={chat.error} />}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          <ChatInput
            mode={activeMode}
            input={isCompare ? compare.input : chat.input}
            loading={isCompare ? compare.loading : chat.loading}
            streaming={isCompare ? compare.streaming : chat.streaming}
            maxTokens={isCompare ? compare.params.maxTokens : chat.params.maxTokens}
            tokenStats={isCompare ? null : chat.tokenStats}
            expertDist={isCompare ? compare.expertDist : chat.expertDist}
            onInputChange={isCompare ? compare.setInput : chat.setInput}
            onSend={handleSend}
            onStop={handleStop}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}

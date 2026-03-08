"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Mode } from "./config";
import { useChat } from "./useChat";
import { useAgent } from "./useAgent";
import { useConversations } from "./useConversations";
import { ChatHeader } from "./ChatHeader";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, LoadingBubble, ErrorBanner } from "./ChatMessage";
import { AgentMessage } from "./AgentMessage";
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

  const chat = useChat(initialMode === "ros2" ? "ros2" : initialMode === "agent" ? "python" : initialMode);
  const agent = useAgent();
  const convos = useConversations(userId);

  // Track current mode separately since agent mode doesn't use useChat's mode
  const [activeMode, setActiveMode] = useState<Mode>(initialMode);

  const [showParams, setShowParams] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentInput, setAgentInput] = useState("");
  const [agentUserMessage, setAgentUserMessage] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  const isAgent = activeMode === "agent";

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
  }, [chat.messages, agent.steps, agent.answer]);

  // Mode switching
  const handleSwitchMode = useCallback((m: Mode) => {
    if (m === activeMode) return;
    if (m !== "agent") {
      chat.switchMode(m);
    }
    if (m === "agent") {
      agent.reset();
      setAgentUserMessage(null);
      setAgentInput("");
    }
    setActiveMode(m);
    inputRef.current?.focus();
  }, [activeMode, chat, agent]);

  // Send message
  const handleSend = useCallback(() => {
    if (isAgent) {
      const text = agentInput.trim();
      if (!text || agent.running) return;
      setAgentUserMessage(text);
      setAgentInput("");
      // Get API key from session or localStorage
      const apiKey = localStorage.getItem("complexity_api_key") || "";
      agent.run(
        [{ role: "user", content: text }],
        { model: "claude-sonnet-4-20250514", apiKey },
      );
      return;
    }

    if (!convos.activeId && chat.input.trim()) {
      if (convos.isFull) return;
      convos.createConversation(chat.mode);
    }
    chat.sendMessage();
  }, [isAgent, agentInput, agent, convos, chat]);

  const handleNewChat = useCallback(() => {
    if (isAgent) {
      agent.reset();
      setAgentUserMessage(null);
      setAgentInput("");
      return;
    }
    if (chat.streaming || chat.loading) chat.stopGeneration();
    chat.clearChat();
    convos.selectConversation(null);
    inputRef.current?.focus();
  }, [isAgent, agent, chat, convos]);

  const handleSelectConvo = useCallback((id: string | null) => {
    if (chat.streaming || chat.loading) chat.stopGeneration();
    convos.selectConversation(id);
  }, [chat, convos]);

  const handleClear = useCallback(() => {
    if (isAgent) {
      agent.reset();
      setAgentUserMessage(null);
      return;
    }
    chat.clearChat();
    if (convos.activeId) {
      convos.deleteConversation(convos.activeId);
    }
    inputRef.current?.focus();
  }, [isAgent, agent, chat, convos]);

  const handleStop = useCallback(() => {
    if (isAgent) {
      agent.stop();
    } else {
      chat.stopGeneration();
    }
  }, [isAgent, agent, chat]);

  // Determine if the agent welcome screen should show
  const showAgentWelcome = isAgent && !agentUserMessage && !agent.running;
  const showChatWelcome = !isAgent && chat.messages.length === 0 && !chat.loading && !chat.streaming;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader
        mode={activeMode}
        streaming={isAgent ? agent.running : chat.streaming}
        showParams={showParams}
        showMonitor={showMonitor}
        health={isAgent ? "ok" : chat.healthStatus}
        onSwitchMode={handleSwitchMode}
        onToggleParams={() => setShowParams(!showParams)}
        onToggleMonitor={() => setShowMonitor(!showMonitor)}
        onClear={handleClear}
      />

      {showParams && !isAgent && <ParamPanel params={chat.params} onUpdate={chat.updateParam} />}
      {showMonitor && !isAgent && (
        <MonitorPanel
          health={chat.healthStatus}
          snapshot={chat.snapshot}
          expertDist={chat.expertDist}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — hidden on mobile, hidden in agent mode */}
        {!isAgent && (
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
            {(showAgentWelcome || showChatWelcome) ? (
              <WelcomeScreen
                mode={activeMode}
                totalRequests={isAgent ? null : chat.totalRequests}
                onSelectPrompt={(prompt) => {
                  if (isAgent) {
                    setAgentUserMessage(prompt);
                    setAgentInput("");
                    const apiKey = localStorage.getItem("complexity_api_key") || "";
                    agent.run(
                      [{ role: "user", content: prompt }],
                      { model: "claude-sonnet-4-20250514", apiKey },
                    );
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
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
                {isAgent ? (
                  <>
                    {/* User message */}
                    {agentUserMessage && (
                      <ChatMessage
                        message={{ role: "user", content: agentUserMessage }}
                        mode="agent"
                      />
                    )}
                    {/* Agent response with steps */}
                    <AgentMessage agent={agent} />
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
            input={isAgent ? agentInput : chat.input}
            loading={isAgent ? false : chat.loading}
            streaming={isAgent ? agent.running : chat.streaming}
            maxTokens={chat.params.maxTokens}
            tokenStats={isAgent ? null : chat.tokenStats}
            expertDist={isAgent ? null : chat.expertDist}
            onInputChange={isAgent ? setAgentInput : chat.setInput}
            onSend={handleSend}
            onStop={handleStop}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}

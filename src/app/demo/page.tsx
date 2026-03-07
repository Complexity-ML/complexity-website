"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Mode } from "./config";
import { MAINTENANCE } from "./config";
import { useChat } from "./useChat";
import { ChatHeader } from "./ChatHeader";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, LoadingBubble, ErrorBanner } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MonitorPanel } from "./MonitorPanel";
import { WelcomeScreen } from "./WelcomeScreen";

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
  const initialMode = (searchParams.get("mode") as Mode) || "python";

  const chat = useChat(initialMode === "ros2" ? "ros2" : "python");

  const [showParams, setShowParams] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  // Auto-scroll on new messages
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

  const maintenanceMsg = MAINTENANCE[chat.mode];

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
        onClear={() => { chat.clearChat(); inputRef.current?.focus(); }}
      />

      {showParams && <ParamPanel params={chat.params} onUpdate={chat.updateParam} />}
      {showMonitor && (
        <MonitorPanel
          health={chat.healthStatus}
          snapshot={chat.snapshot}
          expertDist={chat.expertDist}
        />
      )}

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
        onSend={chat.sendMessage}
        onStop={chat.stopGeneration}
        inputRef={inputRef}
      />
    </div>
  );
}



"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import type { Mode } from "./config";
import { DESCRIPTIONS, SUGGESTIONS, MAINTENANCE } from "./config";
import { useChat } from "./useChat";
import { ChatHeader } from "./ChatHeader";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, LoadingBubble, ErrorBanner } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MonitorPanel } from "./MonitorPanel";

export default function DemoPage() {
  return (
    <Suspense>
      <DemoContent />
    </Suspense>
  );
}

function DemoContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as Mode) || "python";

  const chat = useChat(initialMode === "ros2" ? "ros2" : "python");

  const [showParams, setShowParams] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [rtl, setRtl] = useState(false);
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
        temperature={chat.params.temperature}
        showParams={showParams}
        showMonitor={showMonitor}
        rtl={rtl}
        health={chat.healthStatus}
        onSwitchMode={(m) => { chat.switchMode(m); inputRef.current?.focus(); }}
        onSetTemperature={(t) => chat.updateParam("temperature", t)}
        onToggleParams={() => setShowParams(!showParams)}
        onToggleMonitor={() => setShowMonitor(!showMonitor)}
        onToggleRtl={() => setRtl(!rtl)}
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
          <div dir={rtl ? "rtl" : "ltr"} className="container mx-auto max-w-7xl px-6 py-6 space-y-6">
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
        rtl={rtl}
        maxTokens={chat.params.maxTokens}
        tokenStats={chat.tokenStats}
        onInputChange={chat.setInput}
        onSend={chat.sendMessage}
        onStop={chat.stopGeneration}
        inputRef={inputRef}
      />
    </div>
  );
}

function WelcomeScreen({
  mode,
  totalRequests,
  onSelectPrompt,
}: {
  mode: Mode;
  totalRequests: number | null;
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-mono text-4xl text-primary mb-4">//</p>
        <h2 className="text-2xl font-bold mb-2">
          {mode === "python" ? "Pacific-i64" : mode === "chat" ? "Chat-Node" : "ROS2-Node"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {DESCRIPTIONS[mode]}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          {[
            { label: "params", value: "1.58B" },
            { label: "routing", value: "i64 bit-mask" },
            { label: "experts", value: "4" },
            { label: "kv-cache", value: "paged + LRU" },
            { label: "engine", value: "vllm-i64" },
            { label: "requests", value: totalRequests !== null ? totalRequests.toLocaleString() : "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-card/30"
            >
              <span className="text-[10px] font-mono text-muted-foreground/60">{stat.label}</span>
              <span className="text-[10px] font-mono text-primary/80">{stat.value}</span>
            </div>
          ))}
        </motion.div>

        <div className="mt-8 max-w-7xl mx-auto px-4 space-y-6">
          {SUGGESTIONS[mode].map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-mono text-primary/50 uppercase tracking-widest mb-3">
                {group.label}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {group.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSelectPrompt(prompt)}
                    className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground/30 text-center mt-4 font-mono">
            {mode === "chat"
              ? "1.58B parameter model — responses are creative and may be unpredictable"
              : mode === "ros2"
              ? "1.58B parameter model — ROS2 specialist, outputs may require review"
              : "1.58B parameter model — outputs may require review"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

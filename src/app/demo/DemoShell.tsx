"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Activity,
  Bot,
  CheckCircle2,
  MessageSquareText,
  ScrollText,
  SlidersHorizontal,
  WandSparkles,
} from "lucide-react";
import type { Mode } from "./config";
import { AGENT_MODE_ENABLED, MAINTENANCE, SUGGESTIONS } from "./config";
import { useChat } from "./useChat";
import { useConversations } from "./useConversations";
import { useModelMetadata } from "./useModelMetadata";
import { useSourceAgent } from "./useSourceAgent";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, ErrorBanner } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MonitorPanel } from "./MonitorPanel";
import { ChatSidebar } from "./ChatSidebar";
import { AgentPanel } from "./AgentPanel";
import {
  ActivityLog,
  AILabExitButton,
  AILabPanel,
  AILabRail,
  type ActivityLogEvent,
} from "@/components/ai-lab";

const MODES: Mode[] = ["TR-MoE"];
type LeftPanel = "chats" | "prompts" | "agent" | "logs";
type RightPanel = "model" | "metrics" | "results";

const LEFT_RAIL = [
  { id: "chats", label: "Chats", icon: MessageSquareText },
  { id: "prompts", label: "Prompts", icon: WandSparkles },
  ...(AGENT_MODE_ENABLED ? [{ id: "agent", label: "Agent", icon: Bot }] : []),
  { id: "logs", label: "Live logs", icon: ScrollText },
];

const RIGHT_RAIL = [
  { id: "model", label: "Model", icon: SlidersHorizontal },
  { id: "metrics", label: "Metrics", icon: Activity },
  { id: "results", label: "Results", icon: CheckCircle2 },
];

function shortTitle(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "New inference";
  return compact.length > 64 ? `${compact.slice(0, 64)}…` : compact;
}

export function DemoShell() {
  const { data: session } = useSession();
  const initialMode: Mode = "TR-MoE";
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;

  const chat = useChat();
  const convos = useConversations(userId);
  const sourceAgent = useSourceAgent(AGENT_MODE_ENABLED);
  const { labels: modelLabels } = useModelMetadata();

  const activeMode = initialMode;
  const [leftPanel, setLeftPanel] = useState<LeftPanel | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  const suggestions = useMemo(
    () => SUGGESTIONS[activeMode]
      .flatMap((group) => group.prompts.slice(0, 2).map((prompt) => ({ label: group.label, prompt })))
      .slice(0, 6),
    [activeMode],
  );

  const activityEvents = useMemo<ActivityLogEvent[]>(() => {
    const events = chat.messages.map<ActivityLogEvent>((message, index) => ({
      id: `activity-${index}`,
      label: message.role === "user"
        ? "Prompt accepted"
        : message.content
          ? "Inference completed"
          : "Model is generating",
      detail: message.content || "Waiting for the first streamed tokens…",
      kind: message.role === "user" ? "prompt" as const : "model" as const,
      active: message.role === "assistant" && !message.content,
    })).reverse();

    if (chat.streaming) {
      events.unshift({
        id: "activity-streaming",
        label: "Live generation in progress",
        detail: `${chat.tokenStats?.tokens ?? 0} tokens received from ${modelLabels[chat.mode]}`,
        kind: "system",
        active: true,
      });
    }
    events.unshift(...chat.researchEvents.map((event) => ({
        id: event.id,
        label: event.label,
        detail: event.detail,
        kind: "system" as const,
        active: event.active,
      })));
    if (AGENT_MODE_ENABLED && sourceAgent.subagentEnabled) {
      events.unshift({
        id: "activity-subagent-armed",
        label: "Research subagent armed",
        detail: "One bounded delegation is allowed before the main agent answers.",
        kind: "system",
        active: false,
      });
    }
    return events;
  }, [
    chat.messages,
    chat.mode,
    chat.researchEvents,
    chat.streaming,
    chat.tokenStats?.tokens,
    modelLabels,
    sourceAgent.subagentEnabled,
  ]);

  useEffect(() => {
    if (convos.activeConversation) {
      // A newly-created conversation changes from a temporary ID to its server
      // ID while generation is already running. Keep the live message state in
      // place instead of reloading the still-empty conversation snapshot.
      if ((chat.streaming || chat.loading) && chat.messages.length > 0) {
        return;
      }
      if (!convos.activeConversation.messagesLoaded) {
        return;
      }
      chat.loadMessages(convos.activeConversation.messages);
    } else {
      chat.loadMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convos.activeId, convos.activeConversation?.messagesLoaded]);

  const prevStreaming = useRef(false);
  const previousMessageCount = useRef(0);
  const streamedContentLength = chat.messages.at(-1)?.content.length ?? 0;
  useEffect(() => {
    const wasActive = prevStreaming.current;
    const isActive = chat.streaming || chat.loading;
    const messageCountChanged = previousMessageCount.current !== chat.messages.length;
    prevStreaming.current = isActive;
    previousMessageCount.current = chat.messages.length;
    if (convos.activeId && chat.messages.length > 0) {
      // Stage new message shells immediately, then persist their final content
      // once streaming stops. Do not rewrite conversation state on every token.
      if (messageCountChanged || (wasActive && !isActive)) {
        convos.updateMessages(convos.activeId, chat.messages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages, chat.streaming, chat.loading]);

  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;
    const onScroll = () => {
      const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 150;
      userScrolledUp.current = !atBottom;
    };
    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: chat.streaming ? "instant" : "smooth" });
    }
  }, [chat.messages.length, chat.streaming, streamedContentLength]);

  const handleSend = useCallback(() => {
    if (!convos.activeId && chat.input.trim()) {
      if (convos.isFull) return;
      convos.createConversation(chat.mode);
    }
    chat.sendMessage(undefined, {
      research: AGENT_MODE_ENABLED && sourceAgent.subagentEnabled,
    });
  }, [convos, chat, sourceAgent.subagentEnabled]);

  const handleNewChat = useCallback(() => {
    if (chat.streaming || chat.loading) chat.stopGeneration();
    chat.clearChat();
    convos.selectConversation(null);
    inputRef.current?.focus();
  }, [chat, convos]);

  const handleSelectConvo = useCallback((id: string | null) => {
    if (chat.streaming || chat.loading) chat.stopGeneration();
    chat.loadMessages([]);
    convos.selectConversation(id);
  }, [chat, convos]);

  const handleClear = useCallback(() => {
    chat.clearChat();
    if (convos.activeId) convos.deleteConversation(convos.activeId);
    inputRef.current?.focus();
  }, [chat, convos]);

  const handleStop = useCallback(() => {
    chat.stopGeneration();
  }, [chat]);

  const handlePromptSelection = useCallback((prompt: string) => {
    setLeftPanel(null);
    if (!convos.activeId) {
      if (convos.isFull) return;
      convos.createConversation(chat.mode);
    }
    chat.sendMessage(prompt, {
      research: AGENT_MODE_ENABLED && sourceAgent.subagentEnabled,
    });
  }, [chat, convos, sourceAgent.subagentEnabled]);

  const inputValue = chat.input;
  const messageCount = chat.messages.length;
  const runCount = chat.messages.filter((message) => message.role === "user").length;
  const conversationTitle = convos.activeConversation?.title
    ?? shortTitle(chat.messages.find((message) => message.role === "user")?.content ?? "");
  const publicLabel = "PUBLIC DEMO";
  const activeParams = chat.params;
  const updateParams = chat.updateParam;
  const activeHealth = chat.healthStatus;
  const unavailableReason = MAINTENANCE[activeMode]
    ?? (activeHealth === "offline" ? `${modelLabels[activeMode]} is temporarily unavailable.` : undefined);
  const leftRail = useMemo(
    () => LEFT_RAIL.map((item) => (
      item.id === "agent"
        ? { ...item, badge: sourceAgent.status === "online" ? "ON" : "—" }
        : item
    )),
    [sourceAgent.status],
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#111722] text-[#e8eef7]">
      <section className="relative flex min-w-0 flex-1 overflow-hidden">
        {leftPanel === "chats" && (
          <AILabPanel eyebrow="workspace" title="Chats" onClose={() => setLeftPanel(null)}>
            <ChatSidebar
              conversations={convos.conversations}
              activeId={convos.activeId}
              collapsed={false}
              authenticated={!!userId}
              onSelect={(id) => {
                handleSelectConvo(id);
                setLeftPanel(null);
              }}
              onNew={handleNewChat}
              onDelete={convos.deleteConversation}
              onToggle={() => {}}
              embedded
            />
          </AILabPanel>
        )}

        {leftPanel === "prompts" && (
          <AILabPanel eyebrow="inference" title="Prompts" onClose={() => setLeftPanel(null)}>
            <p className="mb-3 font-mono text-[8px] uppercase tracking-[0.16em] text-[#718096]">Suggested prompts</p>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.label}-${suggestion.prompt}`}
                  type="button"
                  onClick={() => handlePromptSelection(suggestion.prompt)}
                  className="w-full rounded-lg border border-[#2c3a50] bg-[#222d3f] p-3 text-left transition-colors hover:border-[#40516d] hover:bg-[#29364a]"
                >
                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-violet-300/65">{suggestion.label}</span>
                  <span className="mt-1.5 line-clamp-3 block text-[10px] leading-4 text-[#cbd6e5]">{suggestion.prompt}</span>
                </button>
              ))}
            </div>
          </AILabPanel>
        )}

        {leftPanel === "logs" && (
          <AILabPanel eyebrow="live" title="Activity log" onClose={() => setLeftPanel(null)}>
            <ActivityLog events={activityEvents} />
          </AILabPanel>
        )}

        {AGENT_MODE_ENABLED && leftPanel === "agent" && (
          <AILabPanel eyebrow="AI LAB" title="Research agent" onClose={() => setLeftPanel(null)}>
            <AgentPanel
              status={sourceAgent.status}
              subagentEnabled={sourceAgent.subagentEnabled}
              onSubagentChange={sourceAgent.setSubagentEnabled}
              onRefreshStatus={sourceAgent.refreshStatus}
            />
          </AILabPanel>
        )}

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#111722]">
          <div className="ai-lab-grid pointer-events-none absolute inset-0 opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(19,29,44,.08),rgba(10,15,24,.44)_72%)]" />

          <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex items-center justify-between px-3.5">
            <span className="inline-flex h-7 items-center gap-2 rounded-lg border border-[#40516d] bg-[#1b2433]/95 px-2.5 text-[9px] font-semibold text-[#c5d0df] shadow-[0_5px_18px_rgba(0,0,0,.12)] backdrop-blur-xl">
              <span className={`size-1.5 rounded-full ${
                activeHealth === "ok"
                  ? "bg-emerald-400 shadow-[0_0_0_3px_rgba(74,222,128,.08)]"
                  : activeHealth === "degraded"
                    ? "bg-amber-300"
                    : "bg-rose-400"
              }`} />
              {MAINTENANCE[activeMode]
                ? "Maintenance"
                : activeHealth === "ok"
                  ? "Live inference"
                  : activeHealth === "degraded"
                    ? "Starting inference"
                    : "Inference unavailable"}
            </span>
            <span className="h-7 rounded-lg border border-[#40516d] bg-[#1b2433]/95 px-2.5 font-mono text-[9px] leading-[26px] text-[#9aa8bc] shadow-[0_5px_18px_rgba(0,0,0,.12)] backdrop-blur-xl">
              {messageCount} messages <span className="text-[#53647c]">·</span> {runCount} runs
            </span>
          </div>

          <AILabRail
            side="left"
            items={leftRail.filter((item) => item.id !== leftPanel)}
            activeId={null}
            onSelect={(id) => setLeftPanel(id as LeftPanel)}
          />
          <AILabRail
            side="right"
            items={RIGHT_RAIL.filter((item) => item.id !== rightPanel)}
            activeId={null}
            onSelect={(id) => setRightPanel(id as RightPanel)}
          />
          <AILabExitButton />

          <main ref={mainRef} className="relative z-[2] min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto min-h-full w-full max-w-[820px] min-w-0 px-5 pb-36 pt-20 max-md:px-[108px]">
              <div className="mb-10 flex min-w-0 flex-nowrap items-center gap-2.5">
                <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-[-0.025em] text-[#e8eef7]">{conversationTitle}</h1>
                <span className="shrink-0 rounded-full border border-[#494066] bg-[#27233d] px-2 py-1 font-mono text-[8px] font-bold tracking-[0.1em] text-[#b8a9ff]">
                  {publicLabel}
                </span>
              </div>

              <div className="space-y-8">
                {chat.messages.map((message, index) => (
                  <ChatMessage
                    key={message.createdAt
                      ? `${message.role}-${message.createdAt}`
                      : `${message.role}-${index}`}
                    message={message}
                    mode={chat.mode}
                    modelLabel={modelLabels[chat.mode]}
                    streaming={
                      chat.streaming
                      && message.role === "assistant"
                      && index === chat.messages.length - 1
                    }
                    expertActivity={
                      message.role === "assistant"
                      && index === chat.messages.length - 1
                        ? chat.expertActivity
                        : null
                    }
                  />
                ))}
                {chat.error && <ErrorBanner message={chat.error} />}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </main>

          <ChatInput
            input={inputValue}
            loading={chat.loading}
            streaming={chat.streaming}
            maxTokens={activeParams.maxTokens}
            tokenStats={chat.tokenStats}
            unavailableReason={unavailableReason}
            onInputChange={chat.setInput}
            onSend={handleSend}
            onStop={handleStop}
            inputRef={inputRef}
          />
        </div>

        {rightPanel === "model" && (
          <AILabPanel eyebrow="inference" title="Model" side="right" onClose={() => setRightPanel(null)}>
            <p className="mb-3 font-mono text-[8px] uppercase tracking-[0.16em] text-[#718096]">Active model</p>
            <div className="mb-6 space-y-1.5">
              {MODES.map((mode) => (
                <div
                  key={mode}
                  className="flex w-full items-center justify-between rounded-lg border border-violet-400/50 bg-violet-400/10 px-3 py-2.5 text-left text-[10px] text-violet-100"
                >
                  <span>
                    {modelLabels[mode]}
                    {MAINTENANCE[mode] && <small className="ml-2 text-amber-300">maintenance</small>}
                  </span>
                  <span className="size-1.5 rounded-full bg-violet-300" />
                </div>
              ))}
            </div>
            <p className="mb-4 font-mono text-[8px] uppercase tracking-[0.16em] text-[#718096]">Generation</p>
            <ParamPanel params={activeParams} onUpdate={updateParams} embedded />
          </AILabPanel>
        )}

        {rightPanel === "metrics" && (
          <AILabPanel eyebrow="live" title="Metrics" side="right" onClose={() => setRightPanel(null)}>
            <MonitorPanel health={activeHealth} snapshot={chat.snapshot} embedded />
            <div className="mt-5 divide-y divide-[#2c3a50] border-y border-[#2c3a50]">
              <MetricRow label="Output tokens" value={`${chat.tokenStats?.tokens ?? 0}`} />
              <MetricRow label="Elapsed" value={chat.tokenStats ? `${chat.tokenStats.elapsed.toFixed(1)} s` : "—"} />
              <MetricRow
                label="Throughput"
                value={chat.tokenStats?.elapsed
                  ? `${(chat.tokenStats.tokens / chat.tokenStats.elapsed).toFixed(1)} tok/s`
                  : "—"}
              />
              <MetricRow label="Requests" value={`${runCount}`} />
            </div>
          </AILabPanel>
        )}

        {rightPanel === "results" && (
          <AILabPanel eyebrow="run" title="Results" side="right" onClose={() => setRightPanel(null)}>
            <div className="divide-y divide-[#2c3a50] border-y border-[#2c3a50]">
              <ResultRow
                title="Latest inference"
                detail={messageCount ? `${messageCount} messages across ${runCount} run${runCount === 1 ? "" : "s"}.` : "No inference has run yet."}
              />
              <ResultRow title="Model" detail={modelLabels[activeMode]} />
              <ResultRow
                title="Status"
                detail={chat.streaming ? "Generation in progress" : "Ready for another prompt"}
                success={!chat.streaming}
              />
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="mt-5 w-full rounded-lg border border-[#40516d] bg-[#222d3f] px-3 py-2.5 text-[10px] font-semibold text-[#cdd7e5] transition-colors hover:bg-[#29364a]"
            >
              Clear current run
            </button>
          </AILabPanel>
        )}
      </section>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-[10px]">
      <span className="text-[#9aa8bc]">{label}</span>
      <strong className="font-mono font-semibold text-[#e8eef7]">{value}</strong>
    </div>
  );
}

function ResultRow({ title, detail, success = false }: { title: string; detail: string; success?: boolean }) {
  return (
    <div className="py-3">
      <p className="text-[10px] font-semibold text-[#e8eef7]">{title}</p>
      <p className={`mt-1 text-[9px] leading-4 ${success ? "text-emerald-300" : "text-[#718096]"}`}>{detail}</p>
    </div>
  );
}

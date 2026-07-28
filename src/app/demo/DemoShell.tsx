"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Activity,
  BookOpenCheck,
  CheckCircle2,
  MessageSquareText,
  ScrollText,
  SlidersHorizontal,
  WandSparkles,
} from "lucide-react";
import type { Mode } from "./config";
import { MAINTENANCE, SUGGESTIONS } from "./config";
import { useChat } from "./useChat";
import { useCompare } from "./useCompare";
import { useConversations } from "./useConversations";
import { useModelMetadata } from "./useModelMetadata";
import { useSources } from "./useSources";
import { ParamPanel } from "./ParamPanel";
import { ChatMessage, ErrorBanner } from "./ChatMessage";
import { CompareView } from "./CompareView";
import { ChatInput } from "./ChatInput";
import { MonitorPanel } from "./MonitorPanel";
import { ChatSidebar } from "./ChatSidebar";
import { SourcesPanel } from "./SourcesPanel";
import {
  ActivityLog,
  AILabExitButton,
  AILabPanel,
  AILabRail,
  type ActivityLogEvent,
} from "@/components/ai-lab";

const MODES: Mode[] = ["TR-MoE", "compare", "dense"];
type LeftPanel = "chats" | "prompts" | "sources" | "logs";
type RightPanel = "model" | "metrics" | "results";

const LEFT_RAIL = [
  { id: "chats", label: "Chats", icon: MessageSquareText },
  { id: "prompts", label: "Prompts", icon: WandSparkles },
  { id: "sources", label: "Sources", icon: BookOpenCheck },
  { id: "logs", label: "Live logs", icon: ScrollText },
];

const RIGHT_RAIL = [
  { id: "model", label: "Model", icon: SlidersHorizontal },
  { id: "metrics", label: "Metrics", icon: Activity },
  { id: "results", label: "Results", icon: CheckCircle2 },
];

function parseMode(mode: string | null): Mode {
  return MODES.includes(mode as Mode) ? (mode as Mode) : "TR-MoE";
}

function shortTitle(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "New inference";
  return compact.length > 64 ? `${compact.slice(0, 64)}…` : compact;
}

export function DemoShell() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialMode = parseMode(searchParams.get("mode"));
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;

  const chat = useChat(initialMode === "dense" ? "dense" : initialMode === "compare" ? "TR-MoE" : initialMode);
  const compare = useCompare();
  const convos = useConversations(userId);
  const sourceWorkspace = useSources();
  const { labels: modelLabels } = useModelMetadata();

  const [activeMode, setActiveMode] = useState<Mode>(initialMode);
  const [leftPanel, setLeftPanel] = useState<LeftPanel | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  const isCompare = activeMode === "compare";
  const suggestions = useMemo(
    () => SUGGESTIONS[activeMode]
      .flatMap((group) => group.prompts.slice(0, 2).map((prompt) => ({ label: group.label, prompt })))
      .slice(0, 6),
    [activeMode],
  );

  const activityEvents = useMemo<ActivityLogEvent[]>(() => {
    const sourceEvents = sourceWorkspace.sources.map<ActivityLogEvent>((source) => ({
      id: `source-${source.id}`,
      label: source.enabled ? "Verified source attached" : "Source paused",
      detail: `${source.title} · SHA-256 ${source.sha256.slice(0, 12)} · ${source.uri}`,
      kind: "system",
      active: false,
    }));
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
    })).reverse().concat(sourceEvents);

    if (chat.streaming) {
      events.unshift({
        id: "activity-streaming",
        label: "Live generation in progress",
        detail: `${chat.tokenStats?.tokens ?? 0} tokens received from ${modelLabels[chat.mode]}`,
        kind: "system",
        active: true,
      });
    }
    return events;
  }, [chat.messages, chat.mode, chat.streaming, chat.tokenStats?.tokens, modelLabels, sourceWorkspace.sources]);

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
  }, [chat.messages.length, chat.streaming]);

  const handleSwitchMode = useCallback((mode: Mode) => {
    if (mode === activeMode || MAINTENANCE[mode]) return;
    chat.switchMode(mode);
    setActiveMode(mode);
    inputRef.current?.focus();
  }, [activeMode, chat]);

  const handleSend = useCallback(() => {
    const originalPrompt = isCompare ? compare.input : chat.input;
    const groundedPrompt = sourceWorkspace.buildPrompt(originalPrompt);
    if (isCompare) {
      compare.sendMessage(undefined, groundedPrompt);
      return;
    }
    if (!convos.activeId && chat.input.trim()) {
      if (convos.isFull) return;
      convos.createConversation(chat.mode);
    }
    chat.sendMessage(undefined, groundedPrompt);
  }, [isCompare, compare, convos, chat, sourceWorkspace]);

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
    } else {
      chat.clearChat();
      if (convos.activeId) convos.deleteConversation(convos.activeId);
    }
    inputRef.current?.focus();
  }, [isCompare, compare, chat, convos]);

  const handleStop = useCallback(() => {
    if (isCompare) compare.stopGeneration();
    else chat.stopGeneration();
  }, [isCompare, compare, chat]);

  const handlePromptSelection = useCallback((prompt: string) => {
    setLeftPanel(null);
    if (isCompare) {
      compare.sendMessage(prompt, sourceWorkspace.buildPrompt(prompt));
      return;
    }
    if (!convos.activeId) {
      if (convos.isFull) return;
      convos.createConversation(chat.mode);
    }
    chat.sendMessage(prompt, sourceWorkspace.buildPrompt(prompt));
  }, [chat, compare, convos, isCompare, sourceWorkspace]);

  const inputValue = isCompare ? compare.input : chat.input;
  const messageCount = isCompare ? compare.results.length * 3 : chat.messages.length;
  const runCount = isCompare
    ? compare.results.length
    : chat.messages.filter((message) => message.role === "user").length;
  const conversationTitle = isCompare
    ? "Compare routed and dense output"
    : convos.activeConversation?.title
      ?? shortTitle(chat.messages.find((message) => message.role === "user")?.content ?? "");
  const publicLabel = activeMode === "compare" ? "COMPARE MODE" : "PUBLIC DEMO";
  const activeParams = isCompare ? compare.params : chat.params;
  const updateParams = isCompare ? compare.updateParam : chat.updateParam;
  const activeHealth = isCompare ? compare.healthStatus : chat.healthStatus;
  const unavailableReason = MAINTENANCE[activeMode]
    ?? (activeHealth === "offline" ? `${modelLabels[activeMode]} is temporarily unavailable.` : undefined);
  const leftRail = useMemo(
    () => LEFT_RAIL.map((item) => (
      item.id === "sources"
        ? { ...item, badge: `${sourceWorkspace.activeSources.length}` }
        : item
    )),
    [sourceWorkspace.activeSources.length],
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

        {leftPanel === "sources" && (
          <AILabPanel eyebrow="source agent" title="Sources" onClose={() => setLeftPanel(null)}>
            <SourcesPanel
              sources={sourceWorkspace.sources}
              status={sourceWorkspace.status}
              loading={sourceWorkspace.loading}
              error={sourceWorkspace.error}
              onAdd={sourceWorkspace.addSource}
              onToggle={sourceWorkspace.toggleSource}
              onRemove={sourceWorkspace.removeSource}
              onClear={sourceWorkspace.clearSources}
              onRefreshStatus={sourceWorkspace.refreshStatus}
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

              {isCompare ? (
                <>
                  <CompareView
                    results={compare.results}
                    denseContent={compare.denseContent}
                    chatContent={compare.chatContent}
                    denseTokens={compare.denseTokens}
                    chatTokens={compare.chatTokens}
                    streaming={compare.streaming}
                    denseLabel={modelLabels.dense}
                    routedLabel={modelLabels["TR-MoE"]}
                  />
                  {compare.error && <ErrorBanner message={compare.error} />}
                </>
              ) : (
                <div className="space-y-8">
                  {chat.messages.map((message, index) => (
                    <ChatMessage
                      key={index}
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
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <ChatInput
            mode={activeMode}
            input={inputValue}
            loading={isCompare ? compare.loading : chat.loading}
            streaming={isCompare ? compare.streaming : chat.streaming}
            maxTokens={activeParams.maxTokens}
            tokenStats={isCompare ? null : chat.tokenStats}
            unavailableReason={unavailableReason}
            onInputChange={isCompare ? compare.setInput : chat.setInput}
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
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSwitchMode(mode)}
                  disabled={!!MAINTENANCE[mode]}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-[10px] transition-colors ${
                    activeMode === mode
                      ? "border-violet-400/50 bg-violet-400/10 text-violet-100"
                      : "border-[#2c3a50] bg-[#222d3f] text-[#9aa8bc] hover:border-[#40516d] hover:text-[#e8eef7]"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <span>
                    {modelLabels[mode]}
                    {MAINTENANCE[mode] && <small className="ml-2 text-amber-300">maintenance</small>}
                  </span>
                  {activeMode === mode && <span className="size-1.5 rounded-full bg-violet-300" />}
                </button>
              ))}
            </div>
            <p className="mb-4 font-mono text-[8px] uppercase tracking-[0.16em] text-[#718096]">Generation</p>
            <ParamPanel params={activeParams} onUpdate={updateParams} embedded />
          </AILabPanel>
        )}

        {rightPanel === "metrics" && (
          <AILabPanel eyebrow="live" title="Metrics" side="right" onClose={() => setRightPanel(null)}>
            <MonitorPanel health={activeHealth} snapshot={isCompare ? null : chat.snapshot} embedded />
            <div className="mt-5 divide-y divide-[#2c3a50] border-y border-[#2c3a50]">
              <MetricRow label="Output tokens" value={isCompare ? `${compare.denseTokens + compare.chatTokens}` : `${chat.tokenStats?.tokens ?? 0}`} />
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
                title={isCompare ? "Comparison state" : "Latest inference"}
                detail={messageCount ? `${messageCount} messages across ${runCount} run${runCount === 1 ? "" : "s"}.` : "No inference has run yet."}
              />
              <ResultRow title="Model" detail={modelLabels[activeMode]} />
              <ResultRow
                title="Status"
                detail={(isCompare ? compare.streaming : chat.streaming) ? "Generation in progress" : "Ready for another prompt"}
                success={!(isCompare ? compare.streaming : chat.streaming)}
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

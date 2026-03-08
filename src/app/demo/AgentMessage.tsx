"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import type { AgentStep, AgentState } from "./useAgent";

// ---------------------------------------------------------------------------
// Step renderer — shows sandbox executions, RAG searches in real-time
// ---------------------------------------------------------------------------
function StepBlock({ step }: { step: AgentStep }) {
  const isRunning = step.status === "running";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Step header */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px] gap-1.5">
          <span className="text-muted-foreground/60">step</span>
          <span className="text-primary/80">{step.step}</span>
        </Badge>
        <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
          {step.type}
        </Badge>
        {isRunning ? (
          <div className="flex items-center gap-1.5">
            <motion.span
              className="size-1.5 rounded-full bg-accent-purple"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[11px] font-mono text-accent-purple">running...</span>
          </div>
        ) : (
          <Badge className="text-[9px] font-mono px-1.5 py-0 bg-accent-green/15 text-accent-green border-accent-green/30">
            done
          </Badge>
        )}
      </div>

      {/* Tool call details */}
      {step.toolCall && (
        <ToolCallBlock
          toolCall={step.toolCall}
          result={step.toolResult}
          type={step.type}
        />
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tool call block — shows code being executed and its result
// ---------------------------------------------------------------------------
function ToolCallBlock({
  toolCall,
  result,
  type,
}: {
  toolCall: { name: string; args: Record<string, unknown> };
  result?: { name: string; result: string } | null;
  type: string;
}) {
  const isCode = type === "sandbox";
  const isRag = type === "rag_search";

  return (
    <div className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-b border-border/30">
        <span className="text-[11px] font-mono text-primary/70">
          {toolCall.name}
        </span>
        {isCode && !!toolCall.args.language && (
          <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">
            {String(toolCall.args.language)}
          </Badge>
        )}
        {result ? (
          <Badge className="ml-auto text-[9px] font-mono px-1.5 py-0 bg-accent-green/15 text-accent-green border-accent-green/30">
            done
          </Badge>
        ) : (
          <motion.div
            className="ml-auto flex items-center gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="size-1.5 rounded-full bg-accent-purple" />
            <span className="text-[9px] font-mono text-accent-purple">running</span>
          </motion.div>
        )}
      </div>

      {/* Code / query */}
      {isCode && !!toolCall.args.code && (
        <div className="px-3 py-2 max-h-[200px] overflow-y-auto">
          <CodeBlock content={"```" + String(toolCall.args.language || "python") + "\n" + String(toolCall.args.code) + "\n```"} />
        </div>
      )}
      {isRag && !!toolCall.args.query && (
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground font-mono">
            query: &quot;{String(toolCall.args.query)}&quot;
            {!!toolCall.args.k && <span className="text-muted-foreground/50"> (k={String(toolCall.args.k)})</span>}
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="border-t border-border/30 px-3 py-2 bg-muted/20 max-h-[300px] overflow-y-auto">
          <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-words">
            {result.result}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main agent viewer — renders live event stream from vllm-i64
// ---------------------------------------------------------------------------
export function AgentMessage({ agent }: { agent: AgentState }) {
  if (agent.steps.length === 0 && !agent.error && !agent.connected) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <Card className="w-full rounded-xl py-3 gap-0 shadow-none bg-card border-border/50">
        <CardContent className="px-4 py-0 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px] text-primary/60 bg-transparent border-none p-0">
              agent events
            </Badge>
            {agent.connected && (
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-accent-green animate-pulse" />
                <span className="text-[9px] font-mono text-accent-green">live</span>
              </div>
            )}
          </div>

          {/* Steps */}
          {agent.steps.map((step, i) => (
            <StepBlock key={`${step.type}-${i}`} step={step} />
          ))}

          {/* Connecting indicator */}
          {agent.running && agent.steps.length === 0 && !agent.connected && (
            <div className="flex items-center gap-1 h-5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-2 rounded-full bg-primary/60"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Waiting for events */}
          {agent.connected && agent.steps.length === 0 && (
            <p className="text-xs text-muted-foreground/50 font-mono">
              Listening for agent activity...
            </p>
          )}

          {/* Error */}
          {agent.error && (
            <Badge variant="destructive" className="font-mono text-xs">
              {agent.error}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

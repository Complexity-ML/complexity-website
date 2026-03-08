"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import { cn } from "@/lib/utils";
import type { AgentStep, AgentState } from "./useAgent";

// ---------------------------------------------------------------------------
// Step renderer — shows thinking, tool calls, results
// ---------------------------------------------------------------------------
function StepBlock({ step }: { step: AgentStep }) {
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
        {step.thinking && (
          <div className="flex items-center gap-1.5">
            <motion.span
              className="size-1.5 rounded-full bg-accent-purple"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[11px] font-mono text-accent-purple">thinking...</span>
          </div>
        )}
      </div>

      {/* Intermediate text (LLM reasoning) */}
      {step.text && (
        <div className="pl-3 border-l-2 border-border/30">
          <p className="text-xs text-muted-foreground/70 whitespace-pre-wrap">{step.text}</p>
        </div>
      )}

      {/* Tool calls + results */}
      {step.toolCalls.map((tc, i) => {
        const result = step.toolResults.find((r) => r.name === tc.name && step.toolResults.indexOf(r) === i);
        return (
          <ToolCallBlock key={`${tc.name}-${i}`} toolCall={tc} result={result} />
        );
      })}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tool call block — shows code being executed and its result
// ---------------------------------------------------------------------------
function ToolCallBlock({
  toolCall,
  result,
}: {
  toolCall: { name: string; args: Record<string, unknown> };
  result?: { result: string } | undefined;
}) {
  const isCode = toolCall.name === "execute_code";
  const isRag = toolCall.name === "rag_search";

  return (
    <div className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-b border-border/30">
        <span className="text-[11px] font-mono text-primary/70">
          {isCode ? "execute_code" : isRag ? "rag_search" : toolCall.name}
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
          <CodeBlock content={"```" + (String(toolCall.args.language || "python")) + "\n" + String(toolCall.args.code) + "\n```"} />
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
// Main agent message — renders all steps + final answer
// ---------------------------------------------------------------------------
export function AgentMessage({ agent }: { agent: AgentState }) {
  if (agent.steps.length === 0 && !agent.answer && !agent.error && !agent.running) {
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
          <Badge variant="secondary" className="font-mono text-[10px] text-primary/60 bg-transparent border-none p-0">
            agent
          </Badge>

          {/* Steps */}
          {agent.steps.map((step) => (
            <StepBlock key={step.step} step={step} />
          ))}

          {/* Running indicator when no steps yet */}
          {agent.running && agent.steps.length === 0 && (
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

          {/* Final answer */}
          {agent.answer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "pt-3",
                agent.steps.length > 0 && "border-t border-border/30",
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{agent.answer}</p>
            </motion.div>
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

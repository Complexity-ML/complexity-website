"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, Copy, Loader2, User } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mode, Message } from "./config";
import { MODEL_NAMES } from "./config";

interface ChatMessageProps {
  message: Message;
  mode: Mode;
}

export function ChatMessage({ message, mode }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("group flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/[0.055] text-emerald-300">
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={cn(
          "min-w-0 rounded-2xl transition-colors",
          isUser
            ? "max-w-[82%] border border-violet-300/15 bg-violet-300/[0.065] px-4 py-3"
            : "lab-surface w-full p-5",
        )}
      >
          <div className={cn("flex items-center justify-between gap-3", !isUser && "mb-4")}>
            {!isUser && <Badge variant="outline" className="gap-1.5 border-white/[0.08] bg-black/20 font-mono text-[9px] text-white/38">
              {isUser ? <User className="size-3" /> : <Bot className="size-3" />}
              {isUser ? "you" : MODEL_NAMES[mode]}
            </Badge>}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={copyMessage}
              aria-label="Copy message"
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-white/78">{message.content}</p>
          ) : message.content ? (
            <CodeBlock content={message.content} />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              generating…
            </div>
          )}
      </div>
    </motion.div>
  );
}

export function LoadingBubble({ mode }: { mode: Mode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
      <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/[0.055] text-emerald-300">
        <Bot className="size-4" />
      </div>
      <div className="lab-surface rounded-2xl p-5">
          <Badge variant="outline" className="mb-3 border-border/50 bg-background/30 font-mono text-[10px] text-muted-foreground">
            {MODEL_NAMES[mode]}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-primary/70"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
      </div>
    </motion.div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {message}
      </div>
    </motion.div>
  );
}

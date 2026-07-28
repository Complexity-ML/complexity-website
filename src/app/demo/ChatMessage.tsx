"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, Copy, Loader2 } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
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
      className={cn("group flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "min-w-0 transition-colors",
          isUser
            ? "max-w-[86%] rounded-[14px] border border-[#394961] bg-[#222d3f]/92 px-[15px] py-3"
            : "w-full",
        )}
      >
          <div className={cn("flex items-center justify-between gap-3", !isUser && "mb-2.5")}>
            {!isUser && (
              <div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#9aa8bc]">
                <span className="flex size-[22px] items-center justify-center rounded-[7px] border border-[#4f4982] bg-[#272442] text-[#b8adff]">
                  <Bot className="size-3" />
                </span>
                {MODEL_NAMES[mode]}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-[#718096] opacity-0 transition-opacity hover:bg-[#222d3f] group-hover:opacity-100"
              onClick={copyMessage}
              aria-label="Copy message"
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-xs leading-5 text-[#dce5f2] [overflow-wrap:anywhere]">{message.content}</p>
          ) : message.content ? (
            <div className="text-[#d6dfec]"><CodeBlock content={message.content} /></div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#9aa8bc]">
              <Loader2 className="size-4 animate-spin text-violet-300" />
              generating…
            </div>
          )}
      </div>
    </motion.div>
  );
}

export function LoadingBubble({ mode }: { mode: Mode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#9aa8bc]">
            <span className="flex size-[22px] items-center justify-center rounded-[7px] border border-[#4f4982] bg-[#272442] text-[#b8adff]"><Bot className="size-3" /></span>
            {MODEL_NAMES[mode]}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-violet-300/70"
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
      <div className="max-w-full break-words rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive [overflow-wrap:anywhere]">
        {message}
      </div>
    </motion.div>
  );
}

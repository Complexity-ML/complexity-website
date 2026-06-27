"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, Copy, Loader2, User } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
      )}

      <Card
        className={cn(
          "gap-0 rounded-2xl py-0 shadow-none transition-colors",
          isUser
            ? "max-w-[85%] border-primary/25 bg-primary/15"
            : "w-full border-border/55 bg-card/55 backdrop-blur",
        )}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge variant="outline" className="gap-1.5 border-border/50 bg-background/30 font-mono text-[10px] text-muted-foreground">
              {isUser ? <User className="size-3" /> : <Bot className="size-3" />}
              {isUser ? "you" : MODEL_NAMES[mode]}
            </Badge>
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
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : message.content ? (
            <CodeBlock content={message.content} />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              generating…
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LoadingBubble({ mode }: { mode: Mode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
        <Bot className="size-4" />
      </div>
      <Card className="gap-0 rounded-2xl border-border/55 bg-card/55 py-0 shadow-none backdrop-blur">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>
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

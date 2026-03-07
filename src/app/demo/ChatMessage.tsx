"use client";

import { motion } from "framer-motion";
import CodeBlock from "@/components/CodeBlock";
import type { Mode, Message } from "./config";
import { MODEL_NAMES } from "./config";

interface ChatMessageProps {
  message: Message;
  mode: Mode;
}

export function ChatMessage({ message, mode }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`rounded-xl px-4 py-3 ${
          isUser
            ? "max-w-[85%] bg-primary/15 border border-primary/20 text-foreground"
            : "w-full bg-card border border-border/50 text-foreground"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <span className="text-[10px] font-mono text-primary/60 block mb-2">
              {MODEL_NAMES[mode]}
            </span>
            {mode === "python" ? (
              <CodeBlock content={message.content} />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export function LoadingBubble({ mode }: { mode: Mode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
        <span className="text-[10px] font-mono text-primary/60 block mb-1">
          {MODEL_NAMES[mode]}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "0.15s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </motion.div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
      <div className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
        {message}
      </div>
    </motion.div>
  );
}

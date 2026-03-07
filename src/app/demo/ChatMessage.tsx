"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import { cn } from "@/lib/utils";
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
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <Card
        className={cn(
          "rounded-xl py-3 gap-0 shadow-none",
          isUser
            ? "max-w-[85%] bg-primary/15 border-primary/20"
            : "w-full bg-card border-border/50",
        )}
      >
        <CardContent className="px-4 py-0">
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <Badge variant="secondary" className="mb-2 font-mono text-[10px] text-primary/60 bg-transparent border-none p-0">
                {MODEL_NAMES[mode]}
              </Badge>
              {mode === "python" ? (
                <CodeBlock content={message.content} />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LoadingBubble({ mode }: { mode: Mode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <Card className="rounded-xl py-3 gap-0 shadow-none bg-card border-border/50">
        <CardContent className="px-4 py-0">
          <Badge variant="secondary" className="mb-1 font-mono text-[10px] text-primary/60 bg-transparent border-none p-0">
            {MODEL_NAMES[mode]}
          </Badge>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
      <Badge variant="destructive" className="font-mono text-xs px-4 py-2 rounded-lg">
        {message}
      </Badge>
    </motion.div>
  );
}

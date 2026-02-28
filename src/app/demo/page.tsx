"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [rtl, setRtl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

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
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "pacific-i64",
          messages: [{ role: "user", content: text }],
          max_tokens: 256,
          temperature,
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream.");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);
      setLoading(false);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") break;

          try {
            const parsed = JSON.parse(payload);
            const token =
              parsed.choices?.[0]?.delta?.content ??
              parsed.choices?.[0]?.text ??
              "";
            if (token) {
              assistantContent += token;
              const content = assistantContent;
              setMessages([
                ...newMessages,
                { role: "assistant", content },
              ]);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      if (!assistantContent.trim()) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "No response." },
        ]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reach the model."
      );
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-primary font-mono text-lg">//</span>
              <span className="font-bold text-lg">COMPLEXITY</span>
            </Link>
            <span className="text-border">/</span>
            <span className="font-mono text-sm text-primary">demo</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              pacific-i64
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <label className="text-[10px] font-mono text-muted-foreground">
                temp
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-20 h-1 accent-primary cursor-pointer"
              />
              <span className="text-[10px] font-mono text-primary w-6 text-right">
                {temperature.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setRtl(!rtl)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors font-mono ${
                rtl
                  ? "border-primary/40 text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              RTL
            </button>
            <button
              onClick={clearChat}
              className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors font-mono"
            >
              clear
            </button>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="font-mono text-4xl text-primary mb-4">//</p>
              <h2 className="text-2xl font-bold mb-2">Pacific-i64</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Complexity Deep 1.58B — Python code helper powered by
                Token-Routed i64 deterministic routing.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-5xl mx-auto px-4">
                {[
                  "Write a fibonacci function in Python",
                  "Write a bubble sort function in Python",
                  "Write a function to reverse a string",
                  "Write a binary search function",
                  "Write a function to check if a number is prime",
                  "Remove duplicate elements from a list and return unique elements only",
                  "Write a factorial function in Python",
                  "Write a function to find the max element in a list",
                  "Write a function to merge two sorted lists",
                  "Write a function to convert celsius to fahrenheit",
                  "Write a function to find the GCD of two numbers",
                  "Write a function to check if a string is a palindrome",
                  "Write a function to compute the sum of a list of numbers",
                  "Write a function that takes a string and capitalizes the first letter of each word in the string",
                  "Write a function to calculate the distance between two points",
                  "Write a function to calculate the area of a triangle given base and height",
                  "Write a function to find the LCM of two numbers",
                  "Write a function to calculate the mean of a list of numbers",
                  "Write a function to check if a number is even or odd",
                  "Write a function to find the sum of digits of a number",
                  "Write a function to count the number of digits in a number",
                  "Write a function to find the minimum value in a list",
                  "Write a function to calculate the absolute value of a number",
                  "Write a function to multiply all elements in a list",
                  "Write a function to count even numbers in a list",
                  "Write a function to remove negative numbers from a list",
                  "Write a function to find the intersection of two lists",
                  "Write a function to find the average of two numbers",
                  "Write a function to return the last element of a list",
                  "Write a function to concatenate two strings",
                  "Write a function to convert a list of integers to a list of strings",
                  "Write a function to count occurrences of an element in a list",
                  "Write a Python script that makes an HTTP request using the requests library",
                  "Write a Python class to represent a bank account with deposit and withdraw methods",
                  "Write a Python function that uses datetime to get the current date and time",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div dir={rtl ? "rtl" : "ltr"} className="container mx-auto max-w-5xl px-6 py-6 space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "max-w-[85%] bg-primary/15 border border-primary/20 text-foreground"
                      : "w-full bg-card border border-border/50 text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <>
                      <span className="text-[10px] font-mono text-primary/60 block mb-2">
                        pacific-i64
                      </span>
                      <CodeBlock content={msg.content} />
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
                  <span className="text-[10px] font-mono text-primary/60 block mb-1">
                    pacific-i64
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
                  {error}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input bar */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                dir={rtl ? "rtl" : "ltr"}
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="shrink-0 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14m-7-7l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">
            Complexity Deep 1.58B — Python Code Helper — Token-Routed i64
          </p>
        </div>
      </div>
    </div>
  );
}

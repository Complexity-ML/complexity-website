"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("python", python);

type Segment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string };

const FENCED_CODE_RE = /```([\w-]*)?\n([\s\S]*?)```/g;

function parseFencedCode(content: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(FENCED_CODE_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", content: content.slice(lastIndex, index) });
    }

    segments.push({
      type: "code",
      language: (match[1] || "text").toLowerCase(),
      content: match[2].trimEnd(),
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", content: content.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", content }];
}

function FencedCode({ content, language }: { content: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const isPython = language === "python" || language === "py";

  const highlighted = useMemo(() => {
    if (!isPython) return null;
    try {
      return hljs.highlight(content, { language: "python" }).value;
    } catch {
      return null;
    }
  }, [content, isPython]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div dir="ltr" className="my-3 overflow-hidden rounded-xl border border-border/40 bg-background/60">
      <div className="flex items-center justify-between border-b border-border/30 bg-white/[0.03] px-3 py-1.5">
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {language || "text"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed">
        {highlighted ? (
          <code
            className="hljs language-python"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : (
          <code>{content}</code>
        )}
      </pre>
    </div>
  );
}

export default function CodeBlock({ content }: { content: string }) {
  const segments = parseFencedCode(content);

  return (
    <div className="space-y-2">
      {segments.map((segment, index) => {
        if (segment.type === "code") {
          return <FencedCode key={index} content={segment.content} language={segment.language} />;
        }

        if (!segment.content.trim()) return null;
        return (
          <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
            {segment.content.trim()}
          </p>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("python", python);

type Segment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string };

type TextBlock =
  | { type: "paragraph"; content: string }
  | { type: "list"; ordered: boolean; items: string[] };

const FENCED_CODE_RE = /```([\w-]*)?\n([\s\S]*?)```/g;
const BULLET_RE = /^\s*[-*•]\s+(.+)$/;
const ORDERED_RE = /^\s*\d+[.)]\s+(.+)$/;

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

function flushParagraph(lines: string[], blocks: TextBlock[]) {
  if (lines.length === 0) return;
  const content = lines.join(" ").replace(/\s+/g, " ").trim();
  if (!content) return;

  if (content.length > 520) {
    const sentences = content.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [content];
    const chunk: string[] = [];
    for (const sentence of sentences) {
      chunk.push(sentence);
      const joined = chunk.join(" ");
      if (chunk.length >= 3 || joined.length > 360) {
        blocks.push({ type: "paragraph", content: joined });
        chunk.length = 0;
      }
    }
    if (chunk.length > 0) blocks.push({ type: "paragraph", content: chunk.join(" ") });
  } else {
    blocks.push({ type: "paragraph", content });
  }
  lines.length = 0;
}

function parseTextBlocks(content: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const paragraph: string[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  let listItems: string[] = [];
  let orderedList = false;

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", ordered: orderedList, items: listItems });
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const bullet = trimmed.match(BULLET_RE);
    const ordered = trimmed.match(ORDERED_RE);

    if (!trimmed) {
      flushParagraph(paragraph, blocks);
      flushList();
      continue;
    }

    if (bullet || ordered) {
      flushParagraph(paragraph, blocks);
      const nextOrdered = Boolean(ordered);
      if (listItems.length > 0 && orderedList !== nextOrdered) flushList();
      orderedList = nextOrdered;
      listItems.push((bullet?.[1] ?? ordered?.[1] ?? trimmed).trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph(paragraph, blocks);
  flushList();

  return blocks;
}

function TextContent({ content }: { content: string }) {
  const blocks = parseTextBlocks(content);

  return (
    <div className="space-y-3 text-[15px] leading-7 text-foreground/90">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return <p key={index}>{block.content}</p>;
        }

        const ListTag = block.ordered ? "ol" : "ul";
        return (
          <ListTag
            key={index}
            className={block.ordered ? "ml-5 list-decimal space-y-1" : "ml-5 list-disc space-y-1"}
          >
            {block.items.map((item, itemIndex) => (
              <li key={`${index}-${itemIndex}`} className="pl-1 marker:text-primary/70">
                {item}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
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
    <div className="space-y-3">
      {segments.map((segment, index) => {
        if (segment.type === "code") {
          return <FencedCode key={index} content={segment.content} language={segment.language} />;
        }

        if (!segment.content.trim()) return null;
        return <TextContent key={index} content={segment.content.trim()} />;
      })}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("python", python);

const CODE_KEYWORDS = [
  "def ", "class ", "import ", "from ", "for ", "while ",
  "if ", "return ", "print(", "elif ", "else:", "try:", "except",
  "with ", "async ", "await ", "yield ", "lambda ",
];

function looksLikeCode(text: string): boolean {
  const trimmed = text.trim();
  return CODE_KEYWORDS.some((kw) => trimmed.includes(kw));
}

export default function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const trimmed = content.trim();
  const isCode = looksLikeCode(trimmed);

  const highlighted = useMemo(() => {
    if (!isCode) return null;
    try {
      return hljs.highlight(trimmed, { language: "python" }).value;
    } catch {
      return null;
    }
  }, [trimmed, isCode]);

  if (!isCode || !highlighted) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trimmed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border/30">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-border/20">
        <span className="text-[10px] font-mono text-muted-foreground/60">
          python
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              copy
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[13px] leading-relaxed">
        <code
          className="hljs language-python"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

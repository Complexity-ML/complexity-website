const ESCAPED_MARKDOWN_RE = /\\+([*_{}\[\]()#+.!>~-])/g;
const CODE_START_RE = /^\s*(?:async\s+def|def|class|from\s+\S+\s+import|import\s+|@\w|function\s+|(?:const|let|var)\s+|#include\s*[<"]|(?:public|private|protected|static)\s+|SELECT\s+|CREATE\s+(?:TABLE|FUNCTION)|fn\s+|func\s+)/i;
const CODE_BODY_RE = /^\s*(?:return\b|yield\b|raise\b|pass\b|break\b|continue\b|if\s+.+[:{]|elif\s+.+:|else\s*[:{]|for\s+.+[:{]|while\s+.+[:{]|try\s*[:{]|except\b|finally\s*[:{]|with\s+.+:|print\s*\(|console\.|[}\])]|[A-Za-z_$][\w$.[\]]*\s*(?:=|\+=|-=|\*=|\/=))/;

export type AssistantMarkdownSegment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string };

/**
 * Some base-model completions escape Markdown punctuation as if they were
 * serializing it for another Markdown document. Normalize presentation-only
 * escapes while preserving backslashes inside fenced source code.
 */
export function normalizeAssistantMarkdown(content: string): string {
  const unescapedFences = content
    .replace(/\\+`/g, "`")
    .replace(/`{3,}/g, "```");
  return unescapedFences
    .split("```")
    .map((section, index) => (
      index % 2 === 1 ? section : section.replace(ESCAPED_MARKDOWN_RE, "$1")
    ))
    .join("```");
}

function inferCodeLanguage(content: string): string {
  if (/^\s*(?:async\s+def|def|from\s+\S+\s+import|import\s+|print\s*\()/m.test(content)) return "python";
  if (/^\s*(?:const|let|var|function)\s+/m.test(content)) return "javascript";
  if (/^\s*#include\s*[<"]/m.test(content)) return "cpp";
  if (/^\s*(?:SELECT|CREATE\s+(?:TABLE|FUNCTION))\s+/im.test(content)) return "sql";
  return "text";
}

/** Promote recognizable unfenced source lines into code-window segments. */
export function splitImplicitCode(content: string): AssistantMarkdownSegment[] {
  const segments: AssistantMarkdownSegment[] = [];
  const textLines: string[] = [];
  const codeLines: string[] = [];

  const flushText = () => {
    const text = textLines.join("\n").trim();
    if (text) segments.push({ type: "text", content: text });
    textLines.length = 0;
  };
  const flushCode = () => {
    const code = codeLines.join("\n").trimEnd();
    if (code.trim()) segments.push({ type: "code", content: code, language: inferCodeLanguage(code) });
    codeLines.length = 0;
  };

  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (codeLines.length > 0) codeLines.push("");
      else textLines.push("");
      continue;
    }

    const startsCode = CODE_START_RE.test(line);
    const continuesCode = codeLines.length > 0 && (/^\s+/.test(line) || CODE_BODY_RE.test(line) || CODE_START_RE.test(line));
    if (startsCode || continuesCode) {
      if (codeLines.length === 0) flushText();
      codeLines.push(line);
      continue;
    }

    flushCode();
    textLines.push(line);
  }

  flushCode();
  flushText();
  return segments.length > 0 ? segments : [{ type: "text", content }];
}

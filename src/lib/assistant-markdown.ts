const ESCAPED_MARKDOWN_RE = /\\+([*_{}\[\]()#+.!>~-])/g;

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

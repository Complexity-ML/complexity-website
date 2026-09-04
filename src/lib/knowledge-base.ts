export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface KnowledgeMatch extends KnowledgeDocument {
  score: number;
}

export const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "agentic-100m-parameters",
    title: "TR-HASH 100M Agentic SFT parameter count",
    content: "The public Agentic SFT model contains exactly 100,366,720 trainable parameters.",
    keywords: ["100M", "parameter", "parameters", "parameter count", "model size"],
  },
  {
    id: "agentic-100m-routing",
    title: "TR-HASH 100M Agentic routing architecture",
    content: "The model has 10 transformer layers, four stored routed experts, top-2 expert activation, and one shared expert. TR-HASH routes tokens deterministically from token IDs through multiple hashes.",
    keywords: ["100M", "architecture", "layers", "experts", "MoE", "top-2", "routing", "shared expert"],
  },
  {
    id: "agentic-100m-sft",
    title: "Agentic 100M SFT stage",
    content: [
      "The released 100M Agentic checkpoint was instruction-tuned for three epochs on 200,000 examples.",
      "The SFT mixture contains general instruction examples and tool-aware examples, including calls, no-call decisions, and final answers after tool results.",
    ].join(" "),
    keywords: ["SFT", "training", "epochs", "200000", "instruction", "tool use", "refinement"],
  },
  {
    id: "agentic-tokenizer-protocol",
    title: "Agentic tokenizer and chat protocol",
    content: [
      "The 100M Agentic model uses its own TR-HASH 32K Agentic tokenizer; it is not interchangeable with the 200M tokenizer.",
      "Its native chat protocol uses role and end-of-turn tokens plus tool-call, tool-result, thinking, and final-answer delimiters.",
      "Native tool calls are enclosed by <|tool_call_start|> and <|tool_call_end|>.",
    ].join(" "),
    keywords: ["tokenizer", "tokeniseur", "chat template", "special tokens", "tool call", "thinking", "100M", "200M"],
  },
  {
    id: "piqa-published-scorer",
    title: "Scorer used for the published 200M PIQA scores",
    content: "The published 200M PIQA scores came from the historical custom MLX scorer, not lm-eval.",
    keywords: ["PIQA", "MLX", "lm-eval", "scorer", "published score", "evaluation"],
  },
  {
    id: "piqa-published-format",
    title: "Exact published 200M PIQA input format",
    content: "The historical MLX scorer evaluates goal + one space + solution.lstrip(), with add_special_tokens=False, no BOS or EOS, and no chat template. Current lm-eval is not equivalent because it adds Question and Answer formatting and uses a different acc_norm normalization.",
    keywords: ["PIQA", "format", "goal", "solution", "lstrip", "add_special_tokens", "acc_norm", "BOS", "EOS", "chat template"],
  },
  {
    id: "public-agentic-demo",
    title: "Public 100M Agentic demo deployment",
    content: [
      "The public demo serves AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-SFT through TR-Hash-i64.",
      "The model is loaded in full precision on the public Space with quantization set to none.",
      "The demo exposes expert activation telemetry for four experts with top-2 routing.",
    ].join(" "),
    keywords: ["demo", "Space", "F32", "full precision", "quantization", "TR-Hash-i64", "Hugging Face"],
  },
  {
    id: "agentic-tools",
    title: "Tools available in the Agentic demo",
    content: [
      "The Agentic demo can call a safe calculator for arithmetic and a small knowledge-base search tool for TR-HASH questions.",
      "The calculator accepts numbers, parentheses, addition, subtraction, multiplication, division, modulo, and powers without evaluating code.",
      "Tool activity and retrieved passage titles are reported in the demo activity log.",
    ].join(" "),
    keywords: ["tools", "calculator", "RAG", "retrieval", "knowledge base", "activity log"],
  },
];

const TOKEN_ALIASES: Record<string, string> = {
  params: "parameter",
  parameter: "parameter",
  parameters: "parameter",
  parametre: "parameter",
  parametres: "parameter",
  modele: "model",
  modeles: "model",
  models: "model",
  couches: "layer",
  layers: "layer",
  experts: "expert",
  jeton: "token",
  jetons: "token",
  tokeniseur: "tokenizer",
  tokenization: "tokenizer",
  evaluation: "eval",
  evaluer: "eval",
  scores: "score",
  outils: "tool",
  recherche: "search",
};

function tokenize(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+(?:-[a-z0-9]+)*/g)
    ?.filter((token) => token.length > 1)
    .map((token) => TOKEN_ALIASES[token] ?? token) ?? [];
}

function termCounts(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
}

const INDEX = KNOWLEDGE_DOCUMENTS.map((document) => {
  const tokens = tokenize(`${document.title} ${document.content} ${document.keywords.join(" ")}`);
  return { document, tokens, counts: termCounts(tokens) };
});

const DOCUMENT_FREQUENCY = new Map<string, number>();
for (const { counts } of INDEX) {
  for (const token of counts.keys()) {
    DOCUMENT_FREQUENCY.set(token, (DOCUMENT_FREQUENCY.get(token) ?? 0) + 1);
  }
}

const AVERAGE_LENGTH = INDEX.reduce((sum, entry) => sum + entry.tokens.length, 0) / INDEX.length;

export function searchKnowledgeBase(query: string, limit = 3): KnowledgeMatch[] {
  const queryTokens = [...new Set(tokenize(query))];
  if (!queryTokens.length) return [];

  const normalizedQuery = query.toLowerCase();
  return INDEX.map(({ document, tokens, counts }) => {
    let score = 0;
    for (const token of queryTokens) {
      const frequency = counts.get(token) ?? 0;
      if (!frequency) continue;
      const documentFrequency = DOCUMENT_FREQUENCY.get(token) ?? 0;
      const idf = Math.log(1 + (INDEX.length - documentFrequency + 0.5) / (documentFrequency + 0.5));
      const lengthNormalization = frequency + 1.2 * (0.25 + 0.75 * tokens.length / AVERAGE_LENGTH);
      score += idf * (frequency * 2.2) / lengthNormalization;
    }
    if (normalizedQuery.includes(document.title.toLowerCase())) score += 2;
    return { ...document, score: Number(score.toFixed(4)) };
  })
    .filter((match) => match.score > 0.15)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, Math.min(limit, 3)));
}

export function knowledgeContext(matches: KnowledgeMatch[]): string {
  return matches.map((match) => (
    `[${match.title}]\n${match.content}`
  )).join("\n\n---\n\n").slice(0, 3_600);
}

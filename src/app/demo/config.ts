export type Mode = "TR-MoE-v2" | "TR-MoE-v1";

export const DEFAULT_MODE: Mode = "TR-MoE-v1";

export function parseMode(value: string | null | undefined): Mode | null {
  if (value === "v2" || value === "TR-MoE-v2") return "TR-MoE-v2";
  if (value === "v1" || value === "TR-MoE-v1") return "TR-MoE-v1";
  return null;
}

export function modeQueryValue(mode: Mode): "v1" | "v2" {
  return mode === "TR-MoE-v1" ? "v1" : "v2";
}

export const AGENT_MODE_ENABLED = process.env.NEXT_PUBLIC_AGENT_MODE_ENABLED === "true";

export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt?: number;
}

export interface SuggestionGroup {
  label: string;
  prompts: string[];
}

export const MAINTENANCE: Partial<Record<Mode, string>> = {
  "TR-MoE-v2": process.env.NEXT_PUBLIC_TR_HASH_100M_AGENTIC_MAINTENANCE || undefined,
  "TR-MoE-v1": process.env.NEXT_PUBLIC_TR_HASH_TINY_MAINTENANCE || undefined,
};

export const ENDPOINTS: Record<Mode, string> = {
  "TR-MoE-v2": process.env.NEXT_PUBLIC_TR_HASH_100M_AGENTIC_API_URL
    || "https://pacific-i64-tr-hash-100m-agentic.hf.space",
  "TR-MoE-v1": process.env.NEXT_PUBLIC_TR_HASH_TINY_API_URL
    || "https://pacific-i64-tr-hash-tiny.hf.space",
};

export const MODEL_NAMES: Record<Mode, string> = {
  "TR-MoE-v2": "TR-HASH MoE 100M · Agentic SFT",
  "TR-MoE-v1": "TR-HASH MoE 200M · Full SFT v1",
};

export const SYSTEM_PROMPTS: Partial<Record<Mode, string>> = {
  "TR-MoE-v2": [
    "You are a helpful, precise assistant.",
    "Follow the user's requested language, format, and length exactly.",
    "Answer directly and do not repeat yourself.",
    "Use internal thinking when it helps. If tools are available and useful, call them; otherwise answer directly.",
  ].join(" "),
};

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE-v2":
    "The released 100.4M-parameter Agentic SFT checkpoint, trained for three epochs on 200,000 examples with its native 32K tokenizer.",
  "TR-MoE-v1":
    "The released 32,000-token full-SFT checkpoint cited by the public preprint.",
};

export const FOOTERS: Record<Mode, string> = {
  "TR-MoE-v2": "TR-HASH MoE 100M · Agentic SFT · 32K context · TR-Hash-i64",
  "TR-MoE-v1": "TR-HASH MoE 200M · Full SFT v1 · 32,000 tokens · TR-Hash-i64",
};

// Keep the public picker intentionally small. These prompts produce concise,
// factual answers on both public checkpoints.
const COMMON_SUGGESTIONS: SuggestionGroup[] = [
  {
    label: "AI basics",
    prompts: [
      "What is a neural network? Explain it to a beginner in two sentences.",
      "What is the internet? Explain it to a beginner in two sentences.",
    ],
  },
  {
    label: "science",
    prompts: [
      "Who developed the theory of relativity, and in which century? Answer in one sentence.",
      "What is water made of? Answer in one sentence.",
    ],
  },
  {
    label: "quick facts",
    prompts: [
      "What is the capital of France? Answer in one sentence.",
      "Name the four seasons in one sentence.",
    ],
  },
];

export const SUGGESTIONS: Record<Mode, SuggestionGroup[]> = {
  "TR-MoE-v2": COMMON_SUGGESTIONS,
  "TR-MoE-v1": COMMON_SUGGESTIONS,
};

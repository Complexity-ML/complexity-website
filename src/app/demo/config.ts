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

export const CALCULATOR_TOOL = {
  type: "function",
  function: {
    name: "calculator",
    description: "Evaluate arithmetic.",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
        },
      },
      required: ["expression"],
    },
  },
} as const;

export const KNOWLEDGE_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_knowledge_base",
    description: "Search the available knowledge base.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
        },
      },
      required: ["query"],
    },
  },
} as const;

export const DATE_TIME_TOOL = {
  type: "function",
  function: {
    name: "date_time",
    description: "Get the current date and time.",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
        },
      },
    },
  },
} as const;

export type AgentToolName = "calculator" | "search_knowledge_base" | "date_time";

// Match the two-tool system matrices used by the Agentic SFT trajectories.
// TR-Hash-i64 serializes the selected row as `Available tools:\n[...]`.
export const TOOL_DEFINITION_MATRIX = {
  calculator: [CALCULATOR_TOOL, KNOWLEDGE_SEARCH_TOOL],
  search_knowledge_base: [KNOWLEDGE_SEARCH_TOOL, DATE_TIME_TOOL],
  date_time: [DATE_TIME_TOOL, CALCULATOR_TOOL],
} as const;

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE-v2":
    "The released 100.4M-parameter Agentic SFT checkpoint, trained for three epochs on 1,007,473 examples with its native 32K-vocabulary tokenizer.",
  "TR-MoE-v1":
    "The released 32,000-token full-SFT checkpoint cited by the public preprint.",
};

export const FOOTERS: Record<Mode, string> = {
  "TR-MoE-v2": "TR-HASH MoE 100M · Agentic SFT · 2,048-token context · 32K vocabulary · TR-Hash-i64",
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
  "TR-MoE-v2": [
    {
      label: "calculator",
      prompts: [
        "For request CALC-4101, a workshop packs 17 boxes of 24 parts, then removes 85 parts. How many remain?",
        "For request CALC-4102, a workshop packs 48 boxes of 13 parts, then removes 77 parts. How many remain?",
      ],
    },
    {
      label: "date & time",
      prompts: [
        "For request DT-4105, what is the current date and time in UTC?",
        "For request DT-4106, what is the current date and time in Europe/Paris?",
      ],
    },
    {
      label: "synthetic RAG",
      prompts: [
        "What is the verified owner of Project-4108-548-5?",
        "What is the verified owner of Project-4109-771-2?",
      ],
    },
    ...COMMON_SUGGESTIONS,
  ],
  "TR-MoE-v1": COMMON_SUGGESTIONS,
};

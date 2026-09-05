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
  "TR-MoE-v2": "Answer directly and briefly in the user's language and requested format.",
};

export const CALCULATOR_TOOL = {
  type: "function",
  function: {
    name: "calculator",
    description: "Evaluate a mathematical arithmetic expression exactly.",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "Arithmetic using numbers, parentheses, +, -, *, /, %, and ^.",
        },
      },
      required: ["expression"],
      additionalProperties: false,
    },
    return: {
      description: "Exact numeric result.",
      type: "string",
    },
  },
} as const;

export const KNOWLEDGE_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_knowledge_base",
    description: "Search the TR-HASH knowledge base for relevant facts.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Question or keywords to search for.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    return: {
      description: "Relevant passages from the knowledge base.",
      type: "string",
    },
  },
} as const;

export const DATE_TIME_TOOL = {
  type: "function",
  function: {
    name: "date_time",
    description: "Get the current date and time in UTC, Europe/Paris, and a requested IANA time zone.",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "IANA time zone. Use Europe/Paris for Paris and UTC for UTC.",
        },
      },
      additionalProperties: false,
    },
    return: {
      description: "The same current instant formatted in UTC, Europe/Paris, and the requested time zone.",
      type: "object",
    },
  },
} as const;

export type AgentToolName = "calculator" | "search_knowledge_base" | "date_time";
export type ToolPromptPhase = "plan" | "final";

// V-shaped prompt cascade: route into one tool row for planning, then converge
// on its short final contract without repeating the tool schema.
export const TOOL_SYSTEM_PROMPT_MATRIX: ReadonlyArray<
  readonly [AgentToolName, Readonly<Record<ToolPromptPhase, readonly string[]>>]
> = [
  [
    "calculator",
    {
      plan: [
        'Translate the whole problem before calling calculator. Example: "3 boxes of 4, then remove 2" means {"expression":"3*4-2"}. Include every operation and use only digits, parentheses, decimal dots, and + - * / % ^.',
        'Available tools:\n[{"function":{"description":"Evaluate arithmetic.","name":"calculator","parameters":{"properties":{"expression":{"type":"string"}},"required":["expression"],"type":"object"}},"type":"function"}]',
      ],
      final: ["Return the exact calculator result briefly in the user's requested format."],
    },
  ],
  [
    "search_knowledge_base",
    {
      plan: [
        "Call search_knowledge_base with the user's complete question.",
        'Available tools:\n[{"function":{"description":"Search the TR-HASH knowledge base for relevant facts.","name":"search_knowledge_base","parameters":{"properties":{"query":{"type":"string"}},"required":["query"],"type":"object"}},"type":"function"}]',
      ],
      final: ["Answer directly and briefly in the user's language using only the retrieved passage."],
    },
  ],
  [
    "date_time",
    {
      plan: [
        "Call date_time immediately. Use Europe/Paris when no time zone is specified.",
        'Available tools:\n[{"function":{"description":"Get the current date and time.","name":"date_time","parameters":{"properties":{"timezone":{"type":"string"}},"type":"object"}},"type":"function"}]',
      ],
      final: ["Return the exact date and time briefly in the user's requested format."],
    },
  ],
];

export function getToolSystemPrompt(name: AgentToolName, phase: ToolPromptPhase = "plan"): string {
  const row = TOOL_SYSTEM_PROMPT_MATRIX.find(([toolName]) => toolName === name);
  if (!row) throw new Error(`Missing system prompt for tool: ${name}`);
  return row[1][phase].join("\n");
}

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE-v2":
    "The released 100.4M-parameter Agentic SFT checkpoint, trained for three epochs on 500,000 examples with its native 32K-vocabulary tokenizer.",
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
        "What is 927 × 43? Give only the result.",
        "A workshop packs 17 boxes of 24 parts, then removes 85 parts. How many parts remain?",
      ],
    },
    {
      label: "date & time",
      prompts: [
        "What time is it in Paris right now? Include UTC.",
        "Quelle date et quelle heure est-il actuellement à Paris et en UTC ?",
      ],
    },
    {
      label: "knowledge",
      prompts: [
        "How many trainable parameters does the TR-HASH 100M Agentic model have?",
        "How much memory do the TR-HASH 100M Agentic model's trainable parameters require in FP16, in MiB?",
      ],
    },
    ...COMMON_SUGGESTIONS,
  ],
  "TR-MoE-v1": COMMON_SUGGESTIONS,
};

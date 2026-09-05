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
    "Use internal thinking when it helps.",
  ].join(" "),
};

export type ResponseStyleName = "emoji";

// Optional style modules stay outside the base prompt. The request router
// selects at most one row, and strict/tool requests receive none.
export const RESPONSE_STYLE_PROMPT_MATRIX: ReadonlyArray<
  readonly [ResponseStyleName, readonly string[]]
> = [
  ["emoji", ["Use at most one relevant emoji when it feels natural."]],
];

export function getResponseStylePrompt(name: ResponseStyleName): string {
  const row = RESPONSE_STYLE_PROMPT_MATRIX.find(([styleName]) => styleName === name);
  if (!row) throw new Error(`Missing response style prompt: ${name}`);
  return row[1].join("\n");
}

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

// Two-dimensional prompt table: one row per selected tool, with only the
// phases that tool needs. General chat receives none of these instructions.
export const TOOL_SYSTEM_PROMPT_MATRIX: ReadonlyArray<
  readonly [AgentToolName, readonly string[]]
> = [
  [
    "calculator",
    [
      'For arithmetic, call calculator immediately. Copy the complete expression: "A times B" -> "A * B"; "A plus B" -> "A + B"; "subtract B from A" -> "A - B". Do not calculate mentally.',
      'Available tools:\n[{"function":{"description":"Evaluate arithmetic.","name":"calculator","parameters":{"properties":{"expression":{"type":"string"}},"required":["expression"],"type":"object"}},"type":"function"}]',
    ],
  ],
  [
    "search_knowledge_base",
    [
      "Call search_knowledge_base when the answer requires a TR-HASH fact. Use the user's complete question as query.",
      'Available tools:\n[{"function":{"description":"Search the TR-HASH knowledge base for relevant facts.","name":"search_knowledge_base","parameters":{"properties":{"query":{"type":"string"}},"required":["query"],"type":"object"}},"type":"function"}]',
      "After the tool result, answer in the user's language using only the retrieved passage.",
    ],
  ],
  [
    "date_time",
    [
      "For a current date or time question, call date_time immediately. Do not explain first. Use Europe/Paris when no time zone is specified.",
      'Available tools:\n[{"function":{"description":"Get the current date and time.","name":"date_time","parameters":{"properties":{"timezone":{"type":"string"}},"type":"object"}},"type":"function"}]',
    ],
  ],
];

export function getToolSystemPrompt(name: AgentToolName): string {
  const row = TOOL_SYSTEM_PROMPT_MATRIX.find(([toolName]) => toolName === name);
  if (!row) throw new Error(`Missing system prompt for tool: ${name}`);
  return row[1].join("\n");
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
        "Which scorer produced the published 200M PIQA scores?",
      ],
    },
    ...COMMON_SUGGESTIONS,
  ],
  "TR-MoE-v1": COMMON_SUGGESTIONS,
};

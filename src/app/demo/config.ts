export type Mode = "TR-MoE" | "compare" | "dense";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SuggestionGroup {
  label: string;
  prompts: string[];
}

export const MAINTENANCE: Partial<Record<Mode, string>> = {};

export const ENDPOINTS: Record<Mode, string> = {
  "TR-MoE": process.env.NEXT_PUBLIC_API_URL || "https://Pacific-i64-TR-MOE-400M.hf.space",
  compare: process.env.NEXT_PUBLIC_COMPARE_API_URL || "https://Pacific-i64-Compare.hf.space",
  dense: process.env.NEXT_PUBLIC_DENSE_API_URL || "https://Pacific-i64-Dense-400M.hf.space",
};

export const COMPARE_ENDPOINTS = {
  dense: `${ENDPOINTS.compare}/dense`,
  chat: `${ENDPOINTS.compare}/chat`,
  compare: `${ENDPOINTS.compare}/v1/compare`,
};

export const MODEL_NAMES: Record<Mode, string> = {
  "TR-MoE": "TR-MoE-400M",
  compare: "TR-MoE vs Dense",
  dense: "Dense-400M",
};

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE":
    "Token-Routed MoE 384M — 4 experts, Zipf routing, ~105M active params per token. CPU inference.",
  compare:
    "Side-by-side: Token-Routed MoE vs Dense baseline — same prompt, 384M iso-params, real-time comparison.",
  dense:
    "Dense SwiGLU 384M — Standard dense transformer baseline for comparison.",
};

export const FOOTERS: Record<Mode, string> = {
  "TR-MoE": "Token-Routed MoE 384M — 4 experts — CPU inference",
  compare: "TR-MoE vs Dense — 384M iso-params comparison",
  dense: "Dense SwiGLU 384M — Baseline",
};

export const SUGGESTIONS: Record<Mode, SuggestionGroup[]> = {
  "TR-MoE": [
    {
      label: "science",
      prompts: [
        "Machine learning is a branch of artificial intelligence that",
        "The human brain contains approximately",
        "Photosynthesis is the process by which plants",
        "In physics, Newton's second law states that",
        "DNA stands for deoxyribonucleic acid and is responsible for",
        "The theory of relativity was developed by",
      ],
    },
    {
      label: "general",
      prompts: [
        "The meaning of life is",
        "France is a country located in",
        "In a world where artificial intelligence",
        "The most important invention in human history is",
        "The internet was originally developed in the",
        "A computer program is a set of instructions that",
      ],
    },
  ],
  compare: [
    {
      label: "science",
      prompts: [
        "Machine learning is a branch of artificial intelligence that",
        "The human brain contains approximately",
        "Photosynthesis is the process by which plants",
        "In physics, Newton's second law states that",
        "The water cycle begins when the sun heats",
        "DNA stands for deoxyribonucleic acid and is responsible for",
      ],
    },
    {
      label: "history & geography",
      prompts: [
        "The French Revolution began in 1789 when",
        "The Great Wall of China was built to",
        "During the Industrial Revolution, factories",
        "The Amazon rainforest is home to",
        "Ancient Egypt was one of the earliest civilizations and",
        "The Pacific Ocean is the largest ocean and covers",
      ],
    },
    {
      label: "technology",
      prompts: [
        "A computer program is a set of instructions that",
        "The internet was originally developed in the",
        "In programming, a variable is used to",
        "Artificial neural networks are inspired by",
        "An operating system is software that manages",
        "Encryption is the process of converting data into",
      ],
    },
  ],
  dense: [
    {
      label: "science",
      prompts: [
        "Machine learning is a branch of artificial intelligence that",
        "The human brain contains approximately",
        "Photosynthesis is the process by which plants",
        "In physics, Newton's second law states that",
        "The water cycle begins when the sun heats",
        "DNA stands for deoxyribonucleic acid and is responsible for",
      ],
    },
    {
      label: "general",
      prompts: [
        "The meaning of life is",
        "France is a country located in",
        "In a world where artificial intelligence",
        "The most important invention in human history is",
        "Climate change affects the planet by",
        "The internet was originally developed in the",
      ],
    },
  ],
};

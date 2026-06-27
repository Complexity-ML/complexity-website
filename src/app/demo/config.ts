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
  "TR-MoE": "Token-Routed 187M",
  compare: "Token-Routed vs Dense",
  dense: "Dense baseline",
};

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE":
    "Deterministic lexical routing with a shared expert. The public demo highlights the 187M serving stack, separate from the corrected 306.5M scaling run.",
  compare:
    "Side-by-side comparison for intuition: same prompt, dense baseline versus token-routed generation.",
  dense:
    "Dense transformer baseline for comparison against routed generation.",
};

export const FOOTERS: Record<Mode, string> = {
  "TR-MoE": "Demo model: token-routed 187M serving stack — paper scaling result is 306.5M / 8B tokens",
  compare: "Comparison mode — useful for qualitative inspection, not a paper benchmark",
  dense: "Dense baseline — qualitative comparison only",
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

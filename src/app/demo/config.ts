export type Mode = "TR-MoE-v2" | "TR-MoE-v1";

export const DEFAULT_MODE: Mode = "TR-MoE-v2";

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
  "TR-MoE-v2": process.env.NEXT_PUBLIC_TR_HASH_TINY_V2_MAINTENANCE || undefined,
  "TR-MoE-v1": process.env.NEXT_PUBLIC_TR_HASH_TINY_MAINTENANCE || undefined,
};

export const ENDPOINTS: Record<Mode, string> = {
  "TR-MoE-v2": process.env.NEXT_PUBLIC_TR_HASH_TINY_V2_API_URL
    || "https://pacific-i64-tr-hash-tiny-v2.hf.space",
  "TR-MoE-v1": process.env.NEXT_PUBLIC_TR_HASH_TINY_API_URL
    || "https://pacific-i64-tr-hash-tiny.hf.space",
};

export const MODEL_NAMES: Record<Mode, string> = {
  "TR-MoE-v2": "TR-HASH MoE 200M · Full SFT v2",
  "TR-MoE-v1": "TR-HASH MoE 200M · Full SFT v1",
};

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE-v2":
    "The promoted 32,004-token full-SFT v2 checkpoint, trained directly from the refinement model on the audited 500K unified mixture.",
  "TR-MoE-v1":
    "The previous 32,000-token full-SFT checkpoint, retained as a public reference and rollback target.",
};

export const FOOTERS: Record<Mode, string> = {
  "TR-MoE-v2": "TR-HASH MoE 200M · Full SFT v2 · 32,004 tokens · TR-Hash-i64",
  "TR-MoE-v1": "TR-HASH MoE 200M · Full SFT v1 · 32,000 tokens · TR-Hash-i64",
};

const COMMON_SUGGESTIONS: SuggestionGroup[] = [
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
  {
      label: "functions",
      prompts: [
        "Write a fibonacci function in Python",
        "Write a bubble sort function in Python",
        "Write a function to reverse a string",
        "Write a binary search function",
        "Write a function to check if a number is prime",
        "Remove duplicate elements from a list and return unique elements only",
        "Write a factorial function in Python",
        "Write a function to find the max element in a list",
        "Write a function to merge two sorted lists",
        "Write a function to convert celsius to fahrenheit",
        "Write a function to find the GCD of two numbers",
        "Write a function to check if a string is a palindrome",
        "Write a function to compute the sum of a list of numbers",
        "Write a function that takes a string and capitalizes the first letter of each word in the string",
        "Write a function to calculate the distance between two points",
        "Write a function to calculate the area of a triangle given base and height",
        "Write a function to find the LCM of two numbers",
        "Write a function to calculate the mean of a list of numbers",
        "Write a function to check if a number is even or odd",
        "Write a function to find the sum of digits of a number",
        "Write a function to count the number of digits in a number",
        "Write a function to find the minimum value in a list",
        "Write a function to calculate the absolute value of a number",
        "Write a function to multiply all elements in a list",
        "Write a function to count even numbers in a list",
        "Write a function to remove negative numbers from a list",
        "Write a function to find the intersection of two lists",
        "Write a function to find the average of two numbers",
        "Write a function to return the last element of a list",
        "Write a function to concatenate two strings",
        "Write a function to convert a list of integers to a list of strings",
        "Write a function to count occurrences of an element in a list",
      ],
  },
  {
      label: "classes & scripts",
      prompts: [
        "Write a Python script that makes an HTTP request using the requests library",
        "Write a Python class to represent a bank account with deposit and withdraw methods",
        "Write a Python function that uses datetime to get the current date and time",
        "Write a Python class to represent a stack with push and pop methods",
        "Write a Python class to represent a student with name and grades",
      ],
  },
  {
      label: "chat",
      prompts: [
        "Hello, how are you?",
        "What is the capital of France?",
        "Tell me a joke",
        "What is the meaning of life?",
        "What is artificial intelligence?",
        "Explain what machine learning is",
        "What makes a good leader?",
        "Give me three tips for a healthy lifestyle",
        "What are the seasons of the year?",
        "Describe a beautiful sunset",
      ],
  },
  {
      label: "fun time",
      prompts: [
        "Tell me a short story",
        "Write a poem about the ocean",
        "Give me a recipe for chocolate cake",
        "List 5 interesting facts about dogs",
        "Give me a recipe for pancakes",
        "What is the most beautiful place on Earth?",
        "Tell me about the history of computers",
        "Describe the solar system",
        "Explain how the internet works",
        "Why do we dream?",
      ],
  },
];

export const SUGGESTIONS: Record<Mode, SuggestionGroup[]> = {
  "TR-MoE-v2": COMMON_SUGGESTIONS,
  "TR-MoE-v1": COMMON_SUGGESTIONS,
};

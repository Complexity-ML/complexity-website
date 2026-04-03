export type Mode = "python" | "compare" | "dense";

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
  python: process.env.NEXT_PUBLIC_API_URL || "https://Pacific-i64-TR-MOE-400M.hf.space",
  compare: process.env.NEXT_PUBLIC_COMPARE_API_URL || "https://Pacific-i64-Compare.hf.space",
  dense: process.env.NEXT_PUBLIC_DENSE_API_URL || "https://Pacific-i64-Dense-400M.hf.space",
};

export const COMPARE_ENDPOINTS = {
  dense: `${ENDPOINTS.compare}/dense`,
  chat: `${ENDPOINTS.compare}/chat`,
  compare: `${ENDPOINTS.compare}/v1/compare`,
};

export const MODEL_NAMES: Record<Mode, string> = {
  python: "TR-MoE-400M",
  compare: "TR-MoE vs Dense",
  dense: "Dense-400M",
};

export const DESCRIPTIONS: Record<Mode, string> = {
  python:
    "Token-Routed MoE 384M — 4 experts, Zipf routing, ~105M active params per token, 4,900 tok/s.",
  compare:
    "Side-by-side: Token-Routed MoE vs Dense baseline — same prompt, 384M iso-params, real-time comparison.",
  dense:
    "Dense SwiGLU 384M — Standard dense transformer baseline for comparison.",
};

export const FOOTERS: Record<Mode, string> = {
  python: "Token-Routed MoE 384M — 4 experts — 4,900 tok/s",
  compare: "TR-MoE vs Dense — 384M iso-params comparison",
  dense: "Dense SwiGLU 384M — Baseline",
};

export const SUGGESTIONS: Record<Mode, SuggestionGroup[]> = {
  python: [
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

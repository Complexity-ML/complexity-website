export type Mode = "TR-MoE" | "compare" | "dense";

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
  "TR-MoE": process.env.NEXT_PUBLIC_TR_MOE_MAINTENANCE || undefined,
  compare: process.env.NEXT_PUBLIC_COMPARE_MAINTENANCE || undefined,
  dense: process.env.NEXT_PUBLIC_DENSE_MAINTENANCE || undefined,
};

const ROUTED_ENDPOINT = process.env.NEXT_PUBLIC_TR_MOE_API_URL || "https://pacific-i64-tr-hash-0-5b.hf.space";

export const ENDPOINTS: Record<Mode, string> = {
  "TR-MoE": ROUTED_ENDPOINT,
  compare: ROUTED_ENDPOINT,
  dense: ROUTED_ENDPOINT,
};

export const MODEL_NAMES: Record<Mode, string> = {
  "TR-MoE": "TR-HASH-0.5B",
  compare: "TR-HASH-0.5B vs Dense-306",
  dense: "Dense-306",
};

export const DESCRIPTIONS: Record<Mode, string> = {
  "TR-MoE":
    "A 492.1M-parameter TR-Hash MoE with deterministic token-ID top-2 routing and a shared dense path, pretrained over 20B tokens.",
  compare:
    "TR-Hash 492.1M and the historical Dense-306 control streamed side by side for qualitative inspection; this is not an iso-parameter benchmark.",
  dense:
    "The matched 306.5M dense SwiGLU baseline for comparison against routed generation.",
};

export const FOOTERS: Record<Mode, string> = {
  "TR-MoE": "TR-HASH-0.5B · 492.1M parameters · 20B pretraining tokens · vllm-i64",
  compare: "TR-Hash 492.1M vs Dense 306.5M · qualitative, non-iso-parameter comparison",
  dense: "Dense-306 · 306.5M parameters · public Linux CPU inference with vllm-i64",
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
    {
      label: "functions",
      prompts: [
        "Write a fibonacci function in Python",
        "Write a bubble sort function in Python",
        "Write a binary search function",
        "Write a function to check if a string is a palindrome",
        "Write a function to merge two sorted lists",
        "Write a function to count occurrences of an element in a list",
      ],
    },
    {
      label: "chat",
      prompts: [
        "Hello, how are you?",
        "Tell me a joke",
        "What is artificial intelligence?",
        "Explain what machine learning is",
        "Tell me a short story",
        "Explain how the internet works",
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
    {
      label: "functions",
      prompts: [
        "Write a fibonacci function in Python",
        "Write a function to reverse a string",
        "Write a binary search function",
        "Write a function to check if a number is prime",
        "Write a function to find the max element in a list",
        "Write a function to calculate the mean of a list of numbers",
      ],
    },
  ],
};

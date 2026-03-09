export type Mode = "python" | "compare" | "ros2" | "agent";

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
  python: process.env.NEXT_PUBLIC_API_URL || "https://pacific-prime-pacific-i64-demo.hf.space",
  compare: process.env.NEXT_PUBLIC_COMPARE_API_URL || "https://pacific-prime-tekkeni64-vs-dense.hf.space",
  ros2: process.env.NEXT_PUBLIC_ROS2_API_URL || "https://pacific-prime-pacific-ros2.hf.space",
  agent: process.env.NEXT_PUBLIC_VLLM_I64_URL || "http://localhost:8000",
};

export const COMPARE_ENDPOINTS = {
  dense: `${ENDPOINTS.compare}/dense`,
  chat: `${ENDPOINTS.compare}/chat`,
};

export const MODEL_NAMES: Record<Mode, string> = {
  python: "pacific-i64",
  compare: "dense vs i64",
  ros2: "pacific-ros2",
  agent: "agent",
};

export const DESCRIPTIONS: Record<Mode, string> = {
  python:
    "Complexity Deep 1.58B — Python code helper powered by Token-Routed i64 deterministic routing.",
  compare:
    "Side-by-side: Dense baseline vs Token-Routed i64 — same prompt, two models, real-time comparison.",
  ros2:
    "Complexity Deep 1.58B — ROS2 specialist powered by Token-Routed i64 deterministic routing.",
  agent:
    "Live viewer — watch agent activity (sandbox, RAG) from VSCode or CLI in real-time.",
};

export const FOOTERS: Record<Mode, string> = {
  python: "Complexity Deep 1.58B — Python Code Helper — Token-Routed i64",
  compare: "Dense vs Token-Routed i64 — Side-by-Side Comparison",
  ros2: "Complexity Deep 1.58B — ROS2 Specialist — Token-Routed i64",
  agent: "Agent Viewer — Live Events — vllm-i64",
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
      label: "compare",
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
        "Tell me a short story",
        "Write a poem about the ocean",
        "Explain how the internet works",
        "Why do we dream?",
      ],
    },
  ],
  agent: [
    {
      label: "connect to session",
      prompts: [
        "default",
        "vscode-main",
        "debug-session",
      ],
    },
  ],
  ros2: [
    {
      label: "nodes & topics",
      prompts: [
        "Write a ROS2 publisher node in Python",
        "Write a ROS2 subscriber node in Python",
        "Create a ROS2 service server and client",
        "Write a ROS2 action server",
        "Create a ROS2 launch file in Python",
        "Write a ROS2 node that publishes Twist messages",
        "Create a ROS2 timer callback node",
        "Write a ROS2 node with parameter declarations",
        "Create a custom ROS2 message definition",
        "Write a ROS2 lifecycle node",
      ],
    },
    {
      label: "robotics",
      prompts: [
        "Write a ROS2 node for obstacle avoidance",
        "Create a ROS2 TF2 broadcaster",
        "Write a ROS2 node that reads LaserScan data",
        "Create a ROS2 node for sensor fusion",
        "Write a ROS2 node to control a robotic arm",
        "Create a ROS2 node for path planning",
        "Write a ROS2 node that processes PointCloud2",
        "Create a ROS2 node for odometry estimation",
        "Write a ROS2 node for IMU data processing",
        "Create a ROS2 node for camera image processing",
      ],
    },
  ],
};

export interface SamplingParams {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
  frequencyPenalty: number;
}

// Validated balanced defaults for the public 201.2M full-SFT chat.
export const DEFAULT_SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.3,
  maxTokens: 1024,
  topK: 30,
  topP: 0.9,
  repetitionPenalty: 1.05,
  frequencyPenalty: 0,
};

export const DEFAULT_V2_SAMPLING_PARAMS: SamplingParams = {
  ...DEFAULT_SAMPLING_PARAMS,
  // The 32,004-token checkpoint occasionally leaks a short template-like
  // suffix at stochastic temperatures. Greedy decode is stable by default;
  // users can still raise the slider for exploratory generations.
  temperature: 0,
};

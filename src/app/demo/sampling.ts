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

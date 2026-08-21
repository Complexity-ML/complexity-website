export interface SamplingParams {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
  frequencyPenalty: number;
}

// Validated low-variance defaults for the public 201.2M full-SFT chat.
export const DEFAULT_SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.3,
  maxTokens: 1024,
  topK: 20,
  topP: 0.95,
  repetitionPenalty: 1.15,
  frequencyPenalty: 0.2,
};

export interface SamplingParams {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
  frequencyPenalty: number;
}

// Validated low-variance defaults for the public 201.2M Thinking LoRA chat.
export const DEFAULT_SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.4,
  maxTokens: 256,
  topK: 30,
  topP: 0.85,
  repetitionPenalty: 1.1,
  frequencyPenalty: 0,
};

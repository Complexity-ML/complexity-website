export interface SamplingParams {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
  frequencyPenalty: number;
}

// Balanced defaults for the public 201.2M base model: enough sampling
// diversity for completion while keeping short CPU generations stable.
export const DEFAULT_SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.7,
  maxTokens: 128,
  topK: 40,
  topP: 0.9,
  repetitionPenalty: 1.1,
  frequencyPenalty: 0,
};

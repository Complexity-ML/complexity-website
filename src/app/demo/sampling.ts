export interface SamplingParams {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
  frequencyPenalty: number;
}

// Calibrated against the public TR-HASH-0.5B Space. Sampling temperatures
// made this checkpoint less reliable, while removing the repetition penalty
// caused long loops. Keep generation greedy and cap the response length.
export const DEFAULT_SAMPLING_PARAMS: SamplingParams = {
  temperature: 0,
  maxTokens: 192,
  topK: 0,
  topP: 1,
  repetitionPenalty: 1.08,
  frequencyPenalty: 0,
};

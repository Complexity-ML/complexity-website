// Agent mode removed — stub kept to avoid import errors

import type { AgentState } from "./useAgent";

export function AgentMessage({ agent }: { agent: AgentState }) {
  void agent;
  return null;
}

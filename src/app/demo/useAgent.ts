// Agent mode removed — stub kept to avoid import errors

export interface AgentStep {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface AgentState {
  steps: AgentStep[];
  connected: boolean;
  running: boolean;
  connect: (sessionId?: string) => void;
  disconnect: () => void;
  reset: () => void;
}

export function useAgent(): AgentState {
  return {
    steps: [],
    connected: false,
    running: false,
    connect: () => {},
    disconnect: () => {},
    reset: () => {},
  };
}

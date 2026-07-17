export interface TerminalLine {
  id: string; // unique key for React rendering
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
  timestamp: number;
}

export interface CommandResponse {
  output: string;
  error?: boolean;
  clear?: boolean;
  enteringNano?: string; // filepath if entering nano editor
}

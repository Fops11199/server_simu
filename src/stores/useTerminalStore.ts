import { create } from 'zustand';
import type { TerminalLine } from '../types/terminal';
import type { FileNode } from '../types/filesystem';

interface TerminalStore {
  lines: TerminalLine[];
  nanoFilePath: string | null;
  nanoContent: string;

  addLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  addLines: (lines: Omit<TerminalLine, 'id' | 'timestamp'>[]) => void;
  clearLines: () => void;
  setLines: (lines: TerminalLine[]) => void;
  openNano: (filePath: string, content: string) => void;
  setNanoContent: (content: string) => void;
  closeNano: () => void;

  // Cap terminal history at 1000 lines to prevent memory growth
  MAX_LINES: number;
}

const WELCOME_LINES: Omit<TerminalLine, 'id' | 'timestamp'>[] = [
  { type: 'info', text: 'Welcome to HostLab Secure Server Administration CLI.' },
  { type: 'info', text: 'Type "help" to list all simulated Linux terminal commands.' },
  { type: 'info', text: 'Host: server01.hostlab.local   IP: 203.0.113.10   User: student' },
  { type: 'info', text: '' },
];

function makeLine(line: Omit<TerminalLine, 'id' | 'timestamp'>): TerminalLine {
  return { ...line, id: crypto.randomUUID(), timestamp: Date.now() };
}

export const useTerminalStore = create<TerminalStore>()((set, get) => ({
  lines: WELCOME_LINES.map(makeLine),
  nanoFilePath: null,
  nanoContent: '',
  MAX_LINES: 1000,

  addLine: (line) => set(s => {
    const newLines = [...s.lines, makeLine(line)];
    // Trim to MAX_LINES
    return { lines: newLines.length > s.MAX_LINES ? newLines.slice(-s.MAX_LINES) : newLines };
  }),

  addLines: (lines) => set(s => {
    const newLines = [...s.lines, ...lines.map(makeLine)];
    return { lines: newLines.length > s.MAX_LINES ? newLines.slice(-s.MAX_LINES) : newLines };
  }),

  clearLines: () => set({ lines: [] }),

  setLines: (lines) => set({ lines }),

  openNano: (filePath, content) => set({ nanoFilePath: filePath, nanoContent: content }),

  setNanoContent: (content) => set({ nanoContent: content }),

  closeNano: () => set({ nanoFilePath: null, nanoContent: '' }),
}));

// Exported for use by SimulatorProvider / terminal hook
export { WELCOME_LINES };

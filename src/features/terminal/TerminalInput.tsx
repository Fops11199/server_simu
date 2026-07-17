import React, { useState, useRef, useEffect } from 'react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';

interface TerminalInputProps {
  onCommand: (cmd: string) => void;
  disabled?: boolean;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ onCommand, disabled = false }) => {
  const [input, setInput] = useState('');
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useSimulatorStore(s => s.history);
  const currentDir = useSimulatorStore(s => s.currentDir);

  // Focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        onCommand(input);
        setHistoryIdx(-1);
      }
      setInput('');
      return;
    }

    // History navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(nextIdx);
      setInput(history[history.length - 1 - nextIdx] ?? '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIdx > 0 ? historyIdx - 1 : -1;
      setHistoryIdx(nextIdx);
      setInput(nextIdx === -1 ? '' : (history[history.length - 1 - nextIdx] ?? ''));
    }

    // Ctrl+L = clear (handled by the command)
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onCommand('clear');
    }
  };

  const prompt = `student@server01:${currentDir}$`;

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-[#050507] shrink-0"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-cyan-400 font-mono text-[13px] shrink-0 select-none">{prompt}</span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="flex-1 bg-transparent outline-none text-slate-200 font-mono text-[13px] caret-cyan-400 disabled:opacity-50"
        placeholder={disabled ? 'Editor open — save or discard to return to terminal' : ''}
      />
      <span className="w-2 h-4 bg-cyan-400/70 rounded-sm animate-pulse shrink-0" />
    </div>
  );
};

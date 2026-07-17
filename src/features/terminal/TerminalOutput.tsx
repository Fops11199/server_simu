import React, { useRef, useEffect } from 'react';
import { useTerminalStore } from '../../stores/useTerminalStore';

interface TerminalOutputProps {
  /** Called when user wants to scroll to bottom */
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const LINE_TYPE_STYLE: Record<string, string> = {
  input:   'text-cyan-400',
  output:  'text-slate-300',
  error:   'text-rose-400',
  info:    'text-slate-500',
  success: 'text-emerald-400',
};

export const TerminalOutput: React.FC<TerminalOutputProps> = () => {
  const lines = useTerminalStore(s => s.lines);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new lines
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  return (
    <div className="flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed px-4 py-3 space-y-0.5">
      {lines.map(line => (
        <div key={line.id} className={LINE_TYPE_STYLE[line.type] ?? 'text-slate-300'}>
          {line.text === '' ? <>&nbsp;</> : line.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

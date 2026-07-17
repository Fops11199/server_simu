import React from 'react';
import { Terminal as TermIcon } from 'lucide-react';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { NanoEditor } from './NanoEditor';
import { useTerminal } from '../../hooks/useTerminal';

export const TerminalTab: React.FC = () => {
  const { lines, nanoFilePath, nanoContent, runCommand, saveNano, discardNano, currentDir } = useTerminal();

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <TermIcon className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200 font-display">Terminal CLI</h2>
          <p className="text-[11px] text-slate-500 font-mono">student@server01:{currentDir} — Ubuntu 24.04 LTS</p>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 min-h-0 relative rounded-xl border border-white/5 bg-[#030305] flex flex-col overflow-hidden shadow-xl shadow-black/40">
        {/* Traffic lights */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#060608] shrink-0">
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="ml-3 text-[11px] text-slate-600 font-mono">student@server01 — bash</span>
        </div>

        {/* Output area */}
        <TerminalOutput />

        {/* Nano Editor overlay */}
        {nanoFilePath && (
          <NanoEditor
            filePath={nanoFilePath}
            content={nanoContent}
            onSave={saveNano}
            onDiscard={discardNano}
          />
        )}

        {/* Input row */}
        <TerminalInput
          onCommand={runCommand}
          disabled={!!nanoFilePath}
        />
      </div>
    </div>
  );
};

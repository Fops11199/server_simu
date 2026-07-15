import React, { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Terminal, Save, X, CornerDownLeft, AlertCircle } from 'lucide-react';
import { getNodeByPath, cleanPath } from '../lib/simulatorEngine';

export const TerminalTab: React.FC = () => {
  const {
    state,
    terminalLines,
    runTerminalCommand,
    nanoFilePath,
    nanoContent,
    saveAndCloseNano,
    closeNanoWithoutSaving
  } = useSimulator();

  const [inputVal, setInputVal] = useState('');
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [nanoText, setNanoText] = useState('');
  const [nanoUnsaved, setNanoUnsaved] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nanoTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync nano editor content when opened
  useEffect(() => {
    if (nanoFilePath !== null) {
      setNanoText(nanoContent);
      setNanoUnsaved(false);
      setTimeout(() => {
        if (nanoTextareaRef.current) {
          nanoTextareaRef.current.focus();
        }
      }, 50);
    }
  }, [nanoFilePath, nanoContent]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines, nanoFilePath]);

  // Focus terminal input
  const focusTerminalInput = () => {
    if (inputRef.current && nanoFilePath === null) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusTerminalInput();
  }, [nanoFilePath]);

  // Handle terminal submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputVal.trim();
    if (!command) return;

    runTerminalCommand(command);
    setInputVal('');
    setHistoryIdx(-1);
  };

  // Keyboard handlers for Terminal (Arrow keys history, Tab completion)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow UP: older command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.history.length === 0) return;
      const nextIdx = historyIdx === -1 ? state.history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(state.history[nextIdx]);
    }
    // Arrow DOWN: newer command
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx === state.history.length - 1) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(state.history[nextIdx]);
      }
    }
    // TAB: Autocomplete
    else if (e.key === 'Tab') {
      e.preventDefault();
      const currentInput = inputVal;
      const parts = currentInput.trim().split(/\s+/);
      const cmdToken = parts[0];
      const argToken = parts.slice(1).join(' ');

      const availableCmds = [
        'pwd', 'ls', 'cd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'nano', 'chmod',
        'systemctl', 'service', 'journalctl', 'dig', 'nslookup', 'curl', 'wget', 'git', 'docker', 'python', 'node', 'npm', 'clear', 'help'
      ];

      // 1. Auto-complete the command name itself
      if (parts.length === 1 && currentInput.length > 0) {
        const matches = availableCmds.filter(c => c.startsWith(cmdToken));
        if (matches.length === 1) {
          setInputVal(matches[0] + ' ');
        }
      }
      // 2. Auto-complete directory or file parameters
      else if (parts.length > 1) {
        const targetDirNode = getNodeByPath(state.fs, state.currentDir);
        if (targetDirNode && targetDirNode.type === 'dir') {
          const files = Object.keys(targetDirNode.children);
          const lastToken = parts[parts.length - 1];
          const matches = files.filter(f => f.startsWith(lastToken));
          
          if (matches.length === 1) {
            const completedToken = matches[0];
            const node = targetDirNode.children[completedToken];
            // Add slash if it's a directory
            const suffix = node.type === 'dir' ? '/' : ' ';
            parts[parts.length - 1] = completedToken + suffix;
            setInputVal(parts.join(' '));
          }
        }
      }
    }
  };

  // Keyboard handlers inside Nano
  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+O (Save)
    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      saveAndCloseNano(nanoText);
    }
    // Check for Ctrl+X (Exit)
    if (e.ctrlKey && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      triggerNanoExit();
    }
  };

  const triggerNanoExit = () => {
    if (nanoUnsaved) {
      if (confirm('You have unsaved changes in your editor. Save before exiting?')) {
        saveAndCloseNano(nanoText);
      } else {
        closeNanoWithoutSaving();
      }
    } else {
      closeNanoWithoutSaving();
    }
  };

  const handleNanoTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNanoText(e.target.value);
    setNanoUnsaved(true);
  };

  // NANO EDITOR LAYOUT OVERLAY
  if (nanoFilePath !== null) {
    return (
      <div className="flex flex-col bg-[#050507] text-slate-100 rounded-xl border border-white/5 h-full min-h-[480px] overflow-hidden font-mono text-sm shadow-2xl relative">
        {/* Nano Top Header Bar */}
        <div className="bg-[#15253c] text-white px-4 py-1.5 flex justify-between items-center text-xs font-bold uppercase border-b border-[#203a5c] select-none">
          <span>UW-NANO v8.1.3</span>
          <span className="text-cyan-400 font-mono">File: {nanoFilePath}</span>
          <span className="text-amber-300 font-bold">{nanoUnsaved ? 'Modified *' : 'Clean'}</span>
        </div>

        {/* Nano Code Workspace */}
        <div className="flex-1 flex min-h-0 relative bg-[#050507]/95">
          {/* Mock Line numbers */}
          <div className="w-11 text-right select-none text-slate-600 border-r border-white/5 pr-2 pt-3 bg-[#050507]/45 text-xs">
            {Array.from({ length: Math.max(15, nanoText.split('\n').length) }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            ref={nanoTextareaRef}
            value={nanoText}
            onChange={handleNanoTextChange}
            onKeyDown={handleNanoKeyDown}
            placeholder="# Write your configuration code here..."
            className="flex-1 resize-none bg-transparent text-slate-200 font-mono text-sm leading-relaxed p-3 focus:outline-none focus:ring-0 overflow-y-auto"
            style={{ tabSize: 4 }}
          />
        </div>

        {/* Nano Interactive Helper Buttons for Iframe/Browser limits */}
        <div className="bg-[#0d0d12] border-t border-white/5 p-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 select-none px-2 font-semibold">
            <div>
              <span className="bg-[#15151a] border border-white/5 text-slate-300 px-1.5 py-0.5 rounded font-bold mr-1">Ctrl + O</span> WriteOut / Save
            </div>
            <div>
              <span className="bg-[#15151a] border border-white/5 text-slate-300 px-1.5 py-0.5 rounded font-bold mr-1">Ctrl + X</span> Exit Editor
            </div>
          </div>

          <div className="flex items-center gap-2 select-none">
            <button
              onClick={() => saveAndCloseNano(nanoText)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-sans text-xs px-3.5 py-1.5 rounded font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-glow-cyan/10"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
            <button
              onClick={triggerNanoExit}
              className="bg-[#15151a] hover:bg-[#20202a] text-slate-300 font-sans text-xs px-3.5 py-1.5 rounded border border-white/5 font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD TERMINAL LAYOUT
  return (
    <div
      onClick={focusTerminalInput}
      className="flex flex-col bg-[#050507] text-slate-100 rounded-xl border border-white/5 h-full min-h-[480px] overflow-hidden font-mono text-sm shadow-glow-cyan/5 relative"
      id="terminal-workspace-container"
    >
      {/* Terminal Title Bar */}
      <div className="bg-[#0d0d12] px-4 py-2.5 border-b border-white/5 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-400 font-mono">
            student@server01.hostlab.local: {state.currentDir}
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
        </div>
      </div>

      {/* Terminal Display Console */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 select-text"
      >
        {terminalLines.map((line, idx) => {
          if (line.type === 'input') {
            return (
              <div key={idx} className="text-cyan-450 font-semibold leading-relaxed font-mono">
                {line.text}
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={idx} className="text-red-400 font-medium whitespace-pre-wrap leading-relaxed flex items-start gap-1.5 py-1 px-3 bg-red-950/10 rounded border-l-2 border-red-500 font-mono shadow-glow-red/5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{line.text}</span>
              </div>
            );
          }
          if (line.type === 'success') {
            return (
              <div key={idx} className="text-emerald-400 font-medium whitespace-pre-wrap leading-relaxed bg-emerald-950/10 border-l-2 border-emerald-500 py-1.5 px-3 rounded shadow-glow-emerald/5 font-mono">
                {line.text}
              </div>
            );
          }
          if (line.type === 'info') {
            return (
              <div key={idx} className="text-cyan-400/90 font-medium whitespace-pre-wrap leading-relaxed font-mono">
                {line.text}
              </div>
            );
          }
          return (
            <div key={idx} className="text-slate-350 whitespace-pre-wrap leading-relaxed font-mono">
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Active command line input */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#050507] p-4 border-t border-white/5 flex items-center gap-2 select-none"
      >
        <span className="text-cyan-400 font-semibold select-none font-mono">
          student@server01:{state.currentDir}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
          spellCheck="false"
          className="flex-1 bg-transparent border-none text-slate-100 font-mono text-sm focus:outline-none focus:ring-0 p-0"
          placeholder="Type commands... Tab to complete"
        />
        <button
          type="submit"
          className="p-1 hover:bg-[#15151a] border border-transparent hover:border-white/5 rounded text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Save, X, FileText } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

interface NanoEditorProps {
  filePath: string;
  content: string;
  onSave: (content: string) => void;
  onDiscard: () => void;
}

export const NanoEditor: React.FC<NanoEditorProps> = ({
  filePath,
  content: initialContent,
  onSave,
  onDiscard,
}) => {
  const [text, setText] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setText(initialContent);
    setIsDirty(false);
  }, [initialContent, filePath]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsDirty(true);
  };

  // Ctrl+S = save, Ctrl+X = discard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); onSave(text); }
    if (e.ctrlKey && e.key === 'x') { e.preventDefault(); onDiscard(); }
    // Tab inserts 4 spaces instead of focusing next element
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target as HTMLTextAreaElement;
      const { selectionStart, selectionEnd } = el;
      const newText = text.slice(0, selectionStart) + '    ' + text.slice(selectionEnd);
      setText(newText);
      setTimeout(() => { el.selectionStart = el.selectionEnd = selectionStart + 4; }, 0);
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[#050507] rounded-xl border border-cyan-500/30 overflow-hidden shadow-xl shadow-black/50">
      {/* Editor Topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a10] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5 text-slate-400">
          <FileText className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-mono">{filePath}</span>
          {isDirty && <span className="text-[10px] text-amber-400 font-mono">[modified]</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
          <span>^S Save</span>
          <span>^X Discard</span>
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        className="flex-1 bg-transparent text-slate-200 font-mono text-[13px] leading-relaxed p-4 resize-none outline-none caret-cyan-400"
        autoFocus
      />

      {/* Editor Bottombar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a10] border-t border-white/5 shrink-0 gap-3">
        <span className="text-[11px] text-slate-600 font-mono">
          {text.split('\n').length} lines · {text.length} chars
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard} icon={<X className="w-3.5 h-3.5" />}>
            Discard
          </Button>
          <Button variant="primary" size="sm" onClick={() => onSave(text)} icon={<Save className="w-3.5 h-3.5" />}>
            Save File
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal as TerminalIcon } from 'lucide-react';

export function GlobalCLI() {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim().toLowerCase();
      
      if (cmd.startsWith('cd /') || cmd.startsWith('cd ')) {
        const target = cmd.replace('cd ', '').replace('/', '');
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        } else if (target === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setIsOpen(false);
        }
      } else if (cmd.startsWith('start ')) {
        navigate('/app');
      } else if (cmd === 'exit' || cmd === 'quit') {
        setIsOpen(false);
      }

      setInputValue('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 pb-6 pointer-events-auto flex justify-end">
        {isOpen ? (
          <div className="bg-[#131A26] border border-[var(--steel-line)] rounded-lg shadow-2xl flex items-center gap-3 px-4 py-3 w-full sm:w-[400px]">
            <span className="text-[#38bdf8] font-data text-sm shrink-0">guest@papperlab:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleCommand}
              onBlur={() => setIsOpen(false)}
              className="bg-transparent border-none outline-none text-[#38bdf8] font-data text-sm flex-1"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#131A26] border border-[var(--steel-line)] rounded-full p-3 shadow-lg text-[var(--ash)] hover:text-white hover:border-[var(--accent-fiber)] transition-colors group"
            title="Open CLI Navigation"
          >
            <TerminalIcon className="w-5 h-5 group-hover:text-[var(--accent-fiber)] transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}

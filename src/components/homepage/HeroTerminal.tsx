import React, { useState, useEffect, useRef } from 'react';

const demoSequence = [
  { text: "docker run -d -p 80:80 nginx:alpine", typing: true, delay: 100 },
  { text: "\nUnable to find image 'nginx:alpine' locally", delay: 200 },
  { text: "\nalpine: Pulling from library/nginx", delay: 100 },
  { text: "\nDigest: sha256:4ff102c7d...  Status: Downloaded newer image for nginx:alpine", delay: 300 },
  { text: "\n4a8b9c2d1e3f... [Container Started]", delay: 600 },
  { text: "\n\nubuntu@sandbox:~$ ", delay: 800 },
  { text: "curl -I localhost", typing: true, delay: 100 },
  { text: "\nHTTP/1.1 200 OK\nServer: nginx/1.25.3\nDate: Mon, 12 Aug 2024 14:02:41 GMT", delay: 2000 },
  { text: "\n\nubuntu@sandbox:~$ ", delay: 400 },
];

export function HeroTerminal() {
  const [lines, setLines] = useState<string>('ubuntu@sandbox:~$ ');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Interactive state
  const [isInteractive, setIsInteractive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Demo animation loop
  useEffect(() => {
    if (prefersReducedMotion || isInteractive) {
      if (prefersReducedMotion && !isInteractive) {
        setLines("ubuntu@sandbox:~$ docker run -d -p 80:80 nginx:alpine\nUnable to find image 'nginx:alpine' locally\nalpine: Pulling from library/nginx\nDigest: sha256:4ff102c7d... Status: Downloaded newer image for nginx:alpine\n4a8b9c2d1e3f... [Container Started]\n\nubuntu@sandbox:~$ curl -I localhost\nHTTP/1.1 200 OK\nServer: nginx/1.25.3\n\nubuntu@sandbox:~$ ");
      }
      return;
    }

    let isMounted = true;
    let stepIndex = 0;
    
    const runSequence = async () => {
      setLines('ubuntu@sandbox:~$ ');
      let currentText = 'ubuntu@sandbox:~$ ';

      while (isMounted && !isInteractive) {
        const step = demoSequence[stepIndex];
        
        if (step.typing) {
          for (let i = 0; i < step.text.length; i++) {
            if (!isMounted || isInteractive) return;
            currentText += step.text[i];
            setLines(currentText);
            await new Promise(r => setTimeout(r, 40 + Math.random() * 40));
          }
        } else {
          currentText += step.text;
          setLines(currentText);
        }

        await new Promise(r => setTimeout(r, step.delay));
        
        if (!isMounted || isInteractive) return;

        stepIndex++;
        if (stepIndex >= demoSequence.length) {
          stepIndex = 0;
          currentText = 'ubuntu@sandbox:~$ ';
          setLines(currentText);
          await new Promise(r => setTimeout(r, 400));
        }
      }
    };

    runSequence();

    return () => { isMounted = false; };
  }, [prefersReducedMotion, isInteractive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, inputValue]);

  const handleTerminalClick = () => {
    if (!isInteractive) {
      setIsInteractive(true);
      setLines('ubuntu@sandbox:~$ ');
      setInputValue('');
    }
    inputRef.current?.focus();
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim().toLowerCase();
      let response = '';

      if (cmd === 'help') {
        response = '\nAvailable commands: help, ls, whoami, clear, exit';
      } else if (cmd === 'ls') {
        response = '\nmodules/  config/  logs/  lab_environments.sh';
      } else if (cmd === 'whoami') {
        response = '\nguest';
      } else if (cmd === 'clear') {
        setLines('ubuntu@sandbox:~$ ');
        setInputValue('');
        return;
      } else if (cmd === 'exit') {
        setIsInteractive(false);
        return;
      } else if (cmd !== '') {
        response = `\nbash: ${cmd}: command not found`;
      }

      setLines(prev => prev + inputValue + response + '\n\nubuntu@sandbox:~$ ');
      setInputValue('');
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto rounded-xl border border-[var(--steel-line)] bg-[#0A0E17] shadow-xl overflow-hidden text-left flex flex-col h-[280px] cursor-text relative group"
      onClick={handleTerminalClick}
    >
      {!isInteractive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-fiber)]/20 text-[var(--accent-fiber)] border border-[var(--accent-fiber)]/30 px-4 py-2 rounded-full font-display text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
          Click to take control
        </div>
      )}

      <div className="bg-[#131A26] border-b border-[var(--steel-line)] px-4 py-2.5 flex items-center gap-2 shrink-0 z-10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#C24A3D]/80"></div>
          <div className="w-3 h-3 rounded-full bg-[#E8A33D]/80"></div>
          <div className="w-3 h-3 rounded-full bg-[#3FBF8F]/80"></div>
        </div>
        <div className="mx-auto text-[11px] font-mono text-[#5B5F6B] uppercase tracking-wider font-semibold">
          Ubuntu 24.04 — {isInteractive ? 'Terminal (Active)' : 'Interactive'}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="p-4 flex-1 overflow-y-auto font-data text-sm text-[#38bdf8] whitespace-pre-wrap leading-relaxed flex flex-col"
      >
        <span>
          {lines}
          {isInteractive && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleCommand}
              className="bg-transparent border-none outline-none text-[#38bdf8] w-[200px] font-data"
              spellCheck={false}
              autoComplete="off"
            />
          )}
          {(!prefersReducedMotion || isInteractive) && (
            <span className={`inline-block w-2 h-4 bg-[#38bdf8] ml-1 align-middle ${isInteractive ? 'animate-none' : 'animate-pulse'}`} />
          )}
        </span>
      </div>
    </div>
  );
}

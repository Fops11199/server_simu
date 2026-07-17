import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const bootLogs = [
  "BIOS Date 08/12/24 14:02:39 Ver 1.00",
  "CPU: Intel(R) Xeon(R) CPU E5-2673 v4 @ 2.30GHz",
  "Speed: 2.30 GHz",
  "Memory Test: 16777216K OK",
  "PMU ROM Version: 93",
  "NVRAM initialized",
  "USB controllers initialized",
  "Booting from Hard Disk...",
  "Loading Linux 6.8.0-40-generic...",
  "Loading initial ramdisk...",
  "Mounting virtual filesystems... [ OK ]",
  "Starting kernel... [ OK ]",
  "Initializing network interfaces... [ OK ]",
  "Starting SSH daemon... [ OK ]",
  "Starting PapperLab services... [ OK ]"
];

export function BootSequence() {
  const [isVisible, setIsVisible] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const hasBooted = sessionStorage.getItem('papperlab_booted');
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    if (hasBooted || mediaQuery.matches) {
      setIsVisible(false);
      return;
    }

    sessionStorage.setItem('papperlab_booted', 'true');

    let isMounted = true;
    let currentLine = 0;

    const runBoot = async () => {
      while (isMounted && currentLine < bootLogs.length) {
        setLines(prev => [...prev, bootLogs[currentLine]]);
        currentLine++;
        // Speed up the boot sequence progressively
        const delay = Math.max(10, 100 - (currentLine * 5)); 
        await new Promise(r => setTimeout(r, delay));
      }

      if (isMounted) {
        await new Promise(r => setTimeout(r, 300));
        setIsVisible(false);
      }
    };

    runBoot();

    return () => { isMounted = false; };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && !prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-[var(--ink)] flex flex-col p-6 pointer-events-none"
        >
          <div className="font-data text-[13px] text-[#3FBF8F] whitespace-pre-wrap leading-tight">
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            <span className="inline-block w-2 h-3 bg-[#3FBF8F] ml-1 animate-pulse align-middle mt-1" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

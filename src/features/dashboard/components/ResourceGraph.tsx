import React, { useState, useEffect } from 'react';
import { Cpu, Database, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

export const ResourceGraph: React.FC = () => {
  const [cpuLoad, setCpuLoad] = useState(14);
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 15, 14, 18, 11, 16, 14, 19, 13, 14]);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2;
      setCpuLoad(prev => {
        const next = Math.max(5, Math.min(65, prev + delta));
        setCpuHistory(h => [...h.slice(1), next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CPU USAGE */}
      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 shadow-md">
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-sans">CPU Usage</h3>
          </div>
          <span className="text-sm font-bold text-cyan-400 font-mono">{cpuLoad}%</span>
        </div>

        <div className="h-2 w-full bg-[#050507] rounded overflow-hidden mb-4 border border-white/[0.02]">
          <motion.div 
            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            animate={{ width: `${cpuLoad}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="h-16 w-full flex items-end">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M ${cpuHistory.map((val, i) => `${(i / (cpuHistory.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' L ')}`}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M 0,30 L ${cpuHistory.map((val, i) => `${(i / (cpuHistory.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' L ')} L 100,30 Z`}
              fill="url(#cpuGrad)"
            />
          </svg>
        </div>
        <p className="text-[10px] text-slate-550 font-mono mt-2 text-center">4 virtual cores (vCPUs) active</p>
      </div>

      {/* MEMORY USAGE */}
      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 shadow-md">
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-sans">RAM Allocation</h3>
          </div>
          <span className="text-sm font-bold text-purple-400 font-mono">3.4 GB / 8.0 GB (42%)</span>
        </div>

        <div className="h-2 w-full bg-[#050507] rounded overflow-hidden mb-4 border border-white/[0.02]">
          <div className="h-full bg-purple-500 w-[42%]" />
        </div>

        <div className="space-y-2 text-xs font-mono text-slate-400">
          <div className="flex justify-between">
            <span className="text-slate-500">Buffers / Cache:</span>
            <span className="text-slate-300">1.2 GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Swappiness:</span>
            <span className="text-slate-300">10 (Optimized)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Available:</span>
            <span className="text-cyan-400 font-semibold">4.6 GB Free</span>
          </div>
        </div>
      </div>

      {/* STORAGE USAGE */}
      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 shadow-md">
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-sans">Storage Allocation</h3>
          </div>
          <span className="text-sm font-bold text-emerald-400 font-mono">12.8 GB / 100 GB (13%)</span>
        </div>

        <div className="h-2 w-full bg-[#050507] rounded overflow-hidden mb-4 border border-white/[0.02]">
          <div className="h-full bg-emerald-500 w-[12.8%]" />
        </div>

        <div className="space-y-2 text-xs font-mono text-slate-400">
          <div className="flex justify-between">
            <span className="text-slate-500">Document Root (/var/www):</span>
            <span className="text-slate-300">15.2 MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">System & Packages:</span>
            <span className="text-slate-300">11.4 GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Log Files (/var/log):</span>
            <span className="text-slate-300">4.3 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

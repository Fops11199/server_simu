import React from 'react';
import { Server, Globe, Clock, ShieldCheck } from 'lucide-react';

export const MetricRibbon: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-4.5 flex items-center gap-4 shadow-md">
        <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Host Virtual OS</p>
          <h4 className="text-sm font-bold text-white font-display">Ubuntu 24.04 LTS</h4>
          <p className="text-[11px] text-slate-550 font-mono">server01.hostlab.local</p>
        </div>
      </div>

      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-4.5 flex items-center gap-4 shadow-md">
        <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Primary Public IP</p>
          <h4 className="text-sm font-semibold text-slate-200 font-mono">203.0.113.10</h4>
          <p className="text-[11px] text-slate-550 font-mono">CIDR: /24 Static IP</p>
        </div>
      </div>

      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-4.5 flex items-center gap-4 shadow-md">
        <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">System Uptime</p>
          <h4 className="text-sm font-semibold text-slate-200 font-display">4 days, 12h 10m</h4>
          <p className="text-[11px] text-slate-550 font-mono">Refreshed: Realtime</p>
        </div>
      </div>

      <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-4.5 flex items-center gap-4 shadow-md">
        <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Security Core</p>
          <h4 className="text-sm font-bold text-emerald-400 font-display">ufw active</h4>
          <p className="text-[11px] text-slate-550 font-mono">Firewall status: SECURE</p>
        </div>
      </div>
    </div>
  );
};

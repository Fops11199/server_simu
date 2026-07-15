import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { ServiceStatus } from '../types';
import { 
  Server, Cpu, Database, HardDrive, ShieldCheck, Play, Square, RotateCw, 
  Globe, Clock, Terminal, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

export const DashboardTab: React.FC = () => {
  const { state, updateState, addTerminalLine } = useSimulator();
  
  // Alive state for CPU activity
  const [cpuLoad, setCpuLoad] = useState(14);
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 15, 14, 18, 11, 16, 14, 19, 13, 14]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Small fluctuation
      const delta = Math.floor(Math.random() * 5) - 2;
      setCpuLoad(prev => {
        const next = Math.max(5, Math.min(65, prev + delta));
        setCpuHistory(h => [...h.slice(1), next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleServiceAction = (service: keyof ServiceStatus, action: 'start' | 'stop' | 'restart') => {
    let finalStatus: 'running' | 'stopped' | 'failed' = 'running';
    
    if (action === 'start' || action === 'restart') {
      if (service === 'nginx') {
        // Simple check for syntax error
        const hasSyntaxError = state.fs.children.etc?.type === 'dir' && 
          (state.fs.children.etc.children.nginx as any)?.children?.['sites-available']?.children?.default?.content?.includes(';') === false;
        
        if (hasSyntaxError) {
          finalStatus = 'failed';
        } else {
          finalStatus = 'running';
        }
      } else {
        finalStatus = 'running';
      }
    } else {
      finalStatus = 'stopped';
    }

    const updatedServices = { ...state.services, [service]: finalStatus };
    updateState({ services: updatedServices });

    // Print command execution inside terminal lines for coherence
    const displayCmd = `systemctl ${action} ${service}`;
    addTerminalLine({ type: 'input', text: `student@server01:~$ ${displayCmd}` });
    
    if (finalStatus === 'failed') {
      addTerminalLine({ 
        type: 'error', 
        text: `Job for ${service}.service failed. See "systemctl status ${service}.service" for details.` 
      });
    } else {
      addTerminalLine({ 
        type: 'success', 
        text: `Service ${service} ${action}ed successfully.` 
      });
    }
  };

  const activePorts = [
    { port: 80, name: 'HTTP Web Server (Nginx)', active: state.services.nginx === 'running' },
    { port: 443, name: 'HTTPS Secure Server (Nginx)', active: state.services.nginx === 'running' && state.cpanel.sslCertificates.includes('hostlab.local') },
    { port: 5432, name: 'PostgreSQL Database', active: state.services.postgresql === 'running' },
    { port: 5000, name: 'NodeJS Backend API', active: state.services['node-api'] === 'running' },
    { port: 22, name: 'SSH Remote Terminal Daemon', active: true }
  ];

  return (
    <div className="space-y-6 h-full min-h-0 overflow-y-auto pr-1" id="dashboard-tab-container">
      {/* 1. Server Specs Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-4.5 flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-glow-cyan/10">
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
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-glow-emerald/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Security Core</p>
            <h4 className="text-sm font-bold text-emerald-400 font-display">ufw active</h4>
            <p className="text-[11px] text-slate-550 font-mono">Firewall status: SECURE</p>
          </div>
        </div>
      </div>

      {/* 2. Core Resource Metrics & Animated Sparkline */}
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
              className="h-full bg-cyan-500 shadow-glow-cyan"
              animate={{ width: `${cpuLoad}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Custom SVG Sparkline Graph */}
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

      {/* 3. Services Controller & Port Listeners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Services Status Controller */}
        <div className="lg:col-span-8 bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 shadow-md">
          <h3 className="text-sm font-bold text-white mb-4 font-display tracking-wide uppercase">Active Server Services (systemd controller)</h3>
          
          <div className="space-y-3">
            {/* Nginx */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#050507]/60 border border-white/5 rounded-lg gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  state.services.nginx === 'running' 
                    ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' 
                    : state.services.nginx === 'failed' 
                    ? 'bg-red-500 shadow-glow-red' 
                    : 'bg-slate-600'
                }`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-display">nginx.service</h4>
                  <p className="text-xs text-slate-400 mt-0.5">High Performance Nginx Web Server & reverse proxy</p>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded mt-2 inline-block border ${
                    state.services.nginx === 'running' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : state.services.nginx === 'failed'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-slate-800 text-slate-400 border-transparent'
                  }`}>
                    STATUS: {state.services.nginx.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 select-none">
                {state.services.nginx !== 'running' && (
                  <button
                    onClick={() => handleServiceAction('nginx', 'start')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                )}
                {state.services.nginx === 'running' && (
                  <button
                    onClick={() => handleServiceAction('nginx', 'stop')}
                    className="bg-[#15151a] hover:bg-red-950/20 border border-white/5 hover:border-red-500/30 text-red-400 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-red-400/20" /> Stop
                  </button>
                )}
                <button
                  onClick={() => handleServiceAction('nginx', 'restart')}
                  className="bg-[#15151a] hover:bg-[#20202a] border border-white/5 text-slate-300 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Restart
                </button>
              </div>
            </div>

            {/* NodeJS API */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#050507]/60 border border-white/5 rounded-lg gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  state.services['node-api'] === 'running' ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-slate-600'
                }`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-display">node-api.service</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Custom backend Node.js server (express-app) port 5000</p>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded mt-2 inline-block border ${
                    state.services['node-api'] === 'running' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border-transparent'
                  }`}>
                    STATUS: {state.services['node-api'].toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 select-none">
                {state.services['node-api'] !== 'running' && (
                  <button
                    onClick={() => handleServiceAction('node-api', 'start')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                )}
                {state.services['node-api'] === 'running' && (
                  <button
                    onClick={() => handleServiceAction('node-api', 'stop')}
                    className="bg-[#15151a] hover:bg-red-950/20 border border-white/5 hover:border-red-500/30 text-red-400 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-red-400/20" /> Stop
                  </button>
                )}
                <button
                  onClick={() => handleServiceAction('node-api', 'restart')}
                  className="bg-[#15151a] hover:bg-[#20202a] border border-white/5 text-slate-300 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Restart
                </button>
              </div>
            </div>

            {/* PostgreSQL */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#050507]/60 border border-white/5 rounded-lg gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  state.services.postgresql === 'running' ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-slate-600'
                }`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-display">postgresql.service</h4>
                  <p className="text-xs text-slate-400 mt-0.5">PostgreSQL Relational Database Engine port 5432</p>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded mt-2 inline-block border ${
                    state.services.postgresql === 'running' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border-transparent'
                  }`}>
                    STATUS: {state.services.postgresql.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 select-none">
                {state.services.postgresql !== 'running' && (
                  <button
                    onClick={() => handleServiceAction('postgresql', 'start')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                )}
                {state.services.postgresql === 'running' && (
                  <button
                    onClick={() => handleServiceAction('postgresql', 'stop')}
                    className="bg-[#15151a] hover:bg-red-950/20 border border-white/5 hover:border-red-500/30 text-red-400 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-red-400/20" /> Stop
                  </button>
                )}
                <button
                  onClick={() => handleServiceAction('postgresql', 'restart')}
                  className="bg-[#15151a] hover:bg-[#20202a] border border-white/5 text-slate-300 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Restart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listening Ports & Sockets Map */}
        <div className="lg:col-span-4 bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 flex flex-col shadow-md">
          <h3 className="text-sm font-bold text-white mb-4 font-display tracking-wide uppercase select-none">Port Audit List</h3>
          
          <div className="flex-1 space-y-3">
            {activePorts.map((ap) => (
              <div 
                key={ap.port}
                className={`p-3 rounded border flex items-center justify-between font-mono text-xs transition-all duration-300 ${
                  ap.active
                    ? 'bg-emerald-500/[0.04] border-emerald-500/25 text-emerald-300 shadow-glow-emerald/5'
                    : 'bg-[#050507]/40 border-white/5 text-slate-550'
                }`}
              >
                <div>
                  <span className={`font-bold block mb-0.5 ${ap.active ? 'text-emerald-400' : 'text-slate-500'}`}>PORT {ap.port}</span>
                  <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">{ap.name}</span>
                </div>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  ap.active 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse shadow-glow-emerald' 
                    : 'bg-[#15151a] text-slate-600 border-transparent'
                }`}>
                  {ap.active ? 'LISTEN' : 'CLOSED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

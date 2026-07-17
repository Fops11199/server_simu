import React from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';

export const PortAuditList: React.FC = () => {
  const { services, cpanel } = useSimulatorStore();

  const activePorts = [
    { port: 80, name: 'HTTP Web Server (Nginx)', active: services.nginx === 'running' },
    { port: 443, name: 'HTTPS Secure Server (Nginx)', active: services.nginx === 'running' && cpanel.sslCertificates.includes('hostlab.local') },
    { port: 5432, name: 'PostgreSQL Database', active: services.postgresql === 'running' },
    { port: 5000, name: 'NodeJS Backend API', active: services['node-api'] === 'running' },
    { port: 22, name: 'SSH Remote Terminal Daemon', active: true }
  ];

  return (
    <div className="lg:col-span-4 bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 flex flex-col shadow-md">
      <h3 className="text-sm font-bold text-white mb-4 font-display tracking-wide uppercase select-none">Port Audit List</h3>
      
      <div className="flex-1 space-y-3">
        {activePorts.map((ap) => (
          <div 
            key={ap.port}
            className={`p-3 rounded border flex items-center justify-between font-mono text-xs transition-all duration-300 ${
              ap.active
                ? 'bg-emerald-500/[0.04] border-emerald-500/25 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
                : 'bg-[#050507]/40 border-white/5 text-slate-550'
            }`}
          >
            <div>
              <span className={`font-bold block mb-0.5 ${ap.active ? 'text-emerald-400' : 'text-slate-500'}`}>PORT {ap.port}</span>
              <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">{ap.name}</span>
            </div>
            
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
              ap.active 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.2)]' 
                : 'bg-[#15151a] text-slate-600 border-transparent'
            }`}>
              {ap.active ? 'LISTEN' : 'CLOSED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

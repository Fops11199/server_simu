import React from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import { ServiceStatus } from '../../../types/services';
import { Play, Square, RotateCw } from 'lucide-react';

export const ServiceController: React.FC = () => {
  const { services, patchState, addHistory } = useSimulatorStore();

  const handleServiceAction = (service: keyof ServiceStatus, action: 'start' | 'stop' | 'restart') => {
    let finalStatus: 'running' | 'stopped' | 'failed' = 'running';
    
    if (action === 'start' || action === 'restart') {
      if (service === 'nginx') {
        const simState = useSimulatorStore.getState();
        const hasSyntaxError = simState.fs.children.etc?.type === 'dir' && 
          (simState.fs.children.etc.children.nginx as any)?.children?.['sites-available']?.children?.default?.content?.includes(';') === false;
        
        finalStatus = hasSyntaxError ? 'failed' : 'running';
      } else {
        finalStatus = 'running';
      }
    } else {
      finalStatus = 'stopped';
    }

    const updatedServices = { ...services, [service]: finalStatus };
    patchState({ services: updatedServices });

    const displayCmd = `systemctl ${action} ${service}`;
    addHistory(`student@server01:~$ ${displayCmd}`);
    
    if (finalStatus === 'failed') {
      addHistory(`Job for ${service}.service failed. See "systemctl status ${service}.service" for details.`);
    } else {
      addHistory(`Service ${service} ${action}ed successfully.`);
    }
  };

  const ServiceRow = ({ id, title, desc, status }: { id: keyof ServiceStatus, title: string, desc: string, status: string }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#050507]/60 border border-white/5 rounded-lg gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
          status === 'running' 
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' 
            : status === 'failed' 
            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
            : 'bg-slate-600'
        }`} />
        <div>
          <h4 className="text-sm font-bold text-slate-200 font-display">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded mt-2 inline-block border ${
            status === 'running' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : status === 'failed'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-slate-800 text-slate-400 border-transparent'
          }`}>
            STATUS: {status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 select-none">
        {status !== 'running' && (
          <button
            onClick={() => handleServiceAction(id, 'start')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> Start
          </button>
        )}
        {status === 'running' && (
          <button
            onClick={() => handleServiceAction(id, 'stop')}
            className="bg-[#15151a] hover:bg-red-950/20 border border-white/5 hover:border-red-500/30 text-red-400 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-red-400/20" /> Stop
          </button>
        )}
        <button
          onClick={() => handleServiceAction(id, 'restart')}
          className="bg-[#15151a] hover:bg-[#20202a] border border-white/5 text-slate-300 font-mono text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-8 bg-[#0d0d12] border border-white/5 rounded-xl p-5.5 shadow-md">
      <h3 className="text-sm font-bold text-white mb-4 font-display tracking-wide uppercase">Active Server Services (systemd controller)</h3>
      <div className="space-y-3">
        <ServiceRow id="nginx" title="nginx.service" desc="High Performance Nginx Web Server & reverse proxy" status={services.nginx} />
        <ServiceRow id="node-api" title="node-api.service" desc="Custom backend Node.js server (express-app) port 5000" status={services['node-api']} />
        <ServiceRow id="postgresql" title="postgresql.service" desc="PostgreSQL Relational Database Engine port 5432" status={services.postgresql} />
      </div>
    </div>
  );
};

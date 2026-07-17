import React from 'react';
import { CheckCircle, Circle, AlertCircle, Terminal, Network, Server, Database, Shield } from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';
import type { Mission } from '../../types/missions';

interface MissionDetailProps {
  mission: Mission;
}

const CategoryIcon: Record<string, React.ReactNode> = {
  DNS:      <Network className="w-4 h-4" />,
  Nginx:    <Server className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  Database: <Database className="w-4 h-4" />,
  SSL:      <Shield className="w-4 h-4" />,
  Firewall: <Shield className="w-4 h-4" />,
};

export const MissionDetail: React.FC<MissionDetailProps> = ({ mission }) => {
  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Ticket Header */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="text-[10px] text-slate-600 font-mono mb-1.5">
              SUPPORT TICKET #{mission.ticketNumber} · {mission.category.toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-slate-100">{mission.title}</h2>
            <p className="text-[12px] text-slate-500 mt-1">From: <span className="text-slate-400">{mission.clientName}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={mission.completed ? 'success' : 'cyan'}>
              {mission.completed ? '✓ Resolved' : 'Open'}
            </Badge>
            <div className="flex items-center gap-1.5 text-slate-400">
              {CategoryIcon[mission.category]}
              <span className="text-xs font-mono">{mission.category}</span>
            </div>
          </div>
        </div>
        <p className="text-[12px] text-slate-400 leading-relaxed">{mission.description}</p>
      </div>

      {/* Client Message */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 font-mono">CLIENT MESSAGE</span>
        </div>
        <pre className="text-[12px] text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-[var(--color-bg-elevated)] rounded-lg p-4 border border-[var(--color-border)]">
          {mission.ticketMessage}
        </pre>
      </div>

      {/* Objectives Checklist */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Objectives</span>
          </div>
          <Badge variant={mission.completed ? 'success' : 'default'}>
            {mission.objectives.filter(o => o.completed).length}/{mission.objectives.length} Done
          </Badge>
        </div>
        <div className="space-y-3">
          {mission.objectives.map((obj, idx) => (
            <div
              key={obj.id}
              className={[
                'flex items-start gap-3 p-3 rounded-lg border transition-all duration-300',
                obj.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)]',
              ].join(' ')}
            >
              <div className="mt-0.5 shrink-0">
                {obj.completed
                  ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                  : <Circle className="w-4 h-4 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[12px] leading-snug ${obj.completed ? 'text-emerald-300 line-through opacity-70' : 'text-slate-300'}`}>
                  {idx + 1}. {obj.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

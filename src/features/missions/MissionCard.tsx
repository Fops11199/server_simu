import React from 'react';
import { CheckCircle, Circle, Clock, Zap } from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';
import type { Mission } from '../../types/missions';

interface MissionCardProps {
  mission: Mission;
  isActive: boolean;
  onClick: () => void;
}

const DIFFICULTY_BADGE: Record<string, 'success' | 'warning' | 'error'> = {
  Beginner:     'success',
  Intermediate: 'warning',
  Advanced:     'error',
};

const CATEGORY_ICON: Record<string, string> = {
  DNS:      '🌐',
  Nginx:    '⚡',
  Terminal: '💻',
  Database: '🗄️',
  SSL:      '🔒',
  Firewall: '🛡️',
};

export const MissionCard: React.FC<MissionCardProps> = ({ mission, isActive, onClick }) => {
  const completedObjs = mission.objectives.filter(o => o.completed).length;
  const totalObjs = mission.objectives.length;
  const progress = totalObjs > 0 ? (completedObjs / totalObjs) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border p-4 transition-all duration-200 group cursor-pointer',
        mission.completed
          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
          : isActive
            ? 'bg-cyan-500/8 border-cyan-500/30 shadow-[0_0_16px_rgba(34,211,238,0.10)]'
            : 'bg-[var(--color-bg-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{CATEGORY_ICON[mission.category] ?? '📋'}</span>
          <div>
            <div className="text-[11px] text-slate-500 font-mono mb-0.5">Ticket #{mission.ticketNumber}</div>
            <div className={`text-sm font-semibold leading-tight ${mission.completed ? 'text-emerald-400' : 'text-slate-200'}`}>
              {mission.title}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={DIFFICULTY_BADGE[mission.difficulty]}>{mission.difficulty}</Badge>
          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
            <Zap className="w-3 h-3" />
            <span>{mission.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Client name */}
      <div className="text-[11px] text-slate-500 mb-3 font-mono">
        Client: <span className="text-slate-400">{mission.clientName}</span>
      </div>

      {/* Progress bar */}
      {!mission.completed && (
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-1">
            <span>Objectives</span>
            <span>{completedObjs}/{totalObjs}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {mission.completed && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-1">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Ticket Resolved</span>
        </div>
      )}
    </button>
  );
};

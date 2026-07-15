import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Mission } from '../types';
import { CheckCircle2, Circle, AlertCircle, ShieldAlert, Database, Network, KeyRound, Terminal, Award, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const MissionsTab: React.FC = () => {
  const { missions, activeMissionId, setActiveMissionId, xp } = useSimulator();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DNS': return <Network className="w-5 h-5 text-cyan-400" />;
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Nginx': return <Terminal className="w-5 h-5 text-purple-400" />;
      case 'SSL': return <KeyRound className="w-5 h-5 text-amber-400" />;
      default: return <AlertCircle className="w-5 h-5 text-sky-400" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-glow-emerald/10';
      case 'Intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-glow-red/10';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const activeMission = missions.find(m => m.id === activeMissionId) || missions[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0" id="missions-tab-container">
      {/* LEFT: Ticket Queue */}
      <div className="lg:col-span-4 flex flex-col bg-[#0d0d12] border border-white/5 rounded-xl overflow-hidden h-full shadow-xl">
        <div className="p-4 border-b border-white/5 bg-[#0a0a0c]/40 flex justify-between items-center select-none">
          <div>
            <h2 className="font-bold text-white font-display tracking-tight text-sm">SUPPORT TICKETS</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a client ticket to investigate</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#15151a] px-2.5 py-1 rounded border border-white/5 shadow-glow-cyan/5">
            <Award className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 font-mono">{xp} XP</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {missions.map((mission) => {
            const isActive = mission.id === activeMissionId;
            return (
              <button
                key={mission.id}
                id={`ticket-${mission.id}`}
                onClick={() => setActiveMissionId(mission.id)}
                className={`w-full text-left p-3.5 rounded border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/[0.06] border-cyan-500/40 text-cyan-400 shadow-glow-cyan'
                    : 'bg-[#050507]/40 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(mission.category)}
                    <span className="font-mono text-xs text-slate-400 font-semibold">
                      Ticket #{mission.ticketNumber}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${getDifficultyColor(mission.difficulty)}`}>
                    {mission.difficulty}
                  </span>
                </div>

                <h3 className={`font-semibold text-sm truncate mb-1 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                  {mission.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-2.5 leading-relaxed">
                  {mission.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    Client: {mission.clientName}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {mission.completed ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1">
                        <Circle className="w-3.5 h-3.5 fill-amber-500/10" /> In Progress
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Detailed Support View */}
      {activeMission && (
        <div className="lg:col-span-8 flex flex-col bg-[#0d0d12] border border-white/5 rounded-xl overflow-hidden h-full shadow-xl">
          {/* Ticket Header */}
          <div className="p-5 border-b border-white/5 bg-[#0a0a0c]/40 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 select-none">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  Ticket #{activeMission.ticketNumber}
                </span>
                <span className="text-xs text-slate-500">• Created: Realtime (July 15, 2026)</span>
              </div>
              <h1 className="text-lg font-bold text-white font-display tracking-tight">
                {activeMission.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-[#15151a] border border-white/5 px-3 py-1.5 rounded text-xs font-mono text-slate-300">
              Reward: <span className="font-bold text-amber-400">+{activeMission.xpReward} XP</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* The Client Email/Ticket Box */}
            <div className="bg-indigo-600/[0.03] border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden shadow-glow-indigo">
              <div className="absolute top-0 right-0 p-3 text-slate-600 font-mono text-xs select-none uppercase tracking-wider">
                Incoming Mail
              </div>
              
              <div className="flex items-center gap-3 mb-4 select-none">
                <div className="w-10 h-10 rounded bg-[#15151a] flex items-center justify-center font-bold text-slate-200 border border-white/5 font-display text-sm">
                  {activeMission.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 leading-none mb-1">{activeMission.clientName}</h4>
                  <p className="text-xs text-slate-500">To: support@hostlab.local</p>
                </div>
              </div>

              <div className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed border-l-2 border-indigo-500/40 pl-4 py-1">
                {activeMission.ticketMessage}
              </div>
            </div>

            {/* Dynamic Interactive Objectives Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 select-none">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Root Cause & Objectives Checklist
              </h3>

              <div className="grid gap-2.5">
                {activeMission.objectives.map((obj) => (
                  <motion.div
                    key={obj.id}
                    layoutId={`obj-${obj.id}`}
                    className={`flex items-center justify-between p-3.5 rounded border transition-all duration-300 ${
                      obj.completed
                        ? 'bg-emerald-500/[0.04] border-emerald-500/30 text-emerald-300 shadow-glow-emerald/5'
                        : 'bg-[#050507]/50 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {obj.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 shrink-0 fill-[#050507]" />
                      )}
                      <span className={`text-xs font-mono ${obj.completed ? 'line-through text-slate-550' : ''}`}>
                        {obj.text}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      obj.completed ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-500/15' : 'bg-[#15151a] text-slate-500 border border-white/5'
                    }`}>
                      {obj.completed ? 'PASSED' : 'PENDING'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Administrator Tips */}
            <div className="bg-[#15151a]/60 border border-white/5 rounded-xl p-4 flex gap-3 text-slate-400 text-xs leading-relaxed shadow-sm">
              <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Simulation Pro-Tip:</span> You can solve this ticket using **either** cPanel GUI panels or running raw terminal CLI tools (like <code className="bg-[#050507] px-1.5 py-0.5 text-cyan-400 border border-white/5 rounded font-mono font-medium">systemctl</code>, <code className="bg-[#050507] px-1.5 py-0.5 text-cyan-400 border border-white/5 rounded font-mono font-medium">nano</code>, <code className="bg-[#050507] px-1.5 py-0.5 text-cyan-400 border border-white/5 rounded font-mono font-medium">cp</code>, etc.). The underlying simulation engine is fully unified and instantly reflects edits across all interfaces!
              </div>
            </div>
          </div>

          {/* Ticket Footer / Action */}
          <div className="p-4 border-t border-white/5 bg-[#0a0a0c]/20 flex justify-between items-center select-none">
            <p className="text-xs text-slate-500">
              {activeMission.completed ? 'Ticket solved successfully!' : 'Currently investigating ticket.'}
            </p>

            {activeMission.completed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded text-emerald-400 text-xs font-semibold font-mono flex items-center gap-1.5 animate-pulse shadow-glow-emerald">
                <CheckCircle2 className="w-4 h-4" /> Ticket Solved (+{activeMission.xpReward} XP awarded)
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded text-amber-400 text-xs font-semibold font-mono flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div> Pending System Checks
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

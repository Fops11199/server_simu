import React from 'react';
import { useMissionStore } from '../../stores/useMissionStore';
import { useParams, useNavigate } from 'react-router-dom';
import { MissionCard } from './MissionCard';
import { MissionDetail } from './MissionDetail';
import { Award, Trophy } from 'lucide-react';

export const MissionsTab: React.FC = () => {
  const { missions, activeMissionId, setActiveMissionId, xp } = useMissionStore();
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  const selectedId = missionId ?? activeMissionId;
  const selectedMission = missions.find(m => m.id === selectedId) ?? missions[0];

  const handleSelectMission = (id: string) => {
    setActiveMissionId(id);
    navigate(`/missions/${id}`);
  };

  const completedCount = missions.filter(m => m.completed).length;
  const adminLevel = xp >= 400 ? 'Expert' : xp >= 200 ? 'Intermediate' : 'Junior';

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200 font-display">Support Tickets</h2>
            <p className="text-[11px] text-slate-500 font-mono">{completedCount}/{missions.length} tickets resolved</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold font-mono text-amber-400">{adminLevel} · {xp} XP</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Left: Mission List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {missions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              isActive={mission.id === selectedId}
              onClick={() => handleSelectMission(mission.id)}
            />
          ))}
        </div>

        {/* Right: Mission Detail */}
        <div className="overflow-y-auto">
          {selectedMission ? (
            <MissionDetail mission={selectedMission} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 font-mono text-sm">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

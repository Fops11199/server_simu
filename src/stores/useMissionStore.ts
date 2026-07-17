import { create } from 'zustand';
import type { Mission } from '../types/missions';
import { CORE_MISSIONS } from '../lib/missions';
import { useAuthStore } from './useAuthStore';

interface MissionStore {
  missions: Mission[];
  activeMissionId: string | null;
  xp: number;

  setActiveMissionId: (id: string | null) => void;
  loadProgress: (missionsData: any[], objectivesData: any[]) => void;
  completeMission: (id: string) => void;
  updateObjectiveStatus: (missionId: string, objectiveId: string, completed: boolean) => void;
  resetMissions: () => void;
  /** Full missions recalculation — called from the simulator subscriber */
  recalculateMissions: (newMissions: Mission[]) => void;
}

const INITIAL_MISSIONS = CORE_MISSIONS.map(m => ({
  ...m,
  completed: false,
  objectives: m.objectives.map(o => ({ ...o, completed: false }))
}));

export const useMissionStore = create<MissionStore>()(
  (set, get) => ({
    missions: INITIAL_MISSIONS,
    activeMissionId: 'mission_1',
    xp: 0,

    setActiveMissionId: (id) => set({ activeMissionId: id }),

    loadProgress: (missionsData: any[], objectivesData: any[]) => {
      set(s => {
        const missions = s.missions.map(m => {
          const mData = missionsData.find(md => md.id === m.id);
          return {
            ...m,
            completed: mData?.completed || false,
            objectives: m.objectives.map(o => {
              const oData = objectivesData.find(od => od.id === o.id);
              return { ...o, completed: oData?.completed || false };
            })
          };
        });
        return { missions };
      });
    },

    completeMission: (id) => {
      const state = get();
      const mission = state.missions.find(m => m.id === id);
      if (!mission || mission.completed) return;

      set(s => ({
        missions: s.missions.map(m => m.id === id ? { ...m, completed: true } : m),
        xp: s.xp + mission.xpReward
      }));

      // Fire and forget API call
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        fetch('/api/missions/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, missionId: id, completed: true })
        }).catch(err => console.error('Failed to sync mission progress:', err));
        
        // Update user XP via Auth Store
        useAuthStore.getState().updateXp(state.xp + mission.xpReward);
      }
    },

    updateObjectiveStatus: (missionId, objectiveId, completed) => {
      set(s => ({
        missions: s.missions.map(m => {
          if (m.id !== missionId) return m;
          return {
            ...m,
            objectives: m.objectives.map(o => o.id === objectiveId ? { ...o, completed } : o)
          };
        })
      }));

      // Fire and forget API call
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        fetch('/api/missions/objectives/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, objectiveId, completed })
        }).catch(err => console.error('Failed to sync objective progress:', err));
      }
    },

    resetMissions: () => set({
      missions: INITIAL_MISSIONS,
      activeMissionId: 'mission_1',
      xp: 0
    }),

    recalculateMissions: (newMissions) => {
      const s = get();
      // Sum XP for newly completed missions only
      const prevCompleted = new Set(s.missions.filter(m => m.completed).map(m => m.id));
      const newlyCompleted = newMissions.filter(m => m.completed && !prevCompleted.has(m.id));
      const xpGained = newlyCompleted.reduce((sum, m) => sum + m.xpReward, 0);
      
      set({ missions: newMissions, xp: s.xp + xpGained });

      const userId = useAuthStore.getState().user?.id;
      if (userId && newlyCompleted.length > 0) {
        newlyCompleted.forEach(mission => {
          fetch('/api/missions/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, missionId: mission.id, completed: true })
          }).catch(console.error);
        });
        useAuthStore.getState().updateXp(s.xp + xpGained);
      }
    },
  })
);

import { useEffect, useRef } from 'react';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { useMissionStore } from '../stores/useMissionStore';
import { useTerminalStore } from '../stores/useTerminalStore';
import { useShallow } from 'zustand/react/shallow';
import { validateAllMissions, CORE_MISSIONS } from '../lib/missions';

/**
 * MissionWatcher — subscribes to simulator state changes and reactively
 * re-validates all mission objectives. Emits completion events to terminal.
 *
 * Must be mounted inside the router (after stores are initialized).
 * Uses refs to avoid stale closure issues.
 */
export function useMissionWatcher() {
  const simulatorState = useSimulatorStore(
    useShallow((s) => ({
      fs: s.fs,
      dnsRecords: s.dnsRecords,
      cpanel: s.cpanel,
      services: s.services,
      currentDir: s.currentDir,
      history: s.history,
    }))
  );
  const { missions, recalculateMissions } = useMissionStore();
  const { addLine } = useTerminalStore();
  const prevCompletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Re-attach validators from source missions (in case loaded from localStorage)
    const missionsWithValidators = missions.map(m => {
      const source = CORE_MISSIONS.find(s => s.id === m.id);
      if (!source) return m;
      return {
        ...m,
        objectives: m.objectives.map((obj, i) => ({
          ...obj,
          validator: source.objectives[i]?.validator ?? (() => false),
        })),
      };
    });

    const updated = validateAllMissions(missionsWithValidators, simulatorState);

    // Detect newly completed missions for terminal announcements
    const nowCompleted = new Set(updated.filter(m => m.completed).map(m => m.id));
    updated.forEach(m => {
      if (m.completed && !prevCompletedRef.current.has(m.id)) {
        addLine({ type: 'info', text: '' });
        addLine({ type: 'success', text: `🌟 MISSION COMPLETED: "${m.title}"! (+${m.xpReward} XP)` });
        addLine({ type: 'success', text: `Client Ticket #${m.ticketNumber} is now fully resolved and closed.` });
        addLine({ type: 'info', text: '' });
      }
    });
    prevCompletedRef.current = nowCompleted;

    recalculateMissions(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatorState]);
}

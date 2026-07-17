import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { useMissionStore } from '../stores/useMissionStore';
import { useShallow } from 'zustand/react/shallow';
import { CORE_MISSIONS } from '../lib/missions';

export function useDbSync() {
  const { user, sessionId, isLoggedIn } = useAuthStore();
  const [syncLoading, setSyncLoading] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track previous completed missions & objectives to detect changes
  const prevCompletedMissions = useRef<Set<string>>(new Set());
  const prevCompletedObjectives = useRef<Set<string>>(new Set());

  // Helper to save current snapshot to database
  const saveSnapshot = async (label = 'auto-save') => {
    if (!isLoggedIn || !user) return;
    
    const simState = useSimulatorStore.getState();
    const snapshot = {
      fs: simState.fs,
      currentDir: simState.currentDir,
      dnsRecords: simState.dnsRecords,
      cpanel: simState.cpanel,
      services: simState.services,
      history: simState.history,
      serverPower: simState.serverPower,
    };

    try {
      await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sessionId,
          snapshot,
          label,
        }),
      });
    } catch (err) {
      console.error('Failed to auto-save snapshot:', err);
    }
  };

  // 1. Initial Load when logging in
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setSyncLoading(false);
      return;
    }

    const loadUserData = async () => {
      setSyncLoading(true);
      try {
        // Fetch latest snapshot
        const snapRes = await fetch(`/api/snapshots/latest/${user.id}`);
        const snapData = await snapRes.json();
        
        if (snapData.success && snapData.snapshot) {
          const snapshot = snapData.snapshot;
          const currentState = useSimulatorStore.getState();
          useSimulatorStore.setState({
            fs: snapshot.fs || currentState.fs,
            currentDir: snapshot.currentDir || currentState.currentDir,
            dnsRecords: snapshot.dnsRecords || currentState.dnsRecords,
            cpanel: snapshot.cpanel || currentState.cpanel,
            services: snapshot.services || currentState.services,
            history: snapshot.history || currentState.history,
            serverPower: snapshot.serverPower || currentState.serverPower,
          });
        } else {
          // New profile, use default initial state
          useSimulatorStore.getState().resetSimulator();
        }

        // Fetch missions progress
        const progRes = await fetch(`/api/missions/progress/${user.id}`);
        const progData = await progRes.json();

        if (progData.success) {
          const dbMissions = progData.missions || [];
          const dbObjectives = progData.objectives || [];

          // Rebuild missions array with completion status from DB
          const mappedMissions = CORE_MISSIONS.map(m => {
            const dbM = dbMissions.find((x: any) => x.id === m.id);
            return {
              ...m,
              completed: dbM ? dbM.completed : false,
              objectives: m.objectives.map(o => {
                const dbO = dbObjectives.find((x: any) => x.id === o.id);
                return {
                  ...o,
                  completed: dbO ? dbO.completed : false,
                };
              }),
            };
          });

          useMissionStore.setState({
            missions: mappedMissions,
            xp: user.xp,
          });

          // Set refs
          prevCompletedMissions.current = new Set(
            mappedMissions.filter(m => m.completed).map(m => m.id)
          );
          prevCompletedObjectives.current = new Set(
            dbObjectives.filter((o: any) => o.completed).map((o: any) => o.id)
          );
        }
      } catch (err) {
        console.error('Error loading user data from DB:', err);
      } finally {
        setSyncLoading(false);
      }
    };

    loadUserData();
  }, [isLoggedIn, user]);

  // 2. Periodic Auto-Save
  useEffect(() => {
    if (!isLoggedIn || !user || syncLoading) {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    autoSaveIntervalRef.current = setInterval(() => {
      saveSnapshot('auto-save');
    }, 30000); // every 30 seconds

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isLoggedIn, user, syncLoading]);

  // 3. React to mission/objective completions dynamically
  const missionsState = useMissionStore(
    useShallow((s) => ({
      missions: s.missions,
      xp: s.xp,
    }))
  );

  useEffect(() => {
    if (!isLoggedIn || !user || syncLoading) return;

    const syncProgress = async () => {
      const activeMissions = missionsState.missions;
      let stateChanged = false;
      let newlyCompletedMissionId = null;

      // Check for newly completed objectives
      for (const m of activeMissions) {
        for (const o of m.objectives) {
          if (o.completed && !prevCompletedObjectives.current.has(o.id)) {
            prevCompletedObjectives.current.add(o.id);
            stateChanged = true;
            try {
              await fetch('/api/missions/objectives/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  objectiveId: o.id,
                  completed: true,
                }),
              });
            } catch (err) {
              console.error(`Failed to sync objective progress for ${o.id}:`, err);
            }
          }
        }
      }

      // Check for newly completed missions
      for (const m of activeMissions) {
        if (m.completed && !prevCompletedMissions.current.has(m.id)) {
          prevCompletedMissions.current.add(m.id);
          newlyCompletedMissionId = m.id;
          stateChanged = true;
          try {
            await fetch('/api/missions/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                missionId: m.id,
                completed: true,
                attempts: 1, // default
              }),
            });
          } catch (err) {
            console.error(`Failed to sync mission progress for ${m.id}:`, err);
          }
        }
      }

      // If anything changed, sync XP and save snapshot
      if (stateChanged) {
        // Sync XP
        const auth = useAuthStore.getState();
        await auth.updateXp(missionsState.xp);

        // Save snapshot with descriptive label
        const label = newlyCompletedMissionId 
          ? `completed-${newlyCompletedMissionId}`
          : 'objective-updated';
        await saveSnapshot(label);
      }
    };

    syncProgress();
  }, [missionsState, isLoggedIn, user, syncLoading]);

  return { syncLoading };
}

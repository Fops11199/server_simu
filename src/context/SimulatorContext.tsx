/**
 * Legacy SimulatorContext — thin compatibility shim over Zustand stores.
 * Existing components that use `useSimulator()` will continue to work.
 * New components should use the stores directly.
 */
import React, { createContext, useContext } from 'react';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { useTerminalStore } from '../stores/useTerminalStore';
import { useMissionStore } from '../stores/useMissionStore';
import { useTerminal } from '../hooks/useTerminal';
import type { SimulatorCoreState } from '../types/simulator';
import type { TerminalLine } from '../types/terminal';
import type { Mission } from '../types/missions';
import type { DNSRecord } from '../types/network';
import type { CronJob } from '../types/hosting';

// Re-export the shape the old components expect
interface LegacyContextType {
  state: SimulatorCoreState;
  terminalLines: TerminalLine[];
  missions: Mission[];
  activeMissionId: string | null;
  xp: number;
  nanoFilePath: string | null;
  nanoContent: string;
  updateState: (changes: Partial<SimulatorCoreState>) => void;
  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  setActiveMissionId: (id: string | null) => void;
  completeMission: (id: string) => void;
  runTerminalCommand: (rawCmd: string) => { enteringNano: string | null; output: string };
  openNano: (filePath: string) => void;
  saveAndCloseNano: (content: string) => void;
  closeNanoWithoutSaving: () => void;
  resetServer: () => void;
  addDnsRecord: (rec: Omit<DNSRecord, 'id'>) => void;
  deleteDnsRecord: (id: string) => void;
  updateDnsRecord: (id: string, updated: Partial<DNSRecord>) => void;
  createSubdomain: (subdomain: string) => void;
  createDatabase: (name: string) => void;
  createDatabaseUser: (username: string) => void;
  assignUserToDatabase: (dbId: string, username: string) => void;
  toggleSsl: (domain: string) => void;
  addCronJob: (job: Omit<CronJob, 'id'>) => void;
  deleteCronJob: (id: string) => void;
}

const SimulatorContext = createContext<LegacyContextType | undefined>(undefined);

/** Compatibility provider — wraps children with the legacy context */
export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sim = useSimulatorStore();
  const terminal = useTerminalStore();
  const missions = useMissionStore();
  const { runCommand, saveNano, discardNano } = useTerminal();

  const state: SimulatorCoreState = {
    fs: sim.fs,
    currentDir: sim.currentDir,
    dnsRecords: sim.dnsRecords,
    cpanel: sim.cpanel,
    services: sim.services,
    history: sim.history,
  };

  const value: LegacyContextType = {
    state,
    terminalLines: terminal.lines,
    missions: missions.missions,
    activeMissionId: missions.activeMissionId,
    xp: missions.xp,
    nanoFilePath: terminal.nanoFilePath,
    nanoContent: terminal.nanoContent,

    updateState: (changes) => sim.patchState(changes),
    addTerminalLine: (line) => terminal.addLine(line),
    setActiveMissionId: (id) => missions.setActiveMissionId(id),
    completeMission: (id) => missions.completeMission(id),
    runTerminalCommand: (rawCmd) => {
      const result = runCommand(rawCmd);
      return { enteringNano: result.enteringNano, output: '' };
    },
    openNano: (filePath) => {
      const { getNodeByPath } = require('../engine/filesystem');
      const node = getNodeByPath(sim.fs, filePath);
      terminal.openNano(filePath, node?.type === 'file' ? node.content : '');
    },
    saveAndCloseNano: (content) => saveNano(content),
    closeNanoWithoutSaving: () => discardNano(),
    resetServer: () => {
      sim.resetSimulator();
      missions.resetMissions();
      terminal.setLines([
        { id: crypto.randomUUID(), timestamp: Date.now(), type: 'info', text: 'System restored. HostLab Server Administration CLI reset successfully.' },
        { id: crypto.randomUUID(), timestamp: Date.now(), type: 'info', text: 'Type "help" to list all simulated Linux terminal commands.' },
        { id: crypto.randomUUID(), timestamp: Date.now(), type: 'info', text: '' },
      ]);
    },

    // DNS
    addDnsRecord: sim.addDnsRecord,
    deleteDnsRecord: sim.deleteDnsRecord,
    updateDnsRecord: sim.updateDnsRecord,

    // cPanel
    createSubdomain: sim.createSubdomain,
    createDatabase: sim.createDatabase,
    createDatabaseUser: sim.createDatabaseUser,
    assignUserToDatabase: sim.assignUserToDatabase,
    toggleSsl: sim.toggleSsl,
    addCronJob: sim.addCronJob,
    deleteCronJob: sim.deleteCronJob,
  };

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
};

export const useSimulator = () => {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SimulatorState, 
  DNSRecord, 
  CPanelConfig, 
  ServiceStatus, 
  TerminalLine, 
  Mission, 
  DirNode,
  FileNode
} from '../types';
import { 
  INITIAL_FS, 
  INITIAL_DNS, 
  INITIAL_CPANEL, 
  INITIAL_SERVICES 
} from '../lib/initialState';
import { CORE_MISSIONS, validateMission } from '../lib/missions';
import { executeCommand, getNodeByPath, setNodeInFs } from '../lib/simulatorEngine';

interface SimulatorContextType {
  state: SimulatorState;
  terminalLines: TerminalLine[];
  missions: Mission[];
  activeMissionId: string | null;
  xp: number;
  nanoFilePath: string | null; // Null if nano is closed, otherwise the path
  nanoContent: string;
  updateState: (changes: Partial<SimulatorState>) => void;
  setTerminalLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  addTerminalLine: (line: TerminalLine) => void;
  setActiveMissionId: (id: string | null) => void;
  completeMission: (id: string) => void;
  runTerminalCommand: (rawCmd: string) => { enteringNano: string | null; output: string };
  openNano: (filePath: string) => void;
  saveAndCloseNano: (content: string) => void;
  closeNanoWithoutSaving: () => void;
  resetServer: () => void;
  
  // GUI Helper Mutators
  addDnsRecord: (rec: Omit<DNSRecord, 'id'>) => void;
  deleteDnsRecord: (id: string) => void;
  updateDnsRecord: (id: string, updated: Partial<DNSRecord>) => void;
  createSubdomain: (subdomain: string) => void;
  createDatabase: (name: string) => void;
  createDatabaseUser: (username: string) => void;
  assignUserToDatabase: (dbId: string, username: string) => void;
  toggleSsl: (domain: string) => void;
  addCronJob: (job: { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string; command: string }) => void;
  deleteCronJob: (id: string) => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core State
  const [state, setState] = useState<SimulatorState>({
    fs: INITIAL_FS,
    currentDir: '/home/student',
    dnsRecords: INITIAL_DNS,
    cpanel: INITIAL_CPANEL,
    services: INITIAL_SERVICES,
    history: []
  });

  // 2. Extra Applet States
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: 'info', text: 'Welcome to HostLab Secure Server Administration CLI.' },
    { type: 'info', text: 'Type "help" to list all simulated Linux terminal commands.' },
    { type: 'info', text: 'Host: server01.hostlab.local   IP: 203.0.113.10   User: student' },
    { type: 'info', text: '' }
  ]);
  const [missions, setMissions] = useState<Mission[]>(CORE_MISSIONS);
  const [activeMissionId, setActiveMissionId] = useState<string | null>('mission_1');
  const [xp, setXp] = useState<number>(0);
  
  // 3. Nano State
  const [nanoFilePath, setNanoFilePath] = useState<string | null>(null);
  const [nanoContent, setNanoContent] = useState<string>('');

  // 4. Update core state easily
  const updateState = (changes: Partial<SimulatorState>) => {
    setState(prev => ({
      ...prev,
      ...changes
    }));
  };

  const addTerminalLine = (line: TerminalLine) => {
    setTerminalLines(prev => [...prev, line]);
  };

  // 5. Reactive Mission Objectives and Completion Tracker!
  useEffect(() => {
    setMissions(prevMissions => {
      return prevMissions.map(m => {
        if (m.completed) return m;

        // Run validation against current simulator state
        const { completed, objectiveStatus } = validateMission(m.id, state);

        // Map objectives
        const updatedObjectives = m.objectives.map(obj => ({
          ...obj,
          completed: objectiveStatus[obj.id] || false
        }));

        // Check if just completed!
        if (completed && !m.completed) {
          // Play a sound or trigger XP reward
          setXp(prevXp => prevXp + m.xpReward);
          // Print completion notice in terminal!
          setTerminalLines(prev => [
            ...prev,
            { type: 'info', text: '' },
            { type: 'success', text: `🌟 MISSION COMPLETED: "${m.title}"! (+${m.xpReward} XP)` },
            { type: 'success', text: `Client Ticket #${m.ticketNumber} is now fully resolved and closed.` },
            { type: 'info', text: '' }
          ]);
          return {
            ...m,
            objectives: updatedObjectives,
            completed: true
          };
        }

        // Return with updated objectives
        return {
          ...m,
          objectives: updatedObjectives
        };
      });
    });
  }, [state]);

  // 6. Complete mission manually (if needed)
  const completeMission = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && !m.completed) {
        setXp(x => x + m.xpReward);
        return { ...m, completed: true };
      }
      return m;
    }));
  };

  // 7. CLI command runner
  const runTerminalCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return { enteringNano: null, output: '' };

    // Record command history
    setState(prev => ({
      ...prev,
      history: [...prev.history, trimmed]
    }));

    // Add to screen log
    addTerminalLine({ type: 'input', text: `student@server01:${state.currentDir}$ ${trimmed}` });

    // Execute via engine
    const response = executeCommand(trimmed, state, (changes) => {
      setState(prev => ({ ...prev, ...changes }));
    });

    if (response.clear) {
      setTerminalLines([]);
      return { enteringNano: null, output: '' };
    }

    if (response.enteringNano) {
      openNano(response.enteringNano);
      return { enteringNano: response.enteringNano, output: response.output };
    }

    if (response.output) {
      addTerminalLine({ 
        type: response.error ? 'error' : 'output', 
        text: response.output 
      });
    }

    return { enteringNano: null, output: response.output };
  };

  // 8. Nano Handlers
  const openNano = (filePath: string) => {
    const node = getNodeByPath(state.fs, filePath);
    if (node && node.type === 'file') {
      setNanoFilePath(filePath);
      setNanoContent(node.content);
    } else {
      // Create new file
      setNanoFilePath(filePath);
      setNanoContent('');
    }
  };

  const saveAndCloseNano = (content: string) => {
    if (!nanoFilePath) return;

    const fileName = nanoFilePath.split('/').pop()!;
    const updatedFile: FileNode = {
      type: 'file',
      name: fileName,
      permissions: '644',
      owner: 'student',
      content: content
    };

    const updatedFs = setNodeInFs(state.fs, nanoFilePath, updatedFile);
    updateState({ fs: updatedFs });
    
    addTerminalLine({ type: 'success', text: `[nano] Saved changes to ${nanoFilePath}` });
    setNanoFilePath(null);
    setNanoContent('');
  };

  const closeNanoWithoutSaving = () => {
    addTerminalLine({ type: 'info', text: `[nano] Closed editor without saving.` });
    setNanoFilePath(null);
    setNanoContent('');
  };

  // 9. Reset Server
  const resetServer = () => {
    setState({
      fs: INITIAL_FS,
      currentDir: '/home/student',
      dnsRecords: INITIAL_DNS,
      cpanel: INITIAL_CPANEL,
      services: INITIAL_SERVICES,
      history: []
    });
    setTerminalLines([
      { type: 'info', text: 'System restored. HostLab Server Administration CLI reset successfully.' },
      { type: 'info', text: 'Type "help" to list all simulated Linux terminal commands.' },
      { type: 'info', text: '' }
    ]);
    setMissions(CORE_MISSIONS.map(m => ({
      ...m,
      completed: false,
      objectives: m.objectives.map(o => ({ ...o, completed: false }))
    })));
    setXp(0);
    setNanoFilePath(null);
  };

  // ==========================================
  // CPANEL / GUI HELPER MUTATORS
  // ==========================================

  const addDnsRecord = (rec: Omit<DNSRecord, 'id'>) => {
    const newId = (state.dnsRecords.length + 1).toString();
    const newRec: DNSRecord = { id: newId, ...rec };
    updateState({
      dnsRecords: [...state.dnsRecords, newRec]
    });
  };

  const deleteDnsRecord = (id: string) => {
    updateState({
      dnsRecords: state.dnsRecords.filter(r => r.id !== id)
    });
  };

  const updateDnsRecord = (id: string, updated: Partial<DNSRecord>) => {
    updateState({
      dnsRecords: state.dnsRecords.map(r => r.id === id ? { ...r, ...updated } : r)
    });
  };

  const createSubdomain = (subdomain: string) => {
    if (state.cpanel.subdomains.includes(subdomain)) return;
    
    const updatedCpanel = {
      ...state.cpanel,
      subdomains: [...state.cpanel.subdomains, subdomain]
    };
    
    // Auto-create a DNS record for it
    const newDnsRec: DNSRecord = {
      id: (state.dnsRecords.length + 1).toString(),
      name: subdomain,
      type: 'A',
      value: '203.0.113.10',
      ttl: 3600
    };

    updateState({
      cpanel: updatedCpanel,
      dnsRecords: [...state.dnsRecords, newDnsRec]
    });
  };

  const createDatabase = (name: string) => {
    if (state.cpanel.databases.some(db => db.name === name)) return;
    
    const newDb = {
      id: (state.cpanel.databases.length + 1).toString(),
      name,
      users: []
    };
    
    updateState({
      cpanel: {
        ...state.cpanel,
        databases: [...state.cpanel.databases, newDb]
      }
    });
  };

  const createDatabaseUser = (username: string) => {
    if (state.cpanel.dbUsers.some(u => u.username === username)) return;
    
    const newUser = {
      id: (state.cpanel.dbUsers.length + 1).toString(),
      username
    };
    
    updateState({
      cpanel: {
        ...state.cpanel,
        dbUsers: [...state.cpanel.dbUsers, newUser]
      }
    });
  };

  const assignUserToDatabase = (dbId: string, username: string) => {
    const updatedDatabases = state.cpanel.databases.map(db => {
      if (db.id === dbId) {
        if (db.users.includes(username)) return db;
        return {
          ...db,
          users: [...db.users, username]
        };
      }
      return db;
    });

    updateState({
      cpanel: {
        ...state.cpanel,
        databases: updatedDatabases
      }
    });
  };

  const toggleSsl = (domain: string) => {
    const isEnabled = state.cpanel.sslCertificates.includes(domain);
    const updatedCertificates = isEnabled
      ? state.cpanel.sslCertificates.filter(d => d !== domain)
      : [...state.cpanel.sslCertificates, domain];
      
    updateState({
      cpanel: {
        ...state.cpanel,
        sslCertificates: updatedCertificates
      }
    });
  };

  const addCronJob = (job: { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string; command: string }) => {
    const newJob = {
      id: (state.cpanel.cronJobs.length + 1).toString(),
      ...job
    };
    updateState({
      cpanel: {
        ...state.cpanel,
        cronJobs: [...state.cpanel.cronJobs, newJob]
      }
    });
  };

  const deleteCronJob = (id: string) => {
    updateState({
      cpanel: {
        ...state.cpanel,
        cronJobs: state.cpanel.cronJobs.filter(j => j.id !== id)
      }
    });
  };

  return (
    <SimulatorContext.Provider value={{
      state,
      terminalLines,
      missions,
      activeMissionId,
      xp,
      nanoFilePath,
      nanoContent,
      updateState,
      setTerminalLines,
      addTerminalLine,
      setActiveMissionId,
      completeMission,
      runTerminalCommand,
      openNano,
      saveAndCloseNano,
      closeNanoWithoutSaving,
      resetServer,
      
      // GUI helpers
      addDnsRecord,
      deleteDnsRecord,
      updateDnsRecord,
      createSubdomain,
      createDatabase,
      createDatabaseUser,
      assignUserToDatabase,
      toggleSsl,
      addCronJob,
      deleteCronJob
    }}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};

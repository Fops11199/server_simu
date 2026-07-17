import { create } from 'zustand';
import type { SimulatorCoreState } from '../types/simulator';
import type { DirNode } from '../types/filesystem';
import type { DNSRecord } from '../types/network';
import type { CPanelConfig } from '../types/hosting';
import type { ServiceStatus } from '../types/services';
import { INITIAL_FS, INITIAL_DNS, INITIAL_CPANEL, INITIAL_SERVICES, INITIAL_SERVER_POWER } from '../lib/initialState';

const INITIAL_STATE: SimulatorCoreState = {
  fs: INITIAL_FS,
  currentDir: '/home/student',
  dnsRecords: INITIAL_DNS,
  cpanel: INITIAL_CPANEL,
  services: INITIAL_SERVICES,
  history: [],
  serverPower: INITIAL_SERVER_POWER,
};

interface SimulatorStore extends SimulatorCoreState {
  // Core updaters
  updateFs: (fs: DirNode) => void;
  updateDns: (records: DNSRecord[]) => void;
  updateServices: (services: ServiceStatus) => void;
  updateCpanel: (cpanel: CPanelConfig) => void;
  setCurrentDir: (dir: string) => void;
  addHistory: (cmd: string) => void;
  patchState: (changes: Partial<SimulatorCoreState>) => void;
  resetSimulator: () => void;
  
  loadState: (state: SimulatorCoreState) => void;
  saveSnapshot: (userId: string, sessionId?: string, label?: string) => Promise<void>;
  toggleServerPower: () => void;

  // DNS convenience actions
  addDnsRecord: (rec: Omit<DNSRecord, 'id'>) => void;
  deleteDnsRecord: (id: string) => void;
  updateDnsRecord: (id: string, updated: Partial<DNSRecord>) => void;

  // cPanel convenience actions
  createSubdomain: (subdomain: string) => void;
  createDatabase: (name: string) => void;
  createDatabaseUser: (username: string) => void;
  assignUserToDatabase: (dbId: string, username: string) => void;
  toggleSsl: (domain: string) => void;
  addCronJob: (job: Omit<import('../types/hosting').CronJob, 'id'>) => void;
  deleteCronJob: (id: string) => void;
}

export const useSimulatorStore = create<SimulatorStore>()(
  (set, get) => ({
    ...INITIAL_STATE,

    updateFs: (fs) => set({ fs }),
    updateDns: (dnsRecords) => set({ dnsRecords }),
    updateServices: (services) => set({ services }),
    updateCpanel: (cpanel) => set({ cpanel }),
    setCurrentDir: (currentDir) => set({ currentDir }),
    addHistory: (cmd) => set(s => ({ history: [...s.history, cmd] })),
    patchState: (changes) => set(s => ({ ...s, ...changes })),

    resetSimulator: () => set({ ...INITIAL_STATE, history: [] }),

    loadState: (state: SimulatorCoreState) => {
      set({ ...state });
    },

    saveSnapshot: async (userId: string, sessionId?: string, label?: string) => {
      const state = get();
      const snapshot: SimulatorCoreState = {
        fs: state.fs,
        currentDir: state.currentDir,
        dnsRecords: state.dnsRecords,
        cpanel: state.cpanel,
        services: state.services,
        history: state.history,
        serverPower: state.serverPower,
      };

      try {
        await fetch('/api/snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, sessionId, snapshot, label }),
        });
      } catch (err) {
        console.error('Failed to save snapshot:', err);
      }
    },

    toggleServerPower: () => {
      set((s) => ({
        serverPower: s.serverPower === 'running' ? 'stopped' : 'running',
      }));
    },

    // DNS actions
    addDnsRecord: (rec) => set(s => ({
      dnsRecords: [...s.dnsRecords, { id: crypto.randomUUID(), ...rec }]
    })),
    deleteDnsRecord: (id) => set(s => ({
      dnsRecords: s.dnsRecords.filter(r => r.id !== id)
    })),
    updateDnsRecord: (id, updated) => set(s => ({
      dnsRecords: s.dnsRecords.map(r => r.id === id ? { ...r, ...updated } : r)
    })),

    // cPanel actions
    createSubdomain: (subdomain) => {
      const s = get();
      if (s.cpanel.subdomains.includes(subdomain)) return;
      set({
        cpanel: { ...s.cpanel, subdomains: [...s.cpanel.subdomains, subdomain] },
        dnsRecords: [...s.dnsRecords, { id: crypto.randomUUID(), name: subdomain, type: 'A', value: '203.0.113.10', ttl: 3600 }]
      });
    },
    createDatabase: (name) => {
      const s = get();
      if (s.cpanel.databases.some(db => db.name === name)) return;
      set({ cpanel: { ...s.cpanel, databases: [...s.cpanel.databases, { id: crypto.randomUUID(), name, users: [] }] } });
    },
    createDatabaseUser: (username) => {
      const s = get();
      if (s.cpanel.dbUsers.some(u => u.username === username)) return;
      set({ cpanel: { ...s.cpanel, dbUsers: [...s.cpanel.dbUsers, { id: crypto.randomUUID(), username }] } });
    },
    assignUserToDatabase: (dbId, username) => {
      const s = get();
      set({
        cpanel: {
          ...s.cpanel,
          databases: s.cpanel.databases.map(db =>
            db.id === dbId && !db.users.includes(username)
              ? { ...db, users: [...db.users, username] }
              : db
          )
        }
      });
    },
    toggleSsl: (domain) => {
      const s = get();
      const isEnabled = s.cpanel.sslCertificates.includes(domain);
      set({
        cpanel: {
          ...s.cpanel,
          sslCertificates: isEnabled
            ? s.cpanel.sslCertificates.filter(d => d !== domain)
            : [...s.cpanel.sslCertificates, domain]
        }
      });
    },
    addCronJob: (job) => {
      const s = get();
      set({ cpanel: { ...s.cpanel, cronJobs: [...s.cpanel.cronJobs, { id: crypto.randomUUID(), ...job }] } });
    },
    deleteCronJob: (id) => {
      const s = get();
      set({ cpanel: { ...s.cpanel, cronJobs: s.cpanel.cronJobs.filter(j => j.id !== id) } });
    },
  })
);

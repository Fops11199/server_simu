import type { DirNode } from './filesystem';
import type { DNSRecord } from './network';
import type { CPanelConfig } from './hosting';
import type { ServiceStatus } from './services';

/** The core serializable state of the simulator — this is what gets persisted */
export interface SimulatorCoreState {
  fs: DirNode;
  currentDir: string;
  dnsRecords: DNSRecord[];
  cpanel: CPanelConfig;
  services: ServiceStatus;
  history: string[];
  serverPower: 'running' | 'stopped';
}

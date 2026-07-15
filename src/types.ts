export interface FileNode {
  type: 'file';
  name: string;
  content: string;
  permissions: string; // e.g. "644"
  owner: string;       // e.g. "student"
}

export interface DirNode {
  type: 'dir';
  name: string;
  children: { [name: string]: FileNode | DirNode };
  permissions: string; // e.g. "755"
  owner: string;       // e.g. "student"
}

export type FSNode = FileNode | DirNode;

export interface DNSRecord {
  id: string;
  name: string;   // e.g. "api.hostlab.local" or "hostlab.local"
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  value: string;  // e.g. "203.0.113.10"
  ttl: number;
}

export interface Database {
  id: string;
  name: string;
  users: string[];
}

export interface DbUser {
  id: string;
  username: string;
}

export interface CronJob {
  id: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  command: string;
}

export interface EmailAccount {
  id: string;
  address: string;
  quota: string;
}

export interface CPanelConfig {
  subdomains: string[];
  databases: Database[];
  dbUsers: DbUser[];
  sslCertificates: string[]; // list of domains with SSL
  cronJobs: CronJob[];
  emails: EmailAccount[];
}

export interface ServiceStatus {
  nginx: 'running' | 'stopped' | 'failed';
  postgresql: 'running' | 'stopped' | 'failed';
  'node-api': 'running' | 'stopped' | 'failed';
}

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
}

export interface MissionObjective {
  id: string;
  text: string;
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'DNS' | 'Nginx' | 'Terminal' | 'Database' | 'SSL';
  ticketNumber: number;
  clientName: string;
  description: string;
  ticketMessage: string;
  objectives: MissionObjective[];
  xpReward: number;
  completed: boolean;
  // A clean serializable description of validation rules or we can evaluate in React
}

export interface SimulatorState {
  fs: DirNode;
  currentDir: string; // e.g. "/home/student"
  dnsRecords: DNSRecord[];
  cpanel: CPanelConfig;
  services: ServiceStatus;
  history: string[]; // raw strings of past commands for history recall
}

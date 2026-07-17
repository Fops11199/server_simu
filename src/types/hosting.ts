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

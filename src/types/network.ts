export interface DNSRecord {
  id: string;
  name: string;   // e.g. "api.hostlab.local" or "hostlab.local"
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  value: string;  // e.g. "203.0.113.10"
  ttl: number;
}

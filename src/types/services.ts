export interface ServiceStatus {
  nginx: 'running' | 'stopped' | 'failed';
  postgresql: 'running' | 'stopped' | 'failed';
  'node-api': 'running' | 'stopped' | 'failed';
}

import type { SimulatorCoreState } from '../../types/simulator';
import type { ServiceStatus } from '../../types/services';
import type { CommandResponse } from '../../types/terminal';
import { getNodeByPath } from '../filesystem';
import { parseNginxConfig } from '../parsers/nginx';

export function handleServices(
  cmd: string,
  args: string[],
  state: SimulatorCoreState,
  onStateUpdate: (changes: Partial<SimulatorCoreState>) => void
): CommandResponse | null {
  switch (cmd) {
    case 'systemctl':
    case 'service': {
      let action = '';
      let serviceName = '';

      if (cmd === 'systemctl') {
        action = args[0] || '';
        serviceName = args[1] || '';
      } else {
        serviceName = args[0] || '';
        action = args[1] || '';
      }

      if (!action || !serviceName) {
        return { output: `Usage: ${cmd} [start|stop|restart|status] [service_name]`, error: true };
      }

      const validServices = ['nginx', 'postgresql', 'node-api'];
      if (!validServices.includes(serviceName)) {
        return { output: `Failed to ${action} ${serviceName}.service: Unit ${serviceName}.service not found.`, error: true };
      }

      const currentStatus = state.services[serviceName as keyof ServiceStatus];

      if (action === 'status') {
        return { output: buildStatusOutput(serviceName, currentStatus, state) };
      }

      // Modification actions
      const updatedServices = { ...state.services };
      let finalStatus: 'running' | 'stopped' | 'failed' = 'running';

      if (action === 'start' || action === 'restart') {
        if (serviceName === 'nginx') {
          const nginxConfigNode = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
          const configBlocks = nginxConfigNode?.type === 'file'
            ? parseNginxConfig(nginxConfigNode.content)
            : [];
          finalStatus = configBlocks.some(b => b.hasSyntaxError) ? 'failed' : 'running';
        } else {
          finalStatus = 'running';
        }
      } else if (action === 'stop') {
        finalStatus = 'stopped';
      } else {
        return { output: `systemctl: invalid action: ${action}`, error: true };
      }

      updatedServices[serviceName as keyof ServiceStatus] = finalStatus;
      onStateUpdate({ services: updatedServices });

      if (finalStatus === 'failed') {
        return {
          output: `Job for ${serviceName}.service failed because the control process exited with error code.\nSee "systemctl status ${serviceName}.service" and "journalctl -xe" for details.`,
          error: true
        };
      }

      return { output: `Service ${serviceName} ${action}ed successfully.` };
    }

    case 'journalctl': {
      if (args.includes('-xe') || args.includes('-e')) {
        return {
          output: `Jul 15 04:10:22 server01 nginx[1420]: nginx: [emerg] invalid number of arguments or missing ";" in /etc/nginx/sites-enabled/default
Jul 15 04:12:10 server01 systemd[1]: Failed to start A high performance web server.
Jul 15 04:15:33 server01 systemd[1]: Stopped PostgreSQL RDBMS.
Jul 15 04:21:44 server01 node[1045]: API listening on port 5000`
        };
      }
      return { output: 'journalctl: Use -xe to see recent system events' };
    }

    default:
      return null;
  }
}

function buildStatusOutput(
  serviceName: string,
  status: 'running' | 'stopped' | 'failed',
  state: SimulatorCoreState
): string {
  const ts = 'Wed 2026-07-15 04:02:12 UTC';

  if (serviceName === 'nginx') {
    const nginxConfigNode = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
    const configBlocks = nginxConfigNode?.type === 'file'
      ? parseNginxConfig(nginxConfigNode.content)
      : [];
    const syntaxErrorBlock = configBlocks.find(b => b.hasSyntaxError);

    if (syntaxErrorBlock) {
      return `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since ${ts}; 5min ago
     Docs: man:nginx(8)
  Process: 1420 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=1/FAILURE)

Jul 15 04:12:10 server01 systemd[1]: Failed to start A high performance web server.
Jul 15 04:12:10 server01 nginx[1420]: ${syntaxErrorBlock.errorMessage}`;
    }

    if (status === 'running') {
      return `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since ${ts}; 33min ago
     Docs: man:nginx(8)
 Main PID: 843 (nginx)
    Tasks: 2 (limit: 9345)
   Memory: 4.8M
   CGroup: /system.slice/nginx.service
           ├─843 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
           └─844 nginx: worker process

Jul 15 04:02:12 server01 systemd[1]: Started A high performance web server.`;
    }
    return `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: inactive (dead) since ${ts}; 2min ago`;
  }

  if (serviceName === 'postgresql') {
    if (status === 'running') {
      return `● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled)
   Active: active (running) since ${ts}; 15min ago
 Main PID: 923 (postgres)
    Tasks: 6 (limit: 9345)
   CGroup: /system.slice/postgresql.service
           └─923 /usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main

Jul 15 04:20:00 server01 systemd[1]: Started PostgreSQL RDBMS.`;
    }
    return `● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled)
   Active: inactive (dead) since ${ts}; 19min ago`;
  }

  if (serviceName === 'node-api') {
    if (status === 'running') {
      return `● node-api.service - Node.js Backend API
   Loaded: loaded (/etc/systemd/system/node-api.service; enabled)
   Active: active (running) since ${ts}; 13min ago
 Main PID: 1045 (node)
    Tasks: 11
   CGroup: /system.slice/node-api.service
           └─1045 node /home/student/api/app.js

Jul 15 04:21:44 server01 node[1045]: API listening on port 5000`;
    }
    return `● node-api.service - Node.js Backend API
   Loaded: loaded (/etc/systemd/system/node-api.service; enabled)
   Active: inactive (dead)`;
  }

  return '';
}

import type { SimulatorCoreState } from '../../types/simulator';
import type { CommandResponse } from '../../types/terminal';

const HELP_TEXT = `Available Commands:
  Navigation:   pwd, ls [-la], cd [path]
  Files:        touch, mkdir, rm [-rf], cat, cp, mv, chmod
  Editor:       nano, vi, vim [file]
  Network:      dig, nslookup, curl, wget, ping, ufw [status|enable|disable|allow|deny]
  Services:     systemctl [start|stop|restart|status] [service]
                service [service] [start|stop|restart|status]
                journalctl [-xe]
  Text:         echo, grep [pattern] [file], head, tail
  System:       ps, top, uname, uptime, whoami, df, free
  History:      history
  Clear:        clear`;

export function handleMisc(
  cmd: string,
  args: string[],
  state: SimulatorCoreState
): CommandResponse | null {
  switch (cmd) {
    case 'help':
      return { output: HELP_TEXT };

    case 'whoami':
      return { output: 'student' };

    case 'uname': {
      const all = args.includes('-a');
      if (all) {
        return { output: 'Linux server01 6.8.0-49-generic #49-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux' };
      }
      return { output: 'Linux' };
    }

    case 'uptime':
      return { output: ' 04:35:20 up 33 min,  1 user,  load average: 0.14, 0.08, 0.06' };

    case 'echo': {
      const text = args.join(' ').replace(/^['"]|['"]$/g, '');
      return { output: text };
    }

    case 'history': {
      if (state.history.length === 0) return { output: '' };
      const lines = state.history.map((cmd, i) => `  ${(i + 1).toString().padStart(3)}  ${cmd}`);
      return { output: lines.join('\n') };
    }

    case 'ps': {
      const hasAux = args.includes('aux') || args.includes('-aux');
      return {
        output: hasAux
          ? `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 168704 10232 ?        Ss   04:02   0:01 /sbin/init
root         843  0.0  0.1  58136  8420 ?        Ss   04:02   0:00 nginx: master process
www-data     844  0.0  0.1  58852  7840 ?        S    04:02   0:00 nginx: worker process
postgres     923  0.0  0.8 218904 65536 ?        Ss   04:20   0:00 postgres: 16/main
student     1045  0.1  0.9 632104 74856 ?        Sl   04:21   0:01 node /home/student/api/app.js
student     1211  0.0  0.0  16712  3840 pts/0    Ss   04:35   0:00 -bash
student     1234  0.0  0.0  17652  2756 pts/0    R+   04:35   0:00 ps aux`
          : `    PID TTY          TIME CMD
   1211 pts/0    00:00:00 bash
   1234 pts/0    00:00:00 ps`
      };
    }

    case 'top': {
      return {
        output: `top - 04:35:20 up 33 min,  1 user,  load average: 0.14, 0.08, 0.06
Tasks:  87 total,   1 running,  86 sleeping,   0 stopped,   0 zombie
%Cpu(s): 14.0 us,  2.3 sy,  0.0 ni, 82.7 id,  0.7 wa,  0.0 hi,  0.3 si,  0.0 st
MiB Mem :   7845.2 total,   3301.4 free,   3295.5 used,   1248.3 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   4137.4 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1045 student   20   0  632104  74856  18432 S  14.3   0.9   0:01.23 node
  843 root      20   0   58136   8420   6912 S   0.0   0.1   0:00.02 nginx
  923 postgres  20   0  218904  65536  52224 S   0.0   0.8   0:00.11 postgres`
      };
    }

    case 'df': {
      return {
        output: `Filesystem      Size  Used Avail Use% Mounted on
udev            3.8G     0  3.8G   0% /dev
tmpfs           785M  1.1M  784M   1% /run
/dev/sda1        49G  6.3G   40G  14% /
tmpfs           3.9G     0  3.9G   0% /dev/shm`
      };
    }

    case 'free': {
      return {
        output: `               total        used        free      shared  buff/cache   available
Mem:         8033484     3374352     3381140       11236     1278992     4333400
Swap:        2097148           0     2097148`
      };
    }

    case 'ufw': {
      const action = args[0]?.toLowerCase();
      if (!action) {
        return {
          output: `Usage: ufw status|enable|disable|allow|deny [port]`,
          error: true
        };
      }

      const getUfwState = () => {
        const raw = localStorage.getItem('hostlab_ufw_rules');
        if (raw) {
          try { return JSON.parse(raw); } catch (e) {}
        }
        return { enabled: false, rules: [] };
      };

      const saveUfwState = (s: any) => {
        localStorage.setItem('hostlab_ufw_rules', JSON.stringify(s));
      };

      const ufwState = getUfwState();

      if (action === 'status') {
        const verbose = args[1]?.toLowerCase() === 'verbose';
        if (!ufwState.enabled) {
          return { output: 'Status: inactive' };
        }
        let out = 'Status: active\n';
        if (verbose) {
          out += 'Logging: on (low)\nDefault: deny (incoming), allow (outgoing), disabled (routed)\n';
        }
        out += '\nTo                         Action      From\n';
        out += '--                         ------      ----\n';
        if (ufwState.rules.length === 0) {
          out += '(No rules configured)';
        } else {
          out += ufwState.rules.map((r: any) => {
            const toStr = `${r.port}/tcp`.padEnd(27);
            const actStr = r.action.toUpperCase().padEnd(12);
            return `${toStr}${actStr}Anywhere`;
          }).join('\n');
        }
        return { output: out };
      }

      if (action === 'enable') {
        ufwState.enabled = true;
        saveUfwState(ufwState);
        return { output: 'Firewall is active and enabled on system startup' };
      }

      if (action === 'disable') {
        ufwState.enabled = false;
        saveUfwState(ufwState);
        return { output: 'Firewall stopped and disabled on system startup' };
      }

      if (action === 'allow' || action === 'deny') {
        const port = args[1];
        if (!port) return { output: `ufw: port number required`, error: true };
        
        ufwState.rules = ufwState.rules.filter((r: any) => r.port !== port);
        ufwState.rules.push({ port, action });
        saveUfwState(ufwState);
        return { output: `Rule added\nRule added (v6)` };
      }

      return { output: `ufw: unknown action: ${action}`, error: true };
    }

    case 'clear':
      return { output: '', clear: true };

    default:
      return null;
  }
}

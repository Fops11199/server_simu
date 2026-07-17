import type { SimulatorCoreState } from '../../types/simulator';
import type { CommandResponse } from '../../types/terminal';
import { getNodeByPath } from '../filesystem';
import { parseNginxConfig } from '../parsers/nginx';

export function handleNetwork(
  cmd: string,
  args: string[],
  state: SimulatorCoreState
): CommandResponse | null {
  switch (cmd) {
    case 'dig':
    case 'nslookup': {
      const domainArg = args.filter(a => !a.startsWith('@') && !a.startsWith('+'))[0];
      if (!domainArg) return { output: `${cmd}: missing domain query operand`, error: true };

      const queryDomain = domainArg.replace(/^https?:\/\//, '').split('/')[0];
      const records = state.dnsRecords.filter(r => r.name === queryDomain);

      if (cmd === 'dig') {
        if (records.length === 0) {
          return {
            output: `; <<>> DiG 9.18.1-Ubuntu <<>> ${queryDomain}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 41223
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 1

;; Query time: 1.5 msec
;; SERVER: 8.8.8.8#53(8.8.8.8) (UDP)
;; WHEN: Wed Jul 15 04:35:20 UTC 2026
;; MSG SIZE  rcvd: 37`
          };
        }
        const answerSection = records.map(r => `${r.name}.\t\t${r.ttl}\tIN\t${r.type}\t${r.value}`).join('\n');
        return {
          output: `; <<>> DiG 9.18.1-Ubuntu <<>> ${queryDomain}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 32095
;; flags: qr aa rd ra; QUERY: 1, ANSWER: ${records.length}, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;${queryDomain}.\t\t\tIN\tA

;; ANSWER SECTION:
${answerSection}

;; Query time: 0.8 msec
;; SERVER: 203.0.113.10#53(203.0.113.10) (UDP)
;; WHEN: Wed Jul 15 04:35:20 UTC 2026
;; MSG SIZE  rcvd: 75`
        };
      } else {
        // nslookup
        if (records.length === 0) return { output: `** server can't find ${queryDomain}: NXDOMAIN` };
        const answers = records.map(r => `Name:\t${r.name}\nAddress:\t${r.value}`).join('\n\n');
        return { output: `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\n${answers}` };
      }
    }

    case 'curl':
    case 'wget': {
      const urlArg = args.filter(a => !a.startsWith('-'))[0];
      if (!urlArg) return { output: `${cmd}: missing URL operand`, error: true };

      let domain = urlArg.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

      const records = state.dnsRecords.filter(r => r.name === domain);
      if (records.length === 0) {
        return { output: `${cmd}: (6) Could not resolve host: ${domain}`, error: true };
      }

      const aRecord = records.find(r => r.type === 'A' || r.type === 'CNAME');
      if (!aRecord) return { output: `${cmd}: (6) Could not resolve host: ${domain}`, error: true };

      const resolvedIp = aRecord.type === 'CNAME'
        ? state.dnsRecords.find(r => r.name === aRecord.value && r.type === 'A')?.value || 'unknown'
        : aRecord.value;

      if (resolvedIp !== '203.0.113.10') {
        return {
          output: `${cmd}: (7) Failed to connect to ${domain} port 80: Connection timed out (Attempted IP: ${resolvedIp})`,
          error: true
        };
      }

      if (state.services.nginx === 'stopped' || state.services.nginx === 'failed') {
        return { output: `${cmd}: (7) Failed to connect to ${domain} port 80: Connection refused`, error: true };
      }

      const nginxConfigNode = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
      if (!nginxConfigNode || nginxConfigNode.type !== 'file') {
        return { output: `HTTP/1.1 500 Internal Server Error\n\n[Nginx Configuration Not Found]`, error: true };
      }

      const configBlocks = parseNginxConfig(nginxConfigNode.content);
      const activeBlock = configBlocks.find(b => b.serverName.includes(domain));

      if (!activeBlock) {
        return {
          output: `HTTP/1.1 404 Not Found\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<hr><center>nginx/1.24.0</center>\n</body>\n</html>`
        };
      }

      const hasSsl = state.cpanel.sslCertificates.includes(domain);
      const isHttps = urlArg.startsWith('https://');

      if (isHttps && !hasSsl) {
        return { output: `${cmd}: (60) SSL Certificate problem: Certificate has expired or is invalid for ${domain}`, error: true };
      }

      // API domain with proxy_pass
      if (domain === 'api.hostlab.local') {
        const proxyPass = activeBlock.proxies['/'] || '';
        if (proxyPass.includes('8080')) {
          return {
            output: `HTTP/1.1 502 Bad Gateway\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>502 Bad Gateway</title></head>\n<body>\n<center><h1>502 Bad Gateway (Port Mismatch)</h1></center>\n</body>\n</html>`
          };
        }
        if (state.services['node-api'] !== 'running') {
          return {
            output: `HTTP/1.1 502 Bad Gateway\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>502 Bad Gateway</title></head>\n<body>\n<center><h1>502 Bad Gateway (Node API not running)</h1></center>\n</body>\n</html>`
          };
        }
        return {
          output: `HTTP/1.1 200 OK\nServer: nginx/1.24.0\nContent-Type: application/json\n\n{"status":"success","message":"Welcome to HostLab Node API Server!","environment":"Simulation sandbox","db_status":"connected","latency":"1.2ms"}`
        };
      }

      // Static file serving
      const indexPath = activeBlock.root + '/' + activeBlock.index.split(' ')[0];
      const indexNode = getNodeByPath(state.fs, indexPath);

      if (!indexNode || indexNode.type !== 'file') {
        return {
          output: `HTTP/1.1 404 Not Found\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<hr><center>nginx/1.24.0</center>\n</body>\n</html>`
        };
      }

      const proto = hasSsl ? 'https' : 'http';
      return {
        output: `HTTP/1.1 200 OK\nServer: nginx/1.24.0\nContent-Type: text/html\nX-Proto: ${proto}\n\n${indexNode.content}`
      };
    }

    case 'ping': {
      const hostArg = args[0];
      if (!hostArg) return { output: 'ping: missing host operand', error: true };
      const records = state.dnsRecords.filter(r => r.name === hostArg && r.type === 'A');
      if (records.length === 0) return { output: `ping: ${hostArg}: Name or service not known`, error: true };
      return {
        output: `PING ${hostArg} (${records[0].value}) 56(84) bytes of data.
64 bytes from ${records[0].value}: icmp_seq=1 ttl=64 time=0.042 ms
64 bytes from ${records[0].value}: icmp_seq=2 ttl=64 time=0.038 ms
64 bytes from ${records[0].value}: icmp_seq=3 ttl=64 time=0.041 ms
--- ${hostArg} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2041ms`
      };
    }

    default:
      return null;
  }
}

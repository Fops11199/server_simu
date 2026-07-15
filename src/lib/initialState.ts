import { DirNode, DNSRecord, CPanelConfig, ServiceStatus } from '../types';

export const INITIAL_FS: DirNode = {
  type: 'dir',
  name: '/',
  permissions: '755',
  owner: 'root',
  children: {
    bin: {
      type: 'dir',
      name: 'bin',
      permissions: '755',
      owner: 'root',
      children: {}
    },
    boot: {
      type: 'dir',
      name: 'boot',
      permissions: '755',
      owner: 'root',
      children: {}
    },
    dev: {
      type: 'dir',
      name: 'dev',
      permissions: '755',
      owner: 'root',
      children: {}
    },
    etc: {
      type: 'dir',
      name: 'etc',
      permissions: '755',
      owner: 'root',
      children: {
        nginx: {
          type: 'dir',
          name: 'nginx',
          permissions: '755',
          owner: 'root',
          children: {
            'sites-available': {
              type: 'dir',
              name: 'sites-available',
              permissions: '755',
              owner: 'root',
              children: {
                default: {
                  type: 'file',
                  name: 'default',
                  permissions: '644',
                  owner: 'root',
                  content: `server {
    listen 80;
    server_name hostlab.local www.hostlab.local;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    server_name api.hostlab.local;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`
                }
              }
            },
            'sites-enabled': {
              type: 'dir',
              name: 'sites-enabled',
              permissions: '755',
              owner: 'root',
              children: {
                default: {
                  type: 'file',
                  name: 'default',
                  permissions: '644',
                  owner: 'root',
                  content: `server {
    listen 80;
    server_name hostlab.local www.hostlab.local;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    server_name api.hostlab.local;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`
                }
              }
            }
          }
        },
        hosts: {
          type: 'file',
          name: 'hosts',
          permissions: '644',
          owner: 'root',
          content: `127.0.0.1   localhost
203.0.113.10 server01.hostlab.local hostlab.local api.hostlab.local`
        },
        'resolv.conf': {
          type: 'file',
          name: 'resolv.conf',
          permissions: '644',
          owner: 'root',
          content: `nameserver 8.8.8.8
nameserver 1.1.1.1`
        }
      }
    },
    home: {
      type: 'dir',
      name: 'home',
      permissions: '755',
      owner: 'root',
      children: {
        student: {
          type: 'dir',
          name: 'student',
          permissions: '755',
          owner: 'student',
          children: {
            'readme.txt': {
              type: 'file',
              name: 'readme.txt',
              permissions: '644',
              owner: 'student',
              content: `=====================================================
Welcome to HostLab (Virtual Server v1.0.4)
=====================================================

This is your secure home directory. Use standard Linux
terminal commands to explore the server, modify web files,
restart services, and complete your administrator training.

Key server stats:
IP: 203.0.113.10
OS: Ubuntu 24.04 LTS
Main Domain: hostlab.local

Useful CLI tools:
- cd, ls, pwd, mkdir, touch, cat, rm, cp, mv, nano, chmod
- dig, curl, nslookup
- systemctl (start, stop, restart, status)

Happy Hosting!`
            },
            'index.html': {
              type: 'file',
              name: 'index.html',
              permissions: '644',
              owner: 'student',
              content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HostLab Landing Page</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: radial-gradient(circle at center, #0f172a, #020617);
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 1rem;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        h1 {
            color: #38bdf8;
            margin: 0 0 1rem;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>HostLab Virtual Host</h1>
        <p>Your server01 index file is serving correctly. Congratulations!</p>
    </div>
</body>
</html>`
            },
            api: {
              type: 'dir',
              name: 'api',
              permissions: '755',
              owner: 'student',
              children: {
                'app.js': {
                  type: 'file',
                  name: 'app.js',
                  permissions: '644',
                  owner: 'student',
                  content: `const express = require('express');
const app = express();
const port = 5000;

app.get('/api/v1', (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to HostLab Node API Server!",
    environment: "Simulation sandbox",
    db_status: "connected",
    latency: "1.2ms"
  });
});

app.listen(port, () => {
  console.log(\`API listening on port \${port}\`);
});`
                }
              }
            }
          }
        }
      }
    },
    var: {
      type: 'dir',
      name: 'var',
      permissions: '755',
      owner: 'root',
      children: {
        www: {
          type: 'dir',
          name: 'www',
          permissions: '755',
          owner: 'root',
          children: {
            html: {
              type: 'dir',
              name: 'html',
              permissions: '755',
              owner: 'www-data',
              children: {} // EMPTY INITIAL - 404 Error on Landing Page!
            }
          }
        },
        log: {
          type: 'dir',
          name: 'log',
          permissions: '755',
          owner: 'root',
          children: {
            nginx: {
              type: 'dir',
              name: 'nginx',
              permissions: '755',
              owner: 'root',
              children: {
                'access.log': {
                  type: 'file',
                  name: 'access.log',
                  permissions: '644',
                  owner: 'root',
                  content: `203.0.113.125 - - [15/Jul/2026:04:10:22] "GET / HTTP/1.1" 404 153 "-" "Mozilla/5.0"
203.0.113.125 - - [15/Jul/2026:04:12:05] "GET /favicon.ico HTTP/1.1" 404 153 "-" "Mozilla/5.0"`
                },
                'error.log': {
                  type: 'file',
                  name: 'error.log',
                  permissions: '644',
                  owner: 'root',
                  content: `2026/07/15 04:10:22 [error] 1432#1432: *1 directory index of "/var/www/html/" is empty or index.html not found, client: 203.0.113.125, server: hostlab.local`
                }
              }
            },
            postgresql: {
              type: 'dir',
              name: 'postgresql',
              permissions: '755',
              owner: 'root',
              children: {
                'postgresql.log': {
                  type: 'file',
                  name: 'postgresql.log',
                  permissions: '644',
                  owner: 'root',
                  content: `2026-07-15 04:00:10 UTC LOG: database system is ready to accept connections
2026-07-15 04:15:33 UTC FATAL: service stopped by systemctl request`
                }
              }
            }
          }
        }
      }
    },
    tmp: {
      type: 'dir',
      name: 'tmp',
      permissions: '777',
      owner: 'root',
      children: {}
    }
  }
};

export const INITIAL_DNS: DNSRecord[] = [
  { id: '1', name: 'hostlab.local', type: 'A', value: '203.0.113.10', ttl: 3600 },
  { id: '2', name: 'www.hostlab.local', type: 'CNAME', value: 'hostlab.local', ttl: 3600 },
  { id: '3', name: 'mail.hostlab.local', type: 'A', value: '203.0.113.10', ttl: 3600 },
  { id: '4', name: 'hostlab.local', type: 'MX', value: '10 mail.hostlab.local', ttl: 3600 },
  { id: '5', name: 'api.hostlab.local', type: 'A', value: '192.168.1.50', ttl: 3600 } // MISCONFIGURED DNS FOR MISSION 2 (should point to 203.0.113.10)
];

export const INITIAL_CPANEL: CPanelConfig = {
  subdomains: ['api.hostlab.local', 'mail.hostlab.local'],
  databases: [],
  dbUsers: [],
  sslCertificates: [], // Initially empty (no SSL!)
  cronJobs: [],
  emails: [
    { id: '1', address: 'admin@hostlab.local', quota: '500 MB' }
  ]
};

export const INITIAL_SERVICES: ServiceStatus = {
  nginx: 'running',
  postgresql: 'stopped', // STOPS FOR POSTGRESQL MISSION
  'node-api': 'stopped'   // STOPS FOR NODE API MISSION
};

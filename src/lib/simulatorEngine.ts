import { DirNode, FileNode, FSNode, SimulatorState, DNSRecord, ServiceStatus } from '../types';

// ==========================================
// PATH RESOLUTION & NAVIGATION HELPERS
// ==========================================

export function cleanPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const stack: string[] = [];
  
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  
  return '/' + stack.join('/');
}

export function resolvePath(currentDir: string, targetPath: string): string {
  if (targetPath.startsWith('/')) {
    return cleanPath(targetPath);
  }
  
  return cleanPath(currentDir + '/' + targetPath);
}

export function getNodeByPath(fs: DirNode, pathStr: string): FSNode | null {
  const resolved = cleanPath(pathStr);
  if (resolved === '/') return fs;
  
  const parts = resolved.split('/').filter(Boolean);
  let current: FSNode = fs;
  
  for (const part of parts) {
    if (current.type !== 'dir') return null;
    const next = current.children[part];
    if (!next) return null;
    current = next;
  }
  
  return current;
}

export function getParentNodeAndName(fs: DirNode, pathStr: string): { parent: DirNode; name: string } | null {
  const resolved = cleanPath(pathStr);
  if (resolved === '/') return null;
  
  const parts = resolved.split('/').filter(Boolean);
  const name = parts.pop()!;
  
  const parentPath = '/' + parts.join('/');
  const parentNode = getNodeByPath(fs, parentPath);
  
  if (!parentNode || parentNode.type !== 'dir') return null;
  
  return { parent: parentNode, name };
}

// ==========================================
// IMMUTABLE FILESYSTEM MUTATION HELPERS
// ==========================================

export function cloneFs(node: FSNode): FSNode {
  if (node.type === 'file') {
    return { ...node };
  }
  
  const childrenClone: { [name: string]: FSNode } = {};
  for (const [key, val] of Object.entries(node.children)) {
    childrenClone[key] = cloneFs(val);
  }
  
  return {
    ...node,
    children: childrenClone
  };
}

export function setNodeInFs(fs: DirNode, pathStr: string, newNode: FSNode): DirNode {
  const resolved = cleanPath(pathStr);
  const rootClone = cloneFs(fs) as DirNode;
  
  if (resolved === '/') {
    return newNode as DirNode;
  }
  
  const parts = resolved.split('/').filter(Boolean);
  let current: DirNode = rootClone;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current.children[part] || current.children[part].type !== 'dir') {
      // Auto-create intermediate directory
      current.children[part] = {
        type: 'dir',
        name: part,
        permissions: '755',
        owner: 'student',
        children: {}
      };
    }
    current = current.children[part] as DirNode;
  }
  
  const lastPart = parts[parts.length - 1];
  current.children[lastPart] = newNode;
  
  return rootClone;
}

export function deleteNodeInFs(fs: DirNode, pathStr: string): DirNode {
  const resolved = cleanPath(pathStr);
  if (resolved === '/') return fs; // Cannot delete root
  
  const rootClone = cloneFs(fs) as DirNode;
  const parts = resolved.split('/').filter(Boolean);
  let current: DirNode = rootClone;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current.children[part] || current.children[part].type !== 'dir') {
      return fs; // Path not found, return original
    }
    current = current.children[part] as DirNode;
  }
  
  const lastPart = parts[parts.length - 1];
  delete current.children[lastPart];
  
  return rootClone;
}

// ==========================================
// CONFIGURATION PARSERS
// ==========================================

export interface NginxServerBlock {
  serverName: string[];
  root: string;
  index: string;
  proxies: { [path: string]: string };
  raw: string;
  hasSyntaxError: boolean;
  errorMessage?: string;
}

export function parseNginxConfig(configContent: string): NginxServerBlock[] {
  const blocks: NginxServerBlock[] = [];
  
  // Basic check for brackets syntax errors
  let braceCount = 0;
  for (let i = 0; i < configContent.length; i++) {
    if (configContent[i] === '{') braceCount++;
    if (configContent[i] === '}') braceCount--;
  }
  
  if (braceCount !== 0) {
    return [{
      serverName: [],
      root: '',
      index: '',
      proxies: {},
      raw: configContent,
      hasSyntaxError: true,
      errorMessage: `nginx: [emerg] unexpected end of file, expecting "}" in /etc/nginx/sites-enabled/default`
    }];
  }

  // Semi-colon check (basic validation)
  const lines = configContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.endsWith('{') && !l.endsWith('}'));
  for (const line of lines) {
    if (!line.endsWith(';')) {
      return [{
        serverName: [],
        root: '',
        index: '',
        proxies: {},
        raw: configContent,
        hasSyntaxError: true,
        errorMessage: `nginx: [emerg] invalid number of arguments or missing ";" in line: "${line}"`
      }];
    }
  }

  // Split configurations by "server {" blocks
  const serverRegex = /server\s*\{([\s\S]*?)\}/g;
  let match;
  
  while ((match = serverRegex.exec(configContent)) !== null) {
    const body = match[1];
    
    // Server names
    const serverNameMatch = /server_name\s+([^;]+);/.exec(body);
    const serverNames = serverNameMatch 
      ? serverNameMatch[1].trim().split(/\s+/)
      : [];
      
    // Root
    const rootMatch = /root\s+([^;]+);/.exec(body);
    const root = rootMatch ? rootMatch[1].trim() : '/var/www/html';
    
    // Index
    const indexMatch = /index\s+([^;]+);/.exec(body);
    const index = indexMatch ? indexMatch[1].trim() : 'index.html';
    
    // Proxies
    const proxies: { [path: string]: string } = {};
    const locationRegex = /location\s+([^{]+)\{[\s\S]*?proxy_pass\s+([^;]+);[\s\S]*?\}/g;
    let locMatch;
    while ((locMatch = locationRegex.exec(body)) !== null) {
      const pathLoc = locMatch[1].trim();
      const proxyUrl = locMatch[2].trim();
      proxies[pathLoc] = proxyUrl;
    }
    
    blocks.push({
      serverName: serverNames,
      root,
      index,
      proxies,
      raw: configContent,
      hasSyntaxError: false
    });
  }
  
  if (blocks.length === 0) {
    // If we have text but no parsed blocks, return a basic configuration
    return [{
      serverName: ['hostlab.local'],
      root: '/var/www/html',
      index: 'index.html',
      proxies: {},
      raw: configContent,
      hasSyntaxError: false
    }];
  }
  
  return blocks;
}

// ==========================================
// TERMINAL COMMAND PARSER
// ==========================================

export interface CommandResponse {
  output: string;
  error?: boolean;
  clear?: boolean;
  enteringNano?: string; // filepath if entering nano
  stateChanges?: Partial<SimulatorState>;
}

export function executeCommand(
  rawCommand: string,
  state: SimulatorState,
  onStateUpdate: (changes: Partial<SimulatorState>) => void
): CommandResponse {
  const parts = rawCommand.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  
  if (!cmd) return { output: '' };
  
  switch (cmd) {
    case 'clear':
      return { output: '', clear: true };
      
    case 'pwd':
      return { output: state.currentDir };
      
    case 'ls': {
      const showAll = args.includes('-la') || args.includes('-a') || args.includes('-l');
      const longFormat = args.includes('-la') || args.includes('-l');
      
      // Filter out flags to find target path argument
      const pathArg = args.filter(a => !a.startsWith('-'))[0] || '.';
      const targetPath = resolvePath(state.currentDir, pathArg);
      const targetNode = getNodeByPath(state.fs, targetPath);
      
      if (!targetNode) {
        return { output: `ls: cannot access '${pathArg}': No such file or directory`, error: true };
      }
      
      if (targetNode.type === 'file') {
        if (longFormat) {
          return { output: `-rwxr-xr-x 1 ${targetNode.owner} student ${targetNode.content.length} Jul 15 04:35 ${targetNode.name}` };
        }
        return { output: targetNode.name };
      }
      
      const lines: string[] = [];
      const children = targetNode.children;
      
      if (showAll) {
        if (longFormat) {
          lines.push(`drwxr-xr-x 2 ${targetNode.owner} student 4096 Jul 15 04:35 .`);
          lines.push(`drwxr-xr-x 2 ${targetNode.owner === 'root' ? 'root' : 'root'} student 4096 Jul 15 04:35 ..`);
        } else {
          lines.push('.');
          lines.push('..');
        }
      }
      
      const sortedKeys = Object.keys(children).sort();
      for (const name of sortedKeys) {
        if (name.startsWith('.') && !showAll) continue;
        const child = children[name];
        
        if (longFormat) {
          const typeChar = child.type === 'dir' ? 'd' : '-';
          const perms = child.permissions === '755' ? 'rwxr-xr-x' : child.permissions === '644' ? 'rw-r--r--' : 'rwxrwxrwx';
          const owner = child.owner;
          const size = child.type === 'file' ? child.content.length : 4096;
          lines.push(`${typeChar}${perms} 1 ${owner} student ${size} Jul 15 04:35 ${name}`);
        } else {
          lines.push(name);
        }
      }
      
      return { 
        output: longFormat ? lines.join('\n') : lines.join('    ') 
      };
    }
    
    case 'cd': {
      const pathArg = args[0] || '/home/student';
      const targetPath = resolvePath(state.currentDir, pathArg);
      const targetNode = getNodeByPath(state.fs, targetPath);
      
      if (!targetNode) {
        return { output: `cd: no such file or directory: ${pathArg}`, error: true };
      }
      
      if (targetNode.type !== 'dir') {
        return { output: `cd: not a directory: ${pathArg}`, error: true };
      }
      
      onStateUpdate({ currentDir: targetPath });
      return { output: '', stateChanges: { currentDir: targetPath } };
    }
    
    case 'mkdir': {
      const pathArg = args[0];
      if (!pathArg) return { output: 'mkdir: missing operand', error: true };
      
      const targetPath = resolvePath(state.currentDir, pathArg);
      const existing = getNodeByPath(state.fs, targetPath);
      if (existing) return { output: `mkdir: cannot create directory '${pathArg}': File exists`, error: true };
      
      const name = targetPath.split('/').pop()!;
      const newDir: DirNode = {
        type: 'dir',
        name,
        permissions: '755',
        owner: 'student',
        children: {}
      };
      
      const updatedFs = setNodeInFs(state.fs, targetPath, newDir);
      onStateUpdate({ fs: updatedFs });
      return { output: '', stateChanges: { fs: updatedFs } };
    }
    
    case 'touch': {
      const pathArg = args[0];
      if (!pathArg) return { output: 'touch: missing file operand', error: true };
      
      const targetPath = resolvePath(state.currentDir, pathArg);
      const existing = getNodeByPath(state.fs, targetPath);
      if (existing) return { output: '' }; // file already exists, do nothing (simulate mtime update)
      
      const name = targetPath.split('/').pop()!;
      const newFile: FileNode = {
        type: 'file',
        name,
        permissions: '644',
        owner: 'student',
        content: ''
      };
      
      const updatedFs = setNodeInFs(state.fs, targetPath, newFile);
      onStateUpdate({ fs: updatedFs });
      return { output: '', stateChanges: { fs: updatedFs } };
    }
    
    case 'rm': {
      const isRecursive = args.includes('-rf') || args.includes('-r') || args.includes('-f');
      const pathArg = args.filter(a => !a.startsWith('-'))[0];
      
      if (!pathArg) return { output: 'rm: missing operand', error: true };
      
      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);
      
      if (!node) {
        if (isRecursive) return { output: '' }; // silent fail for -rf
        return { output: `rm: cannot remove '${pathArg}': No such file or directory`, error: true };
      }
      
      if (node.type === 'dir' && !isRecursive) {
        return { output: `rm: cannot remove '${pathArg}': Is a directory (use -r)`, error: true };
      }
      
      const updatedFs = deleteNodeInFs(state.fs, targetPath);
      onStateUpdate({ fs: updatedFs });
      return { output: '', stateChanges: { fs: updatedFs } };
    }
    
    case 'cat': {
      const pathArg = args[0];
      if (!pathArg) return { output: 'cat: missing file operand', error: true };
      
      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);
      
      if (!node) return { output: `cat: ${pathArg}: No such file or directory`, error: true };
      if (node.type === 'dir') return { output: `cat: ${pathArg}: Is a directory`, error: true };
      
      return { output: node.content };
    }
    
    case 'nano':
    case 'vi':
    case 'vim': {
      const pathArg = args[0];
      if (!pathArg) return { output: `${cmd}: missing file operand`, error: true };
      
      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);
      
      if (node && node.type === 'dir') {
        return { output: `${cmd}: cannot edit '${pathArg}': Is a directory`, error: true };
      }
      
      // Let the terminal trigger the Nano editor overlay
      return { output: `Opening ${targetPath} in Editor...`, enteringNano: targetPath };
    }
    
    case 'cp': {
      if (args.length < 2) return { output: 'cp: missing destination file operand after source', error: true };
      
      const srcArg = args[0];
      const destArg = args[1];
      
      const srcPath = resolvePath(state.currentDir, srcArg);
      const destPath = resolvePath(state.currentDir, destArg);
      
      const srcNode = getNodeByPath(state.fs, srcPath);
      if (!srcNode) return { output: `cp: cannot stat '${srcArg}': No such file or directory`, error: true };
      if (srcNode.type === 'dir') return { output: `cp: omitting directory '${srcArg}'`, error: true };
      
      let finalDestPath = destPath;
      const destNode = getNodeByPath(state.fs, destPath);
      if (destNode && destNode.type === 'dir') {
        // copy INTO directory
        finalDestPath = cleanPath(destPath + '/' + srcNode.name);
      }
      
      const copiedNode: FileNode = {
        type: 'file',
        name: finalDestPath.split('/').pop()!,
        permissions: srcNode.permissions,
        owner: 'student',
        content: srcNode.content
      };
      
      const updatedFs = setNodeInFs(state.fs, finalDestPath, copiedNode);
      onStateUpdate({ fs: updatedFs });
      return { output: '', stateChanges: { fs: updatedFs } };
    }
    
    case 'mv': {
      if (args.length < 2) return { output: 'mv: missing destination file operand after source', error: true };
      
      const srcArg = args[0];
      const destArg = args[1];
      
      const srcPath = resolvePath(state.currentDir, srcArg);
      const destPath = resolvePath(state.currentDir, destArg);
      
      const srcNode = getNodeByPath(state.fs, srcPath);
      if (!srcNode) return { output: `mv: cannot stat '${srcArg}': No such file or directory`, error: true };
      
      let finalDestPath = destPath;
      const destNode = getNodeByPath(state.fs, destPath);
      if (destNode && destNode.type === 'dir') {
        finalDestPath = cleanPath(destPath + '/' + srcNode.name);
      }
      
      const clonedNode = cloneFs(srcNode);
      clonedNode.name = finalDestPath.split('/').pop()!;
      
      let updatedFs = setNodeInFs(state.fs, finalDestPath, clonedNode);
      updatedFs = deleteNodeInFs(updatedFs, srcPath);
      
      onStateUpdate({ fs: updatedFs });
      return { output: '', stateChanges: { fs: updatedFs } };
    }
    
    case 'chmod': {
      if (args.length < 2) return { output: 'chmod: missing operand', error: true };
      const perms = args[0];
      const pathArg = args[1];
      
      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);
      
      if (!node) return { output: `chmod: cannot access '${pathArg}': No such file or directory`, error: true };
      
      const updatedNode = { ...node, permissions: perms.includes('x') || perms === '755' ? '755' : '644' };
      const updatedFs = setNodeInFs(state.fs, targetPath, updatedNode);
      onStateUpdate({ fs: updatedFs });
      
      return { output: '', stateChanges: { fs: updatedFs } };
    }
    
    case 'systemctl':
    case 'service': {
      let action = '';
      let serviceName = '';
      
      if (cmd === 'systemctl') {
        action = args[0] || '';
        serviceName = args[1] || '';
      } else {
        // service nginx restart
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
        let output = '';
        if (serviceName === 'nginx') {
          // Check Nginx syntax
          const nginxConfigNode = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
          const configBlocks = nginxConfigNode && nginxConfigNode.type === 'file' 
            ? parseNginxConfig(nginxConfigNode.content)
            : [];
          const syntaxErrorBlock = configBlocks.find(b => b.hasSyntaxError);
          
          if (syntaxErrorBlock) {
            output = `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since Wed 2026-07-15 04:12:10 UTC; 5min ago
     Docs: man:nginx(8)
  Process: 1420 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=1/FAILURE)
  
Jul 15 04:12:10 server01 systemd[1]: Failed to start A high performance web server.
Jul 15 04:12:10 server01 nginx[1420]: ${syntaxErrorBlock.errorMessage}`;
          } else if (currentStatus === 'running') {
            output = `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Wed 2026-07-15 04:02:12 UTC; 33min ago
     Docs: man:nginx(8)
 Main PID: 843 (nginx)
    Tasks: 2 (limit: 9345)
   Memory: 4.8M
   CGroup: /system.slice/nginx.service
           ├─843 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
           └─844 nginx: worker process
           
Jul 15 04:02:12 server01 systemd[1]: Started A high performance web server.`;
          } else {
            output = `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: inactive (dead) since Wed 2026-07-15 04:15:22 UTC; 2min ago`;
          }
        } else if (serviceName === 'postgresql') {
          if (currentStatus === 'running') {
            output = `● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled)
   Active: active (running) since Wed 2026-07-15 04:20:00 UTC; 15min ago
 Main PID: 923 (postgres)
    Tasks: 6 (limit: 9345)
   CGroup: /system.slice/postgresql.service
           ├─923 /usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main
           
Jul 15 04:20:00 server01 systemd[1]: Started PostgreSQL RDBMS.`;
          } else {
            output = `● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled)
   Active: inactive (dead) since Wed 2026-07-15 04:15:33 UTC; 19min ago`;
          }
        } else if (serviceName === 'node-api') {
          if (currentStatus === 'running') {
            output = `● node-api.service - Node.js Backend API
   Loaded: loaded (/etc/systemd/system/node-api.service; enabled)
   Active: active (running) since Wed 2026-07-15 04:21:44 UTC; 13min ago
 Main PID: 1045 (node)
    Tasks: 11
   CGroup: /system.slice/node-api.service
           └─1045 node /home/student/api/app.js
           
Jul 15 04:21:44 server01 node[1045]: API listening on port 5000`;
          } else {
            output = `● node-api.service - Node.js Backend API
   Loaded: loaded (/etc/systemd/system/node-api.service; enabled)
   Active: inactive (dead)`;
          }
        }
        return { output };
      }
      
      // Handle modification actions (start, stop, restart)
      const updatedServices = { ...state.services };
      let finalStatus: 'running' | 'stopped' | 'failed' = 'running';
      
      if (action === 'start' || action === 'restart') {
        if (serviceName === 'nginx') {
          // Verify Nginx config first
          const nginxConfigNode = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
          const configBlocks = nginxConfigNode && nginxConfigNode.type === 'file' 
            ? parseNginxConfig(nginxConfigNode.content)
            : [];
          const syntaxErrorBlock = configBlocks.find(b => b.hasSyntaxError);
          
          if (syntaxErrorBlock) {
            finalStatus = 'failed';
          } else {
            finalStatus = 'running';
          }
        } else {
          finalStatus = 'running';
        }
      } else if (action === 'stop') {
        finalStatus = 'stopped';
      }
      
      updatedServices[serviceName as keyof ServiceStatus] = finalStatus;
      onStateUpdate({ services: updatedServices });
      
      if (finalStatus === 'failed') {
        return { 
          output: `Job for ${serviceName}.service failed because the control process exited with error code.\nSee "systemctl status ${serviceName}.service" and "journalctl -xe" for details.`, 
          error: true,
          stateChanges: { services: updatedServices } 
        };
      }
      
      return { 
        output: `Service ${serviceName} ${action}ed successfully.`, 
        stateChanges: { services: updatedServices } 
      };
    }
    
    case 'journalctl': {
      if (args.includes('-xe')) {
        // Return latest events including Nginx and Postgres
        return {
          output: `Jul 15 04:10:22 server01 nginx[1420]: nginx: [emerg] invalid number of arguments or missing ";" in /etc/nginx/sites-enabled/default
Jul 15 04:12:10 server01 systemd[1]: Failed to start A high performance web server.
Jul 15 04:15:33 server01 systemd[1]: Stopped PostgreSQL RDBMS.
Jul 15 04:21:44 server01 node[1045]: API listening on port 5000`
        };
      }
      return { output: 'journalctl: Use -xe to see recent system events' };
    }
    
    case 'dig':
    case 'nslookup': {
      const domainArg = args[0];
      if (!domainArg) return { output: `${cmd}: missing domain query operand`, error: true };
      
      // Strip http or sub-domains
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

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
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
        if (records.length === 0) {
          return { output: `** server can't find ${queryDomain}: NXDOMAIN` };
        }
        
        const answers = records.map(r => `Name:\t${r.name}\nAddress:\t${r.value}`).join('\n\n');
        return {
          output: `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\n${answers}`
        };
      }
    }
    
    case 'curl':
    case 'wget': {
      const urlArg = args[0];
      if (!urlArg) return { output: `${cmd}: missing URL operand`, error: true };
      
      // Parse domain
      let domain = urlArg.replace(/^https?:\/\//, '').split('/')[0];
      domain = domain.split(':')[0]; // remove port
      
      // 1. Resolve domain
      const records = state.dnsRecords.filter(r => r.name === domain);
      if (records.length === 0) {
        return { output: `${cmd}: (6) Could not resolve host: ${domain}`, error: true };
      }
      
      const aRecord = records.find(r => r.type === 'A' || r.type === 'CNAME');
      if (!aRecord) {
        return { output: `${cmd}: (6) Could not resolve host: ${domain}`, error: true };
      }
      
      const resolvedIp = aRecord.type === 'CNAME' 
        ? state.dnsRecords.find(r => r.name === aRecord.value && r.type === 'A')?.value || 'unknown'
        : aRecord.value;
        
      if (resolvedIp !== '203.0.113.10') {
        return { 
          output: `${cmd}: (7) Failed to connect to ${domain} port 80: Connection timed out (Attempted IP: ${resolvedIp})`, 
          error: true 
        };
      }
      
      // 2. Check Nginx server status
      if (state.services.nginx === 'stopped' || state.services.nginx === 'failed') {
        return { output: `${cmd}: (7) Failed to connect to ${domain} port 80: Connection refused`, error: true };
      }
      
      // 3. Parse Nginx server block to get root or proxy config
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
      
      // Check if domain is listed under SSL
      const hasSsl = state.cpanel.sslCertificates.includes(domain);
      const isHttps = urlArg.startsWith('https://');
      
      if (isHttps && !hasSsl) {
        return { output: `${cmd}: (60) SSL Certificate problem: Certificate has expired or is invalid for ${domain}`, error: true };
      }
      
      // Handle static file serving or proxy_pass
      if (domain === 'api.hostlab.local') {
        const proxyPass = activeBlock.proxies['/'] || '';
        
        if (proxyPass.includes('8080')) {
          // Port mismatch (Node runs on 5000, Nginx looks on 8080)
          return { 
            output: `HTTP/1.1 522 Bad Gateway\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>502 Bad Gateway</title></head>\n<body>\n<center><h1>502 Bad Gateway (Port Mismatch)</h1></center>\n</body>\n</html>` 
          };
        }
        
        if (proxyPass.includes('5000')) {
          if (state.services['node-api'] === 'running') {
            // Read actual file content to output
            const apiCodeNode = getNodeByPath(state.fs, '/home/student/api/app.js');
            return {
              output: `HTTP/1.1 200 OK\nServer: nginx/1.24.0\nContent-Type: application/json\nConnection: keep-alive\n\n{\n  "status": "success",\n  "message": "Welcome to HostLab Node API Server!",\n  "environment": "Simulation sandbox",\n  "db_status": "${state.services.postgresql === 'running' ? 'connected' : 'connection_refused'}",\n  "latency": "1.2ms"\n}`
            };
          } else {
            return { 
              output: `HTTP/1.1 502 Bad Gateway\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>502 Bad Gateway</title></head>\n<body>\n<center><h1>502 Bad Gateway (node-api.service down)</h1></center>\n</body>\n</html>` 
            };
          }
        }
        
        return { output: `HTTP/1.1 502 Bad Gateway\nServer: nginx/1.24.0\n\n[Nginx reverse proxy pointing to unconfigured destination]` };
      } else {
        // static file server (hostlab.local / www.hostlab.local)
        const htmlPath = cleanPath(activeBlock.root + '/index.html');
        const indexNode = getNodeByPath(state.fs, htmlPath);
        
        if (!indexNode || indexNode.type !== 'file') {
          return { 
            output: `HTTP/1.1 404 Not Found\nServer: nginx/1.24.0\nContent-Type: text/html\n\n<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<p>No index.html found at Nginx root: ${activeBlock.root}</p>\n<hr><center>nginx/1.24.0</center>\n</body>\n</html>` 
          };
        }
        
        const protoHeader = isHttps ? 'HTTPS/1.1 200 OK' : 'HTTP/1.1 200 OK';
        return {
          output: `${protoHeader}\nServer: nginx/1.24.0\nContent-Type: text/html\nContent-Length: ${indexNode.content.length}\nConnection: keep-alive\n\n${indexNode.content}`
        };
      }
    }
    
    case 'git': {
      const sub = args[0];
      if (!sub) return { output: 'usage: git [init|status|add|commit|log]' };
      
      switch (sub) {
        case 'init':
          return { output: 'Initialized empty Git repository in /home/student/.git/' };
        case 'status':
          return { output: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean' };
        case 'log':
          return { output: 'commit e4c01d9f8c12a02b3c200 (HEAD -> main, origin/main)\nAuthor: student <admin@hostlab.local>\nDate:   Wed Jul 15 04:00:00 2026 -0700\n\n    Initial server landing page files added' };
        case 'add':
        case 'commit':
          return { output: `git ${sub}: execution mock completed successfully.` };
        default:
          return { output: `git command "${sub}" is simulated.` };
      }
    }
    
    case 'docker': {
      const sub = args[0];
      if (sub === 'ps') {
        return {
          output: `CONTAINER ID   IMAGE                 COMMAND                  CREATED         STATUS         PORTS                     NAMES
81ab924cfb90   postgres:16-alpine    "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:5432->5432/tcp    hostlab-db-1
40bfd019ab12   redis:7-alpine        "docker-entrypoint.s…"   2 hours ago     Up 2 hours     6379/tcp                  hostlab-cache-1`
        };
      }
      return { output: 'docker command simulated. Use "docker ps" to inspect running containers.' };
    }
    
    case 'python':
    case 'python3': {
      if (args.includes('--version') || args.includes('-V')) {
        return { output: 'Python 3.13.0' };
      }
      return { output: `Python interactive shell mock. Ran script successfully.` };
    }
    
    case 'node': {
      if (args.includes('--version') || args.includes('-v')) {
        return { output: 'v22.2.0' };
      }
      return { output: `Node.js interpreter mock. Script executed successfully.` };
    }
    
    case 'npm': {
      return { output: `npm v10.8.1\nUsage: npm [install|run|test]` };
    }
    
    case 'help': {
      return {
        output: `HostLab Linux Terminal - Simulated Shell commands:
        
File System:
  ls           List files and directories (-l, -la flags supported)
  cd <dir>     Change directory
  pwd          Print working directory
  mkdir <dir>  Create directory
  touch <file> Create file
  rm <path>    Delete file or folder (-rf, -r flags supported)
  cat <file>   Print file content
  nano <file>  Edit file content inside terminal!
  cp <s.><d.>  Copy file
  mv <s.><d.>  Move/rename file or folder
  chmod <p><f> Change permissions (e.g. 755, 644)

Network & Server Management:
  systemctl    Manage services (status, start, stop, restart for: nginx, postgresql, node-api)
  journalctl   View system log events (-xe flag supported)
  dig <dom>    Domain Information Groper (DNS lookup query)
  nslookup     Query internet name servers
  curl <url>   Transfer data from or to a server (e.g. http://hostlab.local)
  wget <url>   Retrieve files via HTTP/HTTPS

Other Tools:
  git, docker, node, python, clear, help`
      };
    }
    
    default:
      return { output: `bash: ${cmd}: command not found. Type "help" to see available commands.`, error: true };
  }
}

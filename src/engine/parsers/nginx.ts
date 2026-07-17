// ==========================================
// NGINX CONFIG PARSER
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

  // Brace balance check
  let braceCount = 0;
  for (const ch of configContent) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
  }
  if (braceCount !== 0) {
    return [{
      serverName: [], root: '', index: '', proxies: {}, raw: configContent,
      hasSyntaxError: true,
      errorMessage: `nginx: [emerg] unexpected end of file, expecting "}" in /etc/nginx/sites-enabled/default`
    }];
  }

  // Semicolon check
  const lines = configContent.split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.endsWith('{') && !l.endsWith('}'));
  for (const line of lines) {
    if (!line.endsWith(';')) {
      return [{
        serverName: [], root: '', index: '', proxies: {}, raw: configContent,
        hasSyntaxError: true,
        errorMessage: `nginx: [emerg] invalid number of arguments or missing ";" in line: "${line}"`
      }];
    }
  }

  // Parse server{} blocks
  const serverRegex = /server\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = serverRegex.exec(configContent)) !== null) {
    const body = match[1];

    const serverNameMatch = /server_name\s+([^;]+);/.exec(body);
    const serverNames = serverNameMatch ? serverNameMatch[1].trim().split(/\s+/) : [];

    const rootMatch = /root\s+([^;]+);/.exec(body);
    const root = rootMatch ? rootMatch[1].trim() : '/var/www/html';

    const indexMatch = /index\s+([^;]+);/.exec(body);
    const index = indexMatch ? indexMatch[1].trim() : 'index.html';

    const proxies: { [path: string]: string } = {};
    const locationRegex = /location\s+([^{]+)\{[\s\S]*?proxy_pass\s+([^;]+);[\s\S]*?\}/g;
    let locMatch;
    while ((locMatch = locationRegex.exec(body)) !== null) {
      proxies[locMatch[1].trim()] = locMatch[2].trim();
    }

    blocks.push({ serverName: serverNames, root, index, proxies, raw: configContent, hasSyntaxError: false });
  }

  if (blocks.length === 0) {
    return [{
      serverName: ['hostlab.local'], root: '/var/www/html', index: 'index.html',
      proxies: {}, raw: configContent, hasSyntaxError: false
    }];
  }

  return blocks;
}

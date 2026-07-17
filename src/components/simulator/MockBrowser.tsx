import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, ArrowRight, Lock, Unlock, Globe } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { getFileContent, getNodeByPath } from '../../engine/filesystem';
import { parseNginxConfig } from '../../engine/parsers/nginx';
import { DnsError, ConnectionRefusedError, NginxError } from './BrowserErrors';

type RenderResult = 
  | { type: 'html', content: string }
  | { type: 'json', content: string }
  | { type: 'external', content: string }
  | { type: 'error', component: React.ReactNode }
  | { type: 'empty' };

export function MockBrowser() {
  const [urlInput, setUrlInput] = useState('http://hostlab.local');
  const [activeUrl, setActiveUrl] = useState('http://hostlab.local');
  const [renderResult, setRenderResult] = useState<RenderResult>({ type: 'empty' });
  const [isSecure, setIsSecure] = useState(false);

  const simStore = useSimulatorStore();

  const loadUrl = (urlToLoad: string) => {
    setActiveUrl(urlToLoad);
    
    let domain = '';
    let path = '';
    let protocol = 'http:';

    try {
      const validUrlString = urlToLoad.startsWith('http') ? urlToLoad : `http://${urlToLoad}`;
      const urlObj = new URL(validUrlString);
      domain = urlObj.hostname;
      path = urlObj.pathname;
      protocol = urlObj.protocol;
    } catch (e) {
      setRenderResult({ type: 'error', component: <DnsError domain={urlToLoad} /> });
      return;
    }

    // 1. DNS Resolution Check
    const dnsRecord = simStore.dnsRecords.find(r => r.name === domain);
    const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
    
    let resolvesToServer = isLocalhost;
    if (dnsRecord) {
      if (dnsRecord.value === '203.0.113.10') resolvesToServer = true;
      else if (dnsRecord.type === 'CNAME') {
        const target = simStore.dnsRecords.find(r => r.name === dnsRecord.value);
        if (target && target.value === '203.0.113.10') resolvesToServer = true;
      }
    }

    if (!resolvesToServer) {
      // If it doesn't resolve to our simulated server, treat it as a real-world external website
      const externalUrl = urlToLoad.startsWith('http') ? urlToLoad : `https://${urlToLoad}`;
      setIsSecure(externalUrl.startsWith('https:'));
      setRenderResult({ type: 'external', content: externalUrl });
      return;
    }

    // 2. SSL Check
    const hasSsl = simStore.cpanel.sslCertificates.includes(domain);
    if (protocol === 'https:' && !hasSsl) {
      setRenderResult({ type: 'error', component: <ConnectionRefusedError domain={domain} /> });
      setIsSecure(false);
      return;
    }
    setIsSecure(protocol === 'https:');

    // 3. Web Server Check (Nginx)
    if (simStore.services['nginx'] !== 'running') {
      setRenderResult({ type: 'error', component: <ConnectionRefusedError domain={domain} /> });
      return;
    }

    // 4. Dynamic Nginx Routing Resolution
    let rootDir = '/var/www/html';
    let isApiProxy = false;

    const sitesEnabledNode = getNodeByPath(simStore.fs, '/etc/nginx/sites-enabled');
    if (sitesEnabledNode && sitesEnabledNode.type === 'dir') {
      let matchedBlock = null;
      for (const fileName of Object.keys(sitesEnabledNode.children)) {
        const fileNode = sitesEnabledNode.children[fileName];
        if (fileNode.type === 'file') {
          const blocks = parseNginxConfig(fileNode.content);
          for (const block of blocks) {
            if (!block.hasSyntaxError) {
              if (block.serverName.includes(domain) || block.serverName.includes('_')) {
                 matchedBlock = block;
                 break;
              }
            }
          }
        }
        if (matchedBlock) break;
      }
      
      if (matchedBlock) {
        if (matchedBlock.root) rootDir = matchedBlock.root;
        if (matchedBlock.proxies['/']) isApiProxy = true;
      }
    }

    // 5. API Subdomain Check (Node Service)
    if (domain === 'api.hostlab.local' || isApiProxy) {
      if (simStore.services['node-api'] !== 'running') {
        setRenderResult({ type: 'error', component: <NginxError code={502} message="502 Bad Gateway" /> });
        return;
      }
      
      setRenderResult({ 
        type: 'json', 
        content: JSON.stringify({
          status: "success",
          message: "Welcome to HostLab Node API Server!",
          environment: "Simulation sandbox",
          db_status: simStore.services['postgresql'] === 'running' ? "connected" : "disconnected",
          latency: "1.2ms"
        }, null, 2)
      });
      return;
    }

    // 6. Filesystem Resolution
    const targetPath = path === '/' ? '/index.html' : path;
    const fullFsPath = `${rootDir}${targetPath}`;

    const fileNode = getNodeByPath(simStore.fs, fullFsPath);

    if (!fileNode) {
      setRenderResult({ type: 'error', component: <NginxError code={404} message="Not Found" /> });
      return;
    }

    if (fileNode.type === 'dir') {
       // Nginx directory index behavior (simplified)
       setRenderResult({ type: 'error', component: <NginxError code={403} message="Forbidden" /> });
       return;
    }

    // Simple permission check (must be readable by others, i.e., end in 4)
    if (!fileNode.permissions.endsWith('4') && !fileNode.permissions.endsWith('5') && !fileNode.permissions.endsWith('6') && !fileNode.permissions.endsWith('7')) {
      setRenderResult({ type: 'error', component: <NginxError code={403} message="Forbidden" /> });
      return;
    }

    // Render HTML content
    setRenderResult({ type: 'html', content: fileNode.content });
  };

  // Initial load
  useEffect(() => {
    loadUrl(activeUrl);
    // We intentionally don't auto-reload when fs changes, to force the user to hit refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUrl(urlInput);
  };

  const handleRefresh = () => {
    loadUrl(activeUrl);
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f3f4] text-black overflow-hidden font-sans border-t border-[var(--steel-line)]">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex gap-2 text-gray-500">
          <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-not-allowed opacity-50"><ArrowLeft className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-not-allowed opacity-50"><ArrowRight className="w-4 h-4" /></button>
          <button onClick={handleRefresh} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><RefreshCw className="w-4 h-4" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex">
          <div className="flex-1 flex items-center bg-[#f1f3f4] rounded-full px-4 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:shadow-sm transition-all group">
            {isSecure ? (
              <Lock className="w-3.5 h-3.5 text-green-700 mr-2 shrink-0" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            )}
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-gray-800"
              spellCheck={false}
            />
          </div>
        </form>
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 relative bg-white">
        {renderResult.type === 'error' && renderResult.component}
        
        {renderResult.type === 'json' && (
          <div className="p-4 bg-gray-50 h-full overflow-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {renderResult.content}
            </pre>
          </div>
        )}

        {renderResult.type === 'html' && (
          <iframe
            title="Browser Window"
            srcDoc={renderResult.content}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts"
          />
        )}

        {renderResult.type === 'external' && (
          <div className="w-full h-full relative">
            <iframe
              title="Browser Window"
              src={renderResult.content}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {/* Real browser frame banner warning */}
            <div className="absolute bottom-3 right-3 bg-black/85 text-white/90 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 shadow-lg pointer-events-none select-none">
              🔒 Real Browser Window (External Frame)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Server, Plus, Play, Square, RefreshCw, Terminal as TermIcon, Network, Globe, 
  Database, Shield, Cpu, ExternalLink, HelpCircle, HardDrive, Key, ArrowRight,
  ShieldCheck, AlertTriangle, Monitor, LogOut, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Droplet {
  id: string;
  name: string;
  ip: string;
  status: 'active' | 'creating' | 'stopped';
  image: string;
  region: string;
  size: string;
  cpu: number;
  ram: number;
  disk: number;
  cost: number;
}

export const DigitalOceanTab: React.FC = () => {
  const { state, updateState, addTerminalLine } = useSimulator();
  const [activeTab, setActiveTab] = useState<'droplets' | 'create' | 'console'>('droplets');
  const [droplets, setDroplets] = useState<Droplet[]>(() => {
    const saved = localStorage.getItem('do_droplets_tracker');
    return saved ? JSON.parse(saved) : [
      {
        id: 'drop_1',
        name: 'ubuntu-s-1vcpu-1gb-nyc1',
        ip: '159.203.88.42',
        status: 'active',
        image: 'Ubuntu 24.04 LTS',
        region: 'New York (NYC1)',
        size: 'Basic ($6.00/mo)',
        cpu: 1,
        ram: 1,
        disk: 25,
        cost: 6
      }
    ];
  });

  // Sync droplets to localStorage
  useEffect(() => {
    localStorage.setItem('do_droplets_tracker', JSON.stringify(droplets));
  }, [droplets]);

  // Create Droplet Wizard State
  const [selectedImage, setSelectedImage] = useState<string>('Ubuntu 24.04 LTS');
  const [selectedApp, setSelectedApp] = useState<string>('Clean Distribution');
  const [selectedSize, setSelectedSize] = useState<string>('Basic CPU ($6/mo - 1GB RAM / 1 vCPU)');
  const [selectedRegion, setSelectedRegion] = useState<string>('Frankfurt (FRA1)');
  const [dropletName, setDropletName] = useState<string>('ubuntu-droplet-fra1');
  const [authMethod, setAuthMethod] = useState<'password' | 'ssh'>('password');
  const [dropletPassword, setDropletPassword] = useState<string>('DO_securePassword_2026');
  
  // Provisioning Animation state
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [provisionProgress, setProvisionProgress] = useState<number>(0);
  const [provisionStep, setProvisionStep] = useState<string>('');

  // Interactive Droplet Console (SSH emulator)
  const [activeConsoleDroplet, setActiveConsoleDroplet] = useState<Droplet | null>(null);
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleLines, setConsoleLines] = useState<string[]>([]);

  // Distributions & Marketplace options
  const distros = [
    { name: 'Ubuntu 24.04 LTS', desc: 'Canonical LTS image' },
    { name: 'Debian 12', desc: 'Debian Bookworm distribution' },
    { name: 'Rocky Linux 9.4', desc: 'Red Hat Enterprise alternative' }
  ];

  const apps = [
    { name: 'Clean Distribution', desc: 'No preloaded stacks' },
    { name: 'Docker on Ubuntu', desc: 'Includes Compose & CLI Daemon' },
    { name: 'NodeJS API Stack', desc: 'Pre-bundled with Node, npm, PM2' },
    { name: 'LAMP (Linux Apache MySQL PHP)', desc: 'Full traditional hosting' }
  ];

  const plans = [
    { id: 'basic', label: 'Basic CPU ($6/mo - 1GB RAM / 1 vCPU)', cost: 6, ram: 1, cpu: 1, disk: 25 },
    { id: 'premium', label: 'Premium Intel ($12/mo - 2GB RAM / 2 vCPU)', cost: 12, ram: 2, cpu: 2, disk: 50 },
    { id: 'general', label: 'General Purpose ($24/mo - 4GB RAM / 2 vCPU)', cost: 24, ram: 4, cpu: 2, disk: 80 }
  ];

  const regions = [
    { id: 'nyc', name: 'New York (NYC1)', flag: '🇺🇸' },
    { id: 'sfo', name: 'San Francisco (SFO3)', flag: '🇺🇸' },
    { id: 'fra', name: 'Frankfurt (FRA1)', flag: '🇩🇪' },
    { id: 'ams', name: 'Amsterdam (AMS3)', flag: '🇳🇱' },
    { id: 'blr', name: 'Bangalore (BLR1)', flag: '🇮🇳' }
  ];

  // Create Droplet Handlers
  const handleCreateDroplet = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setProvisionProgress(0);
    setActiveTab('create');

    const steps = [
      { progress: 15, text: 'Resolving container image mirrors & allocators...' },
      { progress: 40, text: 'Allocating high-speed NVMe block volume sectors...' },
      { progress: 65, text: `Extracting ${selectedImage} core binary template...` },
      { progress: 85, text: `Injecting Cloud-Init seed configuration (${selectedApp})...` },
      { progress: 100, text: 'Routing public IPv4 network addresses. Handshake successful!' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProvisionProgress(steps[stepIndex].progress);
        setProvisionStep(steps[stepIndex].text);
        stepIndex++;
      } else {
        clearInterval(interval);
        
        // Finalize droplet details
        const planObj = plans.find(p => selectedSize.includes(p.label.split(' - ')[0])) || plans[0];
        const randomIp = `167.${Math.floor(Math.random() * 100) + 100}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`;
        
        const newDroplet: Droplet = {
          id: `drop_${Date.now()}`,
          name: dropletName.trim() || 'droplet-ubuntu',
          ip: randomIp,
          status: 'active',
          image: selectedImage + (selectedApp !== 'Clean Distribution' ? ` (${selectedApp})` : ''),
          region: selectedRegion,
          size: selectedSize,
          cpu: planObj.cpu,
          ram: planObj.ram,
          disk: planObj.disk,
          cost: planObj.cost
        };

        setDroplets(prev => [...prev, newDroplet]);
        setIsProvisioning(false);
        setActiveTab('droplets');

        // Add DNS A record for droplet automatically!
        updateState({
          dnsRecords: [
            ...state.dnsRecords,
            { id: `dns_do_${Date.now()}`, name: `${newDroplet.name}.hostlab.local`, type: 'A', value: randomIp, ttl: 3600 }
          ]
        });

        addTerminalLine({ type: 'success', text: `[DigitalOcean API] Successfully provisioned Droplet ${newDroplet.name} at IP ${randomIp}` });
        addTerminalLine({ type: 'success', text: `[DigitalOcean API] System images fully written to virtual SSD.` });
      }
    }, 1500);
  };

  const handlePowerDroplet = (id: string, action: 'stop' | 'start' | 'reboot') => {
    setDroplets(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = action === 'stop' ? 'stopped' : 'active';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
    addTerminalLine({ type: 'info', text: `[DigitalOcean API] Droplet power action triggered: ${action.toUpperCase()} on VM Node.` });
  };

  const handleDeleteDroplet = (id: string, name: string) => {
    if (confirm(`DANGER: Are you sure you want to permanently destroy Droplet: ${name}? All root filesystem partitions will be deleted.`)) {
      setDroplets(prev => prev.filter(d => d.id !== id));
      addTerminalLine({ type: 'error', text: `[DigitalOcean API] Destroyed cloud instance ${name}. Reclaiming network resources.` });
    }
  };

  // Droplet SSH Terminal emulator Handlers
  const launchConsole = (droplet: Droplet) => {
    setActiveConsoleDroplet(droplet);
    setActiveTab('console');
    setConsoleLines([
      `Connecting to ssh root@${droplet.ip}...`,
      `The authenticity of host '${droplet.ip}' can't be established.`,
      `ECDSA key fingerprint is SHA256:7B8x9o2K...`,
      `Warning: Permanently added '${droplet.ip}' to the list of known hosts.`,
      `root@${droplet.ip}'s password: `,
      `Welcome to Ubuntu Linux kernel (out-of-band console access).`,
      `System load: 0.12  Disk usage: 8.4% of ${droplet.disk}GB  IP: ${droplet.ip}`,
      `Type 'help' to view simulated interactive console operations.`,
      `Type 'exit' to disconnect secure shell connection.`,
      ''
    ]);
  };

  const handleConsoleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = consoleInput.trim();
    if (!cmd) return;

    const hostname = activeConsoleDroplet ? activeConsoleDroplet.name : 'droplet';
    setConsoleLines(prev => [...prev, `root@${hostname}:~# ${consoleInput}`]);
    setConsoleInput('');

    // Command matching
    const args = cmd.split(' ');
    const primaryCmd = args[0];

    if (primaryCmd === 'exit') {
      setActiveConsoleDroplet(null);
      setActiveTab('droplets');
    } else if (primaryCmd === 'help') {
      setConsoleLines(prev => [
        ...prev,
        'DigitalOcean Droplet Interactive Practice Shell:',
        '  - neofetch        : Display system specs & ASCII Linux logo',
        '  - docker ps       : View running docker engine container instances',
        '  - docker run nginx: Provision isolated nginx reverse proxy image',
        '  - npm install     : Simulates NPM dependencies resolver runtime',
        '  - ip addr show    : Inspect localized virtual interfaces & IPs',
        '  - pm2 list        : View PM2 Node.js process manager table',
        '  - shutdown -h now : Stop and turn off droplet instance',
        '  - clear           : Flush output stream logs',
        '  - exit            : Terminate SSH terminal session'
      ]);
    } else if (primaryCmd === 'clear') {
      setConsoleLines([`Active SSH Terminal Session. Type 'help' for available commands.`, '']);
    } else if (primaryCmd === 'neofetch') {
      setConsoleLines(prev => [
        ...prev,
        '       _..---.._     root@' + hostname,
        '     .\'  ..   ..  \'.  -----------------',
        '    /   / _\\ / _\\   \\ OS: Ubuntu 24.04 LTS x86_64',
        '   |   |   / \\   |   | Host: DigitalOcean Droplet Node VM',
        '   |   |   \\_/   |   | Kernel: Linux 6.8.1-do-generic',
        '    \\   \\       /   /  Uptime: 5 mins',
        '     \'.  \'_   _\'  .\'   RAM: 320 MB / ' + (activeConsoleDroplet?.ram || 1) + ' GB',
        '       `""---""`       Disk: 1.4 GB / ' + (activeConsoleDroplet?.disk || 25) + ' GB',
        ''
      ]);
    } else if (primaryCmd === 'docker' && args[1] === 'ps') {
      if (consoleLines.some(l => l.includes('nginx-container-running'))) {
        setConsoleLines(prev => [
          ...prev,
          'CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                NAMES',
          'a410b42c1102   nginx     "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp   nginx-container-running',
          ''
        ]);
      } else {
        setConsoleLines(prev => [...prev, 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS     NAMES', '']);
      }
    } else if (primaryCmd === 'docker' && args[1] === 'run' && args[2] === 'nginx') {
      localStorage.setItem('do_docker_nginx_run_completed', 'true');
      setConsoleLines(prev => [
        ...prev,
        'Unable to find image \'nginx:latest\' locally',
        'latest: Pulling from library/nginx',
        '5a14d51b: Pull complete',
        '8cb81a2e: Pull complete',
        'Digest: sha256:d826c0ac8... (Verified)',
        'Status: Downloaded newer image for nginx:latest',
        'Container mapping: binding port 80 -> container port 80...',
        'Success! nginx-container-running is now online.',
        ''
      ]);
    } else if (primaryCmd === 'npm' && args[1] === 'install') {
      setConsoleLines(prev => [
        ...prev,
        'npm WARN deprecated source-map-url@0.4.1: Retiring support...',
        'added 412 packages from 182 contributors in 2.145s',
        'audited 413 packages in 2.5s',
        'found 0 vulnerabilities! Node.js environment fully optimized.',
        ''
      ]);
    } else if (primaryCmd === 'pm2' && args[1] === 'list') {
      setConsoleLines(prev => [
        ...prev,
        '┌────┬─────────────────┬──────────┬──────┬──────────┬──────────┬──────────┐',
        '│ id │ name            │ mode     │ status│ cpu      │ memory   │ uptime   │',
        '├────┼─────────────────┼──────────┼──────┼──────────┼──────────┼──────────┤',
        '│ 0  │ main-node-api   │ fork     │ online│ 0.2%     │ 24.5mb   │ 4m       │',
        '└────┴─────────────────┴──────────┴──────┴──────────┴──────────┴──────────┘',
        ''
      ]);
    } else if (primaryCmd === 'ip' && args[1] === 'addr') {
      setConsoleLines(prev => [
        ...prev,
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN',
        '    inet 127.0.0.1/8 scope host lo',
        `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP`,
        `    inet ${activeConsoleDroplet?.ip}/20 brd 159.203.255.255 scope global eth0`,
        '    inet6 fe80::f816:3eff:fe01:99a2/64 scope link',
        ''
      ]);
    } else if (cmd === 'shutdown -h now') {
      setConsoleLines(prev => [...prev, 'Shutdown initiated. Connection closed by foreign host.']);
      if (activeConsoleDroplet) {
        handlePowerDroplet(activeConsoleDroplet.id, 'stop');
      }
      setTimeout(() => {
        setActiveConsoleDroplet(null);
        setActiveTab('droplets');
      }, 1500);
    } else {
      setConsoleLines(prev => [...prev, `-bash: ${cmd}: command not found. Type 'help' to check sandbox commands.`]);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full text-slate-800 bg-[#f3f4f6] p-4 rounded-xl border border-slate-200 select-none">
      
      {/* ================= DIGITALOCEAN HEADER HUB ================= */}
      <div className="bg-[#0080FF] rounded-xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#0080FF] flex items-center justify-center font-black text-xl shadow-inner">
            D
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider uppercase leading-none">digitalocean</h2>
            <p className="text-[10px] text-blue-100 font-mono mt-1">Cloud Console • Interactive VM Engine</p>
          </div>
        </div>

        {/* Tab Links inside DigitalOcean */}
        <div className="flex items-center gap-1.5 bg-blue-700/40 p-1 rounded-lg">
          <button 
            onClick={() => { if (!isProvisioning) setActiveTab('droplets'); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'droplets' ? 'bg-white text-[#0080FF] shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Droplets ({droplets.length})
          </button>
          <button 
            onClick={() => { if (!isProvisioning) setActiveTab('create'); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'create' ? 'bg-white text-[#0080FF] shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            + Create Droplet
          </button>
        </div>
      </div>

      {/* ================= DIGITALOCEAN VIEWPORT WORKSPACE ================= */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col min-h-[450px] shadow-sm relative">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">
            {activeTab === 'droplets' && 'Virtual Private Servers Directory'}
            {activeTab === 'create' && 'Cloud-Init Infrastructure Provisioner'}
            {activeTab === 'console' && 'Secure Out-of-Band SSH Session'}
          </span>
          <span className="text-[10px] bg-blue-50 text-[#0080FF] border border-blue-100 px-2.5 py-1 rounded-full font-bold">
            Virtual Private Clouds
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              
              {/* ================= DROPLETS DIRECTORY ================= */}
              {activeTab === 'droplets' && (
                <div className="space-y-5">
                  {droplets.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <Server className="w-10 h-10 text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700 text-xs">No active cloud nodes</h4>
                        <p className="text-[11px] text-slate-400">Launch your first virtual droplet machine using the creator wizard!</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('create')}
                        className="bg-[#0080FF] hover:bg-[#006fd4] text-white font-bold py-1.5 px-3.5 rounded-lg text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      >
                        Create Droplet
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {droplets.map(drop => (
                        <div key={drop.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-350 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center font-bold text-white text-[9px]">D</span>
                              <strong className="text-slate-850 font-bold text-sm block leading-none">{drop.name}</strong>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                drop.status === 'active' ? 'bg-green-100 text-green-700 border border-green-150' : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                {drop.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs text-slate-500">
                              <div>IP: <strong className="font-mono text-[#0080FF]">{drop.ip}</strong></div>
                              <div>Region: <strong className="font-sans text-slate-700">{drop.region}</strong></div>
                              <div>Specs: <strong className="font-sans text-slate-700">{drop.cpu}vCPU / {drop.ram}GB RAM</strong></div>
                              <div>Disk: <strong className="font-sans text-slate-700">{drop.disk}GB SSD</strong></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                            {drop.status === 'active' ? (
                              <>
                                <button
                                  onClick={() => launchConsole(drop)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <TermIcon className="w-3.5 h-3.5" /> Access SSH Console
                                </button>
                                <button
                                  onClick={() => handlePowerDroplet(drop.id, 'stop')}
                                  className="bg-red-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                                >
                                  Power Off
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handlePowerDroplet(drop.id, 'start')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                              >
                                Power On
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteDroplet(drop.id, drop.name)}
                              className="text-slate-400 hover:text-rose-500 p-2 rounded transition-colors cursor-pointer"
                              title="Destroy Droplet"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Informative DevOps Card */}
                  <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-xl text-slate-750 text-xs leading-relaxed space-y-1.5">
                    <h4 className="font-bold text-blue-900 uppercase tracking-wide">Developer VPS vs. Shared Hosting Philosophy:</h4>
                    <p className="text-[11px]">
                      DigitalOcean provides "unmanaged virtual servers" called Droplets. Unlike Hostinger shared hosting which comes with a visual file manager and preloaded software wrappers, DigitalOcean simply provisions a raw OS container (such as Ubuntu).
                      <br /><br />
                      <strong>To make websites work</strong>, you must SSH into the server as <code className="font-mono bg-blue-100 text-blue-800 px-1 rounded font-bold">root</code> and write system files, configure port routers, and set up Docker configs yourself. This offers maximum control but requires command-line skills.
                    </p>
                  </div>
                </div>
              )}

              {/* ================= CREATE DROPLET FORM ================= */}
              {activeTab === 'create' && (
                <div className="space-y-6">
                  {isProvisioning ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-5">
                      <RefreshCw className="w-10 h-10 text-[#0080FF] animate-spin" />
                      <div className="text-center space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 font-mono">PROVISIONING DIGITALOCEAN CLOUD DROPLET</h4>
                        <p className="text-[11px] text-slate-500">{provisionStep}</p>
                      </div>

                      <div className="w-full max-w-sm space-y-1.5">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${provisionProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between font-mono text-[9px] text-slate-400">
                          <span>cloud-init configs...</span>
                          <span className="font-bold text-[#0080FF]">{provisionProgress}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateDroplet} className="space-y-6 text-xs">
                      
                      {/* Step 1: Distribution */}
                      <div className="space-y-2.5">
                        <label className="block font-black text-slate-700 uppercase tracking-wide">1. Choose an Operating System</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {distros.map(d => {
                            const isSel = selectedImage === d.name;
                            return (
                              <button
                                type="button"
                                key={d.name}
                                onClick={() => setSelectedImage(d.name)}
                                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                                  isSel ? 'border-[#0080FF] bg-blue-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-350'
                                }`}
                              >
                                <strong className="font-bold text-slate-850 block">{d.name}</strong>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{d.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2: Marketplace apps */}
                      <div className="space-y-2.5">
                        <label className="block font-black text-slate-700 uppercase tracking-wide">2. Select Software Blueprint (1-Click Apps)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {apps.map(a => {
                            const isSel = selectedApp === a.name;
                            return (
                              <button
                                type="button"
                                key={a.name}
                                onClick={() => setSelectedApp(a.name)}
                                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                                  isSel ? 'border-[#0080FF] bg-blue-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-350'
                                }`}
                              >
                                <strong className="font-bold text-slate-850 block">{a.name}</strong>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{a.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 3: Sizes */}
                      <div className="space-y-2.5">
                        <label className="block font-black text-slate-700 uppercase tracking-wide">3. Select VM RAM & Storage Size</label>
                        <div className="grid grid-cols-1 gap-2">
                          {plans.map(p => {
                            const isSel = selectedSize.includes(p.label.split(' - ')[0]);
                            return (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => setSelectedSize(p.label)}
                                className={`text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                  isSel ? 'border-[#0080FF] bg-blue-50/20' : 'border-slate-200 hover:border-slate-350'
                                }`}
                              >
                                <div>
                                  <strong className="font-bold text-slate-850 block">{p.label.split(' - ')[0]}</strong>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{p.ram} GB RAM • {p.cpu} vCPU Core • {p.disk} GB SSD</span>
                                </div>
                                <span className="font-mono font-bold text-slate-800">${p.cost}.00 / mo</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 4: Region */}
                      <div className="space-y-2.5">
                        <label className="block font-black text-slate-700 uppercase tracking-wide">4. Select Datacenter Region</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {regions.map(r => {
                            const isSel = selectedRegion.includes(r.name.split(' (')[0]);
                            return (
                              <button
                                type="button"
                                key={r.id}
                                onClick={() => setSelectedRegion(r.name)}
                                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSel ? 'border-[#0080FF] bg-blue-50/20' : 'border-slate-200 hover:border-slate-350'
                                }`}
                              >
                                <span className="text-xl block">{r.flag}</span>
                                <strong className="font-bold text-slate-850 block mt-1 text-[11px]">{r.name.split(' (')[0]}</strong>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 5: Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500">Droplet Hostname (Name)</label>
                          <input
                            type="text"
                            value={dropletName}
                            onChange={(e) => setDropletName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500">Root Authentication Password</label>
                          <input
                            type="password"
                            value={dropletPassword}
                            onChange={(e) => setDropletPassword(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#0080FF] hover:bg-[#006fd4] text-white font-bold p-3 rounded-xl cursor-pointer transition-colors text-xs tracking-wide uppercase"
                      >
                        Launch Interactive Cloud Droplet
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ================= INTERACTIVE SSH CONSOLE ================= */}
              {activeTab === 'console' && activeConsoleDroplet && (
                <div className="flex flex-col h-[400px] bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                  <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-[11px] font-mono select-none">
                    <span className="text-slate-400">root@{activeConsoleDroplet.name}: SSH Session</span>
                    <button 
                      onClick={() => { setActiveConsoleDroplet(null); setActiveTab('droplets'); }}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Disconnect SSH
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-green-400 space-y-1 select-text selection:bg-slate-750">
                    {consoleLines.map((line, idx) => (
                      <p key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</p>
                    ))}
                  </div>

                  <form onSubmit={handleConsoleCommand} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 select-none">root@{activeConsoleDroplet.name}:~#</span>
                    <input
                      type="text"
                      value={consoleInput}
                      onChange={(e) => setConsoleInput(e.target.value)}
                      placeholder="e.g. neofetch, docker ps, npm install, pm2 list, help..."
                      className="flex-1 bg-transparent border-none text-green-400 text-xs font-mono focus:outline-none"
                      autoFocus
                    />
                  </form>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

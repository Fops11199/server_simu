import React, { useState, useEffect, useRef } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Server, RotateCcw, Power, RefreshCw, Globe, HelpCircle, HardDrive, 
  Terminal as TermIcon, Shield, Lock, Eye, EyeOff, Check, AlertTriangle, 
  ArrowRight, ShieldCheck, Cpu, Database, Network, ChevronRight, Play, Square, 
  Sparkles, Key, DollarSign, PlusCircle, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ContaboSubMenu = 'services' | 'power' | 'reinstall' | 'rdns' | 'ip' | 'vnc' | 'console';

interface ActionLog {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  details: string;
}

export const ContaboTab: React.FC = () => {
  const { state, updateState, addTerminalLine } = useSimulator();
  const [activeMenu, setActiveMenu] = useState<ContaboSubMenu>('services');
  
  // Local states for Contabo settings
  const [vpsOs, setVpsOs] = useState<string>(() => {
    return localStorage.getItem('contabo_os_image') || 'Ubuntu 24.04 LTS';
  });
  const [vpsStatus, setVpsStatus] = useState<'ONLINE' | 'OFFLINE' | 'REINSTALLING'>('ONLINE');
  const [rootPassword, setRootPassword] = useState<string>('c0ntab0_Admin_2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passStrength, setPassStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Strong');
  
  // OS Reinstall States
  const [selectedOs, setSelectedOs] = useState<string>('Ubuntu 24.04 LTS');
  const [reinstallPassword, setReinstallPassword] = useState<string>('');
  const [isReinstalling, setIsReinstalling] = useState<boolean>(false);
  const [reinstallProgress, setReinstallProgress] = useState<number>(0);
  const [reinstallStepText, setReinstallStepText] = useState<string>('');

  // Reverse DNS PTR States
  const [selectedPtrIp, setSelectedPtrIp] = useState<string>('203.0.113.10');
  const [ptrDomain, setPtrDomain] = useState<string>('server01.hostlab.local');
  const [ptrRecords, setPtrRecords] = useState<{ [ip: string]: string }>({
    '203.0.113.10': 'server01.hostlab.local',
    '2001:db8::10': 'ipv6.server01.hostlab.local'
  });

  // IP management state
  const [assignedIps, setAssignedIps] = useState<string[]>(() => {
    const saved = localStorage.getItem('contabo_assigned_ips');
    return saved ? JSON.parse(saved) : ['203.0.113.10'];
  });
  const [isOrderingIp, setIsOrderingIp] = useState<boolean>(false);
  const [orderIpRegion, setOrderIpRegion] = useState<string>('EU (Germany)');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('contabo_os_image', vpsOs);
  }, [vpsOs]);

  useEffect(() => {
    localStorage.setItem('contabo_assigned_ips', JSON.stringify(assignedIps));
  }, [assignedIps]);

  // VNC State
  const [vncEnabled, setVncEnabled] = useState<boolean>(true);
  const [vncPassword, setVncPassword] = useState<string>('vncSec_99x');
  const [showVncPass, setShowVncPass] = useState<boolean>(false);
  const [vncNewPassword, setVncNewPassword] = useState<string>('');
  
  // Simulated VNC Direct Console state
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleLines, setConsoleLines] = useState<string[]>([
    'Contabo VNC WebConsole v1.4.2 Connected.',
    `Booting virtual environment...`,
    `Loading grub bootloader...`,
    `System ONLINE. Root shell login required.`,
    ''
  ]);
  const [vncLoggedIn, setVncLoggedIn] = useState<boolean>(false);
  const [vncLoginUsername, setVncLoginUsername] = useState<string>('');
  const [vncLoginPassword, setVncLoginPassword] = useState<string>('');
  const [vncStage, setVncStage] = useState<'username' | 'password' | 'shell'>('username');
  
  // Action History state
  const [logs, setLogs] = useState<ActionLog[]>([
    {
      id: 'log_1',
      timestamp: '2026-07-15 04:30:11',
      action: 'PROVISION',
      target: 'VPS S SSD (EU-GER)',
      status: 'SUCCESS',
      details: 'Automatic container node instance setup successfully deployed.'
    },
    {
      id: 'log_2',
      timestamp: '2026-07-15 04:31:45',
      action: 'BOOT_SYSTEM',
      target: 'VPS S SSD',
      status: 'SUCCESS',
      details: 'System cold boot sequence fully established.'
    }
  ]);

  // Check password strength
  useEffect(() => {
    const pwd = isReinstalling ? reinstallPassword : rootPassword;
    if (pwd.length === 0) {
      setPassStrength('Weak');
      return;
    }
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) setPassStrength('Weak');
    else if (score <= 3) setPassStrength('Medium');
    else setPassStrength('Strong');
  }, [rootPassword, reinstallPassword, isReinstalling]);

  const addLog = (action: string, target: string, status: 'SUCCESS' | 'PENDING' | 'FAILED', details: string) => {
    const newLog: ActionLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      target,
      status,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 1. Power Action Handlers
  const handlePowerAction = (actionType: 'SOFT_REBOOT' | 'HARD_REBOOT' | 'STOP' | 'START') => {
    if (vpsStatus === 'REINSTALLING') return;

    if (actionType === 'STOP') {
      setVpsStatus('OFFLINE');
      addLog('POWER_OFF', 'VPS S SSD', 'SUCCESS', 'Graceful system halt initiated via ACPI signal.');
      
      // Update simulator state
      updateState({
        services: {
          nginx: 'stopped',
          postgresql: 'stopped',
          'node-api': 'stopped'
        }
      });

      // Append to virtual terminal CLI
      addTerminalLine({ type: 'error', text: '\n*** SYSTEM RECEIVED ACPI SHUTDOWN SIGNAL ***' });
      addTerminalLine({ type: 'error', text: '[systemd] Stopping Nginx HTTP Server...' });
      addTerminalLine({ type: 'error', text: '[systemd] Stopping PostgreSQL Database Server...' });
      addTerminalLine({ type: 'error', text: '[systemd] Stopping Node API Engine...' });
      addTerminalLine({ type: 'error', text: 'System halted. Virtual instance powered off.\n' });

      // Add to VNC console
      setConsoleLines(prev => [
        ...prev,
        '*** POWER OFF RECEIVED ***',
        '[systemd] Stopping system daemon services...',
        '[systemd] Synced filesystems.',
        'Power down complete.'
      ]);
      setVncStage('username');
      setVncLoggedIn(false);
    } 
    else if (actionType === 'START') {
      setVpsStatus('ONLINE');
      addLog('POWER_ON', 'VPS S SSD', 'SUCCESS', 'Virtual server container powered on.');

      // Restore simulator services
      updateState({
        services: {
          nginx: 'running',
          postgresql: 'running',
          'node-api': 'running'
        }
      });

      addTerminalLine({ type: 'success', text: '\n*** COLD BOOT SEQUENCE INITIALIZED ***' });
      addTerminalLine({ type: 'info', text: '[kernel] Booting Linux kernel version 6.8.0-31-generic...' });
      addTerminalLine({ type: 'success', text: '[systemd] Starting Nginx HTTP Server... Success!' });
      addTerminalLine({ type: 'success', text: '[systemd] Starting PostgreSQL Database Server... Success!' });
      addTerminalLine({ type: 'success', text: '[systemd] Starting Node API Engine... Success!' });
      addTerminalLine({ type: 'success', text: 'System load completed. All services active.\n' });

      setConsoleLines([
        'Contabo VNC WebConsole v1.4.2 Connected.',
        `Booting virtual environment...`,
        `[kernel] loading vmlinuz-6.8.0-31-generic`,
        `[systemd] mounted ext4 storage successfully`,
        `[systemd] bound networking to interface eth0`,
        `System ONLINE. Root shell login required.`,
        ''
      ]);
      setVncStage('username');
      setVncLoggedIn(false);
    }
    else if (actionType === 'SOFT_REBOOT') {
      setVpsStatus('REINSTALLING'); // temporarily blocked during short reboot
      addLog('SOFT_REBOOT', 'VPS S SSD', 'PENDING', 'Graceful software reboot signal sent.');
      
      addTerminalLine({ type: 'info', text: '\n*** REBOOT SIGNAL INITIATED BY CUSTOMER PANEL ***' });
      addTerminalLine({ type: 'error', text: '[systemd] Stopping current active services gracefully...' });
      
      setConsoleLines(prev => [...prev, '*** SYSTEM REBOOTING ***']);

      setTimeout(() => {
        setVpsStatus('ONLINE');
        addLog('SOFT_REBOOT', 'VPS S SSD', 'SUCCESS', 'System reboot completed. Services initialized.');
        
        // Ensure services are active
        updateState({
          services: {
            nginx: 'running',
            postgresql: 'running',
            'node-api': 'running'
          }
        });

        addTerminalLine({ type: 'success', text: '[systemd] Core services restarted. System fully functional.\n' });
        setConsoleLines([
          'Contabo VNC WebConsole v1.4.2 Connected.',
          `Booting virtual environment...`,
          `[kernel] loading vmlinuz-6.8.0-31-generic`,
          `System ONLINE. Root shell login required.`,
          ''
        ]);
        setVncStage('username');
        setVncLoggedIn(false);
      }, 2500);
    }
    else if (actionType === 'HARD_REBOOT') {
      setVpsStatus('REINSTALLING');
      addLog('HARD_REBOOT', 'VPS S SSD', 'PENDING', 'Instant hardware reset signal sent.');
      
      addTerminalLine({ type: 'error', text: '\n*** HARD RESET TRASHING VIRTUAL SOCKETS ***' });
      setConsoleLines(['*** HARD REBOOT ENFORCED ***']);

      setTimeout(() => {
        setVpsStatus('ONLINE');
        localStorage.setItem('contabo_hard_reboot_completed', 'true');
        addLog('HARD_REBOOT', 'VPS S SSD', 'SUCCESS', 'Hard reset complete. Dirty disk mount resolved.');
        
        updateState({
          services: {
            nginx: 'running',
            postgresql: 'running',
            'node-api': 'running'
          }
        });

        addTerminalLine({ type: 'success', text: '[kernel] Warning: Unclean unmount recovered. Boot finished.\n' });
        setConsoleLines([
          'Contabo VNC WebConsole v1.4.2 Connected.',
          `Booting virtual environment...`,
          `System ONLINE. Root shell login required.`,
          ''
        ]);
        setVncStage('username');
        setVncLoggedIn(false);
      }, 2500);
    }
  };

  // 2. OS Reinstall Routine
  const handleOsReinstall = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReinstalling) return;
    if (reinstallPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setIsReinstalling(true);
    setVpsStatus('REINSTALLING');
    setReinstallProgress(0);
    addLog('REINSTALL_OS', `Re-imaging to ${selectedOs}`, 'PENDING', 'OS installation process initiated.');

    addTerminalLine({ type: 'error', text: `\n*** DANGER: OS RE-IMAGING TRIGGERED FOR: ${selectedOs} ***` });
    addTerminalLine({ type: 'info', text: 'All virtual server filesystems are being unmounted and reformatted.' });

    const phases = [
      { progress: 15, text: 'Stopping current virtual machine services & unmounting directories...' },
      { progress: 40, text: 'Formatting SSD block storage to ext4 and writing GPT sector maps...' },
      { progress: 70, text: `Extracting ${selectedOs} official cloud-init root filesystem image...` },
      { progress: 90, text: 'Generating fresh SSH host keys, setting root credentials, and seeding localhost...' },
      { progress: 100, text: 'Finalizing server reboot configuration. Installation successful!' }
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      if (currentPhase < phases.length) {
        const step = phases[currentPhase];
        setReinstallProgress(step.progress);
        setReinstallStepText(step.text);
        
        // Print progress to terminal as well
        addTerminalLine({ type: 'info', text: `[Reinstall ${step.progress}%]: ${step.text}` });

        currentPhase++;
      } else {
        clearInterval(interval);
        setIsReinstalling(false);
        setVpsStatus('ONLINE');
        setVpsOs(selectedOs);
        setRootPassword(reinstallPassword);
        setReinstallPassword('');
        
        addLog('REINSTALL_OS', `Re-imaging to ${selectedOs}`, 'SUCCESS', 'OS fully reinstalled. Root credentials updated.');
        addTerminalLine({ type: 'success', text: `*** OS REINSTALL COMPLETED: Server is now running a fresh copy of ${selectedOs}! ***\n` });

        // Restore services to fresh running state
        updateState({
          services: {
            nginx: 'running',
            postgresql: 'stopped', // postgres stopped by default in fresh install
            'node-api': 'stopped'
          }
        });

        // Reset console
        setConsoleLines([
          'Contabo VNC WebConsole v1.4.2 Connected.',
          `Fresh installation of ${selectedOs} loaded.`,
          'System ONLINE. Root shell login required.',
          ''
        ]);
        setVncStage('username');
        setVncLoggedIn(false);
      }
    }, 1800);
  };

  // 3. PTR Record Updater
  const handleUpdatePtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptrDomain.trim()) return;

    setPtrRecords(prev => ({
      ...prev,
      [selectedPtrIp]: ptrDomain.trim()
    }));

    addLog('UPDATE_PTR', `PTR for ${selectedPtrIp}`, 'SUCCESS', `Set Reverse DNS record pointing to: ${ptrDomain}`);
    addTerminalLine({ type: 'success', text: `[Contabo PTR] Updated Reverse DNS (PTR) for ${selectedPtrIp} -> ${ptrDomain}` });
    alert(`PTR record for ${selectedPtrIp} has been updated to point to ${ptrDomain} successfully!`);
  };

  // 4. IP Ordering flow
  const handleOrderIp = () => {
    const nextIpNum = 10 + assignedIps.length;
    if (nextIpNum > 15) {
      alert('Maximum limits of IP addresses reached for this virtual container.');
      return;
    }
    const newIp = `203.0.113.${nextIpNum}`;

    setAssignedIps(prev => [...prev, newIp]);
    setIsOrderingIp(false);

    // Save to PTR records defaults
    setPtrRecords(prev => ({
      ...prev,
      [newIp]: `ptr-${newIp.replace(/\./g, '-')}.hostlab.local`
    }));

    addLog('ORDER_IP', `Assigned: ${newIp}`, 'SUCCESS', `Ordered additional IPv4. Binding network interface eth0:${assignedIps.length}.`);
    addTerminalLine({ type: 'success', text: `[Contabo IP] Successfully bound additional IPv4 address ${newIp} to virtual network interface!` });
  };

  // 5. VNC password reset
  const handleVncReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (vncNewPassword.length < 5) {
      alert('VNC password must be at least 5 characters.');
      return;
    }
    setVncPassword(vncNewPassword);
    setVncNewPassword('');
    addLog('RESET_VNC_PASS', 'VNC Console Credentials', 'SUCCESS', 'Reset secure VNC terminal passwords.');
    alert('VNC Console Access password has been successfully reset!');
  };

  // 6. Interactive VNC shell handler
  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = consoleInput.trim();
    if (!cmd) return;

    setConsoleLines(prev => [...prev, `${vncStage === 'shell' ? 'root@contabo-vps:~# ' : ''}${consoleInput}`]);
    setConsoleInput('');

    if (vncStage === 'username') {
      if (cmd === 'root') {
        setVncLoginUsername('root');
        setVncStage('password');
        setConsoleLines(prev => [...prev, 'Password: ']);
      } else {
        setConsoleLines(prev => [...prev, 'Invalid username. Only "root" login is permitted over VNC.', 'login: ']);
      }
    } 
    else if (vncStage === 'password') {
      if (cmd === rootPassword) {
        setVncLoggedIn(true);
        setVncStage('shell');
        setConsoleLines(prev => [
          ...prev,
          `Welcome to ${vpsOs}!`,
          'Last login: Wed Jul 15 04:45:01 UTC 2026 from 127.0.0.1',
          'Type "exit" to log out, or standard terminal commands.',
          ''
        ]);
      } else {
        setConsoleLines(prev => [...prev, 'Login incorrect.', 'login: ']);
        setVncStage('username');
      }
    } 
    else if (vncStage === 'shell') {
      if (cmd === 'exit') {
        setVncLoggedIn(false);
        setVncStage('username');
        setConsoleLines(prev => [...prev, 'Logged out of console.', '', 'login: ']);
      } else if (cmd === 'clear') {
        setConsoleLines(['VNC console cleared. Type "exit" or commands.', '']);
      } else if (cmd === 'neofetch') {
        setConsoleLines(prev => [
          ...prev,
          '            .-/++:          root@contabo-vps',
          '         `-+++++++/`        ----------------',
          '        `+++++++++++`       OS: ' + vpsOs,
          '       -++++++++++++-       Host: Contabo VPS S SSD Instance',
          '       ++++++++++++++       Kernel: Linux 6.8.0-31-generic',
          '       -++++++++++++-       Uptime: 2 hours, 14 mins',
          '        `+++++++++++`       Memory: 3.36 GiB / 8.00 GiB (42%)',
          '         `-+++++++/`        Disk: 26.8 GB / 200.0 GB (13%)',
          '            .-/++:          Shell: bash v5.2.21',
          ''
        ]);
      } else if (cmd === 'ip a') {
        setConsoleLines(prev => [
          ...prev,
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default',
          '    inet 127.0.0.1/8 scope host lo',
          '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default',
          assignedIps.map((ip, i) => `    inet ${ip}/24 brd 203.0.113.255 scope global eth0${i > 0 ? ':' + i : ''}`).join('\n'),
          '    inet6 2001:db8::10/64 scope global',
          ''
        ]);
      } else if (cmd === 'systemctl status nginx') {
        setConsoleLines(prev => [
          ...prev,
          '● nginx.service - A high performance web server and a reverse proxy server',
          '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; preset: enabled)',
          `     Active: active (running) since Wed 2026-07-15 04:31:45 UTC; 15min ago`,
          '     Main PID: 1024 (nginx)',
          '     Tasks: 2 (limit: 9481)',
          '     Memory: 8.4M',
          '     CGroup: /system.slice/nginx.service',
          '             ├─1024 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;',
          '             └─1025 nginx: worker process',
          ''
        ]);
      } else if (cmd === 'help') {
        setConsoleLines(prev => [
          ...prev,
          'Available commands: neofetch, ip a, systemctl status nginx, clear, exit, help',
          ''
        ]);
      } else {
        setConsoleLines(prev => [...prev, `-bash: ${cmd}: command not found. (VNC Sandbox Shell)`, '']);
      }
    }
  };

  const getSubTitle = () => {
    switch(activeMenu) {
      case 'services': return 'Overview of Provisioned Virtual Server Instances';
      case 'power': return 'Core VPS Power Actions & Control Log history';
      case 'reinstall': return 'Re-image Container OS & Setup Root Password';
      case 'rdns': return 'Configure Reverse DNS (PTR Records) for Public IPs';
      case 'ip': return 'Manage Bound IPv4/IPv6 Networking Interfaces';
      case 'vnc': return 'Configure Secure Remote Out-Of-Band VNC Access';
      case 'console': return 'Live Out-Of-Band WebVNC Graphical Boot Console';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0" id="contabo-panel-container">
      
      {/* ================= CONTABO SIDEBAR NAVIGATION ================= */}
      <div className="lg:w-64 shrink-0 bg-[#0d1624] border border-white/5 rounded-xl p-4 flex flex-col gap-1.5 select-none shadow-xl">
        
        {/* Contabo Authentic Logo Section */}
        <div className="px-2 py-4 border-b border-white/10 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#ff6b00] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-orange-500/20 tracking-wider">
            C
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-sans leading-none">
              CONTABO
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Customer VPS Panel</p>
          </div>
        </div>

        {/* Sidebar Links */}
        {[
          { id: 'services', label: 'Your Services', icon: <Server className="w-4 h-4" /> },
          { id: 'power', label: 'Power Control', icon: <Power className="w-4 h-4" /> },
          { id: 'reinstall', label: 'Reinstall OS', icon: <RotateCcw className="w-4 h-4" /> },
          { id: 'rdns', label: 'Reverse DNS (PTR)', icon: <Globe className="w-4 h-4" /> },
          { id: 'ip', label: 'IP Management', icon: <Network className="w-4 h-4" /> },
          { id: 'vnc', label: 'VNC Configuration', icon: <Key className="w-4 h-4" /> },
          { id: 'console', label: 'WebVNC Console', icon: <Monitor className="w-4 h-4" />, highlight: vpsStatus === 'ONLINE' }
        ].map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id as ContaboSubMenu);
                if (item.id === 'console' && vncStage === 'username') {
                  setConsoleLines(prev => [...prev, 'login: ']);
                }
              }}
              className={`w-full text-left flex items-center justify-between px-3.5 py-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff6b00]/15 border-[#ff6b00]/40 text-[#ff8c3a] shadow-md shadow-[#ff6b00]/5'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-sans">{item.label}</span>
              </div>
              
              {item.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow-emerald"></span>
              )}
            </button>
          );
        })}

        {/* Support Section card */}
        <div className="mt-auto bg-[#142136] p-3 rounded-lg border border-white/5 mt-4 select-none">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#ff6b00]" />
            <span className="text-[11px] font-bold text-slate-200">Support Hotline</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Need advanced server routing assistance? Dial +49 89 35649560 (EU) or submit a HostLab ticket!
          </p>
        </div>
      </div>

      {/* ================= CONTABO WORKSPACE CONTENT ================= */}
      <div className="flex-1 bg-[#090f19] border border-white/5 rounded-xl overflow-hidden flex flex-col h-full min-h-[500px] shadow-2xl relative">
        
        {/* Workspace Title bar */}
        <div className="p-5 bg-[#0e1625] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0">
          <div>
            <h3 className="font-bold text-slate-100 font-sans tracking-tight text-sm uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ff6b00] rounded"></span>
              {activeMenu === 'services' && 'VPS Services Listing'}
              {activeMenu === 'power' && 'Virtual Power Control Unit'}
              {activeMenu === 'reinstall' && 'OS Image Installation Manager'}
              {activeMenu === 'rdns' && 'Reverse DNS Zone Management'}
              {activeMenu === 'ip' && 'Assigned IP Addresses'}
              {activeMenu === 'vnc' && 'VNC Client Settings'}
              {activeMenu === 'console' && 'Interactive Out-of-Band VNC Console'}
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              {getSubTitle()}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono select-none">
            <span className="text-slate-500">Instance Status:</span>
            {vpsStatus === 'ONLINE' && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
              </span>
            )}
            {vpsStatus === 'OFFLINE' && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> OFFLINE
              </span>
            )}
            {vpsStatus === 'REINSTALLING' && (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> REINSTALLING
              </span>
            )}
          </div>
        </div>

        {/* Main Content Workspace viewport */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              
              {/* ================= SERVICES TAB ================= */}
              {activeMenu === 'services' && (
                <div className="space-y-6">
                  {/* Service Stats Summary Box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#121c2e] p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Assigned VPS IP</span>
                      <strong className="text-slate-100 text-lg font-mono">203.0.113.10</strong>
                      <span className="text-[10px] text-slate-500 font-sans block">Primary IPv4 Interface</span>
                    </div>

                    <div className="bg-[#121c2e] p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Server Location</span>
                      <strong className="text-slate-100 text-lg font-sans flex items-center gap-2">
                        🇩🇪 EU - Düsseldorf
                      </strong>
                      <span className="text-[10px] text-slate-500 font-sans block">Datacenter Region DE-01</span>
                    </div>

                    <div className="bg-[#121c2e] p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Current OS</span>
                      <strong className="text-slate-100 text-base font-sans truncate block">{vpsOs}</strong>
                      <span className="text-[10px] text-[#ff8c3a] font-mono block">Kernel: 6.8-LTS</span>
                    </div>
                  </div>

                  {/* Active VPS Listing Table */}
                  <div className="bg-[#0e1625] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                    <div className="p-4 bg-[#142136] border-b border-white/5 flex justify-between items-center select-none">
                      <span className="text-xs font-bold text-slate-300 font-mono">VPS Container Subscription</span>
                      <span className="text-[10px] bg-[#ff6b00]/10 text-[#ff8c3a] border border-[#ff6b00]/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Contabo VPS S SSD
                      </span>
                    </div>

                    <div className="overflow-x-auto select-none">
                      <table className="w-full text-left text-xs text-slate-300 font-sans">
                        <thead className="bg-[#0b101c] text-slate-400 font-bold border-b border-white/5 uppercase tracking-wide text-[10px]">
                          <tr>
                            <th className="p-4">VM ID / Name</th>
                            <th className="p-4">Processor & Ram</th>
                            <th className="p-4">Disk Space</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Pricing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <span className="text-slate-100 font-bold block">vps01.contabo.local</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: 489104-DE</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-200 block">4 vCPU Cores</span>
                              <span className="text-[10px] text-slate-500 font-mono">8 GB RAM</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-200 block">200 GB SSD</span>
                              <span className="text-[10px] text-slate-500 font-mono">SATA v3 Block</span>
                            </td>
                            <td className="p-4 font-mono text-[#ff8c3a] font-semibold">
                              {assignedIps[0]}
                              {assignedIps.length > 1 && (
                                <span className="block text-[9px] text-slate-500">+{assignedIps.length - 1} More</span>
                              )}
                            </td>
                            <td className="p-4">
                              {vpsStatus === 'ONLINE' && (
                                <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                                </span>
                              )}
                              {vpsStatus === 'OFFLINE' && (
                                <span className="bg-red-500/10 text-red-400 font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Offline
                                </span>
                              )}
                              {vpsStatus === 'REINSTALLING' && (
                                <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Reinstalling
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right font-bold text-white font-mono text-xs">
                              €4.99 / mo
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quick Control Info cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Monitor className="w-4.5 h-4.5 text-[#ff6b00]" /> Out-of-Band WebVNC console
                      </h4>
                      <p className="text-slate-400 text-xs font-sans leading-relaxed">
                        If your system is locked, or you misconfigured the Nginx site config blocking network traffic, you can click on the WebVNC Console menu in the sidebar to open a live virtual terminal displaying local kernel login output.
                      </p>
                      <button
                        onClick={() => setActiveMenu('console')}
                        className="text-[#ff8c3a] hover:text-[#ff6b00] text-xs font-bold font-mono inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Launch Direct WebVNC Terminal <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" /> Administrative Root Password
                      </h4>
                      <div className="flex items-center justify-between bg-[#0b101c] p-3 rounded-lg border border-white/5">
                        <div className="font-mono text-xs text-slate-300">
                          {showPassword ? rootPassword : '••••••••••••••••'}
                        </div>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-450 hover:text-slate-200 cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                        You can reset the root password dynamically at any time by triggering a reinstall of the virtual server OS in the OS Reinstall form page.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= POWER TAB ================= */}
              {activeMenu === 'power' && (
                <div className="space-y-6 select-none">
                  <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Virtual Machine Power Action Sockets
                    </h4>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handlePowerAction('SOFT_REBOOT')}
                        disabled={vpsStatus === 'REINSTALLING'}
                        className="bg-[#1a2e4e] hover:bg-[#254270] border border-blue-500/30 text-blue-200 px-4 py-2.5 rounded-lg font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-45"
                      >
                        <RotateCcw className="w-4 h-4" /> Soft Reboot (ACPI)
                      </button>

                      <button
                        onClick={() => handlePowerAction('HARD_REBOOT')}
                        disabled={vpsStatus === 'REINSTALLING'}
                        className="bg-amber-950/20 hover:bg-amber-950/50 border border-amber-500/20 text-amber-300 px-4 py-2.5 rounded-lg font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-45"
                      >
                        <RefreshCw className="w-4 h-4" /> Hard Reboot (Power Reset)
                      </button>

                      {vpsStatus === 'ONLINE' ? (
                        <button
                          onClick={() => handlePowerAction('STOP')}
                          className="bg-red-950/20 hover:bg-red-950/60 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Square className="w-4 h-4 fill-red-400/30" /> Stop Server VM
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePowerAction('START')}
                          disabled={vpsStatus === 'REINSTALLING'}
                          className="bg-emerald-950/20 hover:bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-lg font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Play className="w-4 h-4 fill-emerald-400/30" /> Start Server VM
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      <strong>Soft Reboot:</strong> Reboots the operating system safely by dispatching ACPI instructions.<br />
                      <strong>Hard Reboot:</strong> Power cycles the hardware instantly, useful if the virtual disk mounts are locked or frozen.<br />
                      <strong>Stop VM:</strong> Shuts down the hypervisor allocation entirely. Public IP services will respond with connection refused.
                    </p>
                  </div>

                  {/* Power Logs History */}
                  <div className="bg-[#0e1625] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 bg-[#142136] border-b border-white/5">
                      <span className="text-xs font-bold text-slate-300 font-mono">Power Event Action Logs</span>
                    </div>

                    <div className="overflow-x-auto text-xs font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-[#0b101c] text-slate-500 select-none text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                          <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Target Instance</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Details / Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 text-slate-450">{log.timestamp}</td>
                              <td className="p-3">
                                <span className="bg-[#0b101c] border border-white/5 px-2 py-0.5 rounded text-[10px] text-slate-300">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 text-slate-200">{log.target}</td>
                              <td className="p-3">
                                {log.status === 'SUCCESS' && (
                                  <span className="text-emerald-400 font-bold">SUCCESS</span>
                                )}
                                {log.status === 'PENDING' && (
                                  <span className="text-amber-400 font-bold animate-pulse">PENDING</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-400 text-[11px] font-sans leading-normal">{log.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= REINSTALL OS TAB ================= */}
              {activeMenu === 'reinstall' && (
                <div className="space-y-6">
                  {isReinstalling ? (
                    <div className="bg-[#0e1625] p-8 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-6 select-none">
                      <RefreshCw className="w-12 h-12 text-[#ff6b00] animate-spin" />
                      <div className="text-center space-y-2">
                        <h4 className="text-sm font-bold text-slate-100 font-mono">REINSTALLING OPERATING SYSTEM</h4>
                        <p className="text-xs text-slate-400 font-sans">{reinstallStepText}</p>
                      </div>

                      <div className="w-full max-w-md space-y-2">
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500 shadow-glow-orange"
                            style={{ width: `${reinstallProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-slate-500">
                          <span>Partitioning...</span>
                          <span className="text-[#ff8c3a] font-bold">{reinstallProgress}% Done</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleOsReinstall} className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-4">
                      <div className="bg-amber-950/15 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs font-sans leading-relaxed text-slate-350">
                          <strong className="text-amber-300 font-semibold block mb-0.5">WARNING: Destructive Operation!</strong>
                          Re-imaging the virtual OS formats your server storage completely. All active directories, file blocks, and data in Nginx default locations will be purged and re-initialized.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                            Select Operating System Image
                          </label>
                          <select
                            value={selectedOs}
                            onChange={(e) => setSelectedOs(e.target.value)}
                            className="w-full bg-[#0b101c] border border-white/5 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-[#ff6b00]/50 text-xs cursor-pointer font-sans"
                          >
                            <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (Recommended)</option>
                            <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
                            <option value="Debian 12 (Bookworm)">Debian 12 (Bookworm)</option>
                            <option value="Rocky Linux 9.4">Rocky Linux 9.4</option>
                            <option value="AlmaLinux 9.4">AlmaLinux 9.4</option>
                            <option value="Windows Server 2022">Windows Server 2022 (+€5.99/mo licensing)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                            Administrative Root Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={reinstallPassword}
                              onChange={(e) => setReinstallPassword(e.target.value)}
                              placeholder="Type highly secure root password"
                              required
                              className="w-full bg-[#0b101c] border border-white/5 rounded-lg p-3 pr-10 text-slate-200 focus:outline-none focus:border-[#ff6b00]/50 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          
                          {/* Password Strength display */}
                          {reinstallPassword.length > 0 && (
                            <div className="flex items-center gap-2 text-[10px] font-mono leading-none pt-1">
                              <span className="text-slate-500">Strength:</span>
                              <span className={`font-bold ${
                                passStrength === 'Strong' ? 'text-emerald-400' :
                                passStrength === 'Medium' ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {passStrength}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          className="bg-[#ff6b00] hover:bg-[#e56200] text-white font-sans font-bold py-2.5 px-5 rounded-lg text-xs inline-flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-orange-500/10"
                        >
                          <RefreshCw className="w-4 h-4" /> Format Storage & Reinstall OS
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ================= REVERSE DNS TAB ================= */}
              {activeMenu === 'rdns' && (
                <div className="space-y-6">
                  <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 text-slate-400 text-xs leading-relaxed font-sans select-none">
                    Reverse DNS (Pointer / PTR Records) maps server IP addresses back to qualified domain names. This is critical for sending mail without going to spam folders, as remote SMTP gateways verify PTR matching.
                  </div>

                  <form onSubmit={handleUpdatePtr} className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider select-none">
                      Set PTR Record
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2 select-none">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                          IP Target
                        </label>
                        <select
                          value={selectedPtrIp}
                          onChange={(e) => setSelectedPtrIp(e.target.value)}
                          className="w-full bg-[#0b101c] border border-white/5 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-[#ff6b00]/50 text-xs cursor-pointer font-mono"
                        >
                          {assignedIps.map(ip => (
                            <option key={ip} value={ip}>{ip} (IPv4 Interface)</option>
                          ))}
                          <option value="2001:db8::10">2001:db8::10 (IPv6 /64 CIDR)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide select-none">
                          Pointer Domain Name (FQDN)
                        </label>
                        <input
                          type="text"
                          value={ptrDomain}
                          onChange={(e) => setPtrDomain(e.target.value)}
                          placeholder="mail.hostlab.local"
                          required
                          className="w-full bg-[#0b101c] border border-white/5 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-[#ff6b00]/50 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="bg-[#ff6b00] hover:bg-[#e56200] text-white font-sans font-bold py-2.5 px-4 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-orange-500/10"
                      >
                        <Globe className="w-4 h-4" /> Save PTR Config
                      </button>
                    </div>
                  </form>

                  {/* Configured PTR Records */}
                  <div className="bg-[#0e1625] border border-white/5 rounded-xl overflow-hidden shadow-lg select-text font-mono">
                    <div className="p-4 bg-[#142136] border-b border-white/5 select-none">
                      <span className="text-xs font-bold text-slate-300">Active Reverse DNS Pointer Maps</span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0b101c] text-slate-500 select-none text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                        <tr>
                          <th className="p-3">IP Address</th>
                          <th className="p-3">Reverse Domain Mapping (PTR)</th>
                          <th className="p-3 text-right">TTL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {Object.entries(ptrRecords).map(([ip, val]) => (
                          <tr key={ip} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-semibold text-slate-200">{ip}</td>
                            <td className="p-3 text-[#ff8c3a] font-bold">{val}</td>
                            <td className="p-3 text-right text-slate-500">86400 (24h)</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= IP ADDRESSES TAB ================= */}
              {activeMenu === 'ip' && (
                <div className="space-y-6">
                  {/* IP Overview cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
                    <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-[#ff6b00]" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          IPv4 Network Interfaces
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {assignedIps.map((ip, i) => (
                          <div key={ip} className="flex justify-between items-center bg-[#0b101c] p-3 rounded-lg border border-white/5">
                            <span className="font-mono text-xs font-bold text-slate-100">{ip}</span>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                              {i === 0 ? 'Primary WAN' : `Interface eth0:${i}`}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setIsOrderingIp(true)}
                        className="bg-[#1c2a3f] hover:bg-[#253957] border border-white/5 text-slate-200 px-4 py-2 rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-[#ff6b00]" /> Request Additional IP Address
                      </button>
                    </div>

                    <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          IPv6 Block Allocation
                        </h4>
                      </div>

                      <div className="bg-[#0b101c] p-4 rounded-lg border border-white/5 space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Allocated Range:</span>
                          <span className="text-[#ff8c3a] font-bold">2001:db8::/64</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <span className="text-slate-500">Gateway:</span>
                          <span className="text-slate-400">2001:db8::1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Primary IP:</span>
                          <span className="text-slate-350">2001:db8::10</span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 leading-normal font-sans">
                        IPv6 blocks of size /64 are allocated free of charge for all high-performance virtual servers at Contabo on initial workspace provision.
                      </p>
                    </div>
                  </div>

                  {/* IP Order Modal */}
                  {isOrderingIp && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                      <div className="bg-[#0d1624] border border-white/10 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="p-4 bg-[#142136] border-b border-white/10 flex justify-between items-center select-none">
                          <span className="font-bold text-slate-250 font-sans text-xs uppercase flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#ff6b00]" /> Order Additional IPv4
                          </span>
                          <button onClick={() => setIsOrderingIp(false)} className="text-slate-400 hover:text-slate-100 cursor-pointer text-xs font-semibold">
                            Close
                          </button>
                        </div>

                        <div className="p-5 space-y-4">
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            Bind a secondary, independent public IPv4 address to route external client web traffic or run multiple web server listener targets.
                          </p>

                          <div className="space-y-2 select-none">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Geographic Network Region
                            </label>
                            <select
                              value={orderIpRegion}
                              onChange={(e) => setOrderIpRegion(e.target.value)}
                              className="w-full bg-[#0b101c] border border-white/5 rounded p-2 text-slate-200 focus:outline-none text-xs cursor-pointer font-sans"
                            >
                              <option value="EU (Germany)">EU (Germany) - Düsseldorf network</option>
                              <option value="US (East)">US (East) - New York network</option>
                              <option value="Asia (SGP)">Asia (Singapore) - SGP network</option>
                            </select>
                          </div>

                          <div className="bg-[#0b101c] p-3 rounded border border-white/5 flex justify-between items-center select-none font-mono">
                            <span className="text-slate-400 text-xs">Monthly Cost:</span>
                            <span className="text-[#ff8c3a] font-bold text-xs">+€2.50 / month</span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0a101a] border-t border-white/5 flex justify-end gap-2">
                          <button
                            onClick={() => setIsOrderingIp(false)}
                            className="bg-[#142136] hover:bg-[#1a2e4c] text-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleOrderIp}
                            className="bg-[#ff6b00] hover:bg-[#e56200] text-white px-4 py-1.5 rounded-lg text-xs font-sans font-bold cursor-pointer transition-colors"
                          >
                            Order & Bind IP
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= VNC SETTINGS TAB ================= */}
              {activeMenu === 'vnc' && (
                <div className="space-y-6">
                  <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 select-none text-slate-400 text-xs leading-relaxed">
                    VNC (Virtual Network Computing) provides direct out-of-band graphical graphical terminal access to your hypervisor. This operates independently of the Linux SSH daemon, allowing you to debug network adapter lockouts or boot issues.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Enable / Disable and settings */}
                    <div className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-4 select-none">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        VNC Access Port Control
                      </h4>

                      <div className="flex justify-between items-center bg-[#0b101c] p-3.5 rounded-lg border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-slate-100 block">VNC Server Listener</span>
                          <span className="text-[10px] text-slate-500 font-mono">Status: {vncEnabled ? 'ENABLED' : 'DISABLED'}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setVncEnabled(!vncEnabled);
                            addLog('TOGGLE_VNC', 'VNC Daemon Status', 'SUCCESS', `VNC interface ${!vncEnabled ? 'Enabled' : 'Disabled'}.`);
                          }}
                          className={`px-3.5 py-1.5 rounded text-xs font-bold font-sans cursor-pointer transition-colors ${
                            vncEnabled 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20'
                          }`}
                        >
                          {vncEnabled ? 'Disable Access' : 'Enable Access'}
                        </button>
                      </div>

                      <div className="font-mono text-xs text-slate-400 space-y-1.5 pt-2">
                        <div className="flex justify-between">
                          <span>Connection Target:</span>
                          <span className="text-slate-200 font-bold">203.0.113.10:5901</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VNC Client Encryption:</span>
                          <span className="text-slate-350">TLS/SSL Preferred</span>
                        </div>
                      </div>
                    </div>

                    {/* VNC Password Reset form */}
                    <form onSubmit={handleVncReset} className="bg-[#0e1625] p-5 rounded-xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider select-none">
                        Reset VNC Console Password
                      </h4>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide select-none">
                          Current VNC Password
                        </label>
                        <div className="flex justify-between items-center bg-[#0b101c] p-2.5 rounded border border-white/5 font-mono text-xs">
                          <span className="text-slate-300">
                            {showVncPass ? vncPassword : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowVncPass(!showVncPass)}
                            className="text-slate-500 hover:text-slate-200 cursor-pointer p-0.5"
                          >
                            {showVncPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">
                          New Secure VNC Password
                        </label>
                        <input
                          type="password"
                          value={vncNewPassword}
                          onChange={(e) => setVncNewPassword(e.target.value)}
                          placeholder="Type at least 5 chars"
                          required
                          className="w-full bg-[#0b101c] border border-white/5 rounded p-2.5 text-slate-200 focus:outline-none focus:border-[#ff6b00]/40 text-xs font-mono"
                        />
                      </div>

                      <div className="pt-1">
                        <button
                          type="submit"
                          className="bg-[#ff6b00] hover:bg-[#e56200] text-white px-4 py-2 rounded font-bold font-sans text-xs cursor-pointer transition-colors shadow-lg shadow-orange-500/10"
                        >
                          Change VNC Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ================= WEB VNC TERMINAL CONSOLE TAB ================= */}
              {activeMenu === 'console' && (
                <div className="space-y-4">
                  <div className="bg-[#0e1625] p-4 rounded-xl border border-white/5 select-none text-slate-400 text-xs leading-relaxed">
                    This simulated console provides a graphical hypervisor login directly bypassing the networks virtual firewall routing. If Nginx or server configs crash, run commands here to examine files.
                  </div>

                  {/* Shell display */}
                  <div className="bg-black text-emerald-400 font-mono text-xs p-5 rounded-xl border border-white/10 min-h-[300px] flex flex-col justify-between shadow-inner">
                    <div className="space-y-1.5 overflow-y-auto max-h-[220px]">
                      {consoleLines.map((line, idx) => (
                        <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                          {line}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleConsoleSubmit} className="flex items-center gap-2 border-t border-emerald-950/40 pt-4 mt-4">
                      <span className="text-[#ff6b00] font-bold shrink-0">
                        {vncStage === 'username' && 'login: '}
                        {vncStage === 'password' && 'Password: '}
                        {vncStage === 'shell' && 'root@contabo-vps:~# '}
                      </span>
                      <input
                        type={vncStage === 'password' ? 'password' : 'text'}
                        value={consoleInput}
                        onChange={(e) => setConsoleInput(e.target.value)}
                        placeholder={vncStage === 'shell' ? 'neofetch, systemctl status nginx...' : ''}
                        autoFocus
                        disabled={vpsStatus !== 'ONLINE'}
                        className="flex-1 bg-transparent text-emerald-300 focus:outline-none border-none p-0 font-mono text-xs select-text disabled:cursor-not-allowed"
                      />
                    </form>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-550 font-mono select-none px-2">
                    <span>Protocol: RFB v3.8 Secure WebSocket Tunnel</span>
                    <span>Encrypt: AES-GCM 256</span>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Globe, Database, Shield, Mail, Folder, Layout, Plus, Trash2, 
  Check, Lock, Eye, EyeOff, AlertCircle, RefreshCw, Key, ShieldCheck, 
  ExternalLink, Server, FileText, ChevronRight, CheckCircle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../stores/useUIStore';

const CompanionHelp: React.FC<{ text: string }> = ({ text }) => {
  const { companionOpen } = useUIStore();
  if (!companionOpen) return null;
  return (
    <span className="relative group cursor-help inline-block ml-1.5 shrink-0 select-none normal-case font-sans">
      <span className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold flex items-center justify-center animate-pulse">
        ?
      </span>
      <span className="absolute z-[999] hidden group-hover:block w-52 p-2.5 bg-slate-950 border border-yellow-500/30 text-slate-350 text-[10px] rounded-lg shadow-2xl leading-normal bottom-full mb-2 left-1/2 -translate-x-1/2">
        {text}
        <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-yellow-500/30 rotate-45"></span>
      </span>
    </span>
  );
};

type HostingerMenu = 'dashboard' | 'websites' | 'domains' | 'databases' | 'ssl' | 'emails';

interface SimulatedWebsite {
  id: string;
  domain: string;
  type: 'WordPress' | 'NodeJS' | 'Static HTML';
  status: 'ACTIVE' | 'INSTALLING' | 'SUSPENDED';
  phpVersion: string;
  storageUsed: string;
}

export const HostingerTab: React.FC = () => {
  const { state, updateState, addTerminalLine, createDatabase, assignUserToDatabase, toggleSsl } = useSimulator();
  const [activeMenu, setActiveMenu] = useState<HostingerMenu>('dashboard');

  // Local Hostinger Specific States
  const [websites, setWebsites] = useState<SimulatedWebsite[]>(() => {
    const saved = localStorage.getItem('hostinger_websites_tracker');
    return saved ? JSON.parse(saved) : [
      { id: 'web_1', domain: 'example.com', type: 'WordPress', status: 'ACTIVE', phpVersion: '8.3', storageUsed: '1.2 GB' }
    ];
  });

  // Sync websites to localStorage
  useEffect(() => {
    localStorage.setItem('hostinger_websites_tracker', JSON.stringify(websites));
  }, [websites]);
  const [newDomain, setNewDomain] = useState('');
  const [newWebType, setNewWebType] = useState<'WordPress' | 'NodeJS' | 'Static HTML'>('WordPress');
  const [isCreatingWeb, setIsCreatingWeb] = useState(false);

  // Email account states
  const [emailAccounts, setEmailAccounts] = useState<{ id: string; address: string; quota: string }[]>([
    { id: 'mail_1', address: 'admin@example.com', quota: '100 MB / 5 GB' }
  ]);
  const [newEmailUser, setNewEmailUser] = useState('');
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('example.com');

  // DB States
  const [dbNameInput, setDbNameInput] = useState('');
  const [dbUserInput, setDbUserInput] = useState('');
  const [dbPassInput, setDbPassInput] = useState('');

  // Handle website creation
  const handleCreateWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const domainName = newDomain.trim().toLowerCase();
    setIsCreatingWeb(true);

    setTimeout(() => {
      const newWeb: SimulatedWebsite = {
        id: `web_${Date.now()}`,
        domain: domainName,
        type: newWebType,
        status: 'ACTIVE',
        phpVersion: '8.3',
        storageUsed: '40 KB'
      };
      setWebsites(prev => [...prev, newWeb]);
      setIsCreatingWeb(false);
      setNewDomain('');

      // Add domain to DNS zones
      updateState({
        dnsRecords: [
          ...state.dnsRecords,
          { id: `dns_hostinger_${Date.now()}`, name: domainName, type: 'A', value: '203.0.113.10', ttl: 14400 }
        ]
      });

      // Update terminal and simulator output
      addTerminalLine({ type: 'success', text: `[Hostinger hPanel] Deployed website root directory /var/www/${domainName}` });
      addTerminalLine({ type: 'success', text: `[Hostinger hPanel] Seeded default files for environment ${newWebType}` });
    }, 2000);
  };

  // Handle Database creation
  const handleCreateDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbNameInput.trim() || !dbUserInput.trim()) return;

    createDatabase(dbNameInput.trim());
    addTerminalLine({ type: 'success', text: `[Hostinger hPanel] Created MySQL database: ${dbNameInput}` });
    addTerminalLine({ type: 'success', text: `[Hostinger hPanel] Associated user ${dbUserInput} to database.` });

    setDbNameInput('');
    setDbUserInput('');
    setDbPassInput('');
    alert('MySQL database and administrative user created successfully!');
  };

  // Handle email creation
  const handleCreateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailUser.trim()) return;

    const fullEmail = `${newEmailUser.trim().toLowerCase()}@${selectedEmailDomain}`;
    setEmailAccounts(prev => [
      ...prev,
      { id: `mail_${Date.now()}`, address: fullEmail, quota: '0 MB / 5 GB' }
    ]);
    setNewEmailUser('');
    addTerminalLine({ type: 'success', text: `[Hostinger hPanel] Created secure email mailbox: ${fullEmail}` });
  };

  const handleDeleteWebsite = (id: string, domain: string) => {
    if (confirm(`Are you sure you want to completely delete website: ${domain}?`)) {
      setWebsites(prev => prev.filter(w => w.id !== id));
      addTerminalLine({ type: 'error', text: `[Hostinger hPanel] Purged website directory & configurations for ${domain}` });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 select-none text-slate-800 bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-200">
      
      {/* ================= HOSTINGER hPANEL SIDEBAR ================= */}
      <div className="lg:w-60 shrink-0 bg-[#673DE6] rounded-xl p-4 flex flex-col gap-1.5 shadow-lg text-white">
        
        {/* Brand section */}
        <div className="px-1 py-3 border-b border-white/10 mb-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white text-[#673DE6] flex items-center justify-center font-black text-sm shadow">
            H
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider leading-none">hostinger</h2>
            <p className="text-[9px] text-purple-200 font-mono mt-1">hPanel Simulation v4.1</p>
          </div>
        </div>

        {/* Sidebar menu items */}
        {[
          { id: 'dashboard', label: 'hPanel Home', icon: <Layout className="w-4 h-4" /> },
          { id: 'websites', label: 'Websites Manager', icon: <Globe className="w-4 h-4 text-pink-200" /> },
          { id: 'domains', label: 'Domains & DNS', icon: <ExternalLink className="w-4 h-4 text-blue-200" /> },
          { id: 'databases', label: 'Databases (MySQL)', icon: <Database className="w-4 h-4 text-emerald-200" /> },
          { id: 'ssl', label: 'SSL Certificates', icon: <Shield className="w-4 h-4 text-yellow-200" /> },
          { id: 'emails', label: 'Email Accounts', icon: <Mail className="w-4 h-4 text-cyan-200" /> }
        ].map(item => {
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as HostingerMenu)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#673DE6] shadow'
                  : 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Plan card info */}
        <div className="mt-auto bg-purple-700/50 border border-white/10 p-3 rounded-lg text-white text-[11px] leading-relaxed mt-4">
          <div className="font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-green-300" /> Premium Web Hosting
          </div>
          <p className="text-[10px] text-purple-200 mt-1">
            Active till Jun 2027. Includes unlimited databases, cron jobs, and site certificates.
          </p>
        </div>
      </div>

      {/* ================= MAIN INTERFACE WRAPPER ================= */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col min-h-[450px] shadow-sm">
        
        {/* Top title bar */}
        <div className="px-5 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#673DE6] rounded-full"></span>
              {activeMenu === 'dashboard' && 'hPanel Overview & Analytics'}
              {activeMenu === 'websites' && 'Websites Configuration Control'}
              {activeMenu === 'domains' && 'Manage Domain Names'}
              {activeMenu === 'databases' && 'MySQL Database Allocations'}
              {activeMenu === 'ssl' && 'Let\'s Encrypt SSL Installation'}
              {activeMenu === 'emails' && 'Interactive Custom Domain Mailboxes'}
            </h3>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Experience the fast, visual simplicity of managed cloud shared hosting.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#673DE6] bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full font-bold">
            Shared Host Environment
          </span>
        </div>

        {/* Viewport contents */}
        <div className="flex-1 p-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="h-full space-y-5"
            >
              
              {/* ================= DASHBOARD OVERVIEW ================= */}
              {activeMenu === 'dashboard' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#673DE6] flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block leading-none">ACTIVE WEBSITES</span>
                        <strong className="text-slate-850 text-xl font-bold block mt-1">{websites.length} Domains</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block leading-none">MYSQL DATABASES</span>
                        <strong className="text-slate-850 text-xl font-bold block mt-1">{state.cpanel.databases.length} Tables</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block leading-none">EMAIL BOXES</span>
                        <strong className="text-slate-850 text-xl font-bold block mt-1">{emailAccounts.length} Mailboxes</strong>
                      </div>
                    </div>
                  </div>

                  {/* Informational guide */}
                  <div className="bg-purple-50 border border-purple-150 p-4 rounded-xl text-slate-700 leading-relaxed text-xs">
                    <h4 className="font-bold text-purple-900 mb-1">How hPanel shared hosting works:</h4>
                    <p className="text-[11px] font-sans">
                      Unlike a Virtual Private Server (VPS) where you use the Command Line (SSH) to set up and manage individual services like Nginx, databases, and SSL certificates manually, managed hosting like Hostinger hides the operating system completely. You simply click visual buttons, and our system carries out actions behind the scenes in seconds.
                    </p>
                  </div>

                  {/* Quick summary of sites */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Websites list</span>
                      <button onClick={() => setActiveMenu('websites')} className="text-xs text-[#673DE6] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {websites.map(site => (
                        <div key={site.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800">{site.domain}</span>
                            <span className="block text-[10px] text-slate-500">{site.type} website • PHP {site.phpVersion}</span>
                          </div>
                          <span className="bg-green-100 text-green-700 border border-green-200 font-bold px-2 py-0.5 rounded text-[10px]">
                            {site.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= WEBSITES MANAGER ================= */}
              {activeMenu === 'websites' && (
                <div className="space-y-4">
                  {/* Create website form */}
                  <form onSubmit={handleCreateWebsite} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#673DE6]" /> Create / Install New Website
                      <CompanionHelp text="Shared web space installer. Allocates folder directories (/var/www) matching the domain record specified." />
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500">Domain Name</label>
                        <input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          placeholder="e.g. hostlab-site.com"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#673DE6] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Select Tech Stack</label>
                        <select
                          value={newWebType}
                          onChange={(e) => setNewWebType(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#673DE6] cursor-pointer"
                        >
                          <option value="WordPress">WordPress CMS</option>
                          <option value="NodeJS">Node.js API Template</option>
                          <option value="Static HTML">Static HTML Landing Page</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingWeb}
                      className="bg-[#673DE6] hover:bg-[#532cc9] text-white font-bold py-2 px-4 rounded-lg text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {isCreatingWeb ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Provisioning Site Directories...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Install Application
                        </>
                      )}
                    </button>
                  </form>

                  {/* Active sites grid list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {websites.map(site => (
                      <div key={site.id} className="border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-slate-350 transition-colors">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-850 text-sm font-bold block">{site.domain}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">PHP Version: {site.phpVersion}</span>
                            </div>
                            <span className="text-[10px] bg-purple-50 text-[#673DE6] border border-purple-100 font-bold px-2 py-0.5 rounded">
                              {site.type}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3 font-mono">
                            <span>Disk storage: {site.storageUsed}</span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> active
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                          <button
                            onClick={() => handleDeleteWebsite(site.id, site.domain)}
                            className="p-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Website"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= DOMAINS ================= */}
              {activeMenu === 'domains' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Domain Name Pointer Mapping</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Registering or mapping external domains to hPanel automatically provisions virtual host block entries under Nginx configuration directories, enabling public visitors to find your web application content.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                      Active DNS Zones & A-Record Binding Points
                    </div>
                    <div className="divide-y divide-slate-150 font-mono text-[11px]">
                      {state.dnsRecords.map(rec => (
                        <div key={rec.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800">{rec.name}</span>
                            <span className="text-slate-400 block mt-0.5">Type: {rec.type} • TTL: {rec.ttl}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-700 font-bold">{rec.value}</span>
                            <span className="block text-[10px] text-slate-400 font-sans">Active host server IP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= DATABASES ================= */}
              {activeMenu === 'databases' && (
                <div className="space-y-4">
                  {/* Create DB */}
                  <form onSubmit={handleCreateDb} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Create MySQL Database & User
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">MySQL Database Name</label>
                        <input
                          type="text"
                          value={dbNameInput}
                          onChange={(e) => setDbNameInput(e.target.value)}
                          placeholder="e.g. u48910_db"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Database User</label>
                        <input
                          type="text"
                          value={dbUserInput}
                          onChange={(e) => setDbUserInput(e.target.value)}
                          placeholder="e.g. u48910_user"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">MySQL Password</label>
                        <input
                          type="password"
                          value={dbPassInput}
                          onChange={(e) => setDbPassInput(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#673DE6] hover:bg-[#532cc9] text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Create MySQL database
                    </button>
                  </form>

                  {/* List Databases */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                      Configured MySQL Databases
                    </div>
                    {state.cpanel.databases.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 font-sans text-center">No active databases found. Use the creator tool above to initialize MySQL parameters.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 font-mono text-[11px]">
                        {state.cpanel.databases.map(db => (
                          <div key={db.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <span className="font-bold text-slate-800">{db.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Database ID: {db.id}</span>
                            </div>
                            <div className="text-right">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold text-[10px]">
                                Active Node Connected
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= SSL MANAGER ================= */}
              {activeMenu === 'ssl' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1.5">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      Let's Encrypt Certificate Authority
                      <CompanionHelp text="SSL/TLS certificates authenticate web endpoints. Activating SSL forces secure HTTPS routing, encrypting visitor sessions." />
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Secure Socket Layer (SSL/HTTPS) secures communication packets between browser clients and your Hostinger Nginx nodes. Provisioning is completely automated and maps in 1-click.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-xs text-slate-700">
                      Managed Certificates status
                    </div>
                    <div className="divide-y divide-slate-100">
                      {websites.map(site => {
                        const hasSsl = state.cpanel.sslCertificates.includes(site.domain);
                        return (
                          <div key={site.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                            <div>
                              <strong className="text-slate-800 block text-sm">{site.domain}</strong>
                              <span className="text-[10px] text-slate-500">Domain mapping endpoint</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {hasSsl ? (
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[10px]">
                                  <ShieldCheck className="w-3.5 h-3.5" /> SSL ACTIVE
                                </span>
                              ) : (
                                <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[10px]">
                                  <AlertCircle className="w-3.5 h-3.5" /> NO CERTIFICATE
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  toggleSsl(site.domain);
                                  addTerminalLine({ type: 'success', text: `[Hostinger hPanel] Triggered ACME DNS Let's Encrypt handshake for ${site.domain}` });
                                }}
                                className={`font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer ${
                                  hasSsl 
                                    ? 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700' 
                                    : 'bg-[#673DE6] text-white hover:bg-[#532cc9]'
                                }`}
                              >
                                {hasSsl ? 'Deactivate' : 'Install SSL'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= EMAIL ACCOUNTS ================= */}
              {activeMenu === 'emails' && (
                <div className="space-y-4">
                  {/* Create email */}
                  <form onSubmit={handleCreateEmail} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Create Custom Domain Email Mailbox
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Mail Username</label>
                        <input
                          type="text"
                          value={newEmailUser}
                          onChange={(e) => setNewEmailUser(e.target.value)}
                          placeholder="e.g. contact"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Domain Extension</label>
                        <select
                          value={selectedEmailDomain}
                          onChange={(e) => setSelectedEmailDomain(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 cursor-pointer"
                        >
                          {websites.map(site => (
                            <option key={site.id} value={site.domain}>@{site.domain}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="bg-[#673DE6] hover:bg-[#532cc9] text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Create Mailbox
                      </button>
                    </div>
                  </form>

                  {/* Mailbox listings */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                      Active Email Accounts
                    </div>
                    <div className="divide-y divide-slate-100">
                      {emailAccounts.map(mail => (
                        <div key={mail.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 font-sans">
                          <div>
                            <span className="font-bold text-slate-800">{mail.address}</span>
                            <span className="block text-[10px] text-slate-500">IMAP/SMTP Mail Delivery Active</span>
                          </div>
                          <span className="text-[10px] bg-slate-100 border border-slate-250 text-slate-500 font-mono px-2 py-0.5 rounded">
                            Quota: {mail.quota}
                          </span>
                        </div>
                      ))}
                    </div>
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

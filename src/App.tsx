import React, { useState } from 'react';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { DashboardTab } from './components/DashboardTab';
import { TerminalTab } from './components/TerminalTab';
import { MissionsTab } from './components/MissionsTab';
import { ProviderSimulator, PathID } from './components/ProviderSimulator';
import { LabsTab } from './components/LabsTab';
import { 
  Server, Terminal as TermIcon, Network, Award, RotateCcw, Cpu, Database, 
  HardDrive, Shield, HelpCircle, GraduationCap, CheckCircle, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabID = 'dashboard' | 'terminal' | 'providers' | 'missions' | 'labs';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabID>('labs'); // Start on labs so they see the training guidelines first!
  const [activeProvider, setActiveProvider] = useState<PathID>('none');
  const { state, xp, missions, resetServer } = useSimulator();

  // Active services count
  const runningServicesCount = Object.values(state.services).filter(s => s === 'running').length;
  const totalServices = Object.keys(state.services).length;

  // Active DNS domains
  const activeDomainsCount = state.dnsRecords.length;

  // Completed missions
  const completedMissionsCount = missions.filter(m => m.completed).length;

  const tabs = [
    { id: 'labs', label: 'Academy & Labs', icon: <GraduationCap className="w-4 h-4 text-yellow-400" /> },
    { id: 'missions', label: 'Support Tickets', icon: <Award className="w-4 h-4" />, badge: missions.filter(m => !m.completed).length },
    { id: 'dashboard', label: 'Server Metrics', icon: <Cpu className="w-4 h-4" /> },
    { id: 'terminal', label: 'Terminal CLI', icon: <TermIcon className="w-4 h-4" /> },
    { id: 'providers', label: 'Provider Clones', icon: <Server className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ================= HEADER BAR ================= */}
      <header className="bg-[#0a0a0c] border-b border-white/5 px-6 py-3.5 shrink-0 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 select-none shrink-0">
            <div className="w-9 h-9 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan font-sans">
              <Server className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-base font-bold font-display tracking-tight text-white uppercase block">HostLab</span>
              <span className="text-[10px] text-slate-500 font-mono leading-none flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Interactive Hosting Simulator
              </span>
            </div>
          </div>

          {/* Core Hardware Metrics Grid */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 select-none">
            {/* CPU Mini bar */}
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1 font-semibold leading-none">
                  <span>vCPU</span>
                  <span className="text-cyan-400">14%</span>
                </div>
                <div className="w-20 h-1 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded shadow-glow-cyan w-[14%]" />
                </div>
              </div>
            </div>

            {/* RAM Mini bar */}
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1 font-semibold leading-none">
                  <span>RAM</span>
                  <span className="text-purple-400">42%</span>
                </div>
                <div className="w-20 h-1 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-purple-500 rounded w-[42%]" />
                </div>
              </div>
            </div>

            {/* Disk Mini bar */}
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1 font-semibold leading-none">
                  <span>DISK</span>
                  <span className="text-emerald-400">13%</span>
                </div>
                <div className="w-20 h-1 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded w-[13%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right actions: XP and Reset */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#0d0d12] border border-white/5 rounded px-3 py-1.5 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-400" />
              <div className="leading-none select-none">
                <span className="text-[10px] text-slate-500 font-mono block mb-0.5">ADMIN LEVEL</span>
                <span className="text-xs font-bold font-mono text-amber-400">
                  {xp >= 400 ? 'Expert' : xp >= 200 ? 'Intermediate' : 'Junior'} ({xp} XP)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to completely reset HostLab virtual server? All directory items, DNS records, and support ticket states will be restored to defaults.')) {
                  resetServer();
                  setActiveTab('missions');
                }
              }}
              title="Reset Simulator State"
              className="p-2.5 bg-[#0d0d12] hover:bg-[#15151a] hover:text-slate-100 border border-white/5 rounded text-slate-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ================= SECONDARY SUBHEADER/NAVIGATION ================= */}
      <nav className="bg-[#0a0a0c]/80 border-b border-white/5 py-3 px-6 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#050507] p-1 rounded-lg border border-white/5 shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as TabID)}
                  className={`relative flex items-center gap-2.5 px-4.5 py-2 rounded border text-xs font-semibold cursor-pointer transition-all duration-350 ${
                    isActive
                      ? 'bg-[#15151a] border-white/10 text-cyan-400 font-bold shadow-glow-cyan'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span className="font-display font-medium tracking-wide">{tab.label}</span>
                  
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded leading-none shrink-0 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-5 text-[11px] font-mono text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald animate-pulse"></span>
              <span>Services: <strong className="text-slate-300 font-semibold">{runningServicesCount}/{totalServices} Running</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>DNS Zones: <strong className="text-slate-300 font-semibold">{activeDomainsCount} Maps</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resolved: <strong className="text-slate-300 font-semibold">{completedMissionsCount}/{missions.length}</strong></span>
            </div>
          </div>

        </div>
      </nav>

      {/* ================= MAIN INTERACTIVE SECTION ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 min-h-0 min-w-0"
          >
            {activeTab === 'labs' && <LabsTab setActiveTab={setActiveTab} setActiveProvider={setActiveProvider} />}
            {activeTab === 'missions' && <MissionsTab />}
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'terminal' && <TerminalTab />}
            {activeTab === 'providers' && <ProviderSimulator activePath={activeProvider} setActivePath={setActiveProvider} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ================= FOOTER / STATUS BAR ================= */}
      <footer className="bg-[#060608] border-t border-white/5 px-6 py-3.5 shrink-0 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-550 font-mono">
          <span>Ubuntu v24.04 Kernel Sandbox Engine. Fully Interactive Virtual State</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-500" /> HostLab Education Environment Secured
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SimulatorProvider>
      <AppContent />
    </SimulatorProvider>
  );
}

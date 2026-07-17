import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSimulatorStore } from './stores/useSimulatorStore';
import { useMissionStore } from './stores/useMissionStore';
import { useUIStore } from './stores/useUIStore';
import { useMissionWatcher } from './hooks/useMissionWatcher';
import { useAuthStore } from './stores/useAuthStore';
import { useDbSync } from './hooks/useDbSync';
import { Auth } from './components/Auth';
import { StudyCompanionPanel } from './components/StudyCompanionPanel';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import {
  Server, Terminal as TermIcon, Award, RotateCcw, Cpu, Database,
  HardDrive, Shield, GraduationCap, Network, Sun, Moon,
  User, LogOut, Maximize, Minimize, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Globe as GlobeIcon } from 'lucide-react';

const NAV_TABS = [
  { path: '/app/labs',      label: 'Academy & Labs',   icon: <GraduationCap className="w-4 h-4 text-yellow-400" /> },
  { path: '/app/missions',  label: 'Support Tickets',  icon: <Award className="w-4 h-4" /> },
  { path: '/app/dashboard', label: 'Server Metrics',   icon: <Cpu className="w-4 h-4" /> },
  { path: '/app/terminal',  label: 'Terminal CLI',     icon: <TermIcon className="w-4 h-4" /> },
  { path: '/app/browser',   label: 'Mock Browser',     icon: <GlobeIcon className="w-4 h-4 text-blue-400" /> },
  { path: '/app/providers', label: 'Provider Clones',  icon: <Server className="w-4 h-4" /> },
] as const;

const AppContent: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  
  // Sync state with local PostgreSQL db
  const { syncLoading } = useDbSync();

  // Reactive mission validation
  useMissionWatcher();

  const { state, resetServer } = useSimulator();
  const { missions, xp } = useMissionStore();
  const { theme, toggleTheme, companionOpen, toggleCompanion, fullScreen, toggleFullScreen } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = !!document.fullscreenElement;
      if (isNativeFull !== fullScreen) {
        toggleFullScreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fullScreen, toggleFullScreen]);

  if (!isLoggedIn) {
    return <Auth />;
  }

  if (syncLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center font-mono text-xs text-cyan-400 select-none">
        <Server className="w-12 h-12 text-cyan-400 animate-pulse mb-4" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Restoring sandbox environment from PostgreSQL...</span>
        </div>
      </div>
    );
  }

  const services = state?.services || {};
  const dnsRecords = state?.dnsRecords || [];
  const runningServicesCount = Object.values(services).filter(s => s === 'running').length;
  const totalServices = Object.keys(services).length;
  const safeMissions = missions || [];
  const completedMissionsCount = safeMissions.filter(m => m.completed).length;
  const pendingTickets = safeMissions.filter(m => !m.completed).length;

  const handleReset = () => {
    if (confirm('Reset HostLab virtual server? All changes, DNS records, and mission states will be restored to defaults.')) {
      resetServer();
      navigate('/app/missions');
    }
  };

  const adminLevel = xp >= 400 ? 'Expert' : xp >= 200 ? 'Intermediate' : 'Junior';

  return (
    <div className={`min-h-screen flex flex-col bg-[#08080c] text-slate-350 font-sans antialiased`}>
      
      {/* ================= HEADER BAR ================= */}
      {!fullScreen && (
        <header className="bg-[#050508]/90 border-b border-white/5 px-6 py-4 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider font-display">HostLab Simulator</h1>
              <p className="text-[10px] text-cyan-400 font-mono">Kernel Core Sandbox v2.4</p>
            </div>
          </div>

          {/* Right: Actions & User Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleCompanion}
              title={companionOpen ? 'Disable Study Companion' : 'Enable Study Companion'}
              className={`p-2.5 border rounded transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 text-xs font-semibold ${
                companionOpen
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                  : 'bg-[#0d0d12] hover:bg-[#15151a] border-white/5 text-slate-400 hover:text-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Companion</span>
            </button>

            <button
              onClick={handleReset}
              title="Reset Simulator State"
              className="p-2.5 bg-[#0d0d12] hover:bg-[#15151a] border border-white/5 rounded text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFullScreen}
              title="Enter Full Screen"
              className="p-2.5 bg-[#0d0d12] hover:bg-[#15151a] border border-white/5 rounded text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer hidden sm:block"
            >
              <Maximize className="w-4 h-4" />
            </button>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(o => !o)}
                title="Account & Settings"
                className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-xl border border-white/5 transition-all cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[900]" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0c0d12] border border-white/10 rounded-xl shadow-2xl p-4 z-[1000] animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col gap-3 text-slate-350">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block mb-0.5 font-bold uppercase tracking-wider">Profile</span>
                      <strong className="text-xs font-bold text-slate-200 font-mono block truncate" title={user?.username}>
                        {user?.username}
                      </strong>
                    </div>
                    
                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block mb-0.5 font-bold uppercase tracking-wider">Admin Level</span>
                      <span className="text-xs font-bold font-mono text-amber-400">{adminLevel} ({xp} XP)</span>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-400">Theme</span>
                      <button
                        onClick={() => { toggleTheme(); setProfileMenuOpen(false); }}
                        className="p-2 bg-[#050507] hover:bg-[#15151a] border border-white/5 rounded-lg text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
                      >
                        {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-500" /> : <Sun className="w-3.5 h-3.5 text-yellow-400" />}
                      </button>
                    </div>

                    <div className="h-px bg-white/5" />

                    <button
                      onClick={() => { logout(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      )}

      {/* ================= NAVIGATION BAR ================= */}
      {!fullScreen && (
        <nav className="bg-[#0a0a0c]/80 border-b border-white/5 py-3 px-6 select-none shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar max-w-full items-center gap-1.5 bg-[#050507] p-1 rounded-lg border border-white/5 shrink-0">
            {NAV_TABS.map((tab) => {
              const isProviders = tab.path === '/app/providers';
              const isActive = isProviders
                ? location.pathname.startsWith('/app/providers')
                : location.pathname.startsWith(tab.path);

              const ticketBadge = tab.path === '/app/missions' ? pendingTickets : 0;

              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  id={`tab-btn-${tab.path.slice(1)}`}
                  className={[
                    'relative flex items-center gap-2.5 px-4 py-2 rounded border text-xs font-semibold cursor-pointer transition-all duration-200',
                    isActive
                      ? 'bg-[#15151a] border-white/10 text-cyan-400 font-bold shadow-[var(--shadow-glow-cyan)]'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200',
                  ].join(' ')}
                >
                  {tab.icon}
                  <span className="font-medium tracking-wide">{tab.label}</span>
                  {ticketBadge > 0 && (
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded leading-none shrink-0 animate-pulse">
                      {ticketBadge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
      )}

      {/* ================= MAIN CONTENT (routed tabs) ================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 min-h-0 flex flex-col lg:flex-row gap-6">
        <main className="flex-1 min-h-0 min-w-0 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 min-w-0 flex flex-col [&>*]:flex-1 [&>*]:min-h-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Companion Sidebar Panel */}
        <AnimatePresence>
          {companionOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:static top-0 right-0 h-screen lg:h-auto z-[999] lg:z-auto w-[280px] sm:w-[320px] lg:w-[320px] flex flex-col shrink-0 min-h-0 bg-black/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-4 lg:p-0"
            >
              <StudyCompanionPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ================= FOOTER ================= */}
      {!fullScreen && (
        <footer className="bg-[#060608] border-t border-white/5 px-6 py-3.5 shrink-0 text-center select-none">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>Ubuntu v24.04 Kernel Sandbox Engine. Fully Interactive Virtual State</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-500" /> HostLab Education Environment Secured
            </span>
          </div>
        </footer>
      )}

       {/* Floating Exit Full Screen Button */}
      {fullScreen && (
        <button
          onClick={handleToggleFullScreen}
          className="fixed bottom-6 left-6 z-[1000] p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center cursor-pointer group"
          title="Exit Full Screen"
        >
          <Minimize className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SimulatorProvider>
      <AppContent />
    </SimulatorProvider>
  );
}

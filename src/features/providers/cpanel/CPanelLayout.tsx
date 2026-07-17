import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Home,
  Wrench,
  Lightbulb,
  Globe,
  BarChart2,
  Shield,
  Package,
} from 'lucide-react';
import { CPanelStatsSidebar } from './CPanelStatsSidebar';

const NAV_ITEMS = [
  { icon: Home,     label: 'Home',       path: '/app/providers/cpanel' },
  { icon: Wrench,   label: 'Tools',      path: '/app/providers/cpanel' },
  { icon: Globe,    label: 'Domains',    path: '/app/providers/cpanel' },
  { icon: Shield,   label: 'Security',   path: '/app/providers/cpanel' },
  { icon: Package,  label: 'Software',   path: '/app/providers/cpanel' },
  { icon: BarChart2,label: 'Metrics',    path: '/app/providers/cpanel' },
  { icon: Lightbulb,label: 'Solutions',  path: '/app/providers/cpanel' },
];

export const CPanelLayout: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [search, setSearch]     = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Tools');

  const isZoneEditor = location.pathname.includes('zone-editor');

  return (
    <div
      className="flex flex-col flex-1 min-h-0 min-w-0 bg-[#f4f6f8] text-[#333333]"
      style={{ fontFamily: '"Open Sans", sans-serif' }}
    >
      {/* ─── Top Navigation Bar ─── */}
      <header className="h-[52px] bg-[#ffffff] border-b border-[#eaeaea] flex items-center justify-between px-3 sm:px-5 shrink-0 z-30 shadow-sm">
        {/* Left: brand + search */}
        <div className="flex items-center gap-2 sm:gap-5 flex-1 min-w-0">
          {/* cPanel Logo */}
          <div
            className="flex items-center gap-1 cursor-pointer shrink-0"
            onClick={() => navigate('/app/providers/cpanel')}
          >
            <span className="text-[20px] font-black tracking-tight text-[#333333]">c</span>
            <span className="text-[20px] font-black tracking-tight text-[#ee7623]">Panel</span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block h-6 w-px bg-[#eaeaea] shrink-0" />

          {/* Search Bar */}
          <div className="relative flex-1 max-w-[520px] min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaaaaa] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Find a feature"
              className="w-full bg-[#f4f6f8] border border-[#eaeaea] rounded-md py-[7px] pl-9 pr-4 text-[13px] text-[#333333] placeholder-[#aaaaaa] focus:outline-none focus:border-[#ee7623] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-1 ml-2 sm:ml-4 shrink-0">
          <button className="hidden sm:block p-2 hover:bg-[#f4f6f8] rounded text-[#777777] hover:text-[#333333] transition-colors cursor-pointer">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="hidden sm:block p-2 hover:bg-[#f4f6f8] rounded text-[#777777] hover:text-[#333333] transition-colors cursor-pointer relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ee7623] rounded-full" />
          </button>
          <div className="hidden sm:block w-px h-5 bg-[#eaeaea] mx-1" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserOpen(v => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#f4f6f8] rounded cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#ee7623] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                AD
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[12px] font-semibold text-[#333333] leading-none">admin</div>
                <div className="text-[10px] text-[#777777] leading-none mt-0.5">example.com</div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#777777]" />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-full mt-1 w-[180px] bg-white border border-[#eaeaea] rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-2 border-b border-[#eaeaea]">
                  <div className="text-[12px] font-semibold text-[#333333]">admin</div>
                  <div className="text-[11px] text-[#777777]">admin@example.com</div>
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333333] hover:bg-[#f4f6f8] transition-colors cursor-pointer">
                  <User className="w-3.5 h-3.5 text-[#777777]" /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333333] hover:bg-[#f4f6f8] transition-colors cursor-pointer">
                  <Settings className="w-3.5 h-3.5 text-[#777777]" /> Preferences
                </button>
                <div className="border-t border-[#eaeaea] mt-1" />
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Secondary Nav Bar ─── */}
      <nav className="h-[40px] bg-[#ffffff] border-b border-[#eaeaea] flex items-center px-5 gap-1 shrink-0 overflow-x-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = activeNav === label;
          return (
            <button
              key={label}
              onClick={() => { setActiveNav(label); navigate(path); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'text-[#ee7623] bg-[#fff4ec]'
                  : 'text-[#555555] hover:text-[#333333] hover:bg-[#f4f6f8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="bg-[#f4f6f8] border-b border-[#eaeaea] px-6 py-2 flex items-center gap-1.5 text-[11px] text-[#777777] shrink-0">
            <span
              className="text-[#ee7623] font-semibold cursor-pointer hover:underline"
              onClick={() => navigate('/app/providers/cpanel')}
            >
              Home
            </span>
            {isZoneEditor && (
              <>
                <span className="text-[#cccccc]">/</span>
                <span className="text-[#777777]">Domains</span>
                <span className="text-[#cccccc]">/</span>
                <span className="text-[#333333] font-semibold">Zone Editor</span>
              </>
            )}
          </div>

          <div className="p-6">
            <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-6">
              {/* Tool content */}
              <div className="flex-1 min-w-0">
                <Outlet />
              </div>

              {/* Stats sidebar — always visible */}
              {!isZoneEditor && (
                <div className="w-full xl:w-[300px] shrink-0">
                  <CPanelStatsSidebar />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Click-away for user menu */}
      {userOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserOpen(false)}
        />
      )}
    </div>
  );
};

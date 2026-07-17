import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Droplets,
  Box,
  Zap,
  Database,
  HardDrive,
  Network,
  Globe,
  Activity,
  Bell,
  Search,
  ChevronDown,
  Plus,
  User,
  Server,
  Shield,
  CreditCard,
  Users,
  BarChart2,
  ChevronRight,
} from 'lucide-react';

/* ─── nav structure ────────────────────────────────────────────── */
const NAV = [
  {
    section: 'MANAGE',
    items: [
      { label: 'Droplets',       icon: Droplets,  path: '/app/providers/digitalocean',        active: true },
      { label: 'Kubernetes',     icon: Box,        path: '#kubernetes' },
      { label: 'Apps',           icon: Zap,        path: '#apps' },
      { label: 'Functions',      icon: Zap,        path: '#functions' },
      { label: 'Databases',      icon: Database,   path: '#databases' },
      { label: 'Spaces',         icon: HardDrive,  path: '#spaces' },
      { label: 'Load Balancers', icon: Network,    path: '#lb' },
      { label: 'Networking',     icon: Globe,      path: '#networking' },
    ],
  },
  {
    section: 'MONITOR',
    items: [
      { label: 'Uptime',  icon: Activity,  path: '#uptime' },
      { label: 'Alerts',  icon: Bell,      path: '#alerts' },
    ],
  },
  {
    section: 'SETTINGS',
    items: [
      { label: 'Teams',   icon: Users,      path: '#teams' },
      { label: 'Billing', icon: CreditCard, path: '#billing' },
    ],
  },
] as const;

/* ─── Create dropdown options ──────────────────────────────────── */
const CREATE_ITEMS = [
  { label: 'Droplet',       icon: Server },
  { label: 'Kubernetes',    icon: Box },
  { label: 'App',           icon: Zap },
  { label: 'Database',      icon: Database },
  { label: 'Space',         icon: HardDrive },
  { label: 'Load Balancer', icon: Network },
  { label: 'Domain',        icon: Globe },
];

/* ─── component ────────────────────────────────────────────────── */
export const DOLayout: React.FC = () => {
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const isDroplets =
    location.pathname === '/app/providers/digitalocean' ||
    location.pathname.startsWith('/app/providers/digitalocean/droplets');

  // breadcrumb segments
  const crumbs = ['my-team', 'default-project', isDroplets ? 'Droplets' : 'DigitalOcean'];

  return (
    <div
      className="flex flex-col h-full text-[#031B4E]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* ═══ TOP BAR ════════════════════════════════════════════════ */}
      <header className="h-[56px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-5 shrink-0 z-20 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-[#64748B]">
          {crumbs.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-[#CBD5E1]" />}
              <span
                className={
                  i === crumbs.length - 1
                    ? 'text-[#031B4E] font-semibold'
                    : 'hover:text-[#0069FF] cursor-pointer transition-colors'
                }
              >
                {c}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search DigitalOcean..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-md border border-[#E2E8F0] text-[13px] text-[#031B4E] placeholder-[#94A3B8] bg-[#F8FAFC] focus:outline-none focus:border-[#0069FF] focus:bg-white transition-all w-52 focus:w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#031B4E] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#0069FF] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#0069FF]/30 transition-all">
            <User className="w-4 h-4 text-white" />
          </div>

          {/* Create button */}
          <div className="relative">
            <button
              onClick={() => setCreateOpen(o => !o)}
              className="flex items-center gap-1.5 bg-[#02B37B] hover:bg-[#029668] text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-md transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {createOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setCreateOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-40 w-48 bg-white rounded-lg border border-[#E2E8F0] shadow-lg py-1 overflow-hidden">
                  {CREATE_ITEMS.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setCreateOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#031B4E] hover:bg-[#F8FAFC] transition-colors text-left"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#64748B]" />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══ BODY (sidebar + content) ═══════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
        <aside className="hidden md:flex w-[240px] bg-[#212429] shrink-0 overflow-y-auto flex-col">

          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#0069FF] flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight">DigitalOcean</span>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 px-2 pt-4 pb-6 space-y-5">
            {NAV.map(({ section, items }) => (
              <div key={section}>
                {/* Section heading */}
                <div className="px-3 mb-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-[#6c7f8e] uppercase">
                    {section}
                  </span>
                </div>

                {/* Items */}
                <ul className="space-y-0.5">
                  {items.map(({ label, icon: Icon, path }) => {
                    const isActive =
                      path === '/app/providers/digitalocean'
                        ? isDroplets
                        : location.pathname === path;

                    return (
                      <li key={label}>
                        {path.startsWith('#') ? (
                          <button
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors text-left ${
                              isActive
                                ? 'bg-[#2e3338] text-white'
                                : 'text-[#9aa5b1] hover:text-white hover:bg-[#2e3338]/60'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            {label}
                          </button>
                        ) : (
                          <NavLink
                            to={path}
                            end
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                              isActive
                                ? 'bg-[#2e3338] text-white'
                                : 'text-[#9aa5b1] hover:text-white hover:bg-[#2e3338]/60'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            {label}
                          </NavLink>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer: Account/Upgrade */}
          <div className="border-t border-white/5 px-3 py-3">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-[#9aa5b1] hover:text-white hover:bg-[#2e3338]/60 transition-colors">
              <BarChart2 className="w-4 h-4 shrink-0" />
              Usage &amp; Billing
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-[#9aa5b1] hover:text-white hover:bg-[#2e3338]/60 transition-colors">
              <Shield className="w-4 h-4 shrink-0" />
              Security
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F4F5F7]">
          <div className="max-w-[1100px] mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

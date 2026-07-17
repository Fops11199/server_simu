import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Image,
  Clock,
  HardDrive,
  LifeBuoy,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Plus,
  Bell,
  LogOut,
  User,
  CreditCard,
  Shield,
  Globe,
  Network,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, children }) => {
  const [open, setOpen] = useState(true);

  if (children) {
    return (
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-medium text-[#a1a1aa] hover:bg-[#3f3f46]/40 hover:text-[#f4f4f5] transition-colors group"
        >
          <span className="text-[#a1a1aa] group-hover:text-[#529EDE] transition-colors flex-shrink-0">
            {icon}
          </span>
          <span className="flex-1 text-left">{label}</span>
          {open ? (
            <ChevronDown size={14} className="text-[#71717a]" />
          ) : (
            <ChevronRight size={14} className="text-[#71717a]" />
          )}
        </button>
        {open && (
          <div className="mt-0.5 ml-4 border-l border-[#3f3f46] pl-3 space-y-0.5">
            {children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-colors ${
                    isActive
                      ? 'text-[#529EDE] bg-[#195DAD]/10 font-medium'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#3f3f46]/40'
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (to) {
    return (
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-medium transition-colors group ${
            isActive
              ? 'text-[#529EDE] bg-[#195DAD]/10'
              : 'text-[#a1a1aa] hover:bg-[#3f3f46]/40 hover:text-[#f4f4f5]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#195DAD] rounded-r-full" />
            )}
            <span
              className={`flex-shrink-0 transition-colors ${
                isActive
                  ? 'text-[#529EDE]'
                  : 'text-[#a1a1aa] group-hover:text-[#529EDE]'
              }`}
            >
              {icon}
            </span>
            <span>{label}</span>
          </>
        )}
      </NavLink>
    );
  }

  return null;
};

// ─── Account Dropdown ─────────────────────────────────────────────────────────

const AccountDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="absolute right-0 top-full mt-2 w-[220px] bg-[#27272a] border border-[#3f3f46] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
    onMouseLeave={onClose}
  >
    <div className="px-4 py-3 border-b border-[#3f3f46]">
      <p className="text-[13px] font-semibold text-[#f4f4f5]">John Doe</p>
      <p className="text-[12px] text-[#71717a] mt-0.5">john.doe@example.com</p>
      <p className="text-[11px] text-[#195DAD] mt-1 font-medium">Customer #847291</p>
    </div>
    <div className="py-1.5">
      {[
        { icon: <User size={14} />, label: 'Your Profile' },
        { icon: <CreditCard size={14} />, label: 'Billing & Invoices' },
        { icon: <Shield size={14} />, label: 'Security' },
      ].map(item => (
        <button
          key={item.label}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#3f3f46]/50 transition-colors"
        >
          <span className="text-[#71717a]">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
    <div className="border-t border-[#3f3f46] py-1.5">
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors">
        <LogOut size={14} />
        Sign Out
      </button>
    </div>
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const ContaboLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div
      className="flex flex-col h-full bg-[#18181b] text-[#f4f4f5] overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="h-[64px] bg-[#18181b] border-b border-[#3f3f46] flex items-center justify-between px-5 shrink-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 bg-[#195DAD] rounded-lg flex items-center justify-center shadow-lg shadow-[#195DAD]/30">
              <span className="text-white font-black text-[15px] leading-none tracking-tighter">C</span>
            </div>
            <span className="text-[#f4f4f5] font-semibold text-[17px] tracking-tight">
              contabo
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-3 text-[13px]">
            <span className="text-[#3f3f46]">|</span>
            <span className="text-[#71717a]">Customer Control Panel</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#195DAD] rounded-full" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(v => !v)}
            className="p-2 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Create button with dropdown */}
          <div className="relative">
            <button
              onClick={() => setCreateOpen(v => !v)}
              className="flex items-center gap-2 bg-[#195DAD] hover:bg-[#1a6dc9] text-white px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-all shadow-lg shadow-[#195DAD]/25 border border-[#195DAD]/50"
            >
              <Plus size={15} strokeWidth={2.5} />
              Create
              <ChevronDown size={13} />
            </button>
            {createOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-[190px] bg-[#27272a] border border-[#3f3f46] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden py-1.5"
                onMouseLeave={() => setCreateOpen(false)}
              >
                {[
                  { icon: <Server size={13} />, label: 'VPS / VDS' },
                  { icon: <HardDrive size={13} />, label: 'Object Storage' },
                  { icon: <Network size={13} />, label: 'Private Network' },
                ].map(item => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#3f3f46]/50 transition-colors"
                  >
                    <span className="text-[#529EDE]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div
            className="relative"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <button className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-[#27272a] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#195DAD] to-[#529EDE] flex items-center justify-center text-[12px] font-bold text-white shadow-md">
                JD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-semibold text-[#f4f4f5] leading-tight">John Doe</p>
                <p className="text-[11px] text-[#71717a] leading-tight">Admin</p>
              </div>
              <ChevronDown size={13} className="text-[#71717a]" />
            </button>
            {accountOpen && <AccountDropdown onClose={() => setAccountOpen(false)} />}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden md:flex w-[250px] bg-[#1c1c1f] border-r border-[#3f3f46] shrink-0 overflow-y-auto flex-col">
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" to="/app/providers/contabo" />

            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#52525b]">
                Compute
              </p>
            </div>

            <NavItem
              icon={<Server size={16} />}
              label="VPS / VDS"
              children={[
                { label: 'Instances', to: '/app/providers/contabo' },
                { label: 'Images', to: '#' },
                { label: 'VPS Auto Backup', to: '#' },
                { label: 'Private Snapshots', to: '#' },
              ]}
            />

            <NavItem icon={<Zap size={16} />} label="Dedicated Servers" to="#" />

            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#52525b]">
                Storage
              </p>
            </div>

            <NavItem icon={<HardDrive size={16} />} label="Object Storage" to="#" />
            <NavItem icon={<Globe size={16} />} label="DNS Zones" to="#" />

            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#52525b]">
                Networking
              </p>
            </div>

            <NavItem icon={<Network size={16} />} label="Private Networks" to="#" />
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 py-4 border-t border-[#3f3f46] space-y-1">
            <NavItem icon={<LifeBuoy size={16} />} label="Support" to="#" />
            <NavItem icon={<Settings size={16} />} label="Account Settings" to="#" />

            {/* Balance widget */}
            <div className="mt-3 mx-1 bg-[#195DAD]/10 border border-[#195DAD]/20 rounded-lg px-3 py-3">
              <p className="text-[11px] font-semibold text-[#529EDE] mb-0.5">Current Balance</p>
              <p className="text-[18px] font-bold text-[#f4f4f5]">€ 24.30</p>
              <p className="text-[11px] text-[#71717a] mt-0.5">Next invoice: Aug 1, 2026</p>
              <button className="mt-2.5 w-full bg-[#195DAD]/20 hover:bg-[#195DAD]/30 border border-[#195DAD]/30 text-[#529EDE] text-[12px] font-medium py-1.5 rounded-md transition-colors">
                Add Credit
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#18181b]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ContaboLayout;

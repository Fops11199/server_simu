import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Zap,
  Search,
  HelpCircle,
  Bell,
  Home,
  Globe,
  Server,
  Mail,
  Link2,
  Cpu,
  CreditCard,
  ChevronDown,
  Settings,
  LogOut,
  User,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',    icon: <Home       size={18} />, to: '/app/providers/hostinger' },
  { label: 'Websites',icon: <Globe      size={18} />, to: '#websites' },
  { label: 'Hosting', icon: <Server     size={18} />, to: '#hosting' },
  { label: 'Emails',  icon: <Mail       size={18} />, to: '#emails' },
  { label: 'Domains', icon: <Link2      size={18} />, to: '#domains' },
  { label: 'VPS',     icon: <Cpu        size={18} />, to: '/app/providers/hostinger' },
  { label: 'Billing', icon: <CreditCard size={18} />, to: '#billing' },
  { label: 'Help',    icon: <HelpCircle size={18} />, to: '#help' },
];

// ─── Notification data ────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, title: 'hostlab-vps-1 rebooted successfully', time: '2 min ago',  read: false, color: '#00B090' },
  { id: 2, title: 'Invoice #INV-2026-07 is ready',       time: '1 hr ago',   read: false, color: '#674CC4' },
  { id: 3, title: 'Snapshot backup completed',            time: '3 hrs ago',  read: true,  color: '#727586' },
];

// ─── Notification Panel ───────────────────────────────────────────────────────

const NotificationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-xl z-50"
    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
      <span className="font-semibold text-[#2D3136] text-[14px]">Notifications</span>
      <button onClick={onClose} className="text-[#727586] hover:text-[#2D3136] transition-colors p-0.5 rounded">
        <X size={14} />
      </button>
    </div>
    <ul className="divide-y divide-[#F3F4F6]">
      {NOTIFICATIONS.map((n) => (
        <li
          key={n.id}
          className={`px-4 py-3 flex gap-3 items-start cursor-pointer hover:bg-[#F9FAFB] transition-colors ${!n.read ? 'bg-[#FAFAFF]' : ''}`}
        >
          <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: n.color }} />
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] leading-snug ${n.read ? 'text-[#727586]' : 'text-[#2D3136] font-medium'}`}>{n.title}</p>
            <p className="text-[11px] text-[#A3A8B4] mt-0.5">{n.time}</p>
          </div>
          {!n.read && <span className="w-2 h-2 rounded-full bg-[#674CC4] shrink-0 mt-1.5" />}
        </li>
      ))}
    </ul>
    <div className="px-4 py-2.5 border-t border-[#E5E7EB]">
      <button className="text-[13px] text-[#674CC4] font-medium hover:underline w-full text-center">
        View all notifications
      </button>
    </div>
  </div>
);

// ─── User Menu ────────────────────────────────────────────────────────────────

const UserMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#E5E7EB] rounded-xl z-50"
    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="px-4 py-3 border-b border-[#E5E7EB]">
      <p className="font-semibold text-[#2D3136] text-[14px]">John Doe</p>
      <p className="text-[12px] text-[#727586]">john@hostlab.dev</p>
    </div>
    <ul className="py-1">
      {[
        { icon: <User       size={14} />, label: 'My Profile' },
        { icon: <Settings   size={14} />, label: 'Account Settings' },
        { icon: <CreditCard size={14} />, label: 'Billing' },
      ].map((item) => (
        <li key={item.label}>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#374151] hover:bg-[#F4F5F7] transition-colors"
          >
            <span className="text-[#727586]">{item.icon}</span>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
    <div className="border-t border-[#E5E7EB] py-1">
      <button
        onClick={onClose}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
      >
        <LogOut size={14} />
        Sign out
      </button>
    </div>
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const HostingerLayout: React.FC = () => {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser,   setShowUser]   = useState(false);
  const [searchVal,  setSearchVal]  = useState('');

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  const closeAll = () => {
    setShowNotifs(false);
    setShowUser(false);
  };

  return (
    <div
      className="flex flex-col h-full bg-[#F4F5F7] text-[#2D3136]"
      style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
      onClick={closeAll}
    >
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <header className="h-[64px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/app/providers/hostinger'); }}
            className="flex items-center gap-2 select-none"
          >
            <div className="w-8 h-8 bg-[#674CC4] rounded-lg flex items-center justify-center shadow-sm">
              <Zap size={17} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="font-extrabold text-[20px] tracking-tight text-[#674CC4] leading-none">
              Hostinger
            </span>
          </button>

          <div
            className="hidden md:flex items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A8B4] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search hPanel..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-[#F4F5F7] border border-transparent rounded-lg py-2 pl-9 pr-4 text-[13px] text-[#2D3136] placeholder-[#A3A8B4] focus:outline-none focus:border-[#674CC4] focus:bg-white w-60 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-2 text-[#727586] hover:text-[#674CC4] hover:bg-[#F0EDFA] rounded-lg transition-colors">
            <HelpCircle size={20} />
          </button>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifs((v) => !v); setShowUser(false); }}
              className="p-2 text-[#727586] hover:text-[#674CC4] hover:bg-[#F0EDFA] rounded-lg transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-[7px] right-[7px] w-[8px] h-[8px] bg-[#EF4444] rounded-full border-2 border-white" />
              )}
            </button>
            {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
          </div>

          {/* Avatar */}
          <div className="relative ml-1">
            <button
              onClick={() => { setShowUser((v) => !v); setShowNotifs(false); }}
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg hover:bg-[#F4F5F7] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#674CC4] flex items-center justify-center text-white font-bold text-[12px] shadow-sm select-none">
                JD
              </div>
              <ChevronDown size={13} className="text-[#A3A8B4]" />
            </button>
            {showUser && <UserMenu onClose={() => setShowUser(false)} />}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden md:flex w-[260px] bg-white border-r border-[#E5E7EB] shrink-0 flex-col overflow-y-auto">
          {/* Account chip */}
          <div className="px-4 pt-5 pb-4 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-3 bg-[#F4F5F7] rounded-xl px-3 py-2.5 cursor-pointer hover:bg-[#ECEDF0] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#674CC4] flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#2D3136] truncate">John Doe</p>
                <p className="text-[11px] text-[#727586] truncate">Developer plan</p>
              </div>
              <ChevronDown size={13} className="text-[#A3A8B4] shrink-0" />
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3 py-3 flex-1 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isVps  = item.label === 'VPS';
              const isHash = item.to.startsWith('#');

              if (isHash) {
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-[11px] rounded-lg font-medium text-[14px] text-[#727586] hover:bg-[#F4F5F7] hover:text-[#2D3136] transition-colors"
                  >
                    <span className="shrink-0 text-[#A3A8B4]">{item.icon}</span>
                    {item.label}
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={isVps}
                  onClick={(e) => e.stopPropagation()}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 px-3 py-[11px] rounded-lg font-medium text-[14px] transition-colors relative',
                      isActive || isVps
                        ? 'bg-[#F0EDFA] text-[#674CC4]'
                        : 'text-[#727586] hover:bg-[#F4F5F7] hover:text-[#2D3136]',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {(isActive || isVps) && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[24px] bg-[#674CC4] rounded-r-full" />
                      )}
                      <span className={`shrink-0 ${(isActive || isVps) ? 'text-[#674CC4]' : 'text-[#A3A8B4]'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {isVps && (
                        <span className="text-[11px] font-semibold bg-[#674CC4] text-white px-1.5 py-0.5 rounded-full leading-none">
                          2
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar footer callout */}
          <div className="px-4 pb-5 pt-3 border-t border-[#F3F4F6]">
            <div className="bg-[#F0EDFA] rounded-xl p-3.5">
              <p className="text-[12px] font-semibold text-[#674CC4] mb-1">Need help?</p>
              <p className="text-[11px] text-[#727586] leading-snug mb-3">
                Chat with our experts 24/7 or browse the knowledge base.
              </p>
              <button className="w-full bg-[#674CC4] hover:bg-[#5236A5] text-white text-[12px] font-semibold rounded-lg py-1.5 transition-colors">
                Get Support
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F4F5F7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

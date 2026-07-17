import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Server } from 'lucide-react';

const PROVIDERS = [
  { path: '/app/providers/cpanel',      label: 'cPanel',        emoji: '🖥️' },
  { path: '/app/providers/contabo',     label: 'Contabo',       emoji: '🇩🇪' },
  { path: '/app/providers/aws',         label: 'AWS',           emoji: '☁️' },
  { path: '/app/providers/digitalocean', label: 'DigitalOcean', emoji: '🌊' },
  { path: '/app/providers/hostinger',   label: 'Hostinger',     emoji: '🟠' },
] as const;

export const ProviderSimulator: React.FC = () => {
  const location = useLocation();
  const isHub = location.pathname === '/app/providers';

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Server className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200 font-display">Provider Clones</h2>
          <p className="text-[11px] text-slate-500 font-mono">Interactive replicas of real hosting control panels</p>
        </div>
      </div>

      {/* Provider Nav */}
      <div className="flex flex-wrap gap-2">
        {PROVIDERS.map(p => (
          <NavLink
            key={p.path}
            to={p.path}
            className={({ isActive }) => [
              'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-[var(--color-bg-surface)] border-[var(--color-border)] text-slate-400 hover:text-slate-200 hover:border-[var(--color-border-strong)]',
            ].join(' ')}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Provider Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isHub ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-4xl">🖥️</div>
            <div>
              <h3 className="text-slate-300 font-semibold mb-1">Choose a Provider</h3>
              <p className="text-slate-500 text-sm">Select a hosting panel above to explore its interface</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {PROVIDERS.map(p => (
                <NavLink
                  key={p.path}
                  to={p.path}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-200 cursor-pointer"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-sm font-medium text-slate-300">{p.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

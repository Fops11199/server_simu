import React, { useState } from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import {
  Search,
  Plus,
  MoreVertical,
  RefreshCw,
  Power,
  Square,
  ExternalLink,
  Copy,
  MapPin,
  Calendar,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Filter,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Status = 'running' | 'stopped' | 'pending';

interface VpsInstance {
  id: string;
  name: string;
  status: Status;
  os: string;
  osVersion: string;
  cpu: number;
  ram: number;
  disk: number;
  diskType: string;
  ip: string;
  location: string;
  locationCode: string;
  plan: string;
  created: string;
  contractEnd: string;
  ipv6?: string;
}

const BASE_INSTANCES: VpsInstance[] = [
  {
    id: 'vmi-20241001',
    name: 'vps-web-01',
    status: 'running',
    os: 'Ubuntu',
    osVersion: '22.04 LTS',
    cpu: 4,
    ram: 8,
    disk: 200,
    diskType: 'NVMe SSD',
    ip: '203.0.113.10',
    ipv6: '2a02:4780::1',
    location: 'Frankfurt',
    locationCode: 'EU-DE-FRA',
    plan: 'Cloud VPS M',
    created: '2026-01-15',
    contractEnd: '2026-08-15',
  },
  {
    id: 'vmi-20242002',
    name: 'vps-db-server',
    status: 'stopped',
    os: 'Ubuntu',
    osVersion: '24.04 LTS',
    cpu: 8,
    ram: 16,
    disk: 400,
    diskType: 'NVMe SSD',
    ip: '198.51.100.45',
    location: 'Nuremberg',
    locationCode: 'EU-DE-NUE',
    plan: 'Cloud VPS XL',
    created: '2026-02-20',
    contractEnd: '2026-09-20',
  },
  {
    id: 'vmi-20243003',
    name: 'vps-staging',
    status: 'running',
    os: 'Debian',
    osVersion: '12 (Bookworm)',
    cpu: 2,
    ram: 4,
    disk: 100,
    diskType: 'SSD',
    ip: '192.0.2.78',
    location: 'Munich',
    locationCode: 'EU-DE-MUC',
    plan: 'Cloud VPS S',
    created: '2026-03-10',
    contractEnd: '2026-10-10',
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { dot: string; text: string; bg: string; label: string; icon: React.ReactNode }> = {
  running: {
    dot: 'bg-[#10b981]',
    text: 'text-[#10b981]',
    bg: 'bg-[#10b981]/10',
    label: 'Running',
    icon: <CheckCircle2 size={11} />,
  },
  stopped: {
    dot: 'bg-[#ef4444]',
    text: 'text-[#ef4444]',
    bg: 'bg-[#ef4444]/10',
    label: 'Stopped',
    icon: <XCircle size={11} />,
  },
  pending: {
    dot: 'bg-[#f59e0b]',
    text: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10',
    label: 'Pending',
    icon: <Clock size={11} />,
  },
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${cfg.text} ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'running' ? 'shadow-[0_0_0_2px_rgba(16,185,129,0.25)]' : ''}`} />
      {cfg.label}
    </span>
  );
};

const OsBadge: React.FC<{ os: string; version: string }> = ({ os, version }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#27272a] border border-[#3f3f46] text-[11.5px] text-[#a1a1aa] font-medium">
    {os} {version}
  </span>
);

// ─── Action Dropdown ──────────────────────────────────────────────────────────

const InstanceActions: React.FC<{ instance: VpsInstance; onClose: () => void }> = ({
  instance,
  onClose,
}) => (
  <div
    className="absolute right-6 top-12 w-[200px] bg-[#27272a] border border-[#3f3f46] rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden py-1.5"
    onMouseLeave={onClose}
  >
    {[
      { icon: <Power size={13} />, label: instance.status === 'running' ? 'Stop' : 'Start', color: instance.status === 'running' ? 'text-[#ef4444]' : 'text-[#10b981]' },
      { icon: <RefreshCw size={13} />, label: 'Restart', color: 'text-[#a1a1aa]' },
      { icon: <ExternalLink size={13} />, label: 'Open Console', color: 'text-[#a1a1aa]' },
      { icon: <Copy size={13} />, label: 'Clone Instance', color: 'text-[#a1a1aa]' },
    ].map(item => (
      <button
        key={item.label}
        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] ${item.color} hover:bg-[#3f3f46]/50 transition-colors`}
        onClick={onClose}
      >
        {item.icon}
        {item.label}
      </button>
    ))}
    <div className="border-t border-[#3f3f46] my-1" />
    <button
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
      onClick={onClose}
    >
      <Square size={13} />
      Delete Instance
    </button>
  </div>
);

// ─── Instance Row ─────────────────────────────────────────────────────────────

const InstanceRow: React.FC<{
  instance: VpsInstance;
  onSelect: (id: string) => void;
}> = ({ instance, onSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="relative flex items-center gap-4 px-6 py-4 border-b border-[#3f3f46]/60 hover:bg-[#27272a]/50 transition-colors group cursor-pointer"
      onClick={() => onSelect(instance.id)}
    >
      {/* Status dot */}
      <div className="flex-shrink-0 flex items-center justify-center w-10">
        <StatusBadge status={instance.status} />
      </div>

      {/* Instance name + OS */}
      <div className="min-w-[180px] flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-semibold text-[#f4f4f5] group-hover:text-[#529EDE] transition-colors">
            {instance.name}
          </span>
          <ChevronRight size={14} className="text-[#52525b] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-center gap-2">
          <OsBadge os={instance.os} version={instance.osVersion} />
          <span className="text-[11.5px] text-[#52525b]">{instance.id}</span>
        </div>
      </div>

      {/* Specs */}
      <div className="hidden lg:flex flex-col gap-1 min-w-[170px]">
        <div className="flex items-center gap-3 text-[12.5px] text-[#a1a1aa]">
          <span className="flex items-center gap-1">
            <Cpu size={11} className="text-[#52525b]" /> {instance.cpu} vCPU
          </span>
          <span className="text-[#3f3f46]">•</span>
          <span className="flex items-center gap-1">
            <MemoryStick size={11} className="text-[#52525b]" /> {instance.ram} GB RAM
          </span>
        </div>
        <div className="flex items-center gap-1 text-[12.5px] text-[#a1a1aa]">
          <HardDrive size={11} className="text-[#52525b]" />
          {instance.disk} GB {instance.diskType}
        </div>
      </div>

      {/* IP */}
      <div className="hidden md:block min-w-[150px]">
        <div
          className="flex items-center gap-1.5 text-[13px] text-[#a1a1aa] font-mono group/ip cursor-pointer"
          onClick={copyIp}
          title="Click to copy"
        >
          <Globe size={12} className="text-[#52525b] flex-shrink-0" />
          <span className="group-hover/ip:text-[#f4f4f5] transition-colors">{instance.ip}</span>
          <Copy
            size={11}
            className={`transition-all flex-shrink-0 ${copied ? 'text-[#10b981]' : 'text-[#52525b] opacity-0 group-hover/ip:opacity-100'}`}
          />
        </div>
        {instance.ipv6 && (
          <div className="text-[11.5px] text-[#52525b] font-mono mt-0.5 ml-4 truncate max-w-[130px]">
            {instance.ipv6}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="hidden lg:flex items-center gap-1.5 min-w-[110px] text-[13px] text-[#a1a1aa]">
        <MapPin size={12} className="text-[#52525b] flex-shrink-0" />
        <div>
          <div>{instance.location}</div>
          <div className="text-[11px] text-[#52525b]">{instance.locationCode}</div>
        </div>
      </div>

      {/* Created */}
      <div className="hidden xl:flex items-center gap-1.5 min-w-[100px] text-[12.5px] text-[#71717a]">
        <Calendar size={11} className="text-[#52525b] flex-shrink-0" />
        {instance.created}
      </div>

      {/* Plan badge */}
      <div className="hidden xl:block">
        <span className="px-2.5 py-1 bg-[#195DAD]/10 border border-[#195DAD]/20 rounded-full text-[11.5px] text-[#529EDE] font-medium whitespace-nowrap">
          {instance.plan}
        </span>
      </div>

      {/* Actions menu */}
      <div className="relative ml-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="p-2 rounded-lg text-[#52525b] hover:text-[#f4f4f5] hover:bg-[#3f3f46] transition-colors opacity-0 group-hover:opacity-100"
          title="Actions"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <InstanceActions instance={instance} onClose={() => setMenuOpen(false)} />
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

import ContaboVpsDetail from './ContaboVpsDetail';

export const ContaboInstanceList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { serverPower } = useSimulatorStore();

  const INSTANCES = BASE_INSTANCES.map((inst, idx) => {
    if (idx === 0) {
      return { ...inst, status: serverPower as Status };
    }
    return inst;
  });

  const filtered = INSTANCES.filter(inst => {
    const matchSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.ip.includes(search) ||
      inst.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inst.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const running = INSTANCES.filter(i => i.status === 'running').length;
  const stopped = INSTANCES.filter(i => i.status === 'stopped').length;

  if (selectedId) {
    return <ContaboVpsDetail onBack={() => setSelectedId(null)} instanceId={selectedId} />;
  }

  return (
    <div
      className="p-8 min-h-full"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[24px] font-semibold text-[#f4f4f5] tracking-tight">
            VPS / VDS
          </h1>
          <span className="px-2.5 py-0.5 bg-[#27272a] border border-[#3f3f46] rounded-full text-[13px] font-medium text-[#a1a1aa]">
            {INSTANCES.length}
          </span>
        </div>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-1.5 text-[#10b981]">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            {running} running
          </div>
          <div className="flex items-center gap-1.5 text-[#ef4444]">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            {stopped} stopped
          </div>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Instances', value: INSTANCES.length, sub: 'Across all regions', color: 'text-[#f4f4f5]' },
          { label: 'vCPUs', value: INSTANCES.reduce((a, b) => a + b.cpu, 0), sub: 'Total allocated', color: 'text-[#529EDE]' },
          { label: 'RAM', value: `${INSTANCES.reduce((a, b) => a + b.ram, 0)} GB`, sub: 'Total allocated', color: 'text-[#529EDE]' },
          { label: 'Storage', value: `${INSTANCES.reduce((a, b) => a + b.disk, 0)} GB`, sub: 'Total allocated', color: 'text-[#529EDE]' },
        ].map(card => (
          <div
            key={card.label}
            className="bg-[#27272a] border border-[#3f3f46] rounded-xl px-5 py-4 hover:border-[#195DAD]/40 transition-colors"
          >
            <p className="text-[12px] text-[#71717a] font-medium mb-1.5">{card.label}</p>
            <p className={`text-[22px] font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[11px] text-[#52525b] mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-[360px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]"
          />
          <input
            type="text"
            placeholder="Search instances, IPs, locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#27272a] border border-[#3f3f46] text-[#f4f4f5] placeholder-[#52525b] text-[13.5px] pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-[#195DAD] focus:ring-1 focus:ring-[#195DAD]/30 transition-colors"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5">
          {(['all', 'running', 'stopped'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-[#195DAD]/15 text-[#529EDE] border border-[#195DAD]/30'
                  : 'text-[#71717a] hover:text-[#f4f4f5] border border-transparent hover:border-[#3f3f46] hover:bg-[#27272a]'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Refresh */}
          <button className="p-2.5 rounded-lg border border-[#3f3f46] text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] hover:border-[#52525b] transition-colors">
            <RefreshCw size={15} />
          </button>

          {/* Create VPS */}
          <button className="flex items-center gap-2 bg-[#195DAD] hover:bg-[#1a6dc9] text-white px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all shadow-md shadow-[#195DAD]/20 border border-[#195DAD]/50">
            <Plus size={15} strokeWidth={2.5} />
            Create VPS
          </button>
        </div>
      </div>

      {/* ── Instance Table ───────────────────────────────────────────────────── */}
      <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-[#3f3f46] bg-[#27272a]/40">
          <div className="w-[100px] text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            Status
          </div>
          <div className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            Instance
          </div>
          <div className="hidden lg:block min-w-[170px] text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            Specs
          </div>
          <div className="hidden md:block min-w-[150px] text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            IP Address
          </div>
          <div className="hidden lg:block min-w-[110px] text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            Location
          </div>
          <div className="hidden xl:block min-w-[100px] text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            Created
          </div>
          <div className="hidden xl:block text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
            Plan
          </div>
          <div className="ml-auto w-10" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-[#3f3f46] mb-3" />
            <p className="text-[15px] font-medium text-[#71717a]">No instances found</p>
            <p className="text-[13px] text-[#52525b] mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map(instance => (
            <InstanceRow
              key={instance.id}
              instance={instance}
              onSelect={id => setSelectedId(id === selectedId ? null : id)}
            />
          ))
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#3f3f46]/60 bg-[#27272a]/20">
          <p className="text-[12.5px] text-[#52525b]">
            Showing {filtered.length} of {INSTANCES.length} instances
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-md text-[12.5px] text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] border border-transparent hover:border-[#3f3f46] transition-colors disabled:opacity-40" disabled>
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-md text-[12.5px] bg-[#195DAD]/15 text-[#529EDE] border border-[#195DAD]/25 font-medium">
              1
            </span>
            <button className="px-3 py-1.5 rounded-md text-[12.5px] text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] border border-transparent hover:border-[#3f3f46] transition-colors disabled:opacity-40" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Contabo promo strip ─────────────────────────────────────────────── */}
      <div className="mt-6 bg-gradient-to-r from-[#195DAD]/10 via-[#27272a] to-[#195DAD]/5 border border-[#195DAD]/20 rounded-xl px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold text-[#f4f4f5]">Need more compute power?</p>
          <p className="text-[13px] text-[#71717a] mt-0.5">
            Upgrade to a Dedicated Server starting at €39.99/month — bare-metal performance guaranteed.
          </p>
        </div>
        <button className="flex-shrink-0 bg-[#195DAD] hover:bg-[#1a6dc9] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap shadow-lg shadow-[#195DAD]/20">
          View Plans
        </button>
      </div>
    </div>
  );
};

// Keep old export name for backwards compat with router
export const InstanceCards = ContaboInstanceList;

export default ContaboInstanceList;

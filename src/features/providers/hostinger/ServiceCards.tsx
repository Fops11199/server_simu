import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  MapPin,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  Power,
  RotateCcw,
  Plus,
  ArrowUpRight,
  Activity,
  Shield,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VpsCard {
  id: string;
  name: string;
  status: 'active' | 'stopped' | 'rebooting';
  os: string;
  osVersion: string;
  plan: string;
  vcpu: number;
  ramGb: number;
  storageGb: number;
  ip: string;
  location: string;
  locationCode: string;
  uptime: string;
  bandwidthUsed: number;
  bandwidthTotal: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const VPS_LIST: VpsCard[] = [
  {
    id: 'vps-1',
    name: 'hostlab-vps-1',
    status: 'active',
    os: 'Ubuntu',
    osVersion: '22.04 LTS',
    plan: 'KVM 2',
    vcpu: 2,
    ramGb: 8,
    storageGb: 100,
    ip: '203.0.113.10',
    location: 'Amsterdam',
    locationCode: 'AMS',
    uptime: '14d 6h 32m',
    bandwidthUsed: 142,
    bandwidthTotal: 400,
  },
  {
    id: 'vps-2',
    name: 'dev-server',
    status: 'active',
    os: 'Debian',
    osVersion: '12 (Bookworm)',
    plan: 'KVM 1',
    vcpu: 1,
    ramGb: 4,
    storageGb: 50,
    ip: '198.51.100.45',
    location: 'London',
    locationCode: 'LON',
    uptime: '3d 11h 05m',
    bandwidthUsed: 57,
    bandwidthTotal: 200,
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: VpsCard['status'] }> = ({ status }) => {
  const map: Record<VpsCard['status'], { label: string; bg: string; dot: string; text: string }> = {
    active:    { label: 'Active',    bg: '#ECFDF5', dot: '#00B090', text: '#065F46' },
    stopped:   { label: 'Stopped',   bg: '#FEF2F2', dot: '#EF4444', text: '#991B1B' },
    rebooting: { label: 'Rebooting', bg: '#FFFBEB', dot: '#F59E0B', text: '#92400E' },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

// ─── Spec chip ────────────────────────────────────────────────────────────────

const SpecChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 bg-[#F4F5F7] rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#374151]">
    <span className="text-[#727586]">{icon}</span>
    {label}
  </div>
);

// ─── Bandwidth bar ────────────────────────────────────────────────────────────

const BandwidthBar: React.FC<{ used: number; total: number }> = ({ used, total }) => {
  const pct = Math.round((used / total) * 100);
  const color = pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#00B090';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] text-[#727586] whitespace-nowrap">{used} / {total} GB</span>
    </div>
  );
};

// ─── VPS Card ─────────────────────────────────────────────────────────────────

const VpsCardItem: React.FC<{ vps: VpsCard; onManage: (id: string) => void }> = ({ vps, onManage }) => {
  const [powered, setPowered] = useState<VpsCard['status']>(vps.status);

  const togglePower = () => {
    setPowered((s) => (s === 'active' ? 'stopped' : 'active'));
  };

  const osColor: Record<string, string> = {
    Ubuntu: '#E95420',
    Debian: '#A80030',
    CentOS: '#932279',
    AlmaLinux: '#00529F',
  };
  const color = osColor[vps.os] ?? '#674CC4';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col gap-5">
      {/* ── Card header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* OS icon circle */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18` }}
          >
            <Server size={22} style={{ color }} />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[17px] font-bold text-[#1F2937] leading-tight">{vps.name}</h2>
              <StatusBadge status={powered} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[13px] text-[#727586]">{vps.os} {vps.osVersion}</span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#F0EDFA] text-[#674CC4]">
                {vps.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Power button */}
        <button
          onClick={togglePower}
          title={powered === 'active' ? 'Shut down' : 'Power on'}
          className={`p-2 rounded-lg border transition-colors shrink-0 ${
            powered === 'active'
              ? 'border-[#00B090]/30 bg-[#ECFDF5] text-[#00B090] hover:bg-[#D1FAE5]'
              : 'border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]'
          }`}
        >
          <Power size={16} />
        </button>
      </div>

      {/* ── Specs row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <SpecChip icon={<Cpu size={13} />}        label={`${vps.vcpu} vCPU`} />
        <SpecChip icon={<MemoryStick size={13} />} label={`${vps.ramGb} GB RAM`} />
        <SpecChip icon={<HardDrive size={13} />}   label={`${vps.storageGb} GB NVMe`} />
      </div>

      {/* ── Info row ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#727586]">
        <div className="flex items-center gap-1.5">
          <Globe size={13} className="text-[#A3A8B4]" />
          <span className="font-mono text-[#374151]">{vps.ip}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-[#A3A8B4]" />
          {vps.location}
          <span className="text-[11px] bg-[#F4F5F7] text-[#727586] px-1.5 py-0.5 rounded font-mono">{vps.locationCode}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-[#A3A8B4]" />
          Up {vps.uptime}
        </div>
      </div>

      {/* ── Bandwidth ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-medium text-[#727586]">Monthly Bandwidth</span>
          <span className="text-[11px] text-[#A3A8B4]">
            {Math.round((vps.bandwidthUsed / vps.bandwidthTotal) * 100)}% used
          </span>
        </div>
        <BandwidthBar used={vps.bandwidthUsed} total={vps.bandwidthTotal} />
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="border-t border-[#F3F4F6]" />

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onManage(vps.id)}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#674CC4] hover:bg-[#5236A5] text-white rounded-lg font-semibold text-[13px] transition-colors shadow-sm"
        >
          Manage
          <ArrowUpRight size={14} />
        </button>
        <button
          className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-[#D1D5DB] text-[#374151] rounded-lg font-medium text-[13px] hover:bg-[#F3F4F6] transition-colors"
        >
          <RotateCcw size={13} />
          Restart
        </button>
        <button
          className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-[#D1D5DB] text-[#374151] rounded-lg font-medium text-[13px] hover:bg-[#F3F4F6] transition-colors"
        >
          <Shield size={13} />
          Firewall
        </button>
      </div>
    </div>
  );
};

// ─── Summary stats strip ──────────────────────────────────────────────────────

const SummaryStats: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {[
      { label: 'Total VPS',     value: '2',         icon: <Server   size={18} />, color: '#674CC4', bg: '#F0EDFA' },
      { label: 'Active',        value: '2',          icon: <Activity size={18} />, color: '#00B090', bg: '#ECFDF5' },
      { label: 'Total vCPUs',   value: '3',          icon: <Cpu      size={18} />, color: '#3B82F6', bg: '#EFF6FF' },
      { label: 'Total RAM',     value: '12 GB',      icon: <MemoryStick size={18} />, color: '#F59E0B', bg: '#FFFBEB' },
    ].map((s) => (
      <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>
          {s.icon}
        </div>
        <div>
          <p className="text-[22px] font-bold text-[#1F2937] leading-tight">{s.value}</p>
          <p className="text-[12px] text-[#727586]">{s.label}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const HostingerVpsList: React.FC = () => {
  const navigate = useNavigate();

  const handleManage = (id: string) => {
    navigate(`/app/providers/hostinger/vps/${id}`);
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
      <div className="max-w-[960px] mx-auto">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#1F2937] leading-tight">VPS</h1>
            <p className="text-[14px] text-[#727586] mt-1">Manage your virtual private servers</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#674CC4] hover:bg-[#5236A5] text-white rounded-lg font-semibold text-[14px] transition-colors shadow-sm">
            <Plus size={16} />
            New VPS
          </button>
        </div>

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#727586] mb-6">
          <span className="hover:text-[#674CC4] cursor-pointer transition-colors">hPanel</span>
          <ChevronRight size={13} />
          <span className="text-[#2D3136] font-medium">VPS</span>
        </nav>

        {/* ── Summary stats ───────────────────────────────────────────────── */}
        <SummaryStats />

        {/* ── Cards ───────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {VPS_LIST.map((vps) => (
            <VpsCardItem key={vps.id} vps={vps} onManage={handleManage} />
          ))}
        </div>

        {/* ── Promo banner ────────────────────────────────────────────────── */}
        <div className="mt-8 bg-gradient-to-r from-[#674CC4] to-[#8B6FD4] rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white font-bold text-[16px]">Need more power?</p>
            <p className="text-white/80 text-[13px] mt-0.5">Upgrade to KVM 4 for 4 vCPUs, 16 GB RAM and 200 GB NVMe.</p>
          </div>
          <button className="px-5 py-2.5 bg-white text-[#674CC4] rounded-lg font-bold text-[14px] hover:bg-[#F0EDFA] transition-colors whitespace-nowrap shrink-0">
            Upgrade Plan
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Legacy alias (keeps router.tsx working without changes) ──────────────────
export { HostingerVpsList as ServiceCards };

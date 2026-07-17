import React, { useState } from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Square,
  Terminal,
  Key,
  RefreshCw,
  Camera,
  Copy,
  MapPin,
  Calendar,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  Network,
  Server,
  Activity,
  Clock,
  Shield,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Trash2,
  MoreVertical,
  Zap,
  Eye,
  Power,
  Info,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'running' | 'stopped' | 'pending';

interface VpsDetailProps {
  instanceId?: string;
  onBack?: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INSTANCE = {
  id: 'vmi-20241001',
  name: 'vps-web-01',
  status: 'running' as Status,
  os: 'Ubuntu',
  osVersion: '22.04 LTS',
  cpu: 4,
  ram: 8,
  disk: 200,
  diskType: 'NVMe SSD',
  ip: '203.0.113.10',
  ipv6: '2a02:4780:4:1::1',
  gateway: '203.0.113.1',
  macAddress: '00:50:56:AB:12:34',
  location: 'Frankfurt, Germany',
  locationCode: 'EU-DE-FRA',
  datacenter: 'AMS01',
  plan: 'Cloud VPS M',
  bandwidthTotal: 32, // TB/month
  bandwidthUsed: 4.8,  // TB
  created: '2026-01-15',
  contractEnd: '2026-08-15',
  uptime: '42 days, 7 hours',
  lastReboot: '2026-06-05 03:14 UTC',
  cpuUsage: 18,
  ramUsed: 3.4,
  ramTotal: 8,
  diskUsed: 74,
  diskTotal: 200,
  networkIn: '1.24 TB',
  networkOut: '3.56 TB',
  snapshots: 2,
  backups: 3,
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: Status; size?: 'sm' | 'lg' }> = ({ status, size = 'sm' }) => {
  const cfg = {
    running: { dot: 'bg-[#10b981]', text: 'text-[#10b981]', bg: 'bg-[#10b981]/10', label: 'Running' },
    stopped: { dot: 'bg-[#ef4444]', text: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', label: 'Stopped' },
    pending: { dot: 'bg-[#f59e0b]', text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', label: 'Pending' },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.text} rounded-full font-medium ${
        size === 'lg' ? 'px-3 py-1.5 text-[13px]' : 'px-2.5 py-1 text-[12px]'
      }`}
    >
      <span className={`rounded-full flex-shrink-0 ${cfg.dot} ${size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'} ${status === 'running' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
};

// ─── Resource Bar ─────────────────────────────────────────────────────────────

interface ResourceBarProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  percentage: number;
  icon: React.ReactNode;
  color?: string;
}

const ResourceBar: React.FC<ResourceBarProps> = ({
  label, used, total, unit, percentage, icon, color = '#195DAD'
}) => {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const barColor =
    pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : color;

  return (
    <div className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-5 hover:border-[#3f3f46]/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#a1a1aa]">
          <span className="text-[#52525b]">{icon}</span>
          <span className="text-[13px] font-medium">{label}</span>
        </div>
        <div className="text-right">
          <span
            className="text-[16px] font-bold"
            style={{ color: barColor }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 bg-[#3f3f46] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[12px] text-[#71717a]">
        <span>{used} {unit} used</span>
        <span>{total} {unit} total</span>
      </div>
    </div>
  );
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  copyable?: string;
  mono?: boolean;
}> = ({ label, value, copyable, mono }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copyable) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-start justify-between py-3 border-b border-[#3f3f46]/50 last:border-0 group">
      <span className="text-[13px] text-[#71717a] min-w-[130px] flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className={`text-[13px] text-[#f4f4f5] ${mono ? 'font-mono' : 'font-medium'}`}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#52525b] hover:text-[#f4f4f5]"
          >
            {copied ? (
              <CheckCircle2 size={13} className="text-[#10b981]" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}> = ({ icon, label, description, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all group text-left ${
      variant === 'danger'
        ? 'border-[#ef4444]/20 bg-[#ef4444]/5 hover:bg-[#ef4444]/10 hover:border-[#ef4444]/40'
        : 'border-[#3f3f46] bg-[#27272a] hover:bg-[#2d2d30] hover:border-[#195DAD]/40'
    }`}
  >
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        variant === 'danger'
          ? 'bg-[#ef4444]/10 text-[#ef4444]'
          : 'bg-[#195DAD]/15 text-[#529EDE] group-hover:bg-[#195DAD]/25'
      } transition-colors`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={`text-[13.5px] font-semibold ${
          variant === 'danger' ? 'text-[#ef4444]' : 'text-[#f4f4f5]'
        }`}
      >
        {label}
      </p>
      <p className="text-[12px] text-[#71717a] mt-0.5 leading-tight">{description}</p>
    </div>
    <ExternalLink
      size={14}
      className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
        variant === 'danger' ? 'text-[#ef4444]' : 'text-[#52525b]'
      }`}
    />
  </button>
);

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Networking', 'Backups', 'Snapshots', 'Console', 'Activity'] as const;
type Tab = typeof TABS[number];

// ─── Main Component ───────────────────────────────────────────────────────────

export const ContaboVpsDetail: React.FC<VpsDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { serverPower, toggleServerPower } = useSimulatorStore();
  const inst = { ...INSTANCE, status: serverPower };

  const handleAction = (action: string) => {
    setActionLoading(action);
    if (action === 'start' || action === 'stop' || action === 'restart') {
      setTimeout(() => {
        toggleServerPower();
        setActionLoading(null);
      }, 800);
    } else {
      setTimeout(() => setActionLoading(null), 2000);
    }
  };

  return (
    <div
      className="min-h-full bg-[#18181b] text-[#f4f4f5] p-8"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[13px] text-[#71717a] mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-[#f4f4f5] transition-colors"
        >
          <ArrowLeft size={14} />
          VPS / VDS
        </button>
        <span className="text-[#3f3f46]">/</span>
        <span className="text-[#f4f4f5] font-medium">{inst.name}</span>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Left: identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#195DAD]/15 border border-[#195DAD]/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <Server size={24} className="text-[#529EDE]" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[22px] font-semibold text-[#f4f4f5] tracking-tight">
                  {inst.name}
                </h1>
                <StatusBadge status={inst.status} size="lg" />
                <span className="px-2.5 py-1 bg-[#27272a] border border-[#3f3f46] rounded-full text-[12px] text-[#71717a]">
                  {inst.id}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-[13px] text-[#71717a] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Globe size={12} className="text-[#52525b]" />
                  {inst.ip}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#52525b]" />
                  {inst.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu size={12} className="text-[#52525b]" />
                  {inst.cpu} vCPU / {inst.ram} GB RAM / {inst.disk} GB {inst.diskType}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-[#52525b]" />
                  Up {inst.uptime}
                </span>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {inst.status === 'stopped' ? (
              <button
                onClick={() => handleAction('start')}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all shadow-md shadow-[#10b981]/20"
              >
                {actionLoading === 'start' ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Play size={14} fill="white" />
                )}
                Start
              </button>
            ) : (
              <button
                onClick={() => handleAction('stop')}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 bg-[#27272a] hover:bg-[#3f3f46] disabled:opacity-60 text-[#ef4444] border border-[#3f3f46] px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
              >
                {actionLoading === 'stop' ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Square size={14} fill="currentColor" />
                )}
                Stop
              </button>
            )}

            <button
              onClick={() => handleAction('restart')}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 bg-[#27272a] hover:bg-[#3f3f46] disabled:opacity-60 text-[#f4f4f5] border border-[#3f3f46] px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
            >
              {actionLoading === 'restart' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <RotateCcw size={14} />
              )}
              Restart
            </button>

            <button className="flex items-center gap-2 bg-[#195DAD] hover:bg-[#1a6dc9] text-white px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all shadow-md shadow-[#195DAD]/20 border border-[#195DAD]/50">
              <Terminal size={14} />
              Console
            </button>

            <button className="p-2.5 rounded-lg border border-[#3f3f46] text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] hover:border-[#52525b] transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mt-6 pt-5 border-t border-[#3f3f46] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#195DAD]/15 text-[#529EDE] border border-[#195DAD]/25'
                  : 'text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a]'
              }`}
            >
              {tab}
              {tab === 'Snapshots' && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#27272a] border border-[#3f3f46] rounded-full text-[10px] text-[#71717a]">
                  {inst.snapshots}
                </span>
              )}
              {tab === 'Backups' && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#27272a] border border-[#3f3f46] rounded-full text-[10px] text-[#71717a]">
                  {inst.backups}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Content ────────────────────────────────────────────────── */}
      {activeTab === 'Overview' && (
        <>
          {/* ── Two column grid ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Server Details card (2/3 width) */}
            <div className="lg:col-span-2 bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#3f3f46] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info size={15} className="text-[#52525b]" />
                  <h2 className="text-[15px] font-semibold text-[#f4f4f5]">Server Details</h2>
                </div>
                <span className="text-[12px] text-[#71717a] bg-[#27272a] border border-[#3f3f46] px-2.5 py-1 rounded-full">
                  {inst.plan}
                </span>
              </div>

              <div className="px-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {/* Column 1 */}
                  <div>
                    <DetailRow label="Instance ID" value={inst.id} copyable={inst.id} mono />
                    <DetailRow label="Status" value={<StatusBadge status={inst.status} />} />
                    <DetailRow label="IPv4 Address" value={inst.ip} copyable={inst.ip} mono />
                    <DetailRow label="IPv6 Address" value={inst.ipv6} copyable={inst.ipv6} mono />
                    <DetailRow label="Gateway" value={inst.gateway} copyable={inst.gateway} mono />
                    <DetailRow label="MAC Address" value={inst.macAddress} mono />
                  </div>
                  {/* Column 2 */}
                  <div>
                    <DetailRow label="Operating System" value={`${inst.os} ${inst.osVersion}`} />
                    <DetailRow
                      label="CPU"
                      value={
                        <span className="flex items-center gap-1">
                          <Cpu size={12} className="text-[#52525b]" />
                          {inst.cpu} vCPU
                        </span>
                      }
                    />
                    <DetailRow
                      label="Memory"
                      value={
                        <span className="flex items-center gap-1">
                          <MemoryStick size={12} className="text-[#52525b]" />
                          {inst.ram} GB RAM
                        </span>
                      }
                    />
                    <DetailRow
                      label="Disk"
                      value={
                        <span className="flex items-center gap-1">
                          <HardDrive size={12} className="text-[#52525b]" />
                          {inst.disk} GB {inst.diskType}
                        </span>
                      }
                    />
                    <DetailRow
                      label="Location"
                      value={
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#52525b]" />
                          {inst.location}
                        </span>
                      }
                    />
                    <DetailRow label="Created" value={inst.created} />
                    <DetailRow label="Contract Until" value={inst.contractEnd} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions card (1/3 width) */}
            <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#3f3f46] flex items-center gap-2">
                <Zap size={15} className="text-[#52525b]" />
                <h2 className="text-[15px] font-semibold text-[#f4f4f5]">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2.5">
                <QuickAction
                  icon={<Key size={18} />}
                  label="Reset Password"
                  description="Generate a new root password and send via email"
                />
                <QuickAction
                  icon={<RefreshCw size={18} />}
                  label="Rebuild Instance"
                  description="Reinstall OS — all data will be erased"
                />
                <QuickAction
                  icon={<Camera size={18} />}
                  label="Take Snapshot"
                  description="Create a point-in-time image of your VPS"
                />
                <QuickAction
                  icon={<Terminal size={18} />}
                  label="View Console"
                  description="Open browser-based VNC console"
                />
                <QuickAction
                  icon={<Download size={18} />}
                  label="Rescue Mode"
                  description="Boot into a recovery environment"
                />
                <div className="pt-1">
                  <QuickAction
                    icon={<Trash2 size={18} />}
                    label="Delete Instance"
                    description="Permanently destroy this VPS and all data"
                    variant="danger"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Resource Usage ───────────────────────────────────────────────── */}
          <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-[#3f3f46] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#52525b]" />
                <h2 className="text-[15px] font-semibold text-[#f4f4f5]">Resource Usage</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#71717a]">Live — updated just now</span>
                <button className="p-1.5 rounded-md text-[#52525b] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
              <ResourceBar
                label="CPU Usage"
                used={inst.cpuUsage}
                total={100}
                unit="%"
                percentage={inst.cpuUsage}
                icon={<Cpu size={15} />}
                color="#195DAD"
              />
              <ResourceBar
                label="RAM Usage"
                used={inst.ramUsed}
                total={inst.ramTotal}
                unit="GB"
                percentage={Math.round((inst.ramUsed / inst.ramTotal) * 100)}
                icon={<MemoryStick size={15} />}
                color="#195DAD"
              />
              <ResourceBar
                label="Disk Usage"
                used={inst.diskUsed}
                total={inst.diskTotal}
                unit="GB"
                percentage={Math.round((inst.diskUsed / inst.diskTotal) * 100)}
                icon={<HardDrive size={15} />}
                color="#195DAD"
              />
            </div>
          </div>

          {/* ── Bandwidth + Info row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bandwidth */}
            <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#3f3f46] flex items-center gap-2">
                <Network size={15} className="text-[#52525b]" />
                <h2 className="text-[15px] font-semibold text-[#f4f4f5]">Bandwidth This Month</h2>
              </div>
              <div className="p-6">
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-[32px] font-bold text-[#f4f4f5]">{inst.bandwidthUsed} TB</span>
                  <span className="text-[14px] text-[#71717a] mb-1.5">of {inst.bandwidthTotal} TB</span>
                </div>

                {/* Bandwidth bar */}
                <div className="h-3 bg-[#3f3f46] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#195DAD] to-[#529EDE]"
                    style={{
                      width: `${(inst.bandwidthUsed / inst.bandwidthTotal) * 100}%`,
                      boxShadow: '0 0 12px rgba(25, 93, 173, 0.4)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div className="bg-[#27272a] rounded-lg p-3.5 border border-[#3f3f46]">
                    <div className="text-[11px] text-[#71717a] mb-1 uppercase tracking-wider">Inbound</div>
                    <div className="font-semibold text-[#f4f4f5]">{inst.networkIn}</div>
                  </div>
                  <div className="bg-[#27272a] rounded-lg p-3.5 border border-[#3f3f46]">
                    <div className="text-[11px] text-[#71717a] mb-1 uppercase tracking-wider">Outbound</div>
                    <div className="font-semibold text-[#f4f4f5]">{inst.networkOut}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uptime / Status */}
            <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#3f3f46] flex items-center gap-2">
                <Shield size={15} className="text-[#52525b]" />
                <h2 className="text-[15px] font-semibold text-[#f4f4f5]">System Information</h2>
              </div>
              <div className="px-6 py-2">
                <DetailRow
                  label="Uptime"
                  value={
                    <span className="text-[#10b981] flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      {inst.uptime}
                    </span>
                  }
                />
                <DetailRow label="Last Reboot" value={inst.lastReboot} />
                <DetailRow label="Datacenter" value={inst.datacenter} />
                <DetailRow
                  label="Location Code"
                  value={inst.locationCode}
                  copyable={inst.locationCode}
                  mono
                />
                <DetailRow
                  label="Snapshots"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Camera size={12} className="text-[#52525b]" />
                      {inst.snapshots} available
                    </span>
                  }
                />
                <DetailRow
                  label="Auto Backups"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Download size={12} className="text-[#52525b]" />
                      {inst.backups} stored
                    </span>
                  }
                />
                <DetailRow
                  label="Contract End"
                  value={
                    <span className="flex items-center gap-1 text-[#f59e0b]">
                      <Calendar size={12} />
                      {inst.contractEnd}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Networking tab (stub) ────────────────────────────────────────────── */}
      {activeTab === 'Networking' && (
        <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Network size={40} className="text-[#3f3f46] mb-4" />
          <p className="text-[16px] font-semibold text-[#71717a]">Networking Configuration</p>
          <p className="text-[13px] text-[#52525b] mt-2">Firewall rules, private networks, and reverse DNS management</p>
          <button className="mt-6 bg-[#195DAD] hover:bg-[#1a6dc9] text-white px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
            Configure Firewall
          </button>
        </div>
      )}

      {/* ── Console tab (stub) ───────────────────────────────────────────────── */}
      {activeTab === 'Console' && (
        <div className="bg-[#0d1117] border border-[#3f3f46] rounded-2xl overflow-hidden" style={{ height: '400px' }}>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1c1c1f] border-b border-[#3f3f46]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            </div>
            <span className="text-[12px] text-[#52525b] ml-2 font-mono">{inst.name} — VNC Console</span>
          </div>
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <Terminal size={36} className="text-[#3f3f46]" />
            <p className="text-[15px] font-semibold text-[#71717a]">VNC Console</p>
            <p className="text-[13px] text-[#52525b]">Click below to open a browser-based console session</p>
            <button className="bg-[#195DAD] hover:bg-[#1a6dc9] text-white px-6 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors flex items-center gap-2">
              <Eye size={15} />
              Open Console Session
            </button>
          </div>
        </div>
      )}

      {/* ── Other tabs (stub) ────────────────────────────────────────────────── */}
      {(activeTab === 'Backups' || activeTab === 'Snapshots' || activeTab === 'Activity') && (
        <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          {activeTab === 'Backups' && <Download size={40} className="text-[#3f3f46] mb-4" />}
          {activeTab === 'Snapshots' && <Camera size={40} className="text-[#3f3f46] mb-4" />}
          {activeTab === 'Activity' && <Activity size={40} className="text-[#3f3f46] mb-4" />}
          <p className="text-[16px] font-semibold text-[#71717a]">{activeTab}</p>
          <p className="text-[13px] text-[#52525b] mt-1">
            {activeTab === 'Backups' && `${inst.backups} backups available — automated daily snapshots`}
            {activeTab === 'Snapshots' && `${inst.snapshots} snapshots on record`}
            {activeTab === 'Activity' && 'Recent audit log and server event history'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContaboVpsDetail;

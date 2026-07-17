import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import {
  Server,
  Power,
  RotateCcw,
  Square,
  MapPin,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Terminal,
  Shield,
  Clock,
  ChevronLeft,
  Copy,
  Check,
  Activity,
  ArrowUp,
  ArrowDown,
  Database,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'ssh' | 'backups' | 'monitoring' | 'settings';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

// ─── VPS mock data ────────────────────────────────────────────────────────────

const VPS_DATA: Record<string, {
  name: string; status: 'active' | 'stopped'; os: string; ip: string;
  location: string; locationCode: string; plan: string; hostname: string;
  vcpu: number; ramGb: number; storageGb: number; uptime: string;
  cpuPct: number; ramPct: number; storagePct: number;
  rootPassword: string; sshPort: number;
  backups: { id: string; date: string; size: string; status: string }[];
}> = {
  'vps-1': {
    name: 'hostlab-vps-1', status: 'active', os: 'Ubuntu 22.04 LTS',
    ip: '203.0.113.10', location: 'Amsterdam', locationCode: 'AMS',
    plan: 'KVM 2', hostname: 'hostlab-vps-1.hostlab.dev',
    vcpu: 2, ramGb: 8, storageGb: 100,
    uptime: '14d 6h 32m', cpuPct: 23, ramPct: 55, storagePct: 38,
    rootPassword: '••••••••••••', sshPort: 22,
    backups: [
      { id: 'bk-1', date: '2026-07-16 03:00', size: '12.4 GB', status: 'success' },
      { id: 'bk-2', date: '2026-07-15 03:00', size: '12.1 GB', status: 'success' },
      { id: 'bk-3', date: '2026-07-14 03:00', size: '11.9 GB', status: 'success' },
      { id: 'bk-4', date: '2026-07-13 03:00', size: '11.8 GB', status: 'failed' },
    ],
  },
  'vps-2': {
    name: 'dev-server', status: 'active', os: 'Debian 12 (Bookworm)',
    ip: '198.51.100.45', location: 'London', locationCode: 'LON',
    plan: 'KVM 1', hostname: 'dev-server.hostlab.dev',
    vcpu: 1, ramGb: 4, storageGb: 50,
    uptime: '3d 11h 05m', cpuPct: 8, ramPct: 41, storagePct: 62,
    rootPassword: '••••••••••••', sshPort: 22,
    backups: [
      { id: 'bk-5', date: '2026-07-16 04:00', size: '6.2 GB', status: 'success' },
      { id: 'bk-6', date: '2026-07-15 04:00', size: '6.0 GB', status: 'success' },
    ],
  },
};

// Fallback for unknown IDs
const DEFAULT_VPS = VPS_DATA['vps-1'];

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { key: 'overview',   label: 'Overview',    icon: <Activity  size={14} /> },
  { key: 'ssh',        label: 'SSH Access',  icon: <Terminal  size={14} /> },
  { key: 'backups',    label: 'Backups',     icon: <Database  size={14} /> },
  { key: 'monitoring', label: 'Monitoring',  icon: <Cpu       size={14} /> },
  { key: 'settings',   label: 'Settings',   icon: <Shield    size={14} /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: 'active' | 'stopped' }> = ({ status }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
    style={
      status === 'active'
        ? { background: '#ECFDF5', color: '#065F46' }
        : { background: '#FEF2F2', color: '#991B1B' }
    }
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ background: status === 'active' ? '#00B090' : '#EF4444' }}
    />
    {status === 'active' ? 'Active' : 'Stopped'}
  </span>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ResourceBar: React.FC<{ label: string; pct: number; icon: React.ReactNode; detail: string }> = ({
  label, pct, icon, detail,
}) => {
  const color = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#674CC4';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#374151]">
          <span className="text-[#727586]">{icon}</span>
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#727586]">{detail}</span>
          <span className="text-[13px] font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Copy Button ──────────────────────────────────────────────────────────────

const CopyBtn: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={doCopy}
      title="Copy"
      className={`p-1.5 rounded transition-colors ${copied ? 'text-[#00B090]' : 'text-[#727586] hover:text-[#374151] hover:bg-[#F4F5F7]'} ${className ?? ''}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

// ─── Code snippet box ─────────────────────────────────────────────────────────

const CodeBox: React.FC<{ code: string }> = ({ code }) => (
  <div className="flex items-center gap-2 bg-[#1E1E2E] rounded-xl px-4 py-3 font-mono text-[13px] text-[#A9B1D6]">
    <span className="text-[#7AA2F7] select-none">$</span>
    <span className="flex-1 text-[#E0E0E0] break-all">{code}</span>
    <CopyBtn text={code} className="text-[#A9B1D6] hover:text-white hover:bg-white/10" />
  </div>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ vps: typeof DEFAULT_VPS }> = ({ vps }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    {/* Server Information */}
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
      <h3 className="text-[15px] font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
        <Server size={16} className="text-[#674CC4]" />
        Server Information
      </h3>
      <dl className="divide-y divide-[#F3F4F6]">
        {[
          { label: 'Hostname',   value: vps.hostname },
          { label: 'OS',         value: vps.os },
          { label: 'IP Address', value: vps.ip,       mono: true },
          { label: 'Location',   value: `${vps.location} (${vps.locationCode})` },
          { label: 'Plan',       value: vps.plan },
          { label: 'Uptime',     value: vps.uptime },
          { label: 'SSH Port',   value: String(vps.sshPort), mono: true },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-[13px] text-[#727586] shrink-0">{row.label}</dt>
            <dd className={`text-[13px] font-medium text-[#1F2937] text-right ${row.mono ? 'font-mono' : ''}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>

    {/* Resource Usage */}
    <div className="space-y-5">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <h3 className="text-[15px] font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
          <Activity size={16} className="text-[#674CC4]" />
          Resource Usage
          <span className="ml-auto text-[11px] text-[#727586] font-normal">Live snapshot</span>
        </h3>
        <div className="space-y-4">
          <ResourceBar
            label="CPU"
            pct={vps.cpuPct}
            icon={<Cpu size={14} />}
            detail={`${vps.vcpu} vCPU`}
          />
          <ResourceBar
            label="RAM"
            pct={vps.ramPct}
            icon={<MemoryStick size={14} />}
            detail={`${Math.round((vps.ramPct / 100) * vps.ramGb * 10) / 10} / ${vps.ramGb} GB`}
          />
          <ResourceBar
            label="Storage"
            pct={vps.storagePct}
            icon={<HardDrive size={14} />}
            detail={`${Math.round((vps.storagePct / 100) * vps.storageGb)} / ${vps.storageGb} GB`}
          />
        </div>
      </div>

      {/* Root Access */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <h3 className="text-[15px] font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
          <Terminal size={16} className="text-[#674CC4]" />
          Root Access
        </h3>
        <p className="text-[12px] text-[#727586] mb-3">Connect via SSH as root:</p>
        <CodeBox code={`ssh root@${vps.ip} -p ${vps.sshPort}`} />
        <p className="text-[11px] text-[#F59E0B] mt-3 flex items-center gap-1.5">
          <AlertCircle size={12} />
          Protect your server — use SSH keys instead of passwords when possible.
        </p>
      </div>
    </div>
  </div>
);

// ─── SSH Access Tab ───────────────────────────────────────────────────────────

const SshTab: React.FC<{ vps: typeof DEFAULT_VPS }> = ({ vps }) => (
  <div className="space-y-5">
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
      <h3 className="text-[15px] font-semibold text-[#1F2937] mb-1">SSH Connection Details</h3>
      <p className="text-[13px] text-[#727586] mb-5">Use these credentials to connect via any SSH client.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Host / IP',  value: vps.ip,       mono: true },
          { label: 'Port',       value: String(vps.sshPort), mono: true },
          { label: 'Username',   value: 'root',       mono: true },
          { label: 'Auth',       value: 'Password / SSH key', mono: false },
        ].map((f) => (
          <div key={f.label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <p className="text-[11px] text-[#A3A8B4] font-medium uppercase tracking-wide mb-1">{f.label}</p>
            <p className={`text-[14px] font-semibold text-[#1F2937] ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-[13px] font-semibold text-[#374151]">Quick connect commands</p>
        <CodeBox code={`ssh root@${vps.ip}`} />
        <CodeBox code={`ssh -i ~/.ssh/id_rsa root@${vps.ip}`} />
      </div>
    </div>

    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
      <h3 className="text-[15px] font-semibold text-[#1F2937] mb-4">SSH Keys</h3>
      <div className="border border-dashed border-[#D1D5DB] rounded-xl p-6 text-center">
        <Shield size={28} className="text-[#A3A8B4] mx-auto mb-2" />
        <p className="text-[13px] text-[#727586] mb-3">No SSH keys added yet</p>
        <button className="px-4 py-2 bg-[#674CC4] hover:bg-[#5236A5] text-white rounded-lg text-[13px] font-semibold transition-colors">
          Add SSH Key
        </button>
      </div>
    </div>
  </div>
);

// ─── Backups Tab ──────────────────────────────────────────────────────────────

const BackupsTab: React.FC<{ vps: typeof DEFAULT_VPS }> = ({ vps }) => (
  <div className="space-y-5">
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1F2937]">Automated Backups</h3>
          <p className="text-[13px] text-[#727586] mt-0.5">Daily backups retained for 7 days</p>
        </div>
        <button className="px-4 py-2 bg-[#674CC4] hover:bg-[#5236A5] text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5">
          <Database size={14} />
          Create Backup
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {['Date & Time', 'Size', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left py-2.5 px-3 text-[12px] font-semibold text-[#727586] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {vps.backups.map((bk) => (
              <tr key={bk.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-mono text-[#1F2937]">{bk.date}</td>
                <td className="py-3 px-3 text-[#374151]">{bk.size}</td>
                <td className="py-3 px-3">
                  {bk.status === 'success' ? (
                    <span className="inline-flex items-center gap-1.5 text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full text-[12px] font-semibold">
                      <CheckCircle2 size={11} /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 rounded-full text-[12px] font-semibold">
                      <AlertCircle size={11} /> Failed
                    </span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <button className="text-[#674CC4] font-medium hover:underline text-[12px] mr-3">
                    Restore
                  </button>
                  <button className="text-[#374151] font-medium hover:underline text-[12px]">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── Monitoring Tab ───────────────────────────────────────────────────────────

const MonitoringTab: React.FC<{ vps: typeof DEFAULT_VPS }> = ({ vps }) => {
  // Sparkline-like fake chart data bars
  const cpuBars  = [12, 18, 15, 23, 28, 20, 17, 23, 21, 25, 22, 23];
  const ramBars  = [50, 52, 53, 54, 55, 52, 53, 54, 56, 55, 55, 55];
  const netIn    = [2.1, 3.5, 1.8, 4.2, 3.1, 2.8, 3.6, 4.1, 3.2, 2.9, 3.7, 3.4];
  const netOut   = [0.8, 1.2, 0.9, 1.5, 1.1, 1.3, 1.0, 1.4, 1.2, 0.9, 1.1, 1.3];

  const MiniChart: React.FC<{ bars: number[]; color: string; max?: number }> = ({ bars, color, max }) => {
    const m = max ?? Math.max(...bars);
    return (
      <div className="flex items-end gap-0.5 h-12">
        {bars.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{ height: `${(v / m) * 100}%`, background: color, opacity: 0.75 + (i / bars.length) * 0.25 }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* CPU chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[#1F2937] flex items-center gap-2">
              <Cpu size={15} className="text-[#674CC4]" /> CPU Usage
            </span>
            <span className="text-[20px] font-bold text-[#674CC4]">{vps.cpuPct}%</span>
          </div>
          <MiniChart bars={cpuBars} color="#674CC4" max={100} />
          <p className="text-[11px] text-[#A3A8B4] mt-2">Last 12 samples</p>
        </div>

        {/* RAM chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[#1F2937] flex items-center gap-2">
              <MemoryStick size={15} className="text-[#00B090]" /> RAM Usage
            </span>
            <span className="text-[20px] font-bold text-[#00B090]">{vps.ramPct}%</span>
          </div>
          <MiniChart bars={ramBars} color="#00B090" max={100} />
          <p className="text-[11px] text-[#A3A8B4] mt-2">Last 12 samples</p>
        </div>

        {/* Network In */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[#1F2937] flex items-center gap-2">
              <ArrowDown size={15} className="text-[#3B82F6]" /> Network In
            </span>
            <span className="text-[20px] font-bold text-[#3B82F6]">
              {netIn[netIn.length - 1]} MB/s
            </span>
          </div>
          <MiniChart bars={netIn} color="#3B82F6" />
          <p className="text-[11px] text-[#A3A8B4] mt-2">Last 12 samples</p>
        </div>

        {/* Network Out */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[#1F2937] flex items-center gap-2">
              <ArrowUp size={15} className="text-[#F59E0B]" /> Network Out
            </span>
            <span className="text-[20px] font-bold text-[#F59E0B]">
              {netOut[netOut.length - 1]} MB/s
            </span>
          </div>
          <MiniChart bars={netOut} color="#F59E0B" />
          <p className="text-[11px] text-[#A3A8B4] mt-2">Last 12 samples</p>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────

const SettingsTab: React.FC<{ vps: typeof DEFAULT_VPS }> = ({ vps }) => {
  const [hostname, setHostname] = useState(vps.hostname);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-[15px] font-semibold text-[#1F2937] mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Hostname</label>
            <input
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2.5 text-[13px] text-[#1F2937] focus:outline-none focus:border-[#674CC4] focus:ring-2 focus:ring-[#674CC4]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Reverse DNS (PTR)</label>
            <input
              defaultValue={vps.hostname}
              className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2.5 text-[13px] text-[#1F2937] focus:outline-none focus:border-[#674CC4] focus:ring-2 focus:ring-[#674CC4]/10 transition-all"
            />
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#674CC4] hover:bg-[#5236A5] text-white rounded-lg font-semibold text-[13px] transition-colors"
          >
            {saved ? <><Check size={14} /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-[15px] font-semibold text-[#1F2937] mb-1">Danger Zone</h3>
        <p className="text-[13px] text-[#727586] mb-4">These actions are irreversible. Proceed with extreme caution.</p>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-[#F59E0B]/40 bg-[#FFFBEB] text-[#92400E] rounded-lg text-[13px] font-medium hover:bg-[#FEF3C7] transition-colors">
            <RotateCcw size={14} /> Rebuild / Reinstall OS
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-[#EF4444]/40 bg-[#FEF2F2] text-[#991B1B] rounded-lg text-[13px] font-medium hover:bg-[#FEE2E2] transition-colors">
            <Square size={14} /> Delete VPS
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const HostingerVpsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { serverPower, toggleServerPower } = useSimulatorStore();
  const powerState = serverPower === 'running' ? 'active' : 'stopped';

  const vps = (id && VPS_DATA[id]) ? VPS_DATA[id] : DEFAULT_VPS;

  const togglePower = () => toggleServerPower();

  return (
    <div
      className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
    >
      <div className="max-w-[960px] mx-auto">

        {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#727586] mb-6">
          <button onClick={() => navigate('/app/providers/hostinger')} className="flex items-center gap-1 hover:text-[#674CC4] transition-colors">
            <ChevronLeft size={13} /> VPS
          </button>
          <span className="text-[#D1D5DB]">/</span>
          <span className="text-[#2D3136] font-medium">{vps.name}</span>
        </nav>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0EDFA] flex items-center justify-center shrink-0">
                <Server size={22} className="text-[#674CC4]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[20px] font-bold text-[#1F2937]">{vps.name}</h1>
                  <StatusBadge status={powerState} />
                  <span className="font-mono">{vps.ip}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-[#A3A8B4]" />
                    {vps.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-[#A3A8B4]" />
                    Up {vps.uptime}
                  </span>
                </div>
              </div>
            </div>

            {/* Power button group */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePower}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-semibold transition-colors ${
                  powerState === 'active'
                    ? 'border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]'
                    : 'border-[#00B090]/30 bg-[#ECFDF5] text-[#00B090] hover:bg-[#D1FAE5]'
                }`}
              >
                <Power size={14} />
                {powerState === 'active' ? 'Shut Down' : 'Power On'}
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] text-[13px] font-semibold hover:bg-[#F3F4F6] transition-colors">
                <RotateCcw size={14} />
                Restart
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab nav ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1.5 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#674CC4] text-white shadow-sm'
                  : 'text-[#727586] hover:bg-[#F4F5F7] hover:text-[#2D3136]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────────────────────────── */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'overview'   && <OverviewTab    vps={vps} />}
          {activeTab === 'ssh'        && <SshTab         vps={vps} />}
          {activeTab === 'backups'    && <BackupsTab      vps={vps} />}
          {activeTab === 'monitoring' && <MonitoringTab  vps={vps} />}
          {activeTab === 'settings'   && <SettingsTab    vps={vps} />}
        </div>

      </div>
    </div>
  );
};

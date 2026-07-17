import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import {
  ArrowLeft,
  Power,
  PowerOff,
  RefreshCw,
  Terminal,
  BarChart2,
  Network,
  HardDrive,
  Camera,
  Shield,
  Trash2,
  Copy,
  Cpu,
  MemoryStick,
  MapPin,
  Calendar,
  Globe,
  Key,
  Monitor,
  Wifi,
  WifiOff,
  ExternalLink,
  ChevronDown,
  Server,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

/* ─── Shared mock data (same droplets as DropletList) ─────────── */
interface DropletData {
  id: string;
  name: string;
  status: 'active' | 'off' | 'new';
  os: string;
  osVersion: string;
  vcpu: number;
  ram: number;
  disk: number;
  region: string;
  datacenter: string;
  ip: string;
  privateIp: string;
  ipv6?: string;
  cost: number;
  tags: string[];
  createdAt: string;
  sshKeys: string[];
  backups: boolean;
  monitoring: boolean;
}

const DROPLETS_MAP: Record<string, DropletData> = {
  'dlt-1': {
    id: 'dlt-1',
    name: 'web-prod-01',
    status: 'active',
    os: 'Ubuntu',
    osVersion: '22.04 (LTS) x64',
    vcpu: 2,
    ram: 4,
    disk: 80,
    region: 'NYC1',
    datacenter: 'New York, United States',
    ip: '203.0.113.10',
    privateIp: '10.0.0.5',
    ipv6: '2001:db8::1',
    cost: 18,
    tags: ['production', 'web'],
    createdAt: 'Jan 15, 2024',
    sshKeys: ['id_rsa (MacBook Pro)', 'deploy_key (CI/CD)'],
    backups: true,
    monitoring: true,
  },
  'dlt-2': {
    id: 'dlt-2',
    name: 'db-prod',
    status: 'active',
    os: 'Ubuntu',
    osVersion: '22.04 (LTS) x64',
    vcpu: 4,
    ram: 8,
    disk: 160,
    region: 'AMS3',
    datacenter: 'Amsterdam, Netherlands',
    ip: '198.51.100.45',
    privateIp: '10.0.0.12',
    cost: 48,
    tags: ['production', 'database'],
    createdAt: 'Jan 20, 2024',
    sshKeys: ['id_rsa (MacBook Pro)'],
    backups: true,
    monitoring: true,
  },
  'dlt-3': {
    id: 'dlt-3',
    name: 'staging-01',
    status: 'off',
    os: 'Ubuntu',
    osVersion: '24.04 (LTS) x64',
    vcpu: 1,
    ram: 2,
    disk: 50,
    region: 'SFO3',
    datacenter: 'San Francisco, United States',
    ip: '192.0.2.78',
    privateIp: '10.0.0.33',
    cost: 12,
    tags: ['staging'],
    createdAt: 'Mar 2, 2024',
    sshKeys: ['id_rsa (MacBook Pro)'],
    backups: false,
    monitoring: false,
  },
};

/* ─── Tabs ───────────────────────────────────────────────────────── */
const TABS = [
  { id: 'graphs',      label: 'Graphs',      icon: BarChart2 },
  { id: 'access',      label: 'Access',       icon: Terminal },
  { id: 'resize',      label: 'Resize',       icon: Server },
  { id: 'networking',  label: 'Networking',   icon: Network },
  { id: 'backups',     label: 'Backups',      icon: Camera },
  { id: 'snapshots',   label: 'Snapshots',    icon: HardDrive },
  { id: 'destroy',     label: 'Destroy',      icon: Trash2 },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Sparkline (SVG) ────────────────────────────────────────────── */
const Sparkline: React.FC<{
  data: number[];
  color: string;
  fillColor: string;
  width?: number;
  height?: number;
}> = ({ data, color, fillColor, width = 600, height = 80 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.95;
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8);
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `${pts[0].split(',')[0]},${height} ${polyline} ${pts[pts.length - 1].split(',')[0]},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Mini bar chart ─────────────────────────────────────────────── */
const BarChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16 w-full">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.7 + 0.3 * (v / max) }}
        />
      ))}
    </div>
  );
};

/* ─── Graphs tab ─────────────────────────────────────────────────── */
const generateWave = (base: number, noise: number, len: number) =>
  Array.from({ length: len }, (_, i) =>
    Math.max(0, Math.min(100, base + Math.sin(i * 0.4) * noise + (Math.random() - 0.5) * noise * 0.5))
  );

const CPU_DATA    = generateWave(32, 18, 48);
const MEM_DATA    = generateWave(62, 10, 48);
const BW_IN_DATA  = generateWave(14, 8,  24);
const BW_OUT_DATA = generateWave(7,  5,  24);
const DISK_DATA   = generateWave(5,  3,  24);

const GraphsTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => {
  const cpuAvg = (CPU_DATA.reduce((a, b) => a + b, 0) / CPU_DATA.length).toFixed(1);
  const memAvg = (MEM_DATA.reduce((a, b) => a + b, 0) / MEM_DATA.length).toFixed(1);

  const MetricCard: React.FC<{
    title: string;
    current: string;
    unit: string;
    peak: string;
    color: string;
    fillColor: string;
    data: number[];
    type?: 'line' | 'bar';
    extra?: React.ReactNode;
  }> = ({ title, current, unit, peak, color, fillColor, data, type = 'line', extra }) => (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
        <div>
          <div className="text-[13px] font-semibold text-[#031B4E]">{title}</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Last 24 hours</div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-bold text-[#031B4E]">
            {current}<span className="text-[13px] font-normal text-[#64748B]">{unit}</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">Peak: {peak}{unit}</div>
        </div>
      </div>
      <div className="px-5 pt-3 pb-4">
        <div className="h-20">
          {type === 'line'
            ? <Sparkline data={data} color={color} fillColor={fillColor} />
            : <BarChart data={data} color={color} />
          }
        </div>
        {extra && <div className="mt-3 pt-3 border-t border-[#F1F5F9]">{extra}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm px-5 py-3 flex flex-wrap gap-6">
        {[
          { label: 'CPU Average',  value: `${cpuAvg}%`,   icon: Cpu,         color: 'text-[#0069FF]' },
          { label: 'Memory Used',  value: `${memAvg}%`,   icon: MemoryStick, color: 'text-[#8B5CF6]' },
          { label: 'Disk Used',    value: '23.4 GB',       icon: HardDrive,   color: 'text-[#F59E0B]' },
          { label: 'Uptime',       value: '14d 6h 32m',    icon: Activity,    color: 'text-[#02B37B]' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon className={`w-4 h-4 ${color}`} />
            <div>
              <div className="text-[11px] text-[#94A3B8]">{label}</div>
              <div className={`text-[14px] font-bold ${color}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="CPU Usage"
          current={cpuAvg}
          unit="%"
          peak={Math.max(...CPU_DATA).toFixed(1)}
          color="#0069FF"
          fillColor="#0069FF"
          data={CPU_DATA}
        />
        <MetricCard
          title="Memory Usage"
          current={memAvg}
          unit="%"
          peak={Math.max(...MEM_DATA).toFixed(1)}
          color="#8B5CF6"
          fillColor="#8B5CF6"
          data={MEM_DATA}
        />
      </div>

      {/* Bandwidth */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <div>
            <div className="text-[13px] font-semibold text-[#031B4E]">Bandwidth</div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5">Inbound / Outbound · Last 24 hours</div>
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="flex items-center gap-1.5 text-[#02B37B] font-semibold">
              <ArrowDownLeft className="w-3.5 h-3.5" /> In: ~14 MB/s
            </span>
            <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> Out: ~7 MB/s
            </span>
          </div>
        </div>
        <div className="px-5 pt-3 pb-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text-[#64748B] mb-1.5 font-medium flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-[#02B37B]" /> Inbound
            </div>
            <div className="h-16"><BarChart data={BW_IN_DATA} color="#02B37B" /></div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] mb-1.5 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#F59E0B]" /> Outbound
            </div>
            <div className="h-16"><BarChart data={BW_OUT_DATA} color="#F59E0B" /></div>
          </div>
        </div>
      </div>

      {/* Disk I/O */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <div>
            <div className="text-[13px] font-semibold text-[#031B4E]">Disk I/O</div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5">Read / Write activity · Last 24 hours</div>
          </div>
          <div className="text-[13px] font-bold text-[#031B4E]">
            ~5.2 <span className="text-[12px] font-normal text-[#64748B]">MB/s avg</span>
          </div>
        </div>
        <div className="px-5 pt-3 pb-5">
          <div className="h-16"><Sparkline data={DISK_DATA} color="#E11D48" fillColor="#E11D48" /></div>
        </div>
      </div>
    </div>
  );
};

/* ─── Access tab ─────────────────────────────────────────────────── */
const AccessTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => {
  const [consoleLaunched, setConsoleLaunched] = useState(false);

  return (
    <div className="space-y-5">
      {/* Web Console card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="text-[15px] font-bold text-[#031B4E]">Droplet Console</h3>
          <p className="text-[13px] text-[#64748B] mt-1">
            Launch a browser-based terminal session directly into your Droplet. No SSH key required.
          </p>
        </div>
        <div className="px-6 py-5">
          {consoleLaunched ? (
            <div className="bg-[#0D1117] rounded-lg border border-[#30363D] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#30363D] bg-[#161B22]">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#02B37B]" />
                <span className="ml-2 text-[12px] text-[#8B949E] font-mono">{droplet.name} — bash</span>
                <button
                  onClick={() => setConsoleLaunched(false)}
                  className="ml-auto text-[11px] text-[#8B949E] hover:text-white px-2 py-0.5 rounded border border-[#30363D] hover:border-[#8B949E] transition-colors"
                >
                  Disconnect
                </button>
              </div>
              <div className="p-4 font-mono text-[13px] text-[#C9D1D9] min-h-[180px]">
                <div className="text-[#02B37B]">Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-88-generic x86_64)</div>
                <div className="text-[#8B949E] mt-2 text-[11px]">
                  System information as of {new Date().toUTCString()}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-0.5 text-[12px] text-[#8B949E]">
                  {[
                    ['System load:', '0.12'],
                    ['Processes:', '87'],
                    ['Usage of /:', '23.4% of 78.16GB'],
                    ['Users logged in:', '0'],
                    ['Memory usage:', '62%'],
                    ['IPv4 address:', droplet.ip],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span>{k}</span><span className="text-[#C9D1D9]">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-[#02B37B]">root@{droplet.name}</span>
                  <span className="text-[#8B949E]">:~#</span>
                  <span className="ml-1 w-2 h-4 bg-[#C9D1D9] animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => setConsoleLaunched(true)}
                className="flex items-center gap-2 bg-[#0069FF] hover:bg-[#0052D9] text-white text-[13px] font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm"
              >
                <Monitor className="w-4 h-4" />
                Launch Droplet Console
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>
              <div className="text-[12px] text-[#94A3B8]">
                Opens a secure browser-based shell session
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SSH info card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="text-[15px] font-bold text-[#031B4E]">SSH Access</h3>
          <p className="text-[13px] text-[#64748B] mt-1">
            Connect via SSH using your terminal or an SSH client.
          </p>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* SSH command */}
          <div>
            <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">SSH Command</div>
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3">
              <code className="flex-1 text-[13px] text-[#031B4E] font-mono">
                ssh root@{droplet.ip}
              </code>
              <button
                onClick={() => navigator.clipboard?.writeText(`ssh root@${droplet.ip}`)}
                className="flex items-center gap-1.5 text-[12px] text-[#0069FF] hover:text-[#0052D9] font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>

          {/* IP Addresses */}
          <div>
            <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">IP Addresses</div>
            <div className="space-y-2">
              {[
                { label: 'Public IPv4',  value: droplet.ip,         icon: Globe },
                { label: 'Private IPv4', value: droplet.privateIp,  icon: Network },
                ...(droplet.ipv6 ? [{ label: 'Public IPv6', value: droplet.ipv6, icon: Globe }] : []),
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                  <Icon className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <div className="flex-1">
                    <div className="text-[11px] text-[#94A3B8]">{label}</div>
                    <div className="text-[13px] font-mono text-[#031B4E] font-medium">{value}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(value)}
                    className="p-1.5 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#475569] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SSH Keys */}
          <div>
            <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Installed SSH Keys</div>
            {droplet.sshKeys.length === 0 ? (
              <div className="text-[13px] text-[#94A3B8]">No SSH keys configured</div>
            ) : (
              <div className="space-y-2">
                {droplet.sshKeys.map((k, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <Key className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span className="text-[13px] text-[#031B4E] font-medium">{k}</span>
                    <span className="ml-auto text-[11px] text-[#02B37B] font-semibold bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recovery mode */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#031B4E]">Recovery Mode</h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Boot from the DO recovery ISO to repair your Droplet if it becomes unresponsive.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-md border border-[#E2E8F0] text-[13px] font-semibold text-[#64748B] hover:border-[#CBD5E1] hover:text-[#031B4E] transition-colors">
            <Shield className="w-3.5 h-3.5" />
            Boot Recovery
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Networking tab ─────────────────────────────────────────────── */
const NetworkingTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E2E8F0]">
        <h3 className="text-[15px] font-bold text-[#031B4E]">Network Interfaces</h3>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            {['Interface', 'IP Address', 'Type', 'Status'].map(h => (
              <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { iface: 'eth0', ip: droplet.ip,        type: 'Public IPv4',  up: true },
            { iface: 'eth0', ip: droplet.privateIp, type: 'Private IPv4', up: true },
            ...(droplet.ipv6 ? [{ iface: 'eth0', ip: droplet.ipv6, type: 'Public IPv6', up: true }] : []),
          ].map((row, i) => (
            <tr key={i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
              <td className="px-6 py-3.5 font-mono text-[#031B4E] font-semibold">{row.iface}</td>
              <td className="px-6 py-3.5 font-mono text-[#475569]">{row.ip}</td>
              <td className="px-6 py-3.5 text-[#64748B]">{row.type}</td>
              <td className="px-6 py-3.5">
                {row.up ? (
                  <span className="flex items-center gap-1.5 text-[#02B37B] font-semibold">
                    <Wifi className="w-3.5 h-3.5" /> Up
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#94A3B8]">
                    <WifiOff className="w-3.5 h-3.5" /> Down
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Firewall */}
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#031B4E]">Firewalls</h3>
          <p className="text-[13px] text-[#64748B] mt-0.5">Manage inbound and outbound rules</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0069FF] hover:bg-[#0052D9] text-white text-[13px] font-semibold rounded-md transition-colors">
          <Shield className="w-3.5 h-3.5" /> Create Firewall
        </button>
      </div>
      <div className="text-center py-6 text-[#94A3B8]">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-[13px]">No firewall applied to this Droplet</p>
      </div>
    </div>
  </div>
);

/* ─── Backups tab ────────────────────────────────────────────────── */
const BackupsTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-[#031B4E]">Automatic Backups</h3>
          <p className="text-[13px] text-[#64748B] mt-0.5">Weekly backups · $1.80/mo (20% of Droplet cost)</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${
          droplet.backups
            ? 'bg-[#ECFDF5] text-[#02B37B] border border-[#A7F3D0]'
            : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]'
        }`}>
          {droplet.backups ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      {droplet.backups ? (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {['Backup', 'Created', 'Size', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: `${droplet.name}-weekly-2024-07-14`, date: 'Jul 14, 2024 03:15 UTC', size: '4.2 GB' },
              { name: `${droplet.name}-weekly-2024-07-07`, date: 'Jul 7, 2024 03:12 UTC',  size: '4.1 GB' },
              { name: `${droplet.name}-weekly-2024-06-30`, date: 'Jun 30, 2024 03:14 UTC', size: '4.0 GB' },
            ].map((b, i) => (
              <tr key={i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
                <td className="px-6 py-3.5 font-medium text-[#031B4E]">{b.name}</td>
                <td className="px-6 py-3.5 text-[#64748B]">{b.date}</td>
                <td className="px-6 py-3.5 text-[#64748B]">{b.size}</td>
                <td className="px-6 py-3.5">
                  <span className="text-[12px] font-bold text-[#02B37B]">Completed</span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button className="text-[12px] text-[#0069FF] hover:text-[#0052D9] font-medium">Restore</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-6 py-10 text-center">
          <Camera className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[14px] text-[#64748B] font-medium">Backups are disabled</p>
          <p className="text-[12px] text-[#94A3B8] mt-1 mb-4">Enable weekly backups for disaster recovery</p>
          <button className="px-4 py-2 bg-[#0069FF] hover:bg-[#0052D9] text-white text-[13px] font-semibold rounded-md transition-colors">
            Enable Backups
          </button>
        </div>
      )}
    </div>
  </div>
);

/* ─── Snapshots tab ─────────────────────────────────────────────── */
const SnapshotsTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => {
  const [snapping, setSnapping] = useState(false);
  const [snapName, setSnapName] = useState(`${droplet.name}-snapshot`);
  const [snapshots] = useState([
    { name: `${droplet.name}-pre-upgrade`, date: 'Jun 20, 2024', size: '4.0 GB' },
  ]);

  return (
    <div className="space-y-4">
      {/* Take snapshot */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm px-6 py-5">
        <h3 className="text-[15px] font-bold text-[#031B4E] mb-1">Take Snapshot</h3>
        <p className="text-[13px] text-[#64748B] mb-4">
          Snapshots are on-demand images of your Droplet. Each snapshot is $0.06/GB/mo.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={snapName}
            onChange={e => setSnapName(e.target.value)}
            className="flex-1 border border-[#E2E8F0] rounded-md px-3 py-2 text-[13px] text-[#031B4E] focus:outline-none focus:border-[#0069FF] transition-colors"
          />
          <button
            onClick={() => setSnapping(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0069FF] hover:bg-[#0052D9] text-white text-[13px] font-semibold rounded-md transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            {snapping ? 'Snapshotting…' : 'Take Snapshot'}
          </button>
        </div>
      </div>

      {/* Existing snapshots */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[14px] font-bold text-[#031B4E]">Existing Snapshots</h3>
        </div>
        {snapshots.length === 0 ? (
          <div className="py-10 text-center text-[#94A3B8] text-[13px]">No snapshots yet</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Snapshot Name', 'Created', 'Size', ''].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s, i) => (
                <tr key={i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
                  <td className="px-6 py-3.5 font-medium text-[#031B4E]">{s.name}</td>
                  <td className="px-6 py-3.5 text-[#64748B]">{s.date}</td>
                  <td className="px-6 py-3.5 text-[#64748B]">{s.size}</td>
                  <td className="px-6 py-3.5 flex justify-end gap-3">
                    <button className="text-[12px] text-[#0069FF] hover:text-[#0052D9] font-medium">Restore</button>
                    <button className="text-[12px] text-[#EF4444] hover:text-[#DC2626] font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ─── Destroy tab ───────────────────────────────────────────────── */
const DestroyTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => {
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleDestroy = () => {
    if (confirm === droplet.name) {
      navigate('/app/providers/digitalocean');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#FEE2E2] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#FEE2E2] bg-[#FFF5F5]">
          <h3 className="text-[15px] font-bold text-[#991B1B] flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Destroy this Droplet
          </h3>
          <p className="text-[13px] text-[#B91C1C] mt-1">
            This action is permanent and cannot be undone. All data will be lost.
          </p>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-4 py-3 text-[13px] text-[#92400E]">
            <strong>Warning:</strong> Destroying <strong>{droplet.name}</strong> will permanently delete all data on its{' '}
            {droplet.disk} GB disk. Backups and snapshots will be preserved.
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#031B4E] mb-1.5">
              To confirm, type the Droplet name: <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#EF4444]">{droplet.name}</code>
            </label>
            <input
              type="text"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={droplet.name}
              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2.5 text-[13px] text-[#031B4E] focus:outline-none focus:border-[#EF4444] transition-colors"
            />
          </div>

          <button
            onClick={handleDestroy}
            disabled={confirm !== droplet.name}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-[13px] font-bold transition-colors ${
              confirm === droplet.name
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white cursor-pointer'
                : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Destroy this Droplet
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Resize tab (placeholder) ───────────────────────────────────── */
const ResizeTab: React.FC<{ droplet: DropletData }> = ({ droplet }) => {
  const PLANS = [
    { vcpu: 1, ram: 1,  disk: 25,  price: 6 },
    { vcpu: 1, ram: 2,  disk: 50,  price: 12 },
    { vcpu: 2, ram: 4,  disk: 80,  price: 18, current: droplet.vcpu === 2 && droplet.ram === 4 },
    { vcpu: 2, ram: 8,  disk: 100, price: 36 },
    { vcpu: 4, ram: 8,  disk: 160, price: 48 },
    { vcpu: 4, ram: 16, disk: 200, price: 96 },
    { vcpu: 8, ram: 32, disk: 400, price: 192 },
  ];
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="text-[15px] font-bold text-[#031B4E]">Resize Droplet</h3>
          <p className="text-[13px] text-[#64748B] mt-1">
            Choose a new plan. Disk resizes are permanent; CPU &amp; RAM can be scaled down later.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLANS.map((p, i) => {
            const isCurrent = droplet.vcpu === p.vcpu && droplet.ram === p.ram;
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => !isCurrent && setSelected(i)}
                className={`text-left border rounded-xl p-4 transition-all ${
                  isCurrent
                    ? 'border-[#02B37B] bg-[#ECFDF5] cursor-default'
                    : isSelected
                    ? 'border-[#0069FF] bg-[#EFF6FF] shadow-sm'
                    : 'border-[#E2E8F0] hover:border-[#0069FF] hover:bg-[#F8FAFC] cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] font-bold text-[#031B4E]">${p.price}<span className="text-[11px] font-normal text-[#94A3B8]">/mo</span></span>
                  {isCurrent && (
                    <span className="text-[11px] text-[#02B37B] font-bold bg-[#D1FAE5] px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <div className="space-y-1 text-[12px] text-[#64748B]">
                  <div className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> {p.vcpu} vCPU</div>
                  <div className="flex items-center gap-1.5"><MemoryStick className="w-3 h-3" /> {p.ram} GB RAM</div>
                  <div className="flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> {p.disk} GB SSD</div>
                </div>
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div className="px-6 pb-5">
            <button className="px-5 py-2.5 bg-[#0069FF] hover:bg-[#0052D9] text-white text-[13px] font-bold rounded-md transition-colors">
              Resize Droplet to {PLANS[selected].vcpu} vCPU / {PLANS[selected].ram} GB
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main DropletDetail component ──────────────────────────────── */
export const DropletDetail: React.FC = () => {
  const { dropletId } = useParams<{ dropletId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('graphs');
  const [powerMenu, setPowerMenu] = useState(false);

  const { serverPower, toggleServerPower } = useSimulatorStore();

  let droplet = dropletId ? DROPLETS_MAP[dropletId] : null;
  if (droplet && droplet.id === '1') {
    droplet = { ...droplet, status: serverPower === 'running' ? 'active' : 'off' };
  }

  if (!droplet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Server className="w-12 h-12 text-[#CBD5E1]" />
        <div className="text-center">
          <p className="text-[16px] font-semibold text-[#031B4E]">Droplet not found</p>
          <p className="text-[13px] text-[#94A3B8] mt-1">The requested Droplet does not exist</p>
        </div>
        <button
          onClick={() => navigate('/app/providers/digitalocean')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0069FF] text-white text-[13px] font-semibold rounded-md hover:bg-[#0052D9] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Droplets
        </button>
      </div>
    );
  }

  const statusCfg = {
    active: { dot: 'bg-[#02B37B] shadow-[0_0_0_3px_rgba(2,179,123,0.20)]', text: 'Active', color: 'text-[#02B37B]' },
    off:    { dot: 'bg-[#94A3B8]', text: 'Off', color: 'text-[#94A3B8]' },
    new:    { dot: 'bg-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.20)]', text: 'New', color: 'text-[#F59E0B]' },
  }[droplet.status];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">

      {/* ── Back link ────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/app/providers/digitalocean')}
        className="flex items-center gap-1.5 text-[13px] text-[#0069FF] hover:text-[#0052D9] font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Droplets
      </button>

      {/* ── Header card ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-[#0069FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold text-[#031B4E] leading-tight">{droplet.name}</h1>
                <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${statusCfg.color}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.text}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1.5 text-[12px] text-[#64748B]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{droplet.region}</span>
                <span>·</span>
                <span>{droplet.os} {droplet.osVersion}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Created {droplet.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Power controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Console button */}
            <button
              onClick={() => setActiveTab('access')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#E2E8F0] text-[13px] font-semibold text-[#64748B] hover:border-[#0069FF] hover:text-[#0069FF] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" /> Console
            </button>

            {/* Power dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (droplet?.id === '1') toggleServerPower();
                  setPowerMenu(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                  droplet.status === 'active'
                    ? 'border border-[#E2E8F0] text-[#64748B] hover:border-[#EF4444] hover:text-[#EF4444]'
                    : 'bg-[#02B37B] hover:bg-[#029668] text-white'
                }`}
              >
                {droplet.status === 'active'
                  ? <><PowerOff className="w-3.5 h-3.5" /> Power Off</>
                  : <><Power className="w-3.5 h-3.5" /> Power On</>
                }
                <ChevronDown className="w-3 h-3" />
              </button>

              {powerMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPowerMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-40 w-44 bg-white rounded-lg border border-[#E2E8F0] shadow-lg py-1">
                    {[
                      { label: 'Power Cycle',  icon: RefreshCw,  cls: '' },
                      { label: 'Soft Reboot',  icon: RefreshCw,  cls: '' },
                      { label: 'Hard Reboot',  icon: RefreshCw,  cls: '' },
                      { label: 'Power Off',    icon: PowerOff,   cls: 'text-[#EF4444]' },
                    ].map(({ label, icon: Icon, cls }) => (
                      <button
                        key={label}
                        onClick={() => setPowerMenu(false)}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] hover:bg-[#F8FAFC] text-left ${cls || 'text-[#031B4E]'}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#64748B]" /> {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Spec summary row */}
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Cpu,         label: 'vCPUs',    value: `${droplet.vcpu} vCPU` },
            { icon: MemoryStick, label: 'Memory',   value: `${droplet.ram} GB RAM` },
            { icon: HardDrive,   label: 'Storage',  value: `${droplet.disk} GB SSD` },
            { icon: TrendingUp,  label: 'Transfer', value: '4 TB / mo' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#64748B]" />
              </div>
              <div>
                <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">{label}</div>
                <div className="text-[13px] font-bold text-[#031B4E]">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E2E8F0] overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === id
                  ? 'border-[#0069FF] text-[#0069FF] bg-[#F8FAFC]'
                  : 'border-transparent text-[#64748B] hover:text-[#031B4E] hover:bg-[#F8FAFC]'
              } ${id === 'destroy' && activeTab !== 'destroy' ? 'hover:text-[#EF4444]' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────── */}
      {activeTab === 'graphs'     && <GraphsTab     droplet={droplet} />}
      {activeTab === 'access'     && <AccessTab     droplet={droplet} />}
      {activeTab === 'resize'     && <ResizeTab     droplet={droplet} />}
      {activeTab === 'networking' && <NetworkingTab droplet={droplet} />}
      {activeTab === 'backups'    && <BackupsTab    droplet={droplet} />}
      {activeTab === 'snapshots'  && <SnapshotsTab  droplet={droplet} />}
      {activeTab === 'destroy'    && <DestroyTab    droplet={droplet} />}
    </div>
  );
};

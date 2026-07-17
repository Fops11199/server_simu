import React, { useState } from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import {
  Search,
  RefreshCcw,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Copy,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type InstanceState = 'running' | 'stopped' | 'pending' | 'terminated' | 'stopping';

interface EC2Instance {
  id: string;
  name: string;
  instanceId: string;
  state: InstanceState;
  instanceType: string;
  statusCheck: 'passed' | 'failed' | 'initializing' | '—';
  alarmStatus: 'No alarms' | 'In alarm' | '—';
  az: string;
  publicIp: string | null;
  privateIp: string;
  vpcId: string;
  subnetId: string;
  amiId: string;
  keyPair: string;
  launchTime: string;
  platform: string;
  monitoring: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const BASE_INSTANCES: EC2Instance[] = [
  {
    id: '1',
    name: 'web-server-01',
    instanceId: 'i-0abc123def456789a',
    state: 'running',
    instanceType: 't3.medium',
    statusCheck: 'passed',
    alarmStatus: 'No alarms',
    az: 'us-east-1a',
    publicIp: '203.0.113.10',
    privateIp: '10.0.1.42',
    vpcId: 'vpc-0a1b2c3d4e5f67890',
    subnetId: 'subnet-0a1b2c3d4e5f67891',
    amiId: 'ami-0abcdef1234567890',
    keyPair: 'hostlab-keypair',
    launchTime: '2026-07-14T08:22:31Z',
    platform: 'Linux/UNIX',
    monitoring: 'disabled',
  },
  {
    id: '2',
    name: 'db-server',
    instanceId: 'i-0def456abc789012b',
    state: 'stopped',
    instanceType: 't3.large',
    statusCheck: '—',
    alarmStatus: '—',
    az: 'us-east-1b',
    publicIp: null,
    privateIp: '10.0.2.88',
    vpcId: 'vpc-0a1b2c3d4e5f67890',
    subnetId: 'subnet-0a1b2c3d4e5f67892',
    amiId: 'ami-0abcdef1234567891',
    keyPair: 'hostlab-keypair',
    launchTime: '2026-07-10T14:05:09Z',
    platform: 'Linux/UNIX',
    monitoring: 'disabled',
  },
  {
    id: '3',
    name: 'staging-app',
    instanceId: 'i-0789012def123456c',
    state: 'running',
    instanceType: 't3.small',
    statusCheck: 'passed',
    alarmStatus: 'No alarms',
    az: 'us-east-1c',
    publicIp: '192.0.2.78',
    privateIp: '10.0.3.15',
    vpcId: 'vpc-0a1b2c3d4e5f67890',
    subnetId: 'subnet-0a1b2c3d4e5f67893',
    amiId: 'ami-0abcdef1234567892',
    keyPair: 'hostlab-keypair',
    launchTime: '2026-07-16T09:11:44Z',
    platform: 'Linux/UNIX',
    monitoring: 'disabled',
  },
];

// ─── State Badge ─────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<InstanceState, { color: string; bg: string; label: string }> = {
  running:    { color: '#1d8102', bg: '#d5f5d5', label: 'Running' },
  stopped:    { color: '#d13212', bg: '#fce5e0', label: 'Stopped' },
  pending:    { color: '#0972d3', bg: '#e3f0fb', label: 'Pending' },
  terminated: { color: '#5f6b7a', bg: '#f2f3f3', label: 'Terminated' },
  stopping:   { color: '#7d5903', bg: '#fef7e0', label: 'Stopping' },
};

const InstanceStateBadge: React.FC<{ state: InstanceState }> = ({ state }) => {
  const cfg = STATE_CONFIG[state];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Outer ring */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: `1.5px solid ${cfg.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Inner dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: cfg.color,
          }}
        />
      </div>
      <span style={{ color: cfg.color, fontWeight: 600, fontSize: 13 }}>{cfg.label}</span>
    </div>
  );
};

// ─── Status Check Badge ──────────────────────────────────────────────────────

const StatusCheckBadge: React.FC<{ status: EC2Instance['statusCheck'] }> = ({ status }) => {
  if (status === '—') return <span style={{ color: '#5f6b7a', fontSize: 13 }}>—</span>;
  if (status === 'passed') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <CheckCircle2 size={14} color="#1d8102" />
        <span style={{ color: '#1d8102', fontSize: 13, fontWeight: 500 }}>2/2 checks passed</span>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <AlertCircle size={14} color="#d13212" />
        <span style={{ color: '#d13212', fontSize: 13, fontWeight: 500 }}>Check failed</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Clock size={14} color="#0972d3" />
      <span style={{ color: '#0972d3', fontSize: 13, fontWeight: 500 }}>Initializing</span>
    </div>
  );
};

// ─── Button helpers ──────────────────────────────────────────────────────────

const OutlineBtn: React.FC<{
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ children, disabled, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 14px',
        fontSize: 14,
        fontWeight: 600,
        color: disabled ? '#aab7b8' : '#16191f',
        background: hov && !disabled ? '#f2f3f3' : '#ffffff',
        border: `1px solid ${disabled ? '#d5dbdb' : '#5f6b7a'}`,
        borderRadius: 20,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.1s',
        boxShadow: '0 1px 1px rgba(0,28,36,.15)',
      }}
    >
      {children}
    </button>
  );
};

const PrimaryBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  orange?: boolean;
}> = ({ children, onClick, orange }) => {
  const [hov, setHov] = useState(false);
  const base = orange ? '#ec7211' : '#0972d3';
  const hover = orange ? '#cc5f09' : '#06529b';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 14px',
        fontSize: 14,
        fontWeight: 600,
        color: '#ffffff',
        background: hov ? hover : base,
        border: 'none',
        borderRadius: 20,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.1s',
        boxShadow: '0 1px 1px rgba(0,28,36,.3)',
      }}
    >
      {children}
    </button>
  );
};

// ─── Table Header Cell ────────────────────────────────────────────────────────

const TH: React.FC<{ children: React.ReactNode; minWidth?: number }> = ({ children, minWidth }) => (
  <th
    style={{
      padding: '10px 16px',
      fontSize: 13,
      fontWeight: 700,
      color: '#16191f',
      background: '#fafafa',
      borderBottom: '2px solid #eaeded',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      minWidth: minWidth ?? 100,
      textAlign: 'left',
      userSelect: 'none',
    }}
  >
    {children}
  </th>
);

const TD: React.FC<{
  children: React.ReactNode;
  link?: boolean;
  mono?: boolean;
  muted?: boolean;
}> = ({ children, link, mono, muted }) => (
  <td
    style={{
      padding: '10px 16px',
      fontSize: 13,
      color: link ? '#0972d3' : muted ? '#5f6b7a' : '#16191f',
      cursor: link ? 'pointer' : 'default',
      fontFamily: mono ? "'Courier New', Courier, monospace" : 'inherit',
      whiteSpace: 'nowrap',
      borderBottom: '1px solid #eaeded',
    }}
  >
    {link ? (
      <span style={{ textDecoration: 'none' }} className="hover:underline">
        {children}
      </span>
    ) : (
      children
    )}
  </td>
);

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const DetailPanel: React.FC<{
  instance: EC2Instance;
  onClose: () => void;
}> = ({ instance, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'Details' | 'Security' | 'Networking' | 'Storage' | 'Status checks' | 'Monitoring' | 'Tags'
  >('Details');

  const cfg = STATE_CONFIG[instance.state];

  const TABS = ['Details', 'Security', 'Networking', 'Storage', 'Status checks', 'Monitoring', 'Tags'] as const;

  const KVRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({
    label,
    value,
    mono,
  }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '12px 0',
        borderBottom: '1px solid #eaeded',
      }}
    >
      <span style={{ fontSize: 12, color: '#5f6b7a', fontWeight: 600 }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          color: '#16191f',
          fontFamily: mono ? "'Courier New', Courier, monospace" : 'inherit',
          wordBreak: 'break-all',
        }}
      >
        {value ?? <span style={{ color: '#8c95a0' }}>—</span>}
      </span>
    </div>
  );

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d5dbdb',
        borderRadius: 4,
        marginTop: 16,
        boxShadow: '0 1px 4px rgba(0,28,36,.15)',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #eaeded',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#16191f' }}>
            {instance.name}
          </span>
          <span
            style={{
              fontSize: 12,
              color: cfg.color,
              background: cfg.bg,
              padding: '2px 8px',
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            {cfg.label}
          </span>
          <span style={{ fontSize: 12, color: '#5f6b7a', fontFamily: 'monospace' }}>
            {instance.instanceId}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#5f6b7a',
            fontSize: 18,
            lineHeight: 1,
            padding: '2px 6px',
          }}
        >
          ×
        </button>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #eaeded',
          padding: '0 20px',
          background: '#ffffff',
          gap: 0,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#0972d3' : '#16191f',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #0972d3' : '3px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '0 20px 20px' }}>
        {activeTab === 'Details' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0 40px',
            }}
          >
            <div>
              <KVRow label="Instance ID" value={instance.instanceId} mono />
              <KVRow label="Instance state" value={<InstanceStateBadge state={instance.state} />} />
              <KVRow label="Instance type" value={instance.instanceType} />
              <KVRow label="Elastic IP addresses" value="—" />
              <KVRow label="Public IPv4 address" value={instance.publicIp ?? '—'} />
              <KVRow label="Private IPv4 addresses" value={instance.privateIp} mono />
              <KVRow label="IPv6 addresses" value="—" />
            </div>
            <div>
              <KVRow label="VPC ID" value={instance.vpcId} mono />
              <KVRow label="Subnet ID" value={instance.subnetId} mono />
              <KVRow label="Availability Zone" value={instance.az} />
              <KVRow label="Launch time" value={new Date(instance.launchTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} />
              <KVRow label="Auto-assigned IP address" value="—" />
              <KVRow label="Owner" value="123456789012" mono />
              <KVRow label="Scheduled events" value="No scheduled events" />
            </div>
            <div>
              <KVRow label="AMI ID" value={instance.amiId} mono />
              <KVRow label="AMI name" value="amzn2-ami-hvm-2.0.20240131.0-x86_64-gp2" />
              <KVRow label="Key pair name" value={instance.keyPair} />
              <KVRow label="Platform" value={instance.platform} />
              <KVRow label="Monitoring" value={instance.monitoring === 'disabled' ? 'Basic monitoring' : 'Detailed monitoring'} />
              <KVRow label="Termination protection" value="Disabled" />
              <KVRow label="Stop protection" value="Disabled" />
            </div>
          </div>
        )}

        {activeTab === 'Security' && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
              <KVRow label="IAM role" value="—" />
              <KVRow label="Key pair name" value={instance.keyPair} />
              <KVRow label="Owner" value="123456789012" mono />
              <KVRow label="Launch time" value={new Date(instance.launchTime).toLocaleString()} />
            </div>
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#16191f', marginBottom: 12 }}>Security groups</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <TH>Security group ID</TH>
                    <TH>Security group name</TH>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <TD link mono>sg-0a1b2c3d4e5f67890</TD>
                    <TD>default</TD>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Networking' && (
          <div style={{ paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
            <KVRow label="VPC ID" value={<span style={{ color: '#0972d3', cursor: 'pointer' }}>{instance.vpcId}</span>} />
            <KVRow label="Subnet ID" value={<span style={{ color: '#0972d3', cursor: 'pointer' }}>{instance.subnetId}</span>} />
            <KVRow label="Availability Zone" value={instance.az} />
            <KVRow label="Public IPv4 address" value={instance.publicIp ?? '—'} />
            <KVRow label="Private IPv4 addresses" value={instance.privateIp} mono />
            <KVRow label="Private IPv4 DNS" value={`ip-${instance.privateIp.replace(/\./g, '-')}.ec2.internal`} mono />
            <KVRow label="Public IPv4 DNS" value={instance.publicIp ? `ec2-${instance.publicIp.replace(/\./g, '-')}.compute-1.amazonaws.com` : '—'} mono />
            <KVRow label="Source / destination check" value="Enabled" />
          </div>
        )}

        {activeTab === 'Storage' && (
          <div style={{ paddingTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Root device details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
              <KVRow label="Root device name" value="/dev/xvda" mono />
              <KVRow label="Root device type" value="EBS" />
              <KVRow label="EBS-optimized" value="Yes" />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 12 }}>Block devices</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>Volume ID</TH>
                  <TH>Device name</TH>
                  <TH>Volume size (GiB)</TH>
                  <TH>Volume type</TH>
                  <TH>Attachment status</TH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TD link mono>vol-0a1b2c3d4e5f67890</TD>
                  <TD mono>/dev/xvda</TD>
                  <TD>20</TD>
                  <TD>gp3</TD>
                  <TD><span style={{ color: '#1d8102', fontWeight: 600 }}>attached</span></TD>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Status checks' && (
          <div style={{ paddingTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>Status check</TH>
                  <TH>Status</TH>
                  <TH>Description</TH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TD>System reachability</TD>
                  <TD>
                    {instance.state === 'running' ? (
                      <span style={{ color: '#1d8102', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Passed
                      </span>
                    ) : (
                      <span style={{ color: '#5f6b7a' }}>—</span>
                    )}
                  </TD>
                  <TD muted>Checks AWS controlled components</TD>
                </tr>
                <tr>
                  <TD>Instance reachability</TD>
                  <TD>
                    {instance.state === 'running' ? (
                      <span style={{ color: '#1d8102', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Passed
                      </span>
                    ) : (
                      <span style={{ color: '#5f6b7a' }}>—</span>
                    )}
                  </TD>
                  <TD muted>Checks software and network configuration</TD>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Monitoring' && (
          <div style={{ paddingTop: 16, color: '#5f6b7a', fontSize: 14 }}>
            <div
              style={{
                padding: 20,
                background: '#fafafa',
                border: '1px solid #eaeded',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Activity size={32} color="#aab7b8" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontWeight: 600, color: '#16191f' }}>Basic monitoring enabled</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                Enable detailed monitoring to get metrics at 1-minute granularity.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Tags' && (
          <div style={{ paddingTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>Key</TH>
                  <TH>Value</TH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TD mono>Name</TD>
                  <TD>{instance.name}</TD>
                </tr>
                <tr>
                  <TD mono>Environment</TD>
                  <TD>{instance.name.includes('staging') ? 'staging' : 'production'}</TD>
                </tr>
                <tr>
                  <TD mono>Project</TD>
                  <TD>hostlab-sim</TD>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const EC2Dashboard: React.FC = () => {
  const { serverPower, toggleServerPower } = useSimulatorStore();

  const INSTANCES = BASE_INSTANCES.map((inst, index) => {
    if (index === 0) {
      return {
        ...inst,
        state: serverPower === 'running' ? 'running' : 'stopped' as InstanceState,
      };
    }
    return inst;
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailInstance, setDetailInstance] = useState<EC2Instance | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InstanceState | 'all'>('all');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === INSTANCES.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(INSTANCES.map(i => i.id)));
    }
  };

  const filtered = INSTANCES.filter(inst => {
    const matchSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.instanceId.toLowerCase().includes(search.toLowerCase()) ||
      (inst.publicIp ?? '').includes(search);
    const matchFilter = filter === 'all' || inst.state === filter;
    return matchSearch && matchFilter;
  });

  const hasSelection = selectedIds.size > 0;
  const oneSelected = selectedIds.size === 1;
  const selectedInstance = oneSelected
    ? INSTANCES.find(i => selectedIds.has(i.id)) ?? null
    : null;

  return (
    <div
      style={{
        fontFamily: "'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif",
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d5dbdb',
          borderRadius: 4,
          boxShadow: '0 1px 1px 0 rgba(0,28,36,.3), 1px 1px 1px 0 rgba(0,28,36,.15), -1px 1px 1px 0 rgba(0,28,36,.15)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #eaeded',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#16191f', margin: 0 }}>
              Instances ({INSTANCES.length})
            </h1>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#5f6b7a',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
                borderRadius: 4,
              }}
              title="Refresh"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <OutlineBtn disabled={!hasSelection}>Connect</OutlineBtn>
            <OutlineBtn 
              disabled={!hasSelection}
              onClick={() => {
                if (selectedIds.has('1')) {
                  toggleServerPower();
                }
              }}
            >
              Toggle State
              <ChevronDown size={13} />
            </OutlineBtn>
            <OutlineBtn disabled={!hasSelection}>
              Actions
              <ChevronDown size={13} />
            </OutlineBtn>
            <PrimaryBtn orange>
              Launch instances
            </PrimaryBtn>
          </div>
        </div>

        {/* Filter / search bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #eaeded',
            background: '#fafafa',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 600 }}>
            {/* Search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1px solid #5f6b7a',
                borderRadius: 4,
                padding: '5px 10px',
                flex: 1,
                boxShadow: '0 1px 1px rgba(0,28,36,.1)',
              }}
            >
              <Search size={14} color="#5f6b7a" />
              <input
                type="text"
                placeholder="Find instances by attribute or tag (case sensitive)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: '#16191f',
                  background: 'transparent',
                  width: '100%',
                }}
              />
            </div>
            {/* Add filter */}
            <OutlineBtn>
              <Filter size={13} />
              Add filter
            </OutlineBtn>
          </div>

          {/* Right: count + preferences */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#5f6b7a' }}>
            <span>
              {selectedIds.size > 0
                ? `${selectedIds.size} of ${filtered.length} selected`
                : `${filtered.length} instances`}
            </span>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#5f6b7a',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Preferences"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* State filter tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #eaeded',
            padding: '0 20px',
            background: '#ffffff',
          }}
        >
          {(['all', 'running', 'stopped', 'pending'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: filter === s ? 700 : 400,
                color: filter === s ? '#0972d3' : '#5f6b7a',
                background: 'transparent',
                border: 'none',
                borderBottom: filter === s ? '2px solid #0972d3' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -2,
                whiteSpace: 'nowrap',
              }}
            >
              {s === 'all' ? 'All instances' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  background: filter === s ? '#e3f0fb' : '#f2f3f3',
                  color: filter === s ? '#0972d3' : '#5f6b7a',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                {s === 'all' ? INSTANCES.length : INSTANCES.filter(i => i.state === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {/* Checkbox */}
                <th
                  style={{
                    width: 40,
                    padding: '10px 12px 10px 20px',
                    borderBottom: '2px solid #eaeded',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.size === INSTANCES.length && INSTANCES.length > 0}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: '#0972d3' }}
                  />
                </th>
                <TH minWidth={130}>Name</TH>
                <TH minWidth={185}>Instance ID</TH>
                <TH minWidth={110}>Instance state</TH>
                <TH minWidth={110}>Instance type</TH>
                <TH minWidth={150}>Status check</TH>
                <TH minWidth={120}>Alarm status</TH>
                <TH minWidth={120}>Availability Zone</TH>
                <TH minWidth={130}>Public IPv4</TH>
                <TH minWidth={130}>Private IPv4</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ padding: 40, textAlign: 'center', color: '#5f6b7a', fontSize: 14 }}
                  >
                    No instances match the current filter.
                  </td>
                </tr>
              )}
              {filtered.map(inst => {
                const isSelected = selectedIds.has(inst.id);
                const isDetail = detailInstance?.id === inst.id;
                return (
                  <tr
                    key={inst.id}
                    style={{
                      background: isSelected
                        ? '#f0f7ff'
                        : isDetail
                        ? '#fafeff'
                        : '#ffffff',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f9f9f9';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = isSelected
                        ? '#f0f7ff'
                        : '#ffffff';
                    }}
                  >
                    {/* Checkbox */}
                    <td
                      style={{
                        padding: '10px 12px 10px 20px',
                        borderBottom: '1px solid #eaeded',
                        width: 40,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(inst.id)}
                        style={{ cursor: 'pointer', accentColor: '#0972d3' }}
                      />
                    </td>
                    {/* Name */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        color: '#0972d3',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() =>
                        setDetailInstance(prev =>
                          prev?.id === inst.id ? null : inst
                        )
                      }
                    >
                      <span className="hover:underline">{inst.name}</span>
                    </td>
                    {/* Instance ID */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            color: '#0972d3',
                            cursor: 'pointer',
                            fontFamily: "'Courier New', Courier, monospace",
                            fontSize: 12.5,
                          }}
                          className="hover:underline"
                        >
                          {inst.instanceId}
                        </span>
                        <button
                          title="Copy instance ID"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#5f6b7a',
                            padding: 2,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    {/* State */}
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid #eaeded' }}>
                      <InstanceStateBadge state={inst.state} />
                    </td>
                    {/* Type */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        fontSize: 13,
                        color: '#0972d3',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span className="hover:underline">{inst.instanceType}</span>
                    </td>
                    {/* Status check */}
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid #eaeded' }}>
                      <StatusCheckBadge status={inst.statusCheck} />
                    </td>
                    {/* Alarm */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        fontSize: 13,
                        color: inst.alarmStatus === '—' ? '#5f6b7a' : '#16191f',
                      }}
                    >
                      {inst.alarmStatus}
                    </td>
                    {/* AZ */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {inst.az}
                    </td>
                    {/* Public IP */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        fontSize: 13,
                        color: inst.publicIp ? '#0972d3' : '#5f6b7a',
                        fontFamily: inst.publicIp ? "'Courier New', Courier, monospace" : 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {inst.publicIp ?? '—'}
                    </td>
                    {/* Private IP */}
                    <td
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #eaeded',
                        fontSize: 13,
                        fontFamily: "'Courier New', Courier, monospace",
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {inst.privateIp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderTop: '1px solid #eaeded',
            background: '#fafafa',
          }}
        >
          <span style={{ fontSize: 13, color: '#5f6b7a' }}>
            Showing {filtered.length} instance{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              disabled
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 10px',
                fontSize: 13,
                background: '#ffffff',
                border: '1px solid #d5dbdb',
                borderRadius: 4,
                color: '#aab7b8',
                cursor: 'not-allowed',
              }}
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span
              style={{
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: '#ffffff',
                background: '#0972d3',
                border: '1px solid #0972d3',
                borderRadius: 4,
              }}
            >
              1
            </span>
            <button
              disabled
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 10px',
                fontSize: 13,
                background: '#ffffff',
                border: '1px solid #d5dbdb',
                borderRadius: 4,
                color: '#aab7b8',
                cursor: 'not-allowed',
              }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail panel (split panel style) */}
      {detailInstance && (
        <DetailPanel
          instance={detailInstance}
          onClose={() => setDetailInstance(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Copy,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Shield,
  HardDrive,
  Network,
  Tag,
  Info,
  RefreshCcw,
  Play,
  Square,
  RotateCcw,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type InstanceState = 'running' | 'stopped' | 'pending' | 'terminated' | 'stopping';

type TabId = 'Details' | 'Security' | 'Networking' | 'Storage' | 'Status checks' | 'Monitoring' | 'Tags';

interface InstanceDetailProps {
  instanceId?: string;
  name?: string;
  state?: InstanceState;
  instanceType?: string;
  amiId?: string;
  launchTime?: string;
  vpcId?: string;
  subnetId?: string;
  publicIp?: string | null;
  privateIp?: string;
  keyPair?: string;
  az?: string;
  platform?: string;
  monitoring?: string;
  onClose?: () => void;
}

// ─── Default mock data ────────────────────────────────────────────────────────

const DEFAULT: Required<Omit<InstanceDetailProps, 'onClose'>> = {
  instanceId: 'i-0abc123def456789a',
  name: 'web-server-01',
  state: 'running',
  instanceType: 't3.medium',
  amiId: 'ami-0abcdef1234567890',
  launchTime: '2026-07-14T08:22:31Z',
  vpcId: 'vpc-0a1b2c3d4e5f67890',
  subnetId: 'subnet-0a1b2c3d4e5f67891',
  publicIp: '203.0.113.10',
  privateIp: '10.0.1.42',
  keyPair: 'hostlab-keypair',
  az: 'us-east-1a',
  platform: 'Linux/UNIX',
  monitoring: 'disabled',
};

// ─── State config ─────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<InstanceState, { color: string; bg: string; label: string }> = {
  running:    { color: '#1d8102', bg: '#d5f5d5', label: 'Running' },
  stopped:    { color: '#d13212', bg: '#fce5e0', label: 'Stopped' },
  pending:    { color: '#0972d3', bg: '#e3f0fb', label: 'Pending' },
  terminated: { color: '#5f6b7a', bg: '#f2f3f3', label: 'Terminated' },
  stopping:   { color: '#7d5903', bg: '#fef7e0', label: 'Stopping' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StateDot: React.FC<{ state: InstanceState }> = ({ state }) => {
  const cfg = STATE_CONFIG[state];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: `1.5px solid ${cfg.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
      </div>
      <span style={{ color: cfg.color, fontWeight: 600, fontSize: 13 }}>{cfg.label}</span>
    </div>
  );
};

const CopyableValue: React.FC<{ value: string; mono?: boolean }> = ({ value, mono }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          fontSize: 13,
          color: '#0972d3',
          fontFamily: mono ? "'Courier New', Courier, monospace" : 'inherit',
          cursor: 'pointer',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </span>
      <button
        onClick={handleCopy}
        title="Copy"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: copied ? '#1d8102' : '#5f6b7a',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
};

// ─── KV Grid Cell ─────────────────────────────────────────────────────────────

const KVCell: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  link?: boolean;
}> = ({ label, value, mono, link }) => (
  <div
    style={{
      padding: '12px 0',
      borderBottom: '1px solid #eaeded',
    }}
  >
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: '#5f6b7a',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </div>
    {typeof value === 'string' ? (
      link ? (
        <span
          style={{
            fontSize: 13,
            color: '#0972d3',
            cursor: 'pointer',
            fontFamily: mono ? "'Courier New', Courier, monospace" : 'inherit',
          }}
        >
          {value}
        </span>
      ) : (
        <span
          style={{
            fontSize: 13,
            color: '#16191f',
            fontFamily: mono ? "'Courier New', Courier, monospace" : 'inherit',
            wordBreak: 'break-all',
          }}
        >
          {value || <span style={{ color: '#8c95a0' }}>—</span>}
        </span>
      )
    ) : (
      value
    )}
  </div>
);

// ─── Tab button ───────────────────────────────────────────────────────────────

const TabBtn: React.FC<{
  id: TabId;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}> = ({ id, icon, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      fontSize: 14,
      fontWeight: active ? 700 : 400,
      color: active ? '#0972d3' : '#16191f',
      background: 'transparent',
      border: 'none',
      borderBottom: active ? '3px solid #0972d3' : '3px solid transparent',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      marginBottom: -1,
    }}
  >
    <span style={{ color: active ? '#0972d3' : '#5f6b7a' }}>{icon}</span>
    {id}
  </button>
);

// ─── Security Groups mini-table ───────────────────────────────────────────────

const MiniTable: React.FC<{
  columns: string[];
  rows: Record<string, React.ReactNode>[];
}> = ({ columns, rows }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
    <thead>
      <tr style={{ background: '#fafafa' }}>
        {columns.map(col => (
          <th
            key={col}
            style={{
              padding: '8px 14px',
              textAlign: 'left',
              fontWeight: 700,
              color: '#16191f',
              borderBottom: '2px solid #eaeded',
              whiteSpace: 'nowrap',
            }}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #eaeded' }}>
          {columns.map(col => (
            <td
              key={col}
              style={{
                padding: '8px 14px',
                color: '#16191f',
                whiteSpace: 'nowrap',
              }}
            >
              {row[col] ?? '—'}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

// ─── Inbound/Outbound rule row ────────────────────────────────────────────────

interface FirewallRule {
  port: string;
  protocol: string;
  source: string;
  description: string;
}

const INBOUND: FirewallRule[] = [
  { port: '22', protocol: 'TCP', source: '0.0.0.0/0', description: 'SSH access' },
  { port: '80', protocol: 'TCP', source: '0.0.0.0/0', description: 'HTTP' },
  { port: '443', protocol: 'TCP', source: '0.0.0.0/0', description: 'HTTPS' },
];

const OUTBOUND: FirewallRule[] = [
  { port: 'All', protocol: 'All', source: '0.0.0.0/0', description: 'Allow all outbound' },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const DetailsTab: React.FC<{ data: Required<Omit<InstanceDetailProps, 'onClose'>> }> = ({ data }) => {
  const cfg = STATE_CONFIG[data.state];
  const launchDate = new Date(data.launchTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0 40px',
        padding: '4px 0 0',
      }}
    >
      {/* Column 1 */}
      <div>
        <KVCell
          label="Instance ID"
          value={<CopyableValue value={data.instanceId} mono />}
        />
        <KVCell
          label="Instance state"
          value={<StateDot state={data.state} />}
        />
        <KVCell label="Instance type" value={data.instanceType} />
        <KVCell label="Elastic IP address" value={<span style={{ color: '#8c95a0' }}>—</span>} />
        <KVCell
          label="Public IPv4 address"
          value={
            data.publicIp ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#16191f', fontFamily: 'monospace' }}>
                  {data.publicIp}
                </span>
                <ArrowUpRight size={13} color="#0972d3" style={{ cursor: 'pointer' }} />
              </div>
            ) : (
              <span style={{ color: '#8c95a0' }}>—</span>
            )
          }
        />
        <KVCell
          label="Private IPv4 address"
          value={<CopyableValue value={data.privateIp} mono />}
        />
        <KVCell label="IPv6 address" value={<span style={{ color: '#8c95a0' }}>—</span>} />
        <KVCell
          label="Hostname type"
          value="IP name: ip-based"
        />
      </div>

      {/* Column 2 */}
      <div>
        <KVCell label="VPC ID" value={data.vpcId} link mono />
        <KVCell label="Subnet ID" value={data.subnetId} link mono />
        <KVCell label="Availability Zone" value={data.az} />
        <KVCell label="Launch time" value={launchDate} />
        <KVCell label="Auto-assigned IP address" value={<span style={{ color: '#8c95a0' }}>—</span>} />
        <KVCell label="Scheduled events" value="No scheduled events" />
        <KVCell label="Owner" value="123456789012" mono />
        <KVCell label="Life cycle" value="Normal" />
      </div>

      {/* Column 3 */}
      <div>
        <KVCell label="AMI ID" value={data.amiId} link mono />
        <KVCell label="AMI name" value="amzn2-ami-hvm-2.0.20240131.0-x86_64-gp2" />
        <KVCell label="Key pair name" value={data.keyPair} />
        <KVCell label="Platform" value={data.platform} />
        <KVCell
          label="Monitoring"
          value={data.monitoring === 'disabled' ? 'Basic monitoring' : 'Detailed monitoring'}
        />
        <KVCell label="Termination protection" value="Disabled" />
        <KVCell label="Stop protection" value="Disabled" />
        <KVCell label="Hibernation" value="Disabled" />
      </div>
    </div>
  );
};

const SecurityTab: React.FC<{ data: Required<Omit<InstanceDetailProps, 'onClose'>> }> = ({ data }) => (
  <div style={{ padding: '8px 0 0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 40px', marginBottom: 24 }}>
      <KVCell label="IAM role" value={<span style={{ color: '#8c95a0' }}>—</span>} />
      <KVCell label="Key pair name" value={data.keyPair} />
      <KVCell label="Source/destination check" value="Enabled" />
    </div>

    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#16191f', margin: '0 0 8px' }}>
      Security groups
    </h4>
    <MiniTable
      columns={['Security group ID', 'Security group name', 'VPC ID']}
      rows={[
        {
          'Security group ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>sg-0a1b2c3d4e5f67890</span>,
          'Security group name': 'default',
          'VPC ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{data.vpcId}</span>,
        },
        {
          'Security group ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>sg-0b9c8d7e6f5a4321f</span>,
          'Security group name': 'web-server-sg',
          'VPC ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{data.vpcId}</span>,
        },
      ]}
    />

    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#16191f', margin: '20px 0 8px' }}>
      Inbound rules
    </h4>
    <MiniTable
      columns={['Port range', 'Protocol', 'Source', 'Description']}
      rows={INBOUND.map(r => ({
        'Port range': r.port,
        'Protocol': r.protocol,
        'Source': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{r.source}</span>,
        'Description': r.description,
      }))}
    />

    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#16191f', margin: '20px 0 8px' }}>
      Outbound rules
    </h4>
    <MiniTable
      columns={['Port range', 'Protocol', 'Destination', 'Description']}
      rows={OUTBOUND.map(r => ({
        'Port range': r.port,
        'Protocol': r.protocol,
        'Destination': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{r.source}</span>,
        'Description': r.description,
      }))}
    />
  </div>
);

const NetworkingTab: React.FC<{ data: Required<Omit<InstanceDetailProps, 'onClose'>> }> = ({ data }) => (
  <div style={{ padding: '8px 0 0' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0 40px',
        marginBottom: 24,
      }}
    >
      <KVCell label="VPC ID" value={data.vpcId} link mono />
      <KVCell label="Subnet ID" value={data.subnetId} link mono />
      <KVCell label="Availability Zone" value={data.az} />
      <KVCell label="Public IPv4 address" value={data.publicIp ?? '—'} mono />
      <KVCell label="Private IPv4 addresses" value={data.privateIp} mono />
      <KVCell
        label="Private IPv4 DNS"
        value={`ip-${data.privateIp.replace(/\./g, '-')}.ec2.internal`}
        mono
      />
      <KVCell
        label="Public IPv4 DNS"
        value={
          data.publicIp
            ? `ec2-${data.publicIp.replace(/\./g, '-')}.compute-1.amazonaws.com`
            : '—'
        }
        mono
      />
      <KVCell label="Source/destination check" value="Enabled" />
      <KVCell label="ENA support" value="Enabled" />
    </div>

    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#16191f', margin: '0 0 8px' }}>
      Network interfaces (1)
    </h4>
    <MiniTable
      columns={['Interface ID', 'Private IPv4', 'Description', 'Status']}
      rows={[
        {
          'Interface ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>eni-0a1b2c3d4e5f67890</span>,
          'Private IPv4': <span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{data.privateIp}</span>,
          'Description': 'Primary network interface',
          'Status': <span style={{ color: '#1d8102', fontWeight: 600 }}>in-use</span>,
        },
      ]}
    />
  </div>
);

const StorageTab: React.FC = () => (
  <div style={{ padding: '8px 0 0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px', marginBottom: 24 }}>
      <KVCell label="Root device name" value="/dev/xvda" mono />
      <KVCell label="Root device type" value="EBS" />
      <KVCell label="EBS-optimized" value="Yes" />
      <KVCell label="Boot mode" value="Legacy BIOS" />
    </div>

    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#16191f', margin: '0 0 8px' }}>
      Block devices (2)
    </h4>
    <MiniTable
      columns={['Volume ID', 'Device name', 'Size (GiB)', 'Volume type', 'IOPS', 'Encrypted', 'Attachment status']}
      rows={[
        {
          'Volume ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>vol-0a1b2c3d4e5f67890</span>,
          'Device name': <span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>/dev/xvda</span>,
          'Size (GiB)': '20',
          'Volume type': 'gp3',
          'IOPS': '3000',
          'Encrypted': 'Not encrypted',
          'Attachment status': <span style={{ color: '#1d8102', fontWeight: 600 }}>attached</span>,
        },
        {
          'Volume ID': <span style={{ color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>vol-0b9c8d7e6f5a43210</span>,
          'Device name': <span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>/dev/sdb</span>,
          'Size (GiB)': '100',
          'Volume type': 'gp3',
          'IOPS': '3000',
          'Encrypted': 'Not encrypted',
          'Attachment status': <span style={{ color: '#1d8102', fontWeight: 600 }}>attached</span>,
        },
      ]}
    />
  </div>
);

const StatusChecksTab: React.FC<{ state: InstanceState }> = ({ state }) => {
  const isRunning = state === 'running';
  const Check: React.FC<{ label: string; passed: boolean; desc: string }> = ({
    label,
    passed,
    desc,
  }) => (
    <tr style={{ borderBottom: '1px solid #eaeded' }}>
      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{label}</td>
      <td style={{ padding: '10px 14px' }}>
        {!isRunning ? (
          <span style={{ color: '#5f6b7a', fontSize: 13 }}>—</span>
        ) : passed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color="#1d8102" />
            <span style={{ color: '#1d8102', fontSize: 13, fontWeight: 600 }}>Passed</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} color="#d13212" />
            <span style={{ color: '#d13212', fontSize: 13, fontWeight: 600 }}>Failed</span>
          </div>
        )}
      </td>
      <td style={{ padding: '10px 14px', fontSize: 13, color: '#5f6b7a' }}>{desc}</td>
    </tr>
  );

  return (
    <div style={{ padding: '8px 0 0' }}>
      <div
        style={{
          padding: '10px 14px',
          background: isRunning ? '#f0fff4' : '#f2f3f3',
          border: `1px solid ${isRunning ? '#1d8102' : '#d5dbdb'}`,
          borderRadius: 4,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: isRunning ? '#1d8102' : '#5f6b7a',
          fontWeight: 600,
        }}
      >
        {isRunning ? <CheckCircle2 size={15} /> : <Clock size={15} />}
        {isRunning ? '2/2 status checks passed' : 'Status checks not available for stopped instances'}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #eaeded' }}>
              Status check
            </th>
            <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #eaeded' }}>
              Status
            </th>
            <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #eaeded' }}>
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <Check
            label="System reachability"
            passed
            desc="Checks AWS-controlled components: power, network, hypervisor, and host hardware"
          />
          <Check
            label="Instance reachability"
            passed
            desc="Checks software and network configuration of this instance"
          />
        </tbody>
      </table>
    </div>
  );
};

const MonitoringTab: React.FC = () => (
  <div style={{ padding: '16px 0 0' }}>
    <div
      style={{
        padding: 24,
        background: '#fafafa',
        border: '1px solid #eaeded',
        borderRadius: 4,
        textAlign: 'center',
        color: '#5f6b7a',
      }}
    >
      <Activity size={36} color="#aab7b8" style={{ margin: '0 auto 12px' }} />
      <p style={{ margin: 0, fontWeight: 700, color: '#16191f', fontSize: 15 }}>
        Basic monitoring enabled
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 13 }}>
        CloudWatch metrics are available at 5-minute intervals.
        Enable detailed monitoring for 1-minute granularity.
      </p>
      <button
        style={{
          marginTop: 16,
          padding: '7px 18px',
          fontSize: 13,
          fontWeight: 600,
          color: '#0972d3',
          background: '#ffffff',
          border: '1px solid #0972d3',
          borderRadius: 20,
          cursor: 'pointer',
        }}
      >
        Enable detailed monitoring
      </button>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginTop: 20,
      }}
    >
      {['CPU utilization', 'Network in', 'Network out', 'Disk reads', 'Disk writes', 'Status check failed'].map(
        metric => (
          <div
            key={metric}
            style={{
              background: '#ffffff',
              border: '1px solid #d5dbdb',
              borderRadius: 4,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#5f6b7a', marginBottom: 8 }}>
              {metric}
            </div>
            <div
              style={{
                height: 80,
                background: '#f2f3f3',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aab7b8',
                fontSize: 12,
              }}
            >
              No data available
            </div>
          </div>
        )
      )}
    </div>
  </div>
);

const TagsTab: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ padding: '8px 0 0' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 12,
      }}
    >
      <button
        style={{
          padding: '5px 14px',
          fontSize: 13,
          fontWeight: 600,
          color: '#0972d3',
          background: '#ffffff',
          border: '1px solid #0972d3',
          borderRadius: 20,
          cursor: 'pointer',
        }}
      >
        Manage tags
      </button>
    </div>
    <MiniTable
      columns={['Key', 'Value']}
      rows={[
        { 'Key': <span style={{ fontFamily: 'monospace' }}>Name</span>, 'Value': name },
        { 'Key': <span style={{ fontFamily: 'monospace' }}>Environment</span>, 'Value': name.includes('staging') ? 'staging' : 'production' },
        { 'Key': <span style={{ fontFamily: 'monospace' }}>Project</span>, 'Value': 'hostlab-sim' },
        { 'Key': <span style={{ fontFamily: 'monospace' }}>Owner</span>, 'Value': 'student@hostlab.io' },
        { 'Key': <span style={{ fontFamily: 'monospace' }}>CreatedBy</span>, 'Value': 'Terraform' },
      ]}
    />
  </div>
);

// ─── Instance Summary Banner ──────────────────────────────────────────────────

const InstanceSummary: React.FC<{
  data: Required<Omit<InstanceDetailProps, 'onClose'>>;
}> = ({ data }) => {
  const cfg = STATE_CONFIG[data.state];
  const launchDate = new Date(data.launchTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d5dbdb',
        borderRadius: 4,
        padding: '16px 20px',
        marginBottom: 0,
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#16191f', margin: '0 0 14px' }}>
        Instance summary
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0 24px',
        }}
      >
        {/* Instance ID */}
        <div style={{ borderBottom: '1px solid #eaeded', paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Instance ID
          </div>
          <CopyableValue value={data.instanceId} mono />
        </div>
        {/* State */}
        <div style={{ borderBottom: '1px solid #eaeded', paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Instance state
          </div>
          <StateDot state={data.state} />
        </div>
        {/* Type */}
        <div style={{ borderBottom: '1px solid #eaeded', paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Instance type
          </div>
          <span style={{ fontSize: 13, color: '#0972d3', cursor: 'pointer' }}>{data.instanceType}</span>
        </div>
        {/* Public IP */}
        <div style={{ borderBottom: '1px solid #eaeded', paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Public IPv4 address
          </div>
          {data.publicIp ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#16191f' }}>{data.publicIp}</span>
              <ArrowUpRight size={13} color="#0972d3" style={{ cursor: 'pointer' }} />
            </div>
          ) : (
            <span style={{ color: '#8c95a0', fontSize: 13 }}>—</span>
          )}
        </div>
        {/* AMI */}
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            AMI ID
          </div>
          <span style={{ fontSize: 12, color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{data.amiId}</span>
        </div>
        {/* VPC */}
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            VPC ID
          </div>
          <span style={{ fontSize: 12, color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{data.vpcId}</span>
        </div>
        {/* Subnet */}
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Subnet ID
          </div>
          <span style={{ fontSize: 12, color: '#0972d3', cursor: 'pointer', fontFamily: 'monospace' }}>{data.subnetId}</span>
        </div>
        {/* Launch time */}
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5f6b7a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Launch time
          </div>
          <span style={{ fontSize: 13, color: '#16191f' }}>{launchDate}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const EC2InstanceDetail: React.FC<InstanceDetailProps> = (props) => {
  const data: Required<Omit<InstanceDetailProps, 'onClose'>> = {
    instanceId:   props.instanceId   ?? DEFAULT.instanceId,
    name:         props.name         ?? DEFAULT.name,
    state:        props.state        ?? DEFAULT.state,
    instanceType: props.instanceType ?? DEFAULT.instanceType,
    amiId:        props.amiId        ?? DEFAULT.amiId,
    launchTime:   props.launchTime   ?? DEFAULT.launchTime,
    vpcId:        props.vpcId        ?? DEFAULT.vpcId,
    subnetId:     props.subnetId     ?? DEFAULT.subnetId,
    publicIp:     props.publicIp     ?? DEFAULT.publicIp,
    privateIp:    props.privateIp    ?? DEFAULT.privateIp,
    keyPair:      props.keyPair      ?? DEFAULT.keyPair,
    az:           props.az           ?? DEFAULT.az,
    platform:     props.platform     ?? DEFAULT.platform,
    monitoring:   props.monitoring   ?? DEFAULT.monitoring,
  };

  const [activeTab, setActiveTab] = useState<TabId>('Details');
  const cfg = STATE_CONFIG[data.state];

  const TABS: { id: TabId; icon: React.ReactNode }[] = [
    { id: 'Details',       icon: <Info size={14} /> },
    { id: 'Security',      icon: <Shield size={14} /> },
    { id: 'Networking',    icon: <Network size={14} /> },
    { id: 'Storage',       icon: <HardDrive size={14} /> },
    { id: 'Status checks', icon: <CheckCircle2 size={14} /> },
    { id: 'Monitoring',    icon: <Activity size={14} /> },
    { id: 'Tags',          icon: <Tag size={14} /> },
  ];

  return (
    <div
      style={{
        fontFamily: "'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif",
        color: '#16191f',
      }}
    >
      {/* Page title + action buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#16191f' }}>
              {data.name}
            </h1>
            <span
              style={{
                fontSize: 12,
                color: cfg.color,
                background: cfg.bg,
                padding: '3px 10px',
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#5f6b7a', fontFamily: 'monospace' }}>
            {data.instanceId}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#16191f',
              background: '#ffffff',
              border: '1px solid #5f6b7a',
              borderRadius: 20,
              cursor: 'pointer',
            }}
          >
            <Play size={13} />
            Connect
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#16191f',
              background: '#ffffff',
              border: '1px solid #5f6b7a',
              borderRadius: 20,
              cursor: 'pointer',
            }}
          >
            Instance state
            <ChevronDown size={13} />
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#16191f',
              background: '#ffffff',
              border: '1px solid #5f6b7a',
              borderRadius: 20,
              cursor: 'pointer',
            }}
          >
            Actions
            <ChevronDown size={13} />
          </button>
          {props.onClose && (
            <button
              onClick={props.onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: '#5f6b7a',
                background: '#ffffff',
                border: '1px solid #d5dbdb',
                borderRadius: 20,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
              Close
            </button>
          )}
        </div>
      </div>

      {/* Instance summary card */}
      <InstanceSummary data={data} />

      {/* Tab panel card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d5dbdb',
          borderRadius: 4,
          marginTop: 16,
          boxShadow: '0 1px 1px 0 rgba(0,28,36,.3), 1px 1px 1px 0 rgba(0,28,36,.15), -1px 1px 1px 0 rgba(0,28,36,.15)',
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #eaeded',
            padding: '0 20px',
            overflowX: 'auto',
          }}
        >
          {TABS.map(tab => (
            <TabBtn
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '4px 20px 24px' }}>
          {activeTab === 'Details'       && <DetailsTab data={data} />}
          {activeTab === 'Security'      && <SecurityTab data={data} />}
          {activeTab === 'Networking'    && <NetworkingTab data={data} />}
          {activeTab === 'Storage'       && <StorageTab />}
          {activeTab === 'Status checks' && <StatusChecksTab state={data.state} />}
          {activeTab === 'Monitoring'    && <MonitoringTab />}
          {activeTab === 'Tags'          && <TagsTab name={data.name} />}
        </div>
      </div>
    </div>
  );
};

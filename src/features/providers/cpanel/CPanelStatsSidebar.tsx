import React from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import {
  HardDrive,
  Activity,
  Mail,
  Upload,
  Database,
  Globe,
  Clock,
  Shield,
  Server,
  Info,
  BarChart2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

/* ─── Progress Bar ─── */
interface ProgressBarProps {
  value: number;   // 0–100
  warn?: boolean;  // switch to yellow/red at high usage
}
const ProgressBar: React.FC<ProgressBarProps> = ({ value, warn = false }) => {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    warn && clamped >= 80
      ? '#c0392b'
      : warn && clamped >= 60
      ? '#f39c12'
      : '#ee7623';

  return (
    <div className="h-[6px] w-full bg-[#eaeaea] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
};

/* ─── Stat Resource Row ─── */
interface ResourceRowProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  used: string;
  limit: string;
  percent: number;
  warn?: boolean;
}
const ResourceRow: React.FC<ResourceRowProps> = ({
  icon: Icon,
  label,
  used,
  limit,
  percent,
  warn,
}) => (
  <div className="py-2.5">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[#ee7623]" />
        <span className="text-[12px] font-semibold text-[#333333]">{label}</span>
      </div>
      <span className="text-[11px] text-[#777777]">
        {used}
        {limit !== '∞' && (
          <span className="text-[#aaaaaa]"> / {limit}</span>
        )}
      </span>
    </div>
    <ProgressBar value={percent} warn={warn} />
  </div>
);

/* ─── Key-Value Info Row ─── */
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  last?: boolean;
  highlight?: boolean;
}
const InfoRow: React.FC<InfoRowProps> = ({ label, value, last, highlight }) => (
  <div
    className={`flex justify-between items-start py-2 ${
      !last ? 'border-b border-dashed border-[#f0f0f0]' : ''
    }`}
  >
    <span className="text-[11px] text-[#888888] font-medium shrink-0 mr-2">{label}</span>
    <span
      className={`text-[11px] font-semibold text-right break-all ${
        highlight ? 'text-[#ee7623]' : 'text-[#333333]'
      }`}
    >
      {value}
    </span>
  </div>
);

/* ─── Section card wrapper ─── */
interface SectionCardProps {
  title: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
}
const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-[#eaeaea] rounded-lg shadow-sm overflow-hidden mb-4">
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eaeaea] bg-[#fafafa]">
      <Icon className="w-3.5 h-3.5 text-[#ee7623]" />
      <h3 className="text-[11px] font-bold text-[#333333] uppercase tracking-wider">{title}</h3>
    </div>
    <div className="px-4 pb-2">{children}</div>
  </div>
);

/* ─── Main Sidebar ─── */
export const CPanelStatsSidebar: React.FC = () => {
  const { cpanel, dnsRecords } = useSimulatorStore();

  const diskPercent  = 45;
  const bwPercent    = 12;
  const emailCount   = 3;
  const emailMax     = 100;
  const ftpCount     = 1;
  const ftpMax       = 20;
  const dbCount      = cpanel.databases.length;
  const dbMax        = 10;
  const subCount     = cpanel.subdomains.length;
  const cronCount    = cpanel.cronJobs.length;
  const sslCount     = cpanel.sslCertificates.length;

  const now = new Date();
  const lastLogin = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(now);

  return (
    <div className="space-y-0">

      {/* ─── General Information ─── */}
      <SectionCard title="General Information" icon={Info}>
        <InfoRow label="Username"        value="admin" />
        <InfoRow label="Primary Domain"  value="example.com" highlight />
        <InfoRow label="Home Directory"  value="/home/admin" />
        <InfoRow label="IP Address"      value="203.0.113.10" />
        <InfoRow label="Last Login"      value={lastLogin} />
        <InfoRow label="Server Name"     value="server1.hostlab.io" last />
      </SectionCard>

      {/* ─── Account Information ─── */}
      <SectionCard title="Account Information" icon={Server}>
        <InfoRow label="Plan"          value={<span className="text-[#ee7623] font-bold">Pro Hosting</span>} />
        <InfoRow label="cPanel Version" value="118.0 (build 3)" />
        <InfoRow label="PHP Version"   value={<span className="text-green-600 font-bold">8.2.21</span>} />
        <InfoRow label="MySQL Version" value="8.0.35" />
        <InfoRow label="Apache"        value={<span className="text-green-600">Running</span>} />
        <InfoRow label="Nameserver 1"  value="ns1.example.com" />
        <InfoRow label="Nameserver 2"  value="ns2.example.com" last />
      </SectionCard>

      {/* ─── Resource Usage ─── */}
      <SectionCard title="Statistics" icon={BarChart2}>
        <div className="divide-y divide-[#f4f6f8]">
          <ResourceRow
            icon={HardDrive}
            label="Disk Usage"
            used="450 MB"
            limit="1 GB"
            percent={diskPercent}
            warn
          />
          <ResourceRow
            icon={Activity}
            label="Bandwidth"
            used="1.2 GB"
            limit="10 GB"
            percent={bwPercent}
          />
          <ResourceRow
            icon={Mail}
            label="Email Accounts"
            used={String(emailCount)}
            limit={String(emailMax)}
            percent={(emailCount / emailMax) * 100}
          />
          <ResourceRow
            icon={Upload}
            label="FTP Accounts"
            used={String(ftpCount)}
            limit={String(ftpMax)}
            percent={(ftpCount / ftpMax) * 100}
          />
          <ResourceRow
            icon={Database}
            label="MySQL Databases"
            used={String(dbCount)}
            limit={String(dbMax)}
            percent={(dbCount / dbMax) * 100}
            warn
          />
          <ResourceRow
            icon={Globe}
            label="Subdomains"
            used={String(subCount)}
            limit="∞"
            percent={Math.min(subCount * 10, 100)}
          />
          <ResourceRow
            icon={Clock}
            label="Cron Jobs"
            used={String(cronCount)}
            limit="∞"
            percent={Math.min(cronCount * 10, 100)}
          />
        </div>
      </SectionCard>

      {/* ─── DNS Records Quick View ─── */}
      <SectionCard title="DNS Records" icon={Globe}>
        {dnsRecords.length === 0 ? (
          <div className="py-3 text-center text-[11px] text-[#aaaaaa]">No records configured</div>
        ) : (
          <div className="py-1 space-y-1">
            {dnsRecords.slice(0, 5).map(rec => (
              <div key={rec.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block px-1.5 py-0.5 bg-[#fff4ec] text-[#ee7623] text-[9px] font-bold rounded shrink-0">
                    {rec.type}
                  </span>
                  <span className="text-[11px] text-[#555555] truncate">{rec.name}</span>
                </div>
                <span className="text-[10px] text-[#aaaaaa] shrink-0 ml-1">{rec.ttl}s</span>
              </div>
            ))}
            {dnsRecords.length > 5 && (
              <div className="text-[10px] text-[#aaaaaa] text-center pt-1">
                +{dnsRecords.length - 5} more
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ─── Security Summary ─── */}
      <SectionCard title="Security" icon={Shield}>
        <div className="py-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">SSL Certificates</span>
            <div className="flex items-center gap-1">
              {sslCount > 0
                ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                : <AlertCircle className="w-3.5 h-3.5 text-[#ee7623]" />
              }
              <span className={`text-[11px] font-bold ${sslCount > 0 ? 'text-green-600' : 'text-[#ee7623]'}`}>
                {sslCount > 0 ? `${sslCount} Active` : 'None'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">Spam Filter</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] font-bold text-green-600">Enabled</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">SSH Access</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] font-bold text-green-600">Allowed</span>
            </div>
          </div>
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] text-[#555555]">Hotlink Protection</span>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#aaaaaa]" />
              <span className="text-[11px] font-bold text-[#aaaaaa]">Disabled</span>
            </div>
          </div>
        </div>
      </SectionCard>

    </div>
  );
};

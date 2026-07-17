import React, { useState } from 'react';
import { useSimulatorStore } from '../../../stores/useSimulatorStore';
import { useTerminalStore } from '../../../stores/useTerminalStore';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Network,
  Pencil,
  Check,
  X,
  ChevronDown,
  Search,
  RefreshCw,
  Download,
  AlertCircle,
  Globe,
  Info,
} from 'lucide-react';
import type { DNSRecord } from '../../../types/network';

/* ────────────────────────────────────────
   Constants
──────────────────────────────────────── */
type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

const RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'];

const TYPE_COLORS: Record<RecordType, string> = {
  A:     'bg-blue-50 text-blue-700 border-blue-200',
  AAAA:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  CNAME: 'bg-purple-50 text-purple-700 border-purple-200',
  MX:    'bg-green-50 text-green-700 border-green-200',
  TXT:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  NS:    'bg-orange-50 text-orange-700 border-orange-200',
  SRV:   'bg-pink-50 text-pink-700 border-pink-200',
  CAA:   'bg-red-50 text-red-700 border-red-200',
};

const PLACEHOLDER: Record<RecordType, string> = {
  A:     '203.0.113.10',
  AAAA:  '2001:db8::1',
  CNAME: 'target.example.com.',
  MX:    '10 mail.example.com.',
  TXT:   '"v=spf1 include:example.com ~all"',
  NS:    'ns1.example.com.',
  SRV:   '10 20 443 target.example.com.',
  CAA:   '0 issue "letsencrypt.org"',
};

/* ────────────────────────────────────────
   Sub-components
──────────────────────────────────────── */
interface TypeBadgeProps {
  type: string;
}
const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const cls = TYPE_COLORS[type as RecordType] ?? 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${cls}`}>
      {type}
    </span>
  );
};

/* ────────────────────────────────────────
   Inline Edit Row
──────────────────────────────────────── */
interface EditRowProps {
  record: DNSRecord;
  onSave: (updated: Partial<DNSRecord>) => void;
  onCancel: () => void;
}
const EditRow: React.FC<EditRowProps> = ({ record, onSave, onCancel }) => {
  const [name,  setName]  = useState(record.name);
  const [type,  setType]  = useState<RecordType>(record.type as RecordType);
  const [value, setValue] = useState(record.value);
  const [ttl,   setTtl]   = useState(record.ttl);

  return (
    <tr className="bg-[#fff8f4]">
      <td className="px-4 py-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-[#ee7623] rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#ee7623]"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={type}
          onChange={e => setType(e.target.value as RecordType)}
          className="border border-[#ee7623] rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#ee7623] cursor-pointer"
        >
          {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={ttl}
          onChange={e => setTtl(parseInt(e.target.value) || 3600)}
          className="w-[80px] border border-[#ee7623] rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#ee7623]"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-[#ee7623] rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#ee7623] font-mono"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1 justify-center">
          <button
            onClick={() => onSave({ name, type, value, ttl })}
            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors cursor-pointer"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 bg-[#eaeaea] hover:bg-[#d0d0d0] text-[#555555] rounded transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ────────────────────────────────────────
   Main ZoneEditor Component
──────────────────────────────────────── */
export const ZoneEditor: React.FC = () => {
  const navigate = useNavigate();
  const { dnsRecords, addDnsRecord, deleteDnsRecord, updateDnsRecord } = useSimulatorStore();
  const { addLine } = useTerminalStore();

  // Form state
  const [name,  setName]  = useState('');
  const [type,  setType]  = useState<RecordType>('A');
  const [value, setValue] = useState('');
  const [ttl,   setTtl]   = useState(14400);
  const [formError, setFormError] = useState('');

  // Table state
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [filterType,   setFilterType]   = useState<string>('ALL');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedDomain, setSelectedDomain] = useState('example.com');

  const DOMAINS = ['example.com', 'sub.example.com', 'api.example.com'];

  /* Add record */
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError('Name / Host is required.'); return; }
    if (!value.trim()) { setFormError('Value / Destination is required.'); return; }
    setFormError('');

    addDnsRecord({ name: name.trim(), type, value: value.trim(), ttl });
    addLine({
      type: 'success',
      text: `[cPanel DNS] Added ${type} record: ${name.trim()} → ${value.trim()} (TTL ${ttl})`,
    });
    setName('');
    setValue('');
  };

  /* Save inline edit */
  const handleSaveEdit = (id: string, updated: Partial<DNSRecord>) => {
    updateDnsRecord(id, updated);
    addLine({
      type: 'info',
      text: `[cPanel DNS] Updated record ${id.slice(0, 8)}…`,
    });
    setEditingId(null);
  };

  /* Delete with terminal log */
  const handleDelete = (rec: DNSRecord) => {
    deleteDnsRecord(rec.id);
    addLine({
      type: 'info',
      text: `[cPanel DNS] Deleted ${rec.type} record: ${rec.name}`,
    });
  };

  /* Filter records */
  const filtered = dnsRecords.filter(r => {
    const matchType  = filterType === 'ALL' || r.type === filterType;
    const matchQuery = !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  /* Group counts for filter tabs */
  const countByType = (t: string) => dnsRecords.filter(r => r.type === t).length;

  return (
    <div
      className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ fontFamily: '"Open Sans", sans-serif' }}
    >
      {/* ─── Header ─── */}
      <div className="bg-white border border-[#eaeaea] rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3 border-b border-[#eaeaea]"
             style={{ borderLeft: '4px solid #ee7623' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/providers/cpanel')}
              className="p-1.5 hover:bg-[#f4f6f8] rounded text-[#777777] hover:text-[#333333] transition-colors cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#ee7623]" />
                <h2 className="text-[15px] font-bold text-[#333333]">DNS Zone Editor</h2>
              </div>
              <p className="text-[11px] text-[#777777] mt-0.5">
                Manage DNS zone records for your domains — changes propagate within 24–48 hours.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#555555] hover:text-[#333333] border border-[#eaeaea] hover:border-[#cccccc] rounded transition-colors cursor-pointer"
              title="Refresh zone"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#555555] hover:text-[#333333] border border-[#eaeaea] hover:border-[#cccccc] rounded transition-colors cursor-pointer"
              title="Export zone file"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Domain selector */}
        <div className="px-5 py-3 bg-[#fafafa] border-b border-[#eaeaea] flex items-center gap-3">
          <Globe className="w-3.5 h-3.5 text-[#777777] shrink-0" />
          <label className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider shrink-0">
            Domain:
          </label>
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="appearance-none bg-white border border-[#eaeaea] rounded px-3 py-1.5 pr-7 text-[12px] text-[#333333] font-semibold focus:outline-none focus:border-[#ee7623] cursor-pointer"
            >
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#777777] pointer-events-none" />
          </div>
          <span className="text-[11px] text-[#aaaaaa]">
            {dnsRecords.length} record{dnsRecords.length !== 1 ? 's' : ''} in zone
          </span>
        </div>
      </div>

      {/* ─── Add Record Form ─── */}
      <div className="bg-white border border-[#eaeaea] rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#eaeaea] bg-[#fafafa] flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-[#ee7623]" />
          <h3 className="text-[12px] font-bold text-[#333333] uppercase tracking-wider">Add DNS Record</h3>
        </div>

        <form onSubmit={handleAdd} className="p-5">
          {formError && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Name */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                Name / Host <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setFormError(''); }}
                placeholder={`e.g. www.${selectedDomain}`}
                className="w-full bg-[#fafafa] border border-[#eaeaea] rounded px-3 py-2 text-[12px] text-[#333333] focus:outline-none focus:border-[#ee7623] focus:bg-white transition-all"
              />
            </div>

            {/* Type */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={e => setType(e.target.value as RecordType)}
                  className="appearance-none w-full bg-[#fafafa] border border-[#eaeaea] rounded px-3 py-2 pr-7 text-[12px] text-[#333333] focus:outline-none focus:border-[#ee7623] focus:bg-white transition-all cursor-pointer"
                >
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#777777] pointer-events-none" />
              </div>
            </div>

            {/* TTL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                TTL (sec)
              </label>
              <div className="relative">
                <select
                  value={ttl}
                  onChange={e => setTtl(parseInt(e.target.value))}
                  className="appearance-none w-full bg-[#fafafa] border border-[#eaeaea] rounded px-3 py-2 pr-7 text-[12px] text-[#333333] focus:outline-none focus:border-[#ee7623] focus:bg-white transition-all cursor-pointer"
                >
                  <option value={300}>5 min</option>
                  <option value={3600}>1 hr</option>
                  <option value={14400}>4 hr</option>
                  <option value={86400}>24 hr</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#777777] pointer-events-none" />
              </div>
            </div>

            {/* Value */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                Value / Destination <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={value}
                onChange={e => { setValue(e.target.value); setFormError(''); }}
                placeholder={PLACEHOLDER[type]}
                className="w-full bg-[#fafafa] border border-[#eaeaea] rounded px-3 py-2 text-[12px] text-[#333333] font-mono focus:outline-none focus:border-[#ee7623] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Type hint */}
          <div className="mt-3 flex items-start gap-1.5">
            <Info className="w-3 h-3 text-[#aaaaaa] mt-0.5 shrink-0" />
            <p className="text-[10px] text-[#aaaaaa]">
              {type === 'A'     && 'Maps a hostname to an IPv4 address. Use the public IP of your server.'}
              {type === 'AAAA'  && 'Maps a hostname to an IPv6 address.'}
              {type === 'CNAME' && 'Creates an alias pointing to another hostname. Must end in a dot (.).'}
              {type === 'MX'    && 'Specifies a mail server for your domain. Format: <priority> <hostname>.'}
              {type === 'TXT'   && 'Stores arbitrary text data — used for SPF, DKIM, domain verification.'}
              {type === 'NS'    && 'Delegates a subdomain to a different set of nameservers.'}
              {type === 'SRV'   && 'Specifies a service location. Format: <priority> <weight> <port> <target>.'}
              {type === 'CAA'   && 'Specifies which CAs are allowed to issue SSL certs for this domain.'}
            </p>
          </div>

          <div className="flex justify-end mt-4 pt-3 border-t border-[#f4f6f8]">
            <button
              type="button"
              onClick={() => { setName(''); setValue(''); setFormError(''); }}
              className="px-4 py-2 text-[12px] text-[#555555] hover:text-[#333333] border border-[#eaeaea] hover:border-[#cccccc] rounded transition-colors cursor-pointer mr-2"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ee7623] hover:bg-[#d96919] text-white text-[12px] font-bold rounded transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record
            </button>
          </div>
        </form>
      </div>

      {/* ─── Records Table ─── */}
      <div className="bg-white border border-[#eaeaea] rounded-lg shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="px-5 py-3 border-b border-[#eaeaea] bg-[#fafafa] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-[#ee7623]" />
            <h3 className="text-[12px] font-bold text-[#333333] uppercase tracking-wider">
              Active DNS Records
            </h3>
            <span className="px-2 py-0.5 bg-[#f4f6f8] text-[#777777] text-[10px] font-bold rounded-full">
              {filtered.length}
            </span>
          </div>
          {/* Search & filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#aaaaaa] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search records…"
                className="bg-white border border-[#eaeaea] rounded px-2 pl-7 py-1.5 text-[11px] focus:outline-none focus:border-[#ee7623] w-[160px]"
              />
            </div>
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="px-5 py-2 border-b border-[#eaeaea] flex items-center gap-1 overflow-x-auto">
          {(['ALL', ...RECORD_TYPES] as string[]).map(t => {
            const count = t === 'ALL' ? dnsRecords.length : countByType(t);
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  filterType === t
                    ? 'bg-[#ee7623] text-white'
                    : 'bg-[#f4f6f8] text-[#555555] hover:bg-[#eaeaea]'
                }`}
              >
                {t}
                {count > 0 && (
                  <span className={`text-[9px] font-bold px-1 rounded ${
                    filterType === t ? 'bg-white/20' : 'bg-[#e0e0e0] text-[#777777]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="bg-[#f4f6f8] text-[#777777] text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3 border-b border-[#eaeaea]">Name / Host</th>
                <th className="px-4 py-3 border-b border-[#eaeaea]">Type</th>
                <th className="px-4 py-3 border-b border-[#eaeaea]">TTL</th>
                <th className="px-4 py-3 border-b border-[#eaeaea]">Value / Destination</th>
                <th className="px-4 py-3 border-b border-[#eaeaea] text-center w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-[#aaaaaa]">
                      <Network className="w-8 h-8 opacity-30" />
                      <span className="text-[12px] font-medium">
                        {searchQuery || filterType !== 'ALL'
                          ? 'No records match your filter.'
                          : 'No DNS records configured. Add one above.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(rec => (
                  editingId === rec.id ? (
                    <EditRow
                      key={rec.id}
                      record={rec}
                      onSave={upd => handleSaveEdit(rec.id, upd)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#fff8f4] transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-[#333333]">
                        {rec.name}
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={rec.type} />
                      </td>
                      <td className="px-4 py-3 text-[#777777]">
                        {rec.ttl >= 86400
                          ? `${rec.ttl / 86400}d`
                          : rec.ttl >= 3600
                          ? `${rec.ttl / 3600}h`
                          : rec.ttl >= 60
                          ? `${rec.ttl / 60}m`
                          : `${rec.ttl}s`}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#555555] max-w-[280px]">
                        <span className="truncate block" title={rec.value}>{rec.value}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => setEditingId(rec.id)}
                            className="p-1.5 hover:bg-[#fff4ec] text-[#aaaaaa] hover:text-[#ee7623] rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Edit record"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec)}
                            className="p-1.5 hover:bg-red-50 text-[#aaaaaa] hover:text-red-500 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-2.5 border-t border-[#eaeaea] bg-[#fafafa] flex justify-between items-center">
            <span className="text-[10px] text-[#aaaaaa]">
              Showing {filtered.length} of {dnsRecords.length} records
              {filterType !== 'ALL' && ` · Filtered by ${filterType}`}
            </span>
            <span className="text-[10px] text-[#aaaaaa]">
              Zone: {selectedDomain}
            </span>
          </div>
        )}
      </div>

      {/* Help panel */}
      <div className="bg-[#fff8f4] border border-[#ffe5cc] rounded-lg p-4 flex gap-3">
        <Info className="w-4 h-4 text-[#ee7623] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[12px] font-bold text-[#ee7623] mb-1">DNS Propagation Notice</h4>
          <p className="text-[11px] text-[#777777] leading-relaxed">
            DNS changes can take between <strong>30 minutes and 48 hours</strong> to propagate worldwide.
            Changes to existing records may take longer due to TTL caching on upstream resolvers.
            Use a TTL of <strong>300 seconds (5 min)</strong> if you plan to make frequent changes.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Copy,
  Terminal,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
  Tag,
  MapPin,
  Cpu,
  MemoryStick,
  HardDrive,
  DollarSign,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Droplet {
  id: string;
  name: string;
  status: 'active' | 'off' | 'new';
  os: string;
  osVersion: string;
  vcpu: number;
  ram: number;      // GB
  disk: number;     // GB
  region: string;
  ip: string;
  ipv6?: string;
  cost: number;     // $/mo
  tags: string[];
  createdAt: string;
}

/* ─── Mock data ─────────────────────────────────────────────────── */
const DROPLETS: Droplet[] = [
  {
    id: 'dlt-1',
    name: 'web-prod-01',
    status: 'active',
    os: 'Ubuntu',
    osVersion: '22.04 (LTS) x64',
    vcpu: 2,
    ram: 4,
    disk: 80,
    region: 'NYC1',
    ip: '203.0.113.10',
    ipv6: '2001:db8::1',
    cost: 18,
    tags: ['production', 'web'],
    createdAt: '2024-01-15',
  },
  {
    id: 'dlt-2',
    name: 'db-prod',
    status: 'active',
    os: 'Ubuntu',
    osVersion: '22.04 (LTS) x64',
    vcpu: 4,
    ram: 8,
    disk: 160,
    region: 'AMS3',
    ip: '198.51.100.45',
    cost: 48,
    tags: ['production', 'database'],
    createdAt: '2024-01-20',
  },
  {
    id: 'dlt-3',
    name: 'staging-01',
    status: 'off',
    os: 'Ubuntu',
    osVersion: '24.04 (LTS) x64',
    vcpu: 1,
    ram: 2,
    disk: 50,
    region: 'SFO3',
    ip: '192.0.2.78',
    cost: 12,
    tags: ['staging'],
    createdAt: '2024-03-02',
  },
];

const TAG_FILTERS = ['All', 'production', 'staging', 'web', 'database'];
const SORT_OPTIONS = ['Name', 'Created', 'Region', 'Size', 'Status'];
const REGION_LABELS: Record<string, string> = {
  NYC1: 'New York 1',
  AMS3: 'Amsterdam 3',
  SFO3: 'San Francisco 3',
};

/* ─── Status badge ───────────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: Droplet['status'] }> = ({ status }) => {
  const cfg = {
    active: { dot: 'bg-[#02B37B]', ring: 'shadow-[0_0_0_3px_rgba(2,179,123,0.20)]', label: 'Active', text: 'text-[#02B37B]' },
    off:    { dot: 'bg-[#94A3B8]', ring: '',                                          label: 'Off',    text: 'text-[#94A3B8]' },
    new:    { dot: 'bg-[#F59E0B]', ring: 'shadow-[0_0_0_3px_rgba(245,158,11,0.20)]', label: 'New',    text: 'text-[#F59E0B]' },
  }[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot} ${cfg.ring}`} />
      <span className={`text-[12px] font-semibold ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
};

/* ─── Spec chip ─────────────────────────────────────────────────── */
const Chip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded border border-[#E2E8F0] font-medium shrink-0">
    {icon}
    {label}
  </span>
);

/* ─── Action menu ───────────────────────────────────────────────── */
const ActionMenu: React.FC<{ droplet: Droplet; onView: () => void }> = ({ droplet, onView }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#E2E8F0] text-[#94A3B8] hover:text-[#475569] transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 w-44 bg-white rounded-lg border border-[#E2E8F0] shadow-lg py-1 overflow-hidden">
            <button
              onClick={() => { setOpen(false); onView(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#031B4E] hover:bg-[#F8FAFC] text-left"
            >
              <Terminal className="w-3.5 h-3.5 text-[#64748B]" /> Access Console
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#031B4E] hover:bg-[#F8FAFC] text-left"
            >
              <Copy className="w-3.5 h-3.5 text-[#64748B]" /> Copy IP Address
            </button>
            {droplet.status === 'active' ? (
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#031B4E] hover:bg-[#F8FAFC] text-left"
              >
                <PowerOff className="w-3.5 h-3.5 text-[#64748B]" /> Power Off
              </button>
            ) : (
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#031B4E] hover:bg-[#F8FAFC] text-left"
              >
                <Power className="w-3.5 h-3.5 text-[#64748B]" /> Power On
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#031B4E] hover:bg-[#F8FAFC] text-left"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" /> Reboot
            </button>
            <div className="border-t border-[#E2E8F0] my-1" />
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#EF4444] hover:bg-[#FFF5F5] text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Destroy
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Main component ────────────────────────────────────────────── */
export const DropletList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Name');
  const [sortOpen, setSortOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = DROPLETS.filter(d => {
    const matchTag = activeTag === 'All' || d.tags.includes(activeTag);
    const matchSearch =
      search === '' ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ip.includes(search) ||
      d.region.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every(d => selected.has(d.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(d => d.id)));
  };

  const handleView = (id: string) => {
    navigate(`/app/providers/digitalocean/droplets/${id}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-[#031B4E] leading-tight">Droplets</h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            {DROPLETS.length} Droplets &mdash; {DROPLETS.filter(d => d.status === 'active').length} active
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#02B37B] hover:bg-[#029668] text-white text-[13px] font-semibold px-4 py-2.5 rounded-md transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Create Droplet
        </button>
      </div>

      {/* ── Tag filter pills ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TAG_FILTERS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
              activeTag === tag
                ? 'bg-[#0069FF] border-[#0069FF] text-white'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#0069FF] hover:text-[#0069FF]'
            }`}
          >
            {tag !== 'All' && <Tag className="w-3 h-3" />}
            {tag}
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search Droplets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-[#E2E8F0] rounded-md text-[13px] text-[#031B4E] placeholder-[#94A3B8] bg-white focus:outline-none focus:border-[#0069FF] transition-colors"
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-md bg-white text-[13px] text-[#64748B] hover:border-[#0069FF] hover:text-[#031B4E] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort: {sort}
            <ChevronDown className="w-3 h-3" />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-40 w-36 bg-white rounded-lg border border-[#E2E8F0] shadow-lg py-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setSortOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-[13px] hover:bg-[#F8FAFC] transition-colors ${
                      sort === opt ? 'text-[#0069FF] font-semibold' : 'text-[#031B4E]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Droplets table ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="flex items-center px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="w-8 mr-2 flex items-center justify-center">
            <button
              onClick={toggleAll}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                allSelected ? 'bg-[#0069FF] border-[#0069FF]' : 'border-[#CBD5E1] hover:border-[#0069FF]'
              }`}
            >
              {allSelected && <CheckSquare className="w-3 h-3 text-white" />}
            </button>
          </div>
          <div className="flex-1 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Name</div>
          <div className="w-32 text-[11px] font-bold text-[#64748B] uppercase tracking-wider hidden md:block">Status</div>
          <div className="w-36 text-[11px] font-bold text-[#64748B] uppercase tracking-wider hidden lg:block">IP Address</div>
          <div className="w-52 text-[11px] font-bold text-[#64748B] uppercase tracking-wider hidden xl:block">Specs</div>
          <div className="w-28 text-[11px] font-bold text-[#64748B] uppercase tracking-wider hidden md:block">Region</div>
          <div className="w-20 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Cost</div>
          <div className="w-10" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Search className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[14px] text-[#64748B] font-medium">No Droplets match your search</p>
            <p className="text-[12px] text-[#94A3B8] mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filtered.map((d, idx) => (
            <div
              key={d.id}
              className={`group flex items-center px-5 py-4 border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                selected.has(d.id) ? 'bg-[#EFF6FF]' : ''
              }`}
              onClick={() => handleView(d.id)}
            >
              {/* Checkbox */}
              <div className="w-8 mr-2 flex items-center justify-center" onClick={e => { e.stopPropagation(); toggleSelect(d.id); }}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selected.has(d.id) ? 'bg-[#0069FF] border-[#0069FF]' : 'border-[#CBD5E1] group-hover:border-[#0069FF]/40'
                }`}>
                  {selected.has(d.id) && <CheckSquare className="w-3 h-3 text-white" />}
                </div>
              </div>

              {/* Name + OS + tags */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleView(d.id); }}
                    className="text-[#0069FF] font-semibold text-[14px] hover:underline truncate"
                  >
                    {d.name}
                  </a>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[11px] px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded border border-[#E2E8F0] font-medium">
                    {d.os} {d.osVersion}
                  </span>
                  {d.tags.map(t => (
                    <span key={t} className="text-[11px] px-2 py-0.5 bg-[#EFF6FF] text-[#0069FF] rounded border border-[#BFDBFE] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="w-32 hidden md:block">
                <StatusBadge status={d.status} />
              </div>

              {/* IP */}
              <div className="w-36 hidden lg:block" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-[#475569] font-mono">{d.ip}</span>
                  <button
                    onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(d.ip); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#E2E8F0] text-[#94A3B8] hover:text-[#475569] transition-all"
                    title="Copy IP"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5">Public IPv4</div>
              </div>

              {/* Specs chips */}
              <div className="w-52 hidden xl:flex flex-wrap gap-1">
                <Chip icon={<Cpu className="w-3 h-3" />} label={`${d.vcpu} vCPU`} />
                <Chip icon={<MemoryStick className="w-3 h-3" />} label={`${d.ram} GB`} />
                <Chip icon={<HardDrive className="w-3 h-3" />} label={`${d.disk} GB`} />
              </div>

              {/* Region */}
              <div className="w-28 hidden md:flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 text-[13px] text-[#475569] font-medium">
                  <MapPin className="w-3 h-3 text-[#94A3B8]" />
                  {d.region}
                </div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5 pl-4">{REGION_LABELS[d.region]}</div>
              </div>

              {/* Cost */}
              <div className="w-20 text-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-0.5 text-[14px] font-bold text-[#031B4E]">
                  <DollarSign className="w-3.5 h-3.5 text-[#64748B]" />{d.cost}
                </div>
                <div className="text-[11px] text-[#94A3B8]">/mo</div>
              </div>

              {/* Action menu */}
              <div className="w-10 flex justify-end" onClick={e => e.stopPropagation()}>
                <ActionMenu droplet={d} onView={() => handleView(d.id)} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Footer summary ───────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[12px] text-[#94A3B8]">
        <span>
          Showing <strong className="text-[#64748B]">{filtered.length}</strong> of{' '}
          <strong className="text-[#64748B]">{DROPLETS.length}</strong> Droplets
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          Total monthly estimate:{' '}
          <strong className="text-[#031B4E]">
            ${DROPLETS.reduce((acc, d) => acc + d.cost, 0).toFixed(2)}
          </strong>
        </span>
      </div>
    </div>
  );
};

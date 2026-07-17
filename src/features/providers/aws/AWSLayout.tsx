import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Zap,
  Search,
  User,
  Globe,
  HelpCircle,
  Bell,
  Server,
  Layers,
  HardDrive,
  Shield,
  Activity,
  Scale,
  RefreshCcw,
  ChevronRight,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

interface NavSection {
  label: string;
  items: { label: string; href: string }[];
}

// ─── Data ──────────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Instances',
    items: [
      { label: 'Instances', href: '#instances' },
      { label: 'Instance Types', href: '#instance-types' },
      { label: 'Launch Templates', href: '#launch-templates' },
      { label: 'Spot Requests', href: '#spot' },
      { label: 'Savings Plans', href: '#savings' },
      { label: 'Reserved Instances', href: '#reserved' },
      { label: 'Dedicated Hosts', href: '#dedicated' },
      { label: 'Capacity Reservations', href: '#capacity' },
    ],
  },
  {
    label: 'Images',
    items: [
      { label: 'AMIs', href: '#amis' },
      { label: 'AMI Catalog', href: '#ami-catalog' },
    ],
  },
  {
    label: 'Elastic Block Store',
    items: [
      { label: 'Volumes', href: '#volumes' },
      { label: 'Snapshots', href: '#snapshots' },
      { label: 'Lifecycle Manager', href: '#lifecycle' },
    ],
  },
  {
    label: 'Network & Security',
    items: [
      { label: 'Security Groups', href: '#security-groups' },
      { label: 'Elastic IPs', href: '#elastic-ips' },
      { label: 'Placement Groups', href: '#placement' },
      { label: 'Key Pairs', href: '#key-pairs' },
      { label: 'Network Interfaces', href: '#network-interfaces' },
    ],
  },
  {
    label: 'Load Balancing',
    items: [
      { label: 'Load Balancers', href: '#load-balancers' },
      { label: 'Target Groups', href: '#target-groups' },
    ],
  },
  {
    label: 'Auto Scaling',
    items: [
      { label: 'Auto Scaling Groups', href: '#asg' },
    ],
  },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'Instances': <Server size={14} />,
  'Images': <Layers size={14} />,
  'Elastic Block Store': <HardDrive size={14} />,
  'Network & Security': <Shield size={14} />,
  'Load Balancing': <Scale size={14} />,
  'Auto Scaling': <RefreshCcw size={14} />,
};

// ─── NavBtn ─────────────────────────────────────────────────────────────────

const NavBtn: React.FC<{
  icon: React.ReactNode;
  label: string | null;
  caret?: boolean;
}> = ({ icon, label, caret }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 8px',
        height: 32,
        fontSize: 13,
        fontWeight: 500,
        color: '#ffffff',
        background: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label && <span style={{ marginLeft: 2 }}>{label}</span>}
      {caret && <ChevronDown size={11} strokeWidth={2.5} style={{ marginLeft: 1 }} />}
    </button>
  );
};

// ─── TopNav ─────────────────────────────────────────────────────────────────

const TopNav: React.FC = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <header
      style={{
        height: 40,
        background: '#232f3e',
        borderBottom: '1px solid #161e2d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* AWS logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 10px',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              background: '#ec7211',
              width: 24,
              height: 24,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#ff9900',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}
          >
            aws
          </span>
        </div>

        {/* Services */}
        <NavBtn icon={null} label="Services" caret />

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 8 }}>
          <Search
            size={14}
            color={searchFocused ? '#5f6b7a' : '#8c95a0'}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search for services, features, blogs, docs, and more"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: 390,
              height: 28,
              background: searchFocused ? '#ffffff' : '#16191f',
              border: `1px solid ${searchFocused ? '#0972d3' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 4,
              paddingLeft: 32,
              paddingRight: 10,
              fontSize: 13,
              color: searchFocused ? '#16191f' : '#ffffff',
              outline: 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavBtn icon={<Bell size={14} />} label={null} />
        <NavBtn icon={<User size={14} />} label="student-account" caret />
        <NavBtn icon={<Globe size={14} />} label="us-east-1" caret />
        <NavBtn icon={<HelpCircle size={14} />} label="Support" caret />
      </div>
    </header>
  );
};

// ─── SideNav ─────────────────────────────────────────────────────────────────

const SideNav: React.FC<{
  activeItem: string;
  onSelect: (item: string) => void;
  collapsed: Record<string, boolean>;
  onToggle: (section: string) => void;
}> = ({ activeItem, onSelect, collapsed, onToggle }) => {
  const quickLinks = ['EC2 Dashboard', 'Events', 'Tags', 'Limits'];

  return (
    <aside
      style={{
        width: 280,
        background: '#ffffff',
        borderRight: '1px solid #eaeded',
        boxShadow: '1px 0 1px 0 rgba(0,28,36,.1)',
        flexShrink: 0,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #eaeded',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#16191f' }}>EC2</span>
          <span style={{ fontSize: 11, color: '#5f6b7a' }}>Management Console</span>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ paddingTop: 8, paddingBottom: 4 }}>
        {quickLinks.map(link => {
          const isActive = activeItem === link;
          return (
            <SideNavItem
              key={link}
              label={link}
              isActive={isActive}
              onClick={() => onSelect(link)}
              indent={false}
            />
          );
        })}
      </div>

      {/* Sections */}
      {NAV_SECTIONS.map(section => (
        <div key={section.label} style={{ borderTop: '1px solid #eaeded' }}>
          {/* Section header button */}
          <SectionHeader
            label={section.label}
            icon={SECTION_ICONS[section.label]}
            collapsed={!!collapsed[section.label]}
            onToggle={() => onToggle(section.label)}
          />

          {/* Section items */}
          {!collapsed[section.label] && (
            <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 6px' }}>
              {section.items.map(item => {
                const isActive = activeItem === item.label;
                return (
                  <li key={item.label}>
                    <SideNavItem
                      label={item.label}
                      isActive={isActive}
                      onClick={() => onSelect(item.label)}
                      indent
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      {/* Bottom padding */}
      <div style={{ height: 32 }} />
    </aside>
  );
};

const SectionHeader: React.FC<{
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
}> = ({ label, icon, collapsed, onToggle }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px 6px',
        fontSize: 13,
        fontWeight: 700,
        color: '#16191f',
        background: hovered ? '#f2f3f3' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#5f6b7a' }}>{icon}</span>
        <span>{label}</span>
      </div>
      <ChevronDown
        size={13}
        style={{
          color: '#5f6b7a',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }}
      />
    </button>
  );
};

const SideNavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  indent: boolean;
}> = ({ label, isActive, onClick, indent }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: isActive ? 700 : 400,
        color: isActive ? '#0972d3' : '#16191f',
        background: isActive ? '#f0f7ff' : hovered ? '#f2f3f3' : 'transparent',
        borderLeft: isActive ? '3px solid #0972d3' : '3px solid transparent',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        cursor: 'pointer',
        padding: isActive
          ? `5px 16px 5px ${indent ? 29 : 13}px`
          : `5px 16px 5px ${indent ? 32 : 16}px`,
      }}
    >
      {label}
    </button>
  );
};

// ─── Breadcrumb ─────────────────────────────────────────────────────────────

const Breadcrumb: React.FC<{ items: string[] }> = ({ items }) => (
  <nav
    aria-label="Breadcrumb"
    style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}
  >
    {items.map((item, i) => (
      <React.Fragment key={item}>
        {i > 0 && <ChevronRight size={13} style={{ color: '#8c95a0', flexShrink: 0 }} />}
        <span
          style={{
            fontSize: 13,
            color: i === items.length - 1 ? '#16191f' : '#0972d3',
            fontWeight: i === items.length - 1 ? 500 : 400,
            cursor: i === items.length - 1 ? 'default' : 'pointer',
            textDecoration: 'none',
          }}
        >
          {item}
        </span>
      </React.Fragment>
    ))}
  </nav>
);

// ─── Root Layout ────────────────────────────────────────────────────────────

export const AWSLayout: React.FC = () => {
  const [activeItem, setActiveItem] = useState('Instances');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleToggle = (section: string) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: "'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif",
        background: '#f2f3f3',
        color: '#16191f',
      }}
    >
      <TopNav />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="hidden md:block shadow-sm shrink-0">
          <SideNav
            activeItem={activeItem}
            onSelect={setActiveItem}
            collapsed={collapsed}
            onToggle={handleToggle}
          />
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <Breadcrumb items={['EC2', 'Instances', activeItem]} />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

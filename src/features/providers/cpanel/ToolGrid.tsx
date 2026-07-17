import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  GitBranch,
  Reply,
  Shield,
  FolderOpen,
  Archive,
  HardDrive,
  Upload,
  Database,
  ExternalLink,
  Server,
  Plus,
  Link,
  ArrowRight,
  Network,
  Lock,
  Terminal,
  EyeOff,
  Code,
  Layout,
  Layers,
  Settings,
  Clock,
  AlertTriangle,
  Users,
  Activity,
  AlertOctagon,
  Globe,
  ChevronUp,
  ChevronDown,
  Star,
  Zap,
} from 'lucide-react';

interface ToolDef {
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  route?: string;
  badge?: string;
}

interface CategoryDef {
  icon: React.FC<{ className?: string }>;
  title: string;
  tools: ToolDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    icon: Mail,
    title: 'Email',
    tools: [
      { icon: Mail,      label: 'Email Accounts',   description: 'Create and manage email accounts for your domain', badge: '3' },
      { icon: GitBranch, label: 'Forwarders',        description: 'Set up email address forwarders' },
      { icon: Reply,     label: 'Autoresponders',    description: 'Create automatic replies to incoming email' },
      { icon: Shield,    label: 'Spam Filters',      description: 'Configure Apache SpamAssassin spam detection' },
      { icon: FolderOpen,label: 'Email Filters',     description: 'Route email based on rules' },
      { icon: Settings,  label: 'Email Deliverability', description: 'Improve email delivery rates with SPF/DKIM' },
    ],
  },
  {
    icon: FolderOpen,
    title: 'Files',
    tools: [
      { icon: FolderOpen, label: 'File Manager',   description: 'Manage files and directories on your account' },
      { icon: Archive,    label: 'Backup',          description: 'Download full or partial backups of your account' },
      { icon: HardDrive,  label: 'Disk Usage',      description: 'View disk usage across your account directories' },
      { icon: Upload,     label: 'FTP Accounts',    description: 'Create and manage FTP accounts', badge: '1' },
      { icon: GitBranch,  label: 'Git™ Version Control', description: 'Manage Git repositories' },
    ],
  },
  {
    icon: Database,
    title: 'Databases',
    tools: [
      { icon: Database,     label: 'MySQL® Databases',       description: 'Create and manage MySQL databases', badge: '2' },
      { icon: ExternalLink, label: 'phpMyAdmin',              description: 'Manage databases with phpMyAdmin web interface' },
      { icon: Server,       label: 'Remote MySQL®',           description: 'Allow remote hosts to connect to your databases' },
      { icon: Database,     label: 'MySQL® Database Wizard',  description: 'Set up a database step-by-step' },
    ],
  },
  {
    icon: Globe,
    title: 'Domains',
    tools: [
      { icon: Plus,      label: 'Addon Domains',    description: 'Host additional domains on your account' },
      { icon: Link,      label: 'Subdomains',       description: 'Create and manage subdomains' },
      { icon: ArrowRight,label: 'Redirects',        description: 'Set up URL redirects for your domains' },
      { icon: Network,   label: 'Zone Editor',      description: 'Manage DNS zone records for your domains', route: 'zone-editor' },
      { icon: Globe,     label: 'Aliases',          description: 'Create domain aliases (parked domains)' },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    tools: [
      { icon: Lock,        label: 'SSL/TLS',             description: 'Manage SSL certificates and HTTPS settings', badge: 'Active' },
      { icon: Terminal,    label: 'SSH Access',           description: 'Manage SSH keys and access settings' },
      { icon: Shield,      label: 'IP Blocker',           description: 'Block unwanted IP addresses from accessing your site' },
      { icon: EyeOff,      label: 'Hotlink Protection',   description: 'Prevent other websites from linking to your files' },
      { icon: Lock,        label: 'Password Protect',     description: 'Password-protect directories with HTTP auth' },
      { icon: AlertTriangle,label: 'Leech Protection',   description: 'Protect against password sharing abuse' },
    ],
  },
  {
    icon: Layers,
    title: 'Software',
    tools: [
      { icon: Code,   label: 'PHP Version',       description: 'Select the PHP version for your account', badge: '8.2' },
      { icon: Layout, label: 'WordPress Toolkit', description: 'Install and manage WordPress sites' },
      { icon: Layers, label: 'Softaculous',        description: 'One-click application installer' },
      { icon: Zap,    label: 'Ruby on Rails',      description: 'Deploy Ruby on Rails applications' },
      { icon: Code,   label: 'Python',             description: 'Manage Python application environments' },
    ],
  },
  {
    icon: Settings,
    title: 'Advanced',
    tools: [
      { icon: Clock,         label: 'Cron Jobs',       description: 'Automate tasks on a scheduled basis' },
      { icon: Terminal,      label: 'Terminal',         description: 'Access command-line shell interface' },
      { icon: AlertTriangle, label: 'Error Pages',      description: 'Customize HTTP error response pages' },
      { icon: Server,        label: 'Apache Handlers',  description: 'Manage Apache MIME type handlers' },
      { icon: Settings,      label: 'MIME Types',       description: 'Define how Apache handles file extensions' },
    ],
  },
  {
    icon: Activity,
    title: 'Metrics',
    tools: [
      { icon: Users,       label: 'Visitors',   description: 'View statistics about visitors to your website' },
      { icon: Activity,    label: 'Bandwidth',  description: 'Track your bandwidth usage over time' },
      { icon: AlertOctagon,label: 'Error Log',  description: 'View recent errors generated by your site' },
      { icon: Star,        label: 'Awstats',    description: 'Advanced web statistics and analytics' },
    ],
  },
];

interface CategoryCardProps {
  category: CategoryDef;
  onToolClick: (tool: ToolDef) => void;
  searchQuery: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onToolClick, searchQuery }) => {
  const [collapsed, setCollapsed] = useState(false);
  const HeaderIcon = category.icon;

  const filteredTools = searchQuery
    ? category.tools.filter(
        t =>
          t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : category.tools;

  if (searchQuery && filteredTools.length === 0) return null;

  return (
    <div className="bg-[#ffffff] border border-[#eaeaea] rounded-lg shadow-sm overflow-hidden mb-5">
      {/* Category Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#eaeaea] cursor-pointer hover:bg-[#fafafa] transition-colors group"
        style={{ borderLeft: '4px solid #ee7623' }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-2.5">
          <HeaderIcon className="w-4 h-4 text-[#ee7623]" />
          <h2 className="text-[14px] font-bold text-[#333333]">{category.title}</h2>
          <span className="text-[11px] text-[#aaaaaa] font-normal">
            ({filteredTools.length} item{filteredTools.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="text-[#aaaaaa] group-hover:text-[#777777] transition-colors">
          {collapsed
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronUp className="w-4 h-4" />
          }
        </div>
      </div>

      {/* Tool List */}
      {!collapsed && (
        <div className="divide-y divide-[#f4f6f8]">
          {filteredTools.map((tool, idx) => {
            const ToolIcon = tool.icon;
            return (
              <div
                key={idx}
                onClick={() => onToolClick(tool)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#fff8f4] cursor-pointer transition-colors group/tool"
              >
                {/* Icon box */}
                <div className="w-9 h-9 rounded-md bg-[#fff4ec] border border-[#ffe5cc] flex items-center justify-center shrink-0 group-hover/tool:bg-[#ee7623] group-hover/tool:border-[#ee7623] transition-all">
                  <ToolIcon className="w-4 h-4 text-[#ee7623] group-hover/tool:text-white transition-colors" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#333333] group-hover/tool:text-[#ee7623] transition-colors">
                      {tool.label}
                    </span>
                    {tool.badge && (
                      <span className="px-1.5 py-0.5 bg-[#ee7623] text-white text-[10px] font-bold rounded">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#777777] leading-snug truncate mt-0.5">
                    {tool.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-3.5 h-3.5 text-[#cccccc] group-hover/tool:text-[#ee7623] shrink-0 transition-colors" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ToolGrid: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery] = useState('');

  const handleToolClick = (tool: ToolDef) => {
    if (tool.route) {
      navigate(tool.route);
    } else {
      // Simulate a "not yet interactive" shell
      console.info(`[cPanel] Navigating to: ${tool.label}`);
    }
  };

  const hasResults = CATEGORIES.some(cat =>
    cat.tools.some(
      t =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-[18px] font-bold text-[#333333]">All Features</h1>
        <p className="text-[12px] text-[#777777] mt-0.5">
          Manage every aspect of your hosting account from one place.
        </p>
      </div>

      {/* Favorite Tools Quick-Access Bar */}
      <div className="bg-white border border-[#eaeaea] rounded-lg shadow-sm p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-3.5 h-3.5 text-[#ee7623]" />
          <span className="text-[12px] font-bold text-[#333333] uppercase tracking-wider">Frequently Used</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Mail,      label: 'Email Accounts' },
            { icon: FolderOpen,label: 'File Manager' },
            { icon: Network,   label: 'Zone Editor', route: 'zone-editor' },
            { icon: Database,  label: 'MySQL Databases' },
            { icon: Lock,      label: 'SSL/TLS' },
            { icon: Code,      label: 'PHP Version' },
          ].map(({ icon: Icon, label, route }) => (
            <button
              key={label}
              onClick={() => route ? navigate(route) : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f6f8] hover:bg-[#fff4ec] border border-[#eaeaea] hover:border-[#ee7623] rounded-md text-[12px] font-medium text-[#333333] hover:text-[#ee7623] transition-all cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* All Categories */}
      {!hasResults && searchQuery ? (
        <div className="text-center py-12 text-[#777777] text-[13px]">
          No features found for &quot;{searchQuery}&quot;.
        </div>
      ) : (
        CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.title}
            category={cat}
            onToolClick={handleToolClick}
            searchQuery={searchQuery}
          />
        ))
      )}
    </div>
  );
};

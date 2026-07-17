import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
import { useMissionStore } from '../stores/useMissionStore';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import {
  X, BookOpen, Terminal as TermIcon, Network, Database, Shield,
  Award, HelpCircle, CheckCircle, ChevronRight, Zap, Info, Play
} from 'lucide-react';
import { motion } from 'motion/react';

export const StudyCompanionPanel: React.FC = () => {
  const location = useLocation();
  const { setCompanionOpen } = useUIStore();
  const { xp, missions } = useMissionStore();
  
  const [activeTab, setActiveTab] = useState<'guide' | 'cheat' | 'path'>('guide');

  // Determine active view context
  const getContext = () => {
    const path = location.pathname;
    
    if (path.includes('/labs')) {
      return {
        title: 'Academy & Labs Hub',
        desc: 'Study core web structures and verify virtual hosting environments.',
        tips: [
          'Theory Courses: Complete lessons and score 100% on quizzes to earn lab credits.',
          'Practice Labs: Unlocked by courses. Launch provider panels to perform operations.',
          'Always click "Verify" on active labs to confirm your configurations.'
        ]
      };
    }
    
    if (path.includes('/missions')) {
      return {
        title: 'Support Tickets Desk',
        desc: 'Solve real-world customer hosting configurations as a support admin.',
        tips: [
          'Read client messages carefully to find clues (e.g. file paths, ports).',
          'Tasks can be solved using either the visual cPanel/providers or CLI commands.',
          'Active missions run validation loops. Objectives mark resolved automatically.'
        ]
      };
    }
    
    if (path.includes('/dashboard')) {
      return {
        title: 'Server Hardware Metrics',
        desc: 'Monitor resource loads and active backend server daemons.',
        tips: [
          'vCPU Load: High utilization indicates heavy server processing loops.',
          'RAM Usage: Tracks active memory allocations for database and web daemons.',
          'Services Rail: If a service displays Stopped or Failed, start it in the Terminal.'
        ]
      };
    }
    
    if (path.includes('/terminal')) {
      return {
        title: 'Ubuntu 24.04 bash Terminal',
        desc: 'Interactive Linux command shell. Execute files and manage system rules.',
        tips: [
          'Use "ls" to list files, "cd [dir]" to move, and "pwd" to print your path.',
          'Use "nano [file]" to modify text files (e.g. Nginx config default).',
          'Use "systemctl status [service]" to check Nginx, PostgreSQL, or Node API.'
        ]
      };
    }
    
    if (path.includes('/providers/hostinger')) {
      return {
        title: 'Hostinger hPanel',
        desc: 'Visual custom control dashboard for simple shared hosting packages.',
        tips: [
          'Websites Manager: Add/Install websites to instantiate public directories.',
          'MySQL Database: Set up DBs, users, and passwords without terminal queries.',
          'Let\'s Encrypt SSL: Establish security handshakes to activate HTTPS.'
        ]
      };
    }
    
    if (path.includes('/providers/cpanel')) {
      return {
        title: 'cPanel Classic UI',
        desc: 'Standard category-grid shared hosting and administration interface.',
        tips: [
          'DNS Zone Editor: Add A (IP pointers), CNAME (aliases), and MX (mail server) records.',
          'Postgres Database: Create databases, users, and map access privileges.',
          'Cron Jobs: Schedule cron intervals to automate command script execution.'
        ]
      };
    }
    
    if (path.includes('/providers/contabo')) {
      return {
        title: 'Contabo VPS Panel',
        desc: 'Unmanaged virtual servers. Access low-level machine controls.',
        tips: [
          'Power Reset: Hard reboot VM sockets if internal kernels freeze.',
          'Re-image OS: Flash clean Linux distributions (Rocky Linux or Ubuntu).',
          'VNC Graphics Console: Connect graphical maintenance screens when SSH is offline.'
        ]
      };
    }
    
    if (path.includes('/providers/digitalocean')) {
      return {
        title: 'DigitalOcean Droplets',
        desc: 'Provision virtual server droplets and deploy app marketplaces.',
        tips: [
          'Marketplace Stacks: Select Docker templates to auto-install dependencies.',
          'Droplet Sizing: Allocate CPU/RAM capacities matching application specifications.',
          'Floating IP: Bind static gateway addresses to direct domain calls.'
        ]
      };
    }
    
    if (path.includes('/providers/aws')) {
      return {
        title: 'Amazon Web Services (AWS)',
        desc: 'Enterprise-grade decoupled cloud environments and buckets.',
        tips: [
          'EC2 Compute: Scale virtual servers on-demand with customized security rules.',
          'S3 Storage: Private buckets store persistent files; Block Public Access overrides.',
          'RDS Databases: Run isolated PostgreSQL or MySQL database clusters.'
        ]
      };
    }
    
    return {
      title: 'HostLab Study Companion',
      desc: 'Your interactive roadmap advisor for DevOps and Server Administration.',
      tips: [
        'Explore Academy Theory modules under the Academy & Labs tab.',
        'Apply lessons directly by working on customer Support Tickets.',
        'Use the Companion Panel for visual explanations whenever you are stuck.'
      ]
    };
  };

  const context = getContext();

  // DevOps Zero-to-Pro Pathway Levels
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.completed).length;
  
  let userLevel = 'Junior Admin';
  let nextLevel = 'Intermediate Architect';
  let progressPct = Math.min((xp / 600) * 100, 100);

  if (xp >= 500) {
    userLevel = 'DevOps Pro';
    nextLevel = 'Cloud Administrator Hero';
  } else if (xp >= 250) {
    userLevel = 'Intermediate Admin';
    nextLevel = 'DevOps Pro';
  }

  return (
    <div className="bg-[#0b0c10]/95 border border-white/5 rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl backdrop-blur-md">
      
      {/* Header Panel */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">DevOps Companion</h3>
            <p className="text-[10px] text-slate-500 font-mono">Guide & Playbook Active</p>
          </div>
        </div>
        <button
          onClick={() => setCompanionOpen(false)}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 text-[10px] font-bold uppercase tracking-wider bg-black/25">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b ${
            activeTab === 'guide'
              ? 'border-yellow-500 text-yellow-400 bg-yellow-500/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
          }`}
        >
          Context Guide
        </button>
        <button
          onClick={() => setActiveTab('cheat')}
          className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b ${
            activeTab === 'cheat'
              ? 'border-yellow-500 text-yellow-400 bg-yellow-500/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
          }`}
        >
          Cheat Sheet
        </button>
        <button
          onClick={() => setActiveTab('path')}
          className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b ${
            activeTab === 'path'
              ? 'border-yellow-500 text-yellow-400 bg-yellow-500/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
          }`}
        >
          Roadmap
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'guide' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Context Info Box */}
            <div className="bg-[#111218] border border-white/5 rounded-xl p-4.5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-display">
                <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                {context.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                {context.desc}
              </p>
            </div>

            {/* Quick Tips */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Educational Playbook Tips
              </h5>
              <ul className="space-y-2">
                {context.tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2.5 items-start text-[11px] text-slate-350 leading-relaxed font-mono bg-[#0d0d12]/40 border border-white/[0.02] p-2.5 rounded-lg"
                  >
                    <span className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center text-[9px] shrink-0 font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'cheat' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 font-mono text-[11px]"
          >
            {/* Terminal Commands */}
            <div className="space-y-2 bg-[#050507] border border-white/5 rounded-xl p-3.5">
              <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <TermIcon className="w-3.5 h-3.5" /> Essential Linux CLI
              </h4>
              <div className="space-y-2 pt-1.5 divide-y divide-white/5">
                <div>
                  <code className="text-white block font-bold">ls -la</code>
                  <span className="text-[10px] text-slate-500 block">List files including hidden config profiles.</span>
                </div>
                <div className="pt-2">
                  <code className="text-white block font-bold">nano /path/to/file</code>
                  <span className="text-[10px] text-slate-500 block">Modify site configuration templates.</span>
                </div>
                <div className="pt-2">
                  <code className="text-white block font-bold">systemctl restart [service]</code>
                  <span className="text-[10px] text-slate-500 block">Restart system services (nginx, postgresql).</span>
                </div>
                <div className="pt-2">
                  <code className="text-white block font-bold">ufw allow [port]/tcp</code>
                  <span className="text-[10px] text-slate-500 block">Configure UFW rules (allow 22, 80).</span>
                </div>
                <div className="pt-2">
                  <code className="text-white block font-bold">ln -s [src] [dest]</code>
                  <span className="text-[10px] text-slate-500 block">Create symbolic links (sites-enabled).</span>
                </div>
              </div>
            </div>

            {/* DNS Records Reference */}
            <div className="space-y-2 bg-[#050507] border border-white/5 rounded-xl p-3.5">
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" /> DNS Mapping Definitions
              </h4>
              <div className="space-y-2 pt-1.5 divide-y divide-white/5">
                <div>
                  <code className="text-white block font-bold">A Record</code>
                  <span className="text-[10px] text-slate-500 block">Maps domain directly to server IPv4 destination.</span>
                </div>
                <div className="pt-2">
                  <code className="text-white block font-bold">CNAME Record</code>
                  <span className="text-[10px] text-slate-500 block">Maps canonical name aliases (cdn to main site).</span>
                </div>
                <div className="pt-2">
                  <code className="text-white block font-bold">MX Record</code>
                  <span className="text-[10px] text-slate-500 block">Routes email queues to specified mail hostnames.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'path' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Zero-to-Pro Pathway Progress */}
            <div className="bg-[#111218] border border-white/5 rounded-xl p-4.5 space-y-3.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-display">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                Zero-to-Pro Roadmap
              </h4>
              
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between font-bold text-slate-350">
                  <span>Current Level:</span>
                  <span className="text-yellow-400">{userLevel}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>XP Gained:</span>
                  <span>{xp} XP</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-[#050507] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase tracking-widest pt-0.5">
                  <span>Junior</span>
                  <span>Pro</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Tickets Resolved:</span>
                <strong className="text-white font-bold">{completedMissions} / {totalMissions}</strong>
              </div>
            </div>

            {/* Structured Levels */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Syllabus Progression Stages
              </h5>
              <div className="space-y-2">
                <div className="bg-[#050507]/40 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Junior Web Host</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">DNS mappings, MySQL, cPanel & domain bases</p>
                  </div>
                </div>

                <div className="bg-[#050507]/40 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">VPS Administrator</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Linux system control, UFW firewalls & Nginx proxy</p>
                  </div>
                </div>

                <div className="bg-[#050507]/40 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold font-mono">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">DevOps & Cloud Pro</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Horizontal scaling, AWS EC2/S3/RDS, Docker containers</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-black/40 border-t border-white/5 text-center text-[10px] font-mono text-slate-600 select-none">
        Mascot Offline • Static Guide Active
      </div>
    </div>
  );
};

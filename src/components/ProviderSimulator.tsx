import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Server, Globe, Database, Cpu, Network, Shield, HelpCircle, 
  ChevronRight, Award, DollarSign, Layout, Terminal as TermIcon, ArrowLeft,
  Sparkles, Layers, ArrowRight, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HostingerTab } from './HostingerTab';
import { ContaboTab } from './ContaboTab';
import { DigitalOceanTab } from './DigitalOceanTab';
import { AwsTab } from './AwsTab';
import { CPanelTab } from './CPanelTab';

export type PathID = 'none' | 'hostinger' | 'cpanel' | 'contabo' | 'digitalocean' | 'aws';

interface ComparisonData {
  difficulty: number; // 1-5 stars
  cost: string;       // e.g. "Low ($3/mo)"
  control: 'Low' | 'Medium' | 'High' | 'Very High' | 'Maximum';
  bestFor: string;
  verdict: string;
}

interface ProviderSimulatorProps {
  activePath?: PathID;
  setActivePath?: (path: PathID) => void;
}

export const ProviderSimulator: React.FC<ProviderSimulatorProps> = ({ 
  activePath: propActivePath, 
  setActivePath: propSetActivePath 
}) => {
  const { state } = useSimulator();
  const [localActivePath, setLocalActivePath] = useState<PathID>('none');
  
  const activePath = propActivePath !== undefined ? propActivePath : localActivePath;
  const setActivePath = propSetActivePath !== undefined ? propSetActivePath : setLocalActivePath;

  const [comparisonApp, setComparisonApp] = useState<'fastapi' | 'wordpress' | 'static' | 'ecommerce'>('fastapi');

  const paths = [
    {
      id: 'hostinger',
      title: 'Hostinger hPanel',
      badge: 'Beginner Friendly',
      color: 'from-violet-500 to-indigo-600',
      textColor: 'text-indigo-400',
      icon: <Layout className="w-5 h-5 text-indigo-400" />,
      difficulty: '🟢 Easy',
      learn: ['Custom Domains mapping', '1-Click WordPress installations', 'Sleek Database creation', 'Interactive secure Emails setup'],
      desc: 'Visual control panel. No server command line required. Ideal for blogs, portfolios, and client sites.'
    },
    {
      id: 'cpanel',
      title: 'cPanel Shared Hosting',
      badge: 'Industry Classic',
      color: 'from-orange-500 to-red-600',
      textColor: 'text-orange-400',
      icon: <Network className="w-5 h-5 text-orange-400" />,
      difficulty: '🟢 Easy',
      learn: ['Multi-site subdomains', 'Cron Job automated schedules', 'Let\'s Encrypt SSL', 'Dynamic File Manager directories'],
      desc: 'The traditional interface found in 90% of legacy web hosts. Visual, category-based tools.'
    },
    {
      id: 'contabo',
      title: 'Contabo VPS Panel',
      badge: 'Unbeatable Hardware Value',
      color: 'from-amber-600 to-orange-500',
      textColor: 'text-amber-500',
      icon: <Server className="w-5 h-5 text-amber-500" />,
      difficulty: '🟡 Intermediate',
      learn: ['Out-of-band WebVNC console', 'Hard vs. Soft kernel rebooting', 'OS Re-imaging (Ubuntu/Rocky)', 'Reverse DNS (PTR) records mapping'],
      desc: 'Practise VPS container hypervisor actions, VNC graphical console logins, and multiple global IP allocation.'
    },
    {
      id: 'digitalocean',
      title: 'DigitalOcean Droplets',
      badge: 'Developer Cloud VPS',
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-400',
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      difficulty: '🟡 Intermediate',
      learn: ['Interactive Droplet creation wizard', 'Installing Docker on Ubuntu templates', 'PM2 Node.js process managers', 'Direct root SSH sandbox console access'],
      desc: 'Simple developer cloud. Spin up raw Linux OS instances (Droplets) and practise unmanaged SSH terminal commands.'
    },
    {
      id: 'aws',
      title: 'AWS Console',
      badge: 'Enterprise Architecture',
      color: 'from-slate-700 to-slate-900 border-b-2 border-orange-500',
      textColor: 'text-orange-400',
      icon: <Layers className="w-5 h-5 text-orange-400" />,
      difficulty: '🔴 Advanced',
      learn: ['EC2 Instance launches with security firewall rules', 'Private S3 Buckets & Public Access Policies', 'RDS PostgreSQL database nodes', 'Route53 Hosted DNS zones & IAM user rights'],
      desc: 'Industry standard enterprise platform. Learn why AWS is highly modular, customizable, powerful but complex.'
    }
  ];

  // Comparison DB lookup
  const comparisonMatrix: Record<string, Record<PathID, ComparisonData>> = {
    fastapi: {
      none: {} as any,
      hostinger: { difficulty: 2, cost: 'Low ($3.50/mo)', control: 'Medium', bestFor: 'WordPress/Static mainly. Node is supported but setup is complex.', verdict: 'Possible via custom Git integrations, but lacks terminal access to install python dependencies easily.' },
      cpanel: { difficulty: 2.5, cost: 'Low ($4.00/mo)', control: 'Medium', bestFor: 'PHP applications, legacy systems, simple tools.', verdict: 'Supports Python apps via Passenger WSGI wrapper, but configuration is tedious and non-standard for developers.' },
      contabo: { difficulty: 4, cost: 'Low-Med (€4.99/mo)', control: 'Very High', bestFor: 'Developers, Docker containers, custom APIs, background queues.', verdict: 'Outstanding value! You get 4 vCPU Cores & 8GB RAM to host multiple FastAPI containers via Nginx proxy.' },
      digitalocean: { difficulty: 3.5, cost: 'Low-Med ($6.00/mo)', control: 'Very High', bestFor: 'Modern developer stacks, Node API, FastAPI, Python.', verdict: 'Highly recommended for developers. Deploy using standard Docker, bind domain, and manage via direct SSH.' },
      aws: { difficulty: 5, cost: 'Variable / Complex', control: 'Maximum', bestFor: 'Large scalable systems, multi-region API clusters.', verdict: 'Perfect for large enterprise platforms requiring load balancers, RDS PostgreSQL databases, and auto-scaling EC2 instances.' }
    },
    wordpress: {
      none: {} as any,
      hostinger: { difficulty: 1, cost: 'Low ($2.99/mo)', control: 'Medium', bestFor: 'Small/Medium blogs, portfolios, e-commerce.', verdict: 'Best Choice for Beginners! 1-click installer provisions database, files, and SSL automatically.' },
      cpanel: { difficulty: 1.5, cost: 'Low ($4.00/mo)', control: 'Medium', bestFor: 'Traditional developers, legacy agency clients.', verdict: 'Very easy. Built-in Softaculous installer puts WordPress online in 1-click.' },
      contabo: { difficulty: 4, cost: 'Low (€4.99/mo)', control: 'Very High', bestFor: 'Developers who want complete database ownership.', verdict: 'Requires manual installation of LAMP stack (Apache/PHP/MySQL) over SSH. Excellent practice but over-kill for simple blogs.' },
      digitalocean: { difficulty: 3, cost: 'Low ($6.00/mo)', control: 'Very High', bestFor: 'Developers building custom themes or headless headless WP.', verdict: '1-click LAMP or OpenLiteSpeed templates get it running fast, but updates must be handled via command line.' },
      aws: { difficulty: 5, cost: 'Medium-High', control: 'Maximum', bestFor: 'Enterprise news portals, massive WooCommerce sites.', verdict: 'Overcomplicated for simple sites. Recommended only for high-traffic enterprise networks requiring Lightsail or elastic EC2.' }
    },
    static: {
      none: {} as any,
      hostinger: { difficulty: 1, cost: 'Low ($1.99/mo)', control: 'Medium', bestFor: 'HTML/CSS/JS basic pages, React dist bundles.', verdict: 'Very easy. Simply upload static folders directly to public_html folder using File Manager.' },
      cpanel: { difficulty: 1, cost: 'Low ($4.00/mo)', control: 'Medium', bestFor: 'Portfolio sites, basic marketing grids.', verdict: 'Extremely easy. Drag & drop files directly into public_html directory.' },
      contabo: { difficulty: 4, cost: 'Low (€4.99/mo)', control: 'Very High', bestFor: 'Large content assets distribution.', verdict: 'Complete overkill. Setting up Nginx virtual hosts over terminal is unnecessary just to serve static text files.' },
      digitalocean: { difficulty: 2.5, cost: 'Low ($4.00/mo)', control: 'Very High', bestFor: 'Serverless landing sites or static docs.', verdict: 'DigitalOcean App Platform offers free static hosting, but manual droplet setup is tedious for simple static HTML.' },
      aws: { difficulty: 3, cost: 'Almost Free ($0.50/mo)', control: 'Maximum', bestFor: 'Enterprise global CDNs, React/Vue SPAs.', verdict: 'Incredible enterprise setup! Host static files inside an S3 bucket, set Public Block policy, and cache globally with CloudFront.' }
    },
    ecommerce: {
      none: {} as any,
      hostinger: { difficulty: 2, cost: 'Med ($8.99/mo)', control: 'Medium', bestFor: 'WooCommerce, Prestashop, small shops.', verdict: 'Good for standard traffic WooCommerce stores. Handled entirely visually with custom caching.' },
      cpanel: { difficulty: 2, cost: 'Med ($12.00/mo)', control: 'Medium', bestFor: 'Classic PHP online shopping baskets.', verdict: 'Stable and easy, but visual panels lack modern automatic horizontal scaling.' },
      contabo: { difficulty: 4.5, cost: 'Low (€4.99/mo)', control: 'Very High', bestFor: 'Developer-led custom Node/React shops.', verdict: 'Offers outstanding raw resources (RAM) to handle heavy PostgreSQL databases and concurrent customer API calls.' },
      digitalocean: { difficulty: 4, cost: 'Medium ($24.00/mo)', control: 'Very High', bestFor: 'SaaS shops, custom databases, intermediate scale.', verdict: 'Perfect middleground. Spin up dedicated Droplets for your API, and a managed PostgreSQL node to scale transactions.' },
      aws: { difficulty: 5, cost: 'High / Pay-per-use', control: 'Maximum', bestFor: 'Global giants, Amazon-like massive systems.', verdict: 'The golden standard. Decouple your system: host web assets on S3/CloudFront, API routers on auto-scaling EC2, and transaction records on RDS.' }
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col min-h-0" id="provider-simulator-root">
      
      {/* ================= BACK NAVIGATION FOR CLONES ================= */}
      {activePath !== 'none' && (
        <div className="shrink-0 flex items-center justify-between bg-[#0e0e12] border border-white/5 rounded-xl px-5 py-3 select-none">
          <button
            onClick={() => setActivePath('none')}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Back to Provider Marketplace
          </button>
          
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-500 font-mono">SIMULATION TERMINUS:</span>
            <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
              {paths.find(p => p.id === activePath)?.title}
            </span>
          </div>
        </div>
      )}

      {/* ================= COMPONENT VIEWS ROUTER ================= */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activePath === 'none' ? (
            <motion.div
              key="selection-lobby"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* LOBBY HEADER */}
              <div className="text-center max-w-xl mx-auto space-y-2 py-4 select-none">
                <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Virtual Infrastructure Simulator
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white font-display uppercase tracking-tight">
                  HostLab Marketplace
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  "Try before you buy." Experience real hosting environments virtually, practice command operations, and discover the best server fit for your projects.
                </p>
              </div>

              {/* CHOOSE YOUR PATH SELECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paths.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0b0b0e] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all flex flex-col justify-between space-y-4 shadow-lg group relative overflow-hidden"
                  >
                    {/* Visual Hover Gradient */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-purple-500/0 rounded-full blur-2xl pointer-events-none group-hover:from-cyan-500/10 group-hover:duration-500 transition-all"></div>

                    <div className="space-y-3.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-white/5 border border-white/5 text-slate-400 font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wide">
                          {p.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{p.difficulty}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                          {p.icon}
                        </div>
                        <h3 className="font-bold text-white text-base font-sans tracking-tight">{p.title}</h3>
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed font-sans min-h-[48px]">
                        {p.desc}
                      </p>

                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1 font-mono">Practise Skills:</span>
                        {p.learn.map((l, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0"></span>
                            <span className="truncate">{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setActivePath(p.id as PathID)}
                      className={`w-full mt-4 bg-gradient-to-r ${p.color} text-white hover:opacity-90 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all uppercase tracking-wide`}
                    >
                      Enter Environment <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* ================= COMPARISON MODE SECTION ================= */}
              <div className="bg-[#0b0b0e] border border-white/5 rounded-xl p-6 shadow-xl space-y-6 select-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-2 border-b border-white/5 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-widest font-mono">
                    <Award className="w-3.5 h-3.5 animate-pulse" /> DevOps Decision Guide
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans tracking-tight">Comparison Mode</h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Compare technical parameters, estimated billing cycles, and difficulty weights between shared and developer-unmanaged architectures based on your application stack.
                  </p>
                </div>

                {/* SELECT APP STACK */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold mr-2">I want to host:</span>
                  {[
                    { id: 'fastapi', label: 'FastAPI + React API App' },
                    { id: 'wordpress', label: 'WordPress Blog' },
                    { id: 'static', label: 'Static HTML Landing Page' },
                    { id: 'ecommerce', label: 'Enterprise E-Commerce' }
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => setComparisonApp(app.id as any)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                        comparisonApp === app.id
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 font-bold shadow-sm'
                          : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>

                {/* DYNAMIC COMPARISON COMPARISON GRID CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-sans text-xs">
                  {paths.map(p => {
                    const matrix = comparisonMatrix[comparisonApp][p.id as PathID];
                    if (!matrix) return null;
                    return (
                      <div key={p.id} className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded bg-white/10 flex items-center justify-center text-[10px]">P</span>
                            <strong className="text-white text-xs block truncate font-bold font-sans">{p.title}</strong>
                          </div>

                          <div className="space-y-1.5 border-t border-white/5 pt-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-mono text-[10px]">Difficulty</span>
                              <div className="flex gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < matrix.difficulty ? 'fill-current text-amber-400' : 'text-white/10'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-slate-500">Cost/Mo</span>
                              <strong className="text-slate-300 font-bold">{matrix.cost}</strong>
                            </div>
                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-slate-500">Ctrl Level</span>
                              <strong className="text-cyan-400 font-semibold">{matrix.control}</strong>
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-2">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1 font-mono">Best For:</span>
                            <p className="text-[11px] text-slate-400 leading-normal min-h-[36px]">{matrix.bestFor}</p>
                          </div>
                        </div>

                        <div className="bg-white/3 border border-white/5 p-2.5 rounded-lg text-[11px] leading-relaxed text-slate-300 font-sans italic">
                          "{matrix.verdict}"
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </motion.div>
          ) : (
            <motion.div
              key="active-clone-viewport"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activePath === 'hostinger' && <HostingerTab />}
              {activePath === 'cpanel' && <CPanelTab />}
              {activePath === 'contabo' && <ContaboTab />}
              {activePath === 'digitalocean' && <DigitalOceanTab />}
              {activePath === 'aws' && <AwsTab />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

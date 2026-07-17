import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ServiceRail } from './ServiceRail';
import { HeroTerminal } from './HeroTerminal';
import { BootSequence } from './BootSequence';
import { GlobalCLI } from './GlobalCLI';

export default function HomePage() {
  return (
    <div className="homepage-shell min-h-screen bg-[var(--ink)] text-[var(--text-dark-bg)] font-sans selection:bg-[var(--accent-fiber)]/30 selection:text-white relative">
      <BootSequence />
      <GlobalCLI />
      <Header />

      <main className="pt-[120px] pb-24 md:pt-[160px] flex flex-col gap-[80px] md:gap-[160px]">
        
        {/* === 1. HERO SECTION === */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <p className="text-caption text-[var(--ash)] mb-6">
              No credit card. No VPS bill. Just the panel.
            </p>
            <h1 className="h1 text-white max-w-4xl mb-6">
              Learn five hosting panels before you ever pay for one.
            </h1>
            <p className="text-body-large text-[var(--ash)] max-w-2xl mb-10">
              Practice real configurations, break things without consequence, and build muscle memory across the industry's most popular control panels.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
              <Link to="/app" className="btn-primary w-full sm:w-auto">
                Start a free lab &rarr;
              </Link>
              <a href="#modules" className="btn-secondary w-full sm:w-auto">
                See all five environments
              </a>
            </div>

            <HeroTerminal />
          </motion.div>
        </section>

        {/* === 2. THE RAIL / MODULE CARDS === */}
        <section id="modules" className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-caption text-[var(--ash)] mb-2">The Rail</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Hostinger */}
            <ModuleCard 
              id="hostinger"
              name="Hostinger"
              desc="Point a domain and issue an SSL cert."
              level="Beginner"
              colorVar="--module-hostinger"
            />
            {/* Contabo */}
            <ModuleCard 
              id="contabo"
              name="Contabo"
              desc="Rebuild OS and manage basic networking."
              level="Intermediate"
              colorVar="--module-contabo"
            />
            {/* AWS */}
            <ModuleCard 
              id="aws"
              name="AWS Console"
              desc="Configure an EC2 instance and Security Groups."
              level="Advanced"
              colorVar="--module-aws"
            />
            {/* cPanel */}
            <ModuleCard 
              id="cpanel"
              name="cPanel"
              desc="Create databases, users, and cron jobs."
              level="Beginner"
              colorVar="--module-cpanel"
            />
            {/* DigitalOcean */}
            <ModuleCard 
              id="digitalocean"
              name="DigitalOcean"
              desc="Deploy a Droplet and manage SSH keys."
              level="Intermediate"
              colorVar="--module-digitalocean"
            />
          </div>
        </section>

        {/* === 3. HOW IT WORKS === */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-caption text-[var(--ash)] mb-4">How it works</h2>
            <h3 className="h2 text-white">Three steps to mastery</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="font-display text-4xl text-[var(--steel-line)] font-light">01</div>
              <h4 className="font-display text-lg text-white font-medium">Pick a service</h4>
              <p className="text-[var(--ash)]">Select the panel you want to learn from the service rail. Instantly boot a fresh, simulated environment.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="font-display text-4xl text-[var(--steel-line)] font-light">02</div>
              <h4 className="font-display text-lg text-white font-medium">Work the panel</h4>
              <p className="text-[var(--ash)]">Follow the interactive objective or just explore. The UI mirrors the real platform's layout and logic.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="font-display text-4xl text-[var(--steel-line)] font-light">03</div>
              <h4 className="font-display text-lg text-white font-medium">Get validated</h4>
              <p className="text-[var(--ash)]">The system checks your work in real time. Pass the objective, keep the skill, and move to the next challenge.</p>
            </div>
          </div>
        </section>

        {/* === 4. COMPARISON === */}
        <section className="bg-[#131720] border-y border-[var(--steel-line)] py-20">
          <div className="max-w-[1000px] mx-auto px-6 md:px-10 lg:px-20">
            <div className="text-center mb-16">
              <h2 className="h2 text-white">Why not just buy a plan?</h2>
              <p className="text-[var(--ash)] mt-4">The cost of real trial accounts vs. the PapperLab sandbox.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--steel-line)] border border-[var(--steel-line)] rounded-xl overflow-hidden">
              <div className="bg-[var(--ink)] p-8 md:p-12">
                <h4 className="font-display text-lg text-white font-medium mb-6">Real Trial / VPS</h4>
                <ul className="flex flex-col gap-4 text-[var(--ash)]">
                  <li className="flex gap-3">
                    <span className="text-[#C24A3D]">✗</span>
                    <span>Requires a credit card on file</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C24A3D]">✗</span>
                    <span>Risk of auto-renewal charges</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C24A3D]">✗</span>
                    <span>Breaking production takes hours to fix</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#C24A3D]">✗</span>
                    <span>Limited to one provider's ecosystem</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#181D26] p-8 md:p-12 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-fiber)] opacity-[0.03] blur-3xl"></div>
                <h4 className="font-display text-lg text-[var(--accent-fiber)] font-medium mb-6">PapperLab Sandbox</h4>
                <ul className="flex flex-col gap-4 text-white">
                  <li className="flex gap-3">
                    <span className="text-[var(--status-success)]">✓</span>
                    <span>100% free, no credit card ever</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--status-success)]">✓</span>
                    <span>Zero financial risk or hidden fees</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--status-success)]">✓</span>
                    <span>Reset broken environments in one click</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--status-success)]">✓</span>
                    <span>Five different ecosystems in one place</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* === 5. STATUS STRIP === */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 text-center">
          <div className="inline-flex items-center gap-3 bg-[var(--steel)] border border-[var(--steel-line)] rounded-full px-5 py-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] shadow-[0_0_8px_var(--status-success)] animate-pulse"></span>
            <span className="font-data text-[var(--text-dark-bg)]">All 5 environments operational</span>
          </div>
        </section>

        {/* === 6. FINAL CTA === */}
        <section className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="h2 text-white mb-8">Ready to break some servers?</h2>
          <Link to="/app" className="btn-primary inline-flex">
            Start your first lab &rarr;
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}

/* === Sub-components === */

function ModuleCard({ id, name, desc, level, colorVar }: { id: string, name: string, desc: string, level: string, colorVar: string }) {
  // Extract icon dynamically from the rail data
  // But we can also just use the Rail component directly
  // However, the spec says "jack icon, name, one-line what it teaches, difficulty tag, 'Enter sandbox →'"
  
  return (
    <div className="group relative flex flex-col h-full bg-[var(--steel)] border border-[var(--steel-line)] rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        {/* Single jack icon, using the ServiceRail styling logic but isolated */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--steel-line)] relative overflow-hidden transition-all duration-200"
          style={{ color: `var(${colorVar})` }}
        >
          <div 
            className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity duration-200"
            style={{ backgroundColor: `color-mix(in srgb, var(${colorVar}) 10%, transparent)` }}
          />
          {/* We map the id to the icon. Easiest is rendering ServiceRail with a filter, but let's just hardcode the icon logic for clarity */}
          {id === 'hostinger' && <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>}
          {id === 'contabo' && <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>}
          {id === 'aws' && <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>}
          {id === 'cpanel' && <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z"></path></svg>}
          {id === 'digitalocean' && <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a10 10 0 1 1 5-18.66"></path><path d="M12 12a5 5 0 1 1 2.5-9.33"></path><path d="M12 7a2 2 0 1 1 1-3.73"></path><path d="M12 4.5V4"></path><path d="M12 9.5V9"></path><path d="M12 14.5V14"></path></svg>}
        </div>

        {/* Difficulty Pill */}
        <div className="bg-[var(--ink)] border border-[var(--steel-line)] rounded text-xs font-display font-medium px-2 py-1 text-[var(--ash)]">
          {level}
        </div>
      </div>

      <h4 className="font-display text-white font-medium mb-2">{name}</h4>
      <p className="text-sm text-[var(--ash)] mb-6 flex-1">{desc}</p>
      
      <div className="mt-auto pt-4 border-t border-[var(--steel-line)]">
        <Link to="/app" className="text-sm font-display font-medium text-[var(--text-dark-bg)] group-hover:text-white transition-colors flex items-center gap-2">
          Enter sandbox 
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

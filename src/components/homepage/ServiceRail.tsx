import { Rocket, Server, Box, Shield, Droplet } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

type RailScale = 'compact' | 'default' | 'sidebar';

interface ServiceRailProps {
  scale?: RailScale;
  className?: string;
  animateIn?: boolean;
}

// A tiny 10ms synthesized "click" or "tick" sound (base64 encoded wav)
const clickAudioSrc = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function ServiceRail({ scale = 'default', className = '', animateIn = false }: ServiceRailProps) {
  const isCompact = scale === 'compact';
  const isSidebar = scale === 'sidebar';
  
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only initialize audio once per client
    const audio = new Audio(clickAudioSrc);
    audio.volume = 0.15; // Very subtle
    setAudioObj(audio);
  }, []);

  const playClick = () => {
    if (!audioObj) return;
    // Reset and play to allow rapid overlapping clicks
    audioObj.currentTime = 0;
    audioObj.play().catch(() => {
      // Ignore autoplay/interaction restrictions on first load
    });
  };

  const containerClass = isSidebar ? 'flex flex-col gap-2' : 'flex flex-row gap-2';

  const services = [
    { name: 'Hostinger', icon: Rocket, colorVar: '--module-hostinger', id: 'hostinger' },
    { name: 'Contabo', icon: Server, colorVar: '--module-contabo', id: 'contabo' },
    { name: 'AWS Console', icon: Box, colorVar: '--module-aws', id: 'aws' },
    { name: 'cPanel', icon: Shield, colorVar: '--module-cpanel', id: 'cpanel' },
    { name: 'DigitalOcean', icon: Droplet, colorVar: '--module-digitalocean', id: 'digitalocean' },
  ];

  return (
    <div className={`${containerClass} ${className}`}>
      {services.map((svc, i) => {
        const Icon = svc.icon;
        
        let sizeClass = 'w-16 h-16 rounded-xl'; // default hero
        let iconSizeClass = 'w-8 h-8';
        
        if (isCompact) {
          sizeClass = 'w-7 h-7 rounded-md';
          iconSizeClass = 'w-4 h-4';
        } else if (isSidebar) {
          sizeClass = 'w-10 h-10 rounded-lg';
          iconSizeClass = 'w-5 h-5';
        }

        // To comply with motion props on TS, we check animateIn
        const motionProps = animateIn ? {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' as const }
        } : {};

        return (
          <motion.button
            key={svc.id}
            {...motionProps}
            title={svc.name}
            onMouseEnter={playClick}
            className={`flex items-center justify-center cursor-pointer transition-all duration-200 group relative border border-[var(--steel-line)] bg-[var(--steel)] ${sizeClass}`}
            style={{ 
              color: `var(${svc.colorVar})`,
            }}
          >
            <div 
              className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                boxShadow: `0 0 15px var(${svc.colorVar})`,
                backgroundColor: `color-mix(in srgb, var(${svc.colorVar}) 10%, transparent)`
              }}
            />
            <Icon className={`${iconSizeClass} opacity-60 group-hover:opacity-100 transition-opacity duration-200 relative z-10`} />
          </motion.button>
        );
      })}
    </div>
  );
}

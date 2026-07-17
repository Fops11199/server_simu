import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animate?: boolean;
}

const colorMap: Record<string, string> = {
  cyan:    'bg-cyan-500',
  purple:  'bg-purple-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
};

const textColorMap: Record<string, string> = {
  cyan:    'text-cyan-400',
  purple:  'text-purple-400',
  emerald: 'text-emerald-400',
  amber:   'text-amber-400',
  rose:    'text-rose-400',
};

const sizeMap: Record<string, string> = {
  xs: 'h-0.5',
  sm: 'h-1',
  md: 'h-1.5',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'cyan',
  size = 'sm',
  showLabel = false,
  label,
  className = '',
  animate = true,
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-semibold">{label}</span>}
          {showLabel && <span className={`text-[10px] font-mono font-semibold ${textColorMap[color]}`}>{clamped}%</span>}
        </div>
      )}
      <div className={`w-full ${sizeMap[size]} bg-white/5 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colorMap[color]} ${animate ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

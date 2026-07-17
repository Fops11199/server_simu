import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'xp' | 'cyan' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-[var(--color-bg-overlay)] border-[var(--color-border)] text-[var(--color-text-secondary)]',
  success:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  warning:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
  error:    'bg-rose-500/10 border-rose-500/20 text-rose-400',
  info:     'bg-blue-500/10 border-blue-500/20 text-blue-400',
  xp:       'bg-amber-500/10 border-amber-500/20 text-amber-400',
  cyan:     'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  purple:   'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  pulse = false,
}) => (
  <span className={[
    'inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border leading-none',
    variantStyles[variant],
    pulse ? 'animate-pulse' : '',
    className,
  ].join(' ')}>
    {children}
  </span>
);

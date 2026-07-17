import React from 'react';

type ServiceState = 'running' | 'stopped' | 'failed' | 'pending';

interface StatusDotProps {
  status: ServiceState;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
}

const statusColor: Record<ServiceState, string> = {
  running: 'bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
  stopped: 'bg-slate-500',
  failed:  'bg-rose-500 shadow-[0_0_6px_rgba(251,113,133,0.6)]',
  pending: 'bg-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.6)]',
};

const statusText: Record<ServiceState, string> = {
  running: 'text-emerald-400',
  stopped: 'text-slate-400',
  failed:  'text-rose-400',
  pending: 'text-amber-400',
};

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  pulse,
  label,
}) => {
  const shouldPulse = pulse ?? status === 'running';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={[
        'rounded-full flex-shrink-0',
        sizeClass[size],
        statusColor[status],
        shouldPulse ? 'animate-pulse' : '',
      ].join(' ')} />
      {label && (
        <span className={`text-xs font-mono font-medium capitalize ${statusText[status]}`}>
          {label}
        </span>
      )}
    </span>
  );
};

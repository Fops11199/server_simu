import React from 'react';

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
  primary: 'bg-cyan-500/15 border border-[var(--color-accent-cyan-border)] text-[var(--color-accent-cyan)] hover:bg-cyan-500/25 hover:shadow-[var(--shadow-glow-cyan)]',
  danger:  'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:shadow-[var(--shadow-glow-rose)]',
  ghost:   'bg-transparent border border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
  outline: 'bg-transparent border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-cyan-border)] hover:text-[var(--color-accent-cyan)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] cursor-pointer',
        'transition-all duration-[var(--transition-fast)] select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

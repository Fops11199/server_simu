import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  hover = false,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={[
      'rounded-[var(--radius-lg)] border border-[var(--color-border)]',
      'bg-[var(--color-bg-surface)] shadow-[var(--shadow-sm)]',
      glass ? 'backdrop-blur-sm bg-[var(--color-bg-surface)]/80' : '',
      hover ? 'cursor-pointer transition-all duration-[var(--transition-base)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] hover:shadow-[var(--shadow-md)]' : '',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-[var(--color-border)] ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

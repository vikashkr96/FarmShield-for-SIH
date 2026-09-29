import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide select-none';

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const variantStyles = {
    success: 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    error: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    info: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-[#0E4D2B] text-white border-[#0E4D2B]',
  };

  const pulseColor = {
    success: 'bg-[#16A34A]',
    warning: 'bg-[#D97706]',
    error: 'bg-[#DC2626]',
    info: 'bg-[#2563EB]',
    neutral: 'bg-slate-500',
    emerald: 'bg-[#10B981]',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColor[variant]}`}></span>
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

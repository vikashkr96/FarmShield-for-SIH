import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
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
  const baseStyles = 'inline-flex items-center gap-1.5 font-black rounded-full border-2 shadow-sm transition-colors tracking-wide';

  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base',
  };

  const variantStyles = {
    success: 'bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]',
    warning: 'bg-[#FFF8E1] text-[#B78103] border-[#FFC107]',
    error: 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]',
    info: 'bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]',
    neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const pulseColor = {
    success: 'bg-[#1B5E20]',
    warning: 'bg-[#FFC107]',
    error: 'bg-[#D32F2F]',
    info: 'bg-[#1B5E20]',
    neutral: 'bg-gray-500',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {pulse && (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseColor[variant]}`}></span>
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

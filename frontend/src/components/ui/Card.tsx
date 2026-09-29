import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-200 bg-white text-[#0F172A] shadow-sm';

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]',
    glass: 'bg-white/95 backdrop-blur-sm border border-slate-200 shadow-[0_4px_20px_rgba(14,77,43,0.06)]',
    bordered: 'bg-white border-2 border-[#0E4D2B]/30 shadow-sm',
    elevated: 'bg-white border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.08)]',
  };

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-0.5 hover:border-[#10B981] hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)]'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

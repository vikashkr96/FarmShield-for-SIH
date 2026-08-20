import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-3xl p-6 transition-all duration-300 bg-white text-gray-900 shadow-xl shadow-green-900/5';

  const variantStyles = {
    default: 'bg-white border-2 border-[#E8F5E9]',
    glass: 'bg-white border-2 border-[#1B5E20]/20 shadow-xl shadow-[#1B5E20]/5',
    bordered: 'bg-white border-2 border-[#1B5E20]',
  };

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-1 hover:border-[#1B5E20] hover:shadow-2xl hover:shadow-[#1B5E20]/10'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

'use client';

import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2.5',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colorMap = {
    primary: 'border-gray-200 border-t-[#1B5E20]',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div
        role="status"
        aria-label={label || 'Loading'}
        className={`animate-spin rounded-full ${sizeMap[size]} ${colorMap[color]}`}
      />
      {label && <span className="text-sm font-medium text-gray-600">{label}</span>}
    </div>
  );
};

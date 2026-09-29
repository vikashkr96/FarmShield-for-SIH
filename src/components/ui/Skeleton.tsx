'use client';

import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) => {
  const variantStyles = {
    text: 'rounded h-4 w-full',
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-gray-200/80 ${variantStyles[variant]} ${className}`}
    />
  );
};

export const CardSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? '75%' : '100%'} height={14} />
        ))}
      </div>
    </div>
  );
};

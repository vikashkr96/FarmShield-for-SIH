'use client';

import React from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const getInitials = (n: string) => {
    if (!n) return 'FS';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusSizeStyles = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  const statusColorStyles = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeStyles[size]} rounded-2xl object-cover border border-gray-200 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-2xl bg-[#E8F5E9] text-[#1B5E20] font-black border border-[#A5D6A7] flex items-center justify-center shadow-inner select-none`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white ${statusSizeStyles[size]} ${statusColorStyles[status]}`}
        />
      )}
    </div>
  );
};

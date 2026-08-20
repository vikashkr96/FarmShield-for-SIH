import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black transition-all duration-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-center active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[40px]',
    md: 'px-4.5 py-3 text-sm gap-2 min-h-[48px]',
    lg: 'px-6 py-4 text-base gap-3 min-h-[56px]',
    xl: 'px-8 py-5 text-lg gap-4 min-h-[64px] w-full',
  };

  const variantStyles = {
    primary: 'bg-[#1B5E20] hover:bg-[#2E7D32] text-white border-2 border-[#1B5E20] shadow-[#1B5E20]/20',
    secondary: 'bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] border-2 border-[#A5D6A7]',
    outline: 'bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border-2 border-[#1B5E20]',
    ghost: 'bg-transparent hover:bg-[#E8F5E9] text-[#1B5E20]',
    danger: 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#D32F2F]',
    success: 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-current shrink-0" />
      ) : (
        leftIcon
      )}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

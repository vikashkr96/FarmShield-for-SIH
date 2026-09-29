import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
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
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-[#10B981]/30 disabled:opacity-50 disabled:cursor-not-allowed text-center active:scale-[0.98] cursor-pointer select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[50px]',
    xl: 'px-7 py-4 text-lg gap-3 min-h-[58px] w-full',
  };

  const variantStyles = {
    primary: 'bg-[#0E4D2B] hover:bg-[#166534] text-white shadow-sm border border-[#0E4D2B]',
    accent: 'bg-gradient-to-r from-[#10B981] to-[#047857] hover:from-[#059669] hover:to-[#047857] text-white shadow-md shadow-[#10B981]/20 border border-[#10B981]',
    secondary: 'bg-[#E8F5E9] hover:bg-[#DCFCE7] text-[#0E4D2B] border border-[#DCFCE7] font-semibold',
    outline: 'bg-white hover:bg-[#F8FAFC] text-[#0E4D2B] border border-slate-300 hover:border-[#10B981]',
    ghost: 'bg-transparent hover:bg-slate-100 text-[#475569] hover:text-[#0E4D2B]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm border border-[#DC2626]',
    success: 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm border border-[#16A34A]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon
      )}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

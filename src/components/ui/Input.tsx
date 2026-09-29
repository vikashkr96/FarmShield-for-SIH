'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, prefixText, type = 'text', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const effectiveType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-black text-gray-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          {prefixText && (
            <div className="absolute left-3.5 text-gray-500 font-bold text-xs pointer-events-none select-none">
              {prefixText}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-xs font-bold text-gray-900 transition-all duration-200 outline-none placeholder:text-gray-400 placeholder:font-medium disabled:opacity-50 disabled:bg-gray-50 shadow-sm ${
              leftIcon ? 'pl-10' : prefixText ? 'pl-12' : ''
            } ${isPasswordType || rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20'
                : 'border-gray-200 hover:border-gray-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/20'
            } ${className}`}
            {...props}
          />

          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 text-gray-400 pointer-events-none flex items-center">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-red-600">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, leftIcon, children, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-black text-gray-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-2xl border bg-white px-4 py-3 text-xs font-bold text-gray-900 transition-all duration-200 outline-none pr-10 shadow-sm disabled:opacity-50 disabled:bg-gray-50 cursor-pointer ${
              leftIcon ? 'pl-10' : ''
            } ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20'
                : 'border-gray-200 hover:border-gray-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/20'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 text-gray-400 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';

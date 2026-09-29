'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, checked, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1 font-sans">
        <label htmlFor={inputId} className="flex items-start space-x-3 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${
              checked
                ? 'bg-[#1B5E20] border-[#1B5E20] text-white shadow-sm'
                : 'border-gray-300 bg-white group-hover:border-gray-400 peer-focus:ring-2 peer-focus:ring-[#1B5E20]/30'
            } ${error ? 'border-red-500' : ''} ${className}`}>
              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {(label || description) && (
            <div className="space-y-0.5">
              {label && (
                <span className="block text-xs font-bold text-gray-800 group-hover:text-gray-900 leading-tight">
                  {label}
                </span>
              )}
              {description && (
                <span className="block text-[11px] text-gray-500 leading-normal font-medium">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>

        {error && <p className="text-[11px] font-bold text-red-600 pl-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

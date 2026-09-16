'use client';

import React from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  error,
  className = '',
}) => {
  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {label && <label className="block text-xs font-black text-gray-700">{label}</label>}

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const inputId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`flex items-start space-x-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-[#1B5E20] bg-[#E8F5E9]/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => onChange?.(option.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected ? 'border-[#1B5E20]' : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#1B5E20]" />}
                </div>
              </div>

              <div className="space-y-0.5">
                <span
                  className={`block text-xs font-bold leading-tight ${
                    isSelected ? 'text-[#1B5E20]' : 'text-gray-800'
                  }`}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-[11px] text-gray-500 leading-normal font-medium">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
    </div>
  );
};

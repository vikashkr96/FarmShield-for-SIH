'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 gap-1.5',
    md: 'text-sm py-2 px-4 gap-2',
    lg: 'text-base py-2.5 px-5 gap-2.5',
  };

  return (
    <div
      className={`flex items-center overflow-x-auto scrollbar-none border-b border-gray-200 ${
        variant === 'pills' ? 'border-b-0 gap-1.5 p-1 bg-gray-100 rounded-xl' : ''
      } ${variant === 'enclosed' ? 'border-b border-gray-200 gap-1' : ''} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        let variantClasses = '';
        if (variant === 'underline') {
          variantClasses = isActive
            ? 'border-b-2 border-[#1B5E20] text-[#1B5E20] font-semibold'
            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium';
        } else if (variant === 'pills') {
          variantClasses = isActive
            ? 'bg-white text-gray-900 shadow-sm font-semibold rounded-lg'
            : 'text-gray-600 hover:text-gray-900 font-medium rounded-lg';
        } else if (variant === 'enclosed') {
          variantClasses = isActive
            ? 'border border-gray-200 border-b-transparent bg-white text-[#1B5E20] font-semibold rounded-t-lg -mb-px'
            : 'text-gray-500 hover:text-gray-900 font-medium';
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`flex items-center justify-center transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] ${
              fullWidth ? 'flex-1' : ''
            } ${sizeStyles[size]} ${variantClasses} ${
              tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

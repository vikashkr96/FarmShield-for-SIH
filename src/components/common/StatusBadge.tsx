import React from 'react';
import { WithdrawalStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StatusBadgeProps {
  status: WithdrawalStatus;
  daysRemaining?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  daysRemaining,
  showIcon = true,
  size = 'md'
}) => {
  const { t } = useApp();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3.5 py-1.5 gap-2'
  }[size];

  switch (status) {
    case 'CLEARED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm ${sizeClasses}`}>
          {showIcon && <CheckCircle2 className={size === 'lg' ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />}
          <span>{t.statusCleared}</span>
        </span>
      );
    case 'REVIEW_REQUIRED':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-sm ${sizeClasses}`}>
          {showIcon && <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />}
          <span>{t.statusReviewRequired}</span>
          {daysRemaining !== undefined && daysRemaining > 0 && (
            <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {daysRemaining}d
            </span>
          )}
        </span>
      );
    case 'WITHDRAWAL_ACTIVE':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-sm animate-pulse ${sizeClasses}`}>
          {showIcon && <AlertOctagon className={size === 'lg' ? 'w-4 h-4 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />}
          <span>{t.statusWithdrawalActive}</span>
          {daysRemaining !== undefined && daysRemaining > 0 && (
            <span className="bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {daysRemaining}d left
            </span>
          )}
        </span>
      );
  }
};

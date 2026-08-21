import React from 'react';
import { MLRiskLevel } from '../../types';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RiskBadgeProps {
  riskLevel: MLRiskLevel;
  confidenceScore?: number;
  labelPrefix?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskLevel,
  confidenceScore,
  labelPrefix,
  size = 'md'
}) => {
  const { t } = useApp();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2'
  }[size];

  switch (riskLevel) {
    case 'LOW':
      return (
        <span className={`inline-flex items-center rounded-md bg-teal-50 text-teal-800 border border-teal-200 ${sizeClasses}`}>
          <ShieldCheck className={size === 'lg' ? 'w-4 h-4 text-teal-600' : 'w-3.5 h-3.5 text-teal-600'} />
          <span>{labelPrefix ? `${labelPrefix}: ` : ''}{t.mlRiskLow}</span>
          {confidenceScore !== undefined && (
            <span className="text-teal-600 font-mono text-[10px]">({Math.round(confidenceScore * 100)}%)</span>
          )}
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-50 text-amber-900 border border-amber-300 ${sizeClasses}`}>
          <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>{labelPrefix ? `${labelPrefix}: ` : ''}{t.mlRiskMedium}</span>
          {confidenceScore !== undefined && (
            <span className="text-amber-700 font-mono text-[10px]">({Math.round(confidenceScore * 100)}%)</span>
          )}
        </span>
      );
    case 'HIGH':
    default:
      return (
        <span className={`inline-flex items-center rounded-md bg-rose-50 text-rose-900 border border-rose-300 ${sizeClasses}`}>
          <ShieldAlert className={size === 'lg' ? 'w-4 h-4 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />
          <span>{labelPrefix ? `${labelPrefix}: ` : ''}{t.mlRiskHigh}</span>
          {confidenceScore !== undefined && (
            <span className="text-rose-700 font-mono text-[10px]">({Math.round(confidenceScore * 100)}%)</span>
          )}
        </span>
      );
  }
};

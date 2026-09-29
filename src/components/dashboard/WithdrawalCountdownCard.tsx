'use client';

import React, { useState, useEffect } from 'react';
import { Lock, AlertOctagon, Milk, Beef, Fish, Egg } from 'lucide-react';
import { TargetProduct } from '../../types/database';

export interface ActiveWithdrawalItem {
  id: string;
  animal_code: string;
  product: TargetProduct;
  medicine_name: string;
  end_date: string;
}

interface WithdrawalCountdownCardProps {
  withdrawals: ActiveWithdrawalItem[];
  onSelectAnimal?: (animalCode: string) => void;
}

export const WithdrawalCountdownCard: React.FC<WithdrawalCountdownCardProps> = ({
  withdrawals,
  onSelectAnimal,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    progress: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

  const activeItem = withdrawals[0];

  useEffect(() => {
    if (!activeItem) return;

    const calculate = () => {
      const target = new Date(activeItem.end_date).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 1 });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / (24 * 3600));
      const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      // Assume 7-day default total period for relative progress bar
      const estimatedTotalSec = 7 * 24 * 3600;
      const progress = Math.min(1, Math.max(0, 1 - totalSec / estimatedTotalSec));

      setTimeLeft({ days, hours, minutes, seconds, progress });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [activeItem]);

  if (!activeItem) return null;

  const getProductIcon = (product: TargetProduct) => {
    switch (product) {
      case 'milk':
        return <Milk className="w-4 h-4 text-amber-400" />;
      case 'meat':
        return <Beef className="w-4 h-4 text-red-400" />;
      case 'fish':
        return <Fish className="w-4 h-4 text-blue-400" />;
      case 'eggs':
        return <Egg className="w-4 h-4 text-amber-300" />;
      default:
        return <AlertOctagon className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0A0E] via-[#2E1015] to-[#3F141B] border-2 border-red-500/40 p-6 text-white shadow-2xl">
      {/* Background glow circle */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left: Product & Animal Tag warning */}
        <div className="flex items-start gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-inner">
              <Lock className="w-7 h-7 animate-pulse text-red-400" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 animate-ping" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-500/20 text-red-300 border border-red-500/50 uppercase tracking-wider">
                {getProductIcon(activeItem.product)}
                WITHHOLD {activeItem.product}
              </span>
              <button
                onClick={() => onSelectAnimal?.(activeItem.animal_code)}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-md transition cursor-pointer"
              >
                Tag: {activeItem.animal_code}
              </button>
            </div>

            <h3 className="text-base font-black tracking-tight text-white">
              Do not sell or consume {activeItem.product} from this animal
            </h3>
            <p className="text-xs text-red-200/80 font-medium">
              Active antimicrobial regimen: <span className="font-bold text-white">{activeItem.medicine_name}</span>. Chemical residue clearance in progress under FSSAI MRL standards.
            </p>
          </div>
        </div>

        {/* Right: Live Ticking Digital Countdown Pods */}
        <div className="bg-black/50 border border-red-500/30 rounded-2xl p-3 flex items-center justify-center gap-2 md:gap-3 shrink-0 shadow-inner">
          <div className="flex flex-col items-center">
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 font-mono text-xl font-black text-white min-w-[48px] text-center">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Days</span>
          </div>

          <span className="font-mono text-xl font-bold text-red-400 pb-4">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 font-mono text-xl font-black text-white min-w-[48px] text-center">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Hours</span>
          </div>

          <span className="font-mono text-xl font-bold text-red-400 pb-4">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 font-mono text-xl font-black text-white min-w-[48px] text-center">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Mins</span>
          </div>

          <span className="font-mono text-xl font-bold text-red-400 pb-4">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-red-500/20 border border-red-500/60 rounded-xl px-3 py-1.5 font-mono text-xl font-black text-red-400 min-w-[48px] text-center animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className="text-[9px] font-bold text-red-400 uppercase mt-1">Secs</span>
          </div>
        </div>
      </div>

      {/* Clearance Progress Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-4 text-xs">
        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(timeLeft.progress * 100)}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-gray-300 shrink-0">
          {Math.round(timeLeft.progress * 100)}% Clearance Elapsed
        </span>
      </div>
    </div>
  );
};

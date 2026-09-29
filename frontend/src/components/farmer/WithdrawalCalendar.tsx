'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Milk,
  Utensils,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface WithdrawalCalendarProps {
  onBack: () => void;
}

interface WithdrawalItem {
  id: string;
  animal_code: string;
  species: string;
  medicine_name: string;
  product: 'milk' | 'meat' | 'all';
  start_date: string;
  end_date: string;
  remaining_hours: number;
  status: 'active' | 'cleared';
  indication: string;
}

export const WithdrawalCalendar: React.FC<WithdrawalCalendarProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'active' | 'cleared'>('all');
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([
    {
      id: 'w1',
      animal_code: 'COW-102',
      species: 'Cow',
      medicine_name: 'Amoxicillin Trihydrate 15%',
      product: 'milk',
      start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      remaining_hours: 26,
      status: 'active',
      indication: 'Clinical Mastitis',
    },
    {
      id: 'w2',
      animal_code: 'BUF-201',
      species: 'Buffalo',
      medicine_name: 'Oxytetracycline LA 200',
      product: 'milk',
      start_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      remaining_hours: 48,
      status: 'active',
      indication: 'Respiratory Distress',
    },
    {
      id: 'w3',
      animal_code: 'COW-101',
      species: 'Cow',
      medicine_name: 'Ceftiofur Sodium Sterile',
      product: 'milk',
      start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      remaining_hours: 0,
      status: 'cleared',
      indication: 'Metritis Prevention',
    },
  ]);

  useEffect(() => {
    fetch('http://localhost:5000/api/withdrawals')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item: any) => {
            const endDate = new Date(item.end_date || item.safe_date || Date.now());
            const diffHours = Math.max(0, Math.round((endDate.getTime() - Date.now()) / (1000 * 60 * 60)));
            return {
              id: item.id || `w_${Math.random()}`,
              animal_code: item.animals?.animal_code || item.animal_code || 'COW-TAG',
              species: item.animals?.species || item.species || 'Cow',
              medicine_name: item.medicines?.name || item.medicine_name || 'Veterinary Antimicrobial',
              product: item.product || 'milk',
              start_date: item.start_date || new Date().toISOString(),
              end_date: endDate.toISOString(),
              remaining_hours: diffHours,
              status: diffHours > 0 ? 'active' : 'cleared',
              indication: item.treatments?.indication || 'Clinical Treatment',
            };
          });
          setWithdrawals(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = withdrawals.filter((w) => {
    if (filter === 'active') return w.status === 'active';
    if (filter === 'cleared') return w.status === 'cleared';
    return true;
  });

  const activeCount = withdrawals.filter((w) => w.status === 'active').length;
  const clearedCount = withdrawals.filter((w) => w.status === 'cleared').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#072716] via-[#0E4D2B] to-[#166534] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">
                {language === 'en' ? 'AMU & MRL Withdrawal Calendar' : 'निकासी समय एवं अवशेष मुक्ति कैलेंडर'}
              </h1>
              <p className="text-xs text-[#DCFCE7] font-semibold">
                {language === 'en'
                  ? 'Active milk withholding countdowns & statutory food safety compliance'
                  : 'दूध एवं मांस आपूर्ति के लिए सुरक्षित तारीख व अवशेष मुक्ति समय'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-[#DCFCE7] block">Under Hold</span>
              <span className="text-xl font-black text-white">{activeCount}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-[#DCFCE7] block">Cleared Safe</span>
              <span className="text-xl font-black text-white">{clearedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#0E4D2B] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Records ({withdrawals.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'active' ? 'bg-[#0E4D2B] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Hold ({activeCount})
          </button>
          <button
            onClick={() => setFilter('cleared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'cleared' ? 'bg-[#0E4D2B] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cleared Safe ({clearedCount})
          </button>
        </div>
      </div>

      {/* Withdrawals List Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 font-semibold text-xs">
            No withdrawal records match the current filter.
          </Card>
        ) : (
          filtered.map((item) => {
            const isHold = item.status === 'active';
            const daysLeft = Math.ceil(item.remaining_hours / 24);

            return (
              <Card
                key={item.id}
                className={`p-5 border transition-all ${
                  isHold
                    ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                    : 'border-slate-200 bg-white hover:border-[#10B981]'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[#0E4D2B] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {item.animal_code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">({item.species})</span>
                      <Badge variant={isHold ? 'warning' : 'success'} pulse={isHold}>
                        {isHold ? `Active Hold (${daysLeft}d / ${item.remaining_hours}h left)` : 'Cleared - Safe for Tank'}
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-slate-700">
                      <strong className="text-slate-900 font-bold">Drug:</strong> {item.medicine_name} •{' '}
                      <strong className="text-slate-900 font-bold">Indication:</strong> {item.indication}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Administered: {new Date(item.start_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Safe Date: {new Date(item.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Warning / Clearance Indicator */}
                  <div className="text-right shrink-0">
                    {isHold ? (
                      <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>DO NOT SUPPLY MILK TO BULK TANK</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Residue-Free • Approved for Sale</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

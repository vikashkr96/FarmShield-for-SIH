'use client';

import React from 'react';
import { X, ShieldCheck, AlertTriangle, TrendingDown, PieChart, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface AmuAnalyticsModalProps {
  onClose: () => void;
}

interface ClassBreakdown {
  name: string;
  whoCategory: 'HPCIA' | 'CIA' | 'HIA';
  volumeDoses: number;
  percentage: number;
  status: 'safe' | 'caution' | 'warning';
  trend: string;
}

const AMU_DATA: ClassBreakdown[] = [
  {
    name: 'Beta-lactams (Penicillins & Cephalosporins)',
    whoCategory: 'HPCIA',
    volumeDoses: 18,
    percentage: 42,
    status: 'caution',
    trend: '-8% vs last month',
  },
  {
    name: 'Tetracyclines (Oxytetracycline)',
    whoCategory: 'HIA',
    volumeDoses: 12,
    percentage: 28,
    status: 'safe',
    trend: '-14% vs last month',
  },
  {
    name: 'Fluoroquinolones (Enrofloxacin)',
    whoCategory: 'HPCIA',
    volumeDoses: 6,
    percentage: 14,
    status: 'warning',
    trend: 'Statutory reduction target: < 10%',
  },
  {
    name: 'Sulfonamides & Trimethoprim',
    whoCategory: 'HIA',
    volumeDoses: 5,
    percentage: 11,
    status: 'safe',
    trend: 'Optimal first-line choice',
  },
  {
    name: 'Aminoglycosides (Gentamicin)',
    whoCategory: 'CIA',
    volumeDoses: 2,
    percentage: 5,
    status: 'safe',
    trend: 'Low usage',
  },
];

export const AmuAnalyticsModal: React.FC<AmuAnalyticsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Antimicrobial Stewardship Analytics</h2>
              <p className="text-xs text-emerald-200">
                Monthly AMU Consumption by WHO Classification • Defined Daily Doses (DDDvet)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Stewardship KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total AMU Doses</span>
              <span className="text-2xl font-black text-emerald-900">43</span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">↓ 12% vs last cycle</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">HPCIA Usage Ratio</span>
              <span className="text-2xl font-black text-amber-900">56%</span>
              <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">Target: &lt; 40%</span>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Stewardship Grade</span>
              <span className="text-2xl font-black text-blue-900">A-</span>
              <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">WHO Aligned</span>
            </div>
          </div>

          {/* Class Breakdown List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Drug Class Breakdown &amp; Resistance Risk
              </h3>
              <span className="text-xs text-gray-500 font-medium">43 Doses Total</span>
            </div>

            <div className="space-y-3">
              {AMU_DATA.map((item) => (
                <div key={item.name} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{item.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.whoCategory === 'HPCIA'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : item.whoCategory === 'CIA'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.whoCategory}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono text-gray-800">
                      {item.volumeDoses} doses ({item.percentage}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${
                        item.whoCategory === 'HPCIA'
                          ? 'bg-red-500'
                          : item.whoCategory === 'CIA'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>{item.trend}</span>
                    {item.whoCategory === 'HPCIA' && (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Highest Priority Critically Important
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <strong className="block font-bold mb-1">AMR Reduction Recommendation:</strong>
              Substitute 3rd-generation cephalosporins with first-line narrow-spectrum penicillins for standard mastitis episodes. Maintain pre-dipping teat sanitization to reduce clinical incidence by an estimated 35%.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">DAHD / WOAH Veterinary Public Health Standards</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.location.href = '/reports';
              }}
            >
              Export Full AMU Audit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

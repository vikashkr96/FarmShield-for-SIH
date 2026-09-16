'use client';

import React from 'react';
import { X, Pill, AlertTriangle, ShieldAlert, CheckCircle, Clock, Info } from 'lucide-react';
import { Medicine } from '../../types/database';
import { Button } from '../ui/Button';

interface MedicineDetailModalProps {
  medicine: Medicine;
  onClose: () => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  onClose,
}) => {
  const isHpcia = medicine.antimicrobial_class.includes('3rd') ||
    medicine.antimicrobial_class.includes('Fluoroquinolone') ||
    medicine.antimicrobial_class.includes('Macrolide') ||
    medicine.name.toLowerCase().includes('ceftiofur') ||
    medicine.name.toLowerCase().includes('enrofloxacin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{medicine.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isHpcia
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isHpcia ? 'WHO HPCIA' : 'WHO CIA'}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-0.5">
                Active: {medicine.active_ingredient} • {medicine.strength || 'Standard Veterinary Grade'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Statutory Warning Banner if HPCIA */}
          {isHpcia && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-900">
                <strong className="block font-bold mb-0.5">Highest Priority Critically Important Antimicrobial (HPCIA)</strong>
                Restricted under National Action Plan on AMR. Reserved for culture-confirmed infections when lower-tier alternatives have proven ineffective. Do not use for prophylaxis or growth promotion.
              </div>
            </div>
          )}

          {/* Pharmacopeia Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Antimicrobial Class</span>
              <span className="font-bold text-gray-900">{medicine.antimicrobial_class}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Approved Species</span>
              <span className="font-bold text-gray-900">Bovine, Caprine, Swine, Aqua</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Administration Routes</span>
              <span className="font-bold text-gray-900">IM, SC, Intramammary</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Standard Therapeutic Dosage</span>
              <span className="font-bold text-gray-900">5 – 10 mg/kg liveweight OD</span>
            </div>
          </div>

          {/* Statutory Withdrawal & MRL Standards */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Statutory Withdrawal Embargoes &amp; FSSAI MRLs
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">🥛 Dairy Milk Withdrawal</span>
                  <span className="text-[11px] text-amber-800">Standard Clearance: <strong>72 to 96 hours (3–4 days)</strong></span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-gray-500 uppercase block">FSSAI MRL</span>
                  <span className="font-bold text-gray-900">≤ 100 μg/kg (ppb)</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">🥩 Muscle / Meat Slaughter Withdrawal</span>
                  <span className="text-[11px] text-amber-800">Standard Clearance: <strong>14 to 28 days</strong></span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-gray-500 uppercase block">FSSAI MRL</span>
                  <span className="font-bold text-gray-900">≤ 200 μg/kg (ppb)</span>
                </div>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-sky-950 block">🐟 Aquaculture / Inland Fisheries</span>
                  <span className="text-[11px] text-sky-800">Pond Water Clearance: <strong>21 days</strong></span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-gray-500 uppercase block">MPEDA Limit</span>
                  <span className="font-bold text-gray-900">≤ 50 μg/kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Off-Label Regulation Note */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Cascade Rule:</strong> If administered off-label (higher dosage, different species or route), statutory regulations mandate extending the withdrawal embargo period by a minimum multiplier of +50%.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-400">National Veterinary Pharmacopeia V2.4</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.location.href = `/treatments/new?medicineId=${medicine.id}`;
              }}
            >
              Prescribe Drug
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

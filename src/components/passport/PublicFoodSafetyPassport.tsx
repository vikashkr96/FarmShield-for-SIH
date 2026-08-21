import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckCircle2, AlertOctagon, Calendar, MapPin, QrCode, Lock, Building } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface PublicFoodSafetyPassportProps {
  animalTagId?: string;
  onClose?: () => void;
}

export const PublicFoodSafetyPassport: React.FC<PublicFoodSafetyPassportProps> = ({ animalTagId, onClose }) => {
  const { animals, t } = useApp();

  const animal = animals.find(a => a.tagId === animalTagId) || animals[0];
  const isCleared = animal?.currentStatus === 'CLEARED';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-6">
      
      {/* Header */}
      <div className="max-w-xl mx-auto w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Tricolor Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">National Food Safety Passport</h2>
              <p className="text-[11px] text-teal-200 font-mono">Government of India • DAHD Livestock Traceability</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
            Public Registry View
          </span>
        </div>

        {/* Passport Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Status Verification Stamp */}
          <div className={`p-5 rounded-2xl border-2 text-center space-y-2 ${
            isCleared 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm' 
              : 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm'
          }`}>
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              isCleared ? 'bg-emerald-600 text-white shadow-md' : 'bg-rose-600 text-white shadow-md animate-pulse'
            }`}>
              {isCleared ? <CheckCircle2 className="w-9 h-9" /> : <AlertOctagon className="w-9 h-9" />}
            </div>

            <h3 className="text-lg font-black tracking-tight">
              {isCleared ? 'CLEARED FOR FOOD CHAIN HARVEST' : 'ACTIVE ANTIMICROBIAL WITHHOLDING'}
            </h3>

            <p className="text-xs max-w-md mx-auto leading-relaxed">
              {isCleared
                ? 'This animal has successfully completed all statutory withdrawal periods. Animal products (milk/meat/eggs) are compliant with FSSAI MRL standards and safe for consumption.'
                : `Animal is currently within statutory antimicrobial withholding period until ${animal.earliestClearanceDate}. Products must NOT enter commercial food distribution.`
              }
            </p>
          </div>

          {/* Public Verification Metadata (Zero private clinical or financial data) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Official Ear-Tag ID:</span>
              <span className="font-mono font-extrabold text-slate-900">{animal.tagId}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Species & Breed:</span>
              <span className="font-bold text-slate-800">{animal.species} • {animal.breed}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Production Purpose:</span>
              <span className="font-bold text-slate-800">{animal.purpose}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Origin District:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Karnal, Haryana Province
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Ledger Sync Timestamp:</span>
              <span className="font-mono text-slate-600 text-[11px]">
                {new Date().toISOString().replace('T', ' ').substring(0, 16)} IST
              </span>
            </div>
          </div>

          {/* Privacy Protocol Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950">
            <Lock className="w-4 h-4 text-sky-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Data Privacy Guarantee:</strong> In accordance with national livestock data governance norms, sensitive farmer records and individual medicine dosages are concealed on this public passport. Full clinical history is accessible only by authorized registered veterinarians and government inspectors.
            </p>
          </div>

        </div>

        {/* Footer in Passport */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          AgriTrace National Livestock Verification Network • Digital India
        </div>

      </div>

    </div>
  );
};

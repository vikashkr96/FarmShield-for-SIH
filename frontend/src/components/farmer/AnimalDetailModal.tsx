'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldCheck,
  Calendar,
  Weight,
  Clock,
  Pill,
  Activity,
  FileText,
  AlertTriangle,
  QrCode,
  Syringe,
  CheckCircle2,
} from 'lucide-react';
import { AnimalItem } from './AnimalList';
import { getBreedImage } from '../../lib/breed_assets';

interface AnimalDetailModalProps {
  animal: AnimalItem;
  onClose: () => void;
  onLogTreatment?: () => void;
  onViewPassport?: () => void;
  onReportIssue?: () => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  onClose,
  onLogTreatment,
  onViewPassport,
  onReportIssue,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'medical' | 'withdrawals' | 'vaccines'
  >('overview');

  const breedPhoto = getBreedImage(animal.breed, animal.species);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-[#1B5E20]/30 shadow-2xl overflow-hidden my-8 space-y-0">
        {/* Top Image Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900">
          <img
            src={breedPhoto}
            alt={animal.breed || animal.animal_code}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animal Title Card in Banner */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur border border-white/30">
                {animal.species} • {animal.purpose}
              </span>
              <h2 className="text-2xl font-black text-white">{animal.animal_code}</h2>
              <p className="text-xs text-gray-200 font-bold">{animal.breed || 'Standard Breed'}</p>
            </div>

            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                animal.health_status === 'healthy'
                  ? 'bg-emerald-500 text-white'
                  : animal.health_status === 'under_treatment'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {animal.health_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 text-xs font-black">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'medical'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Withdrawal Clocks
          </button>
          <button
            onClick={() => setActiveTab('vaccines')}
            className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'vaccines'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Immunizations
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <Weight className="w-4 h-4 text-[#1B5E20] mx-auto mb-1" />
                  <div className="text-base font-black text-gray-900">{animal.weight} kg</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Weight</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <Calendar className="w-4 h-4 text-[#1B5E20] mx-auto mb-1" />
                  <div className="text-sm font-black text-gray-900 truncate">{animal.dob || '2022-03-15'}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Date of Birth</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <Activity className="w-4 h-4 text-[#1B5E20] mx-auto mb-1" />
                  <div className="text-sm font-black text-gray-900 capitalize">{animal.sex}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Sex</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <QrCode className="w-4 h-4 text-[#1B5E20] mx-auto mb-1" />
                  <div className="text-xs font-black text-gray-900 truncate">{animal.qr_token}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">QR Token</div>
                </div>
              </div>

              {/* Fishery Pond details if applicable */}
              {animal.species === 'fishery' && animal.fishery_details && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                  <h4 className="text-xs font-black text-blue-900 uppercase">
                    Inland Aquaculture Pond Profile
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs text-blue-950 font-bold">
                    <div>Pond ID: {animal.fishery_details.pond_id}</div>
                    <div>Water: {animal.fishery_details.water_type}</div>
                    <div>Biomass: {animal.fishery_details.biomass_kg} kg</div>
                  </div>
                </div>
              )}

              {/* MRL Food Safety Seal */}
              <div className="p-4 bg-[#FFFDF5] border border-gray-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-gray-900">Food Safety Verification Seal</h4>
                  <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                    {animal.health_status === 'under_treatment'
                      ? '⚠️ Chemical withdrawal period currently active. Milk/Meat withholding in effect.'
                      : '✓ Certified cleared for human consumption under FSSAI MRL standards.'}
                  </p>
                </div>
                <button
                  onClick={onViewPassport}
                  className="px-3 py-2 bg-[#1B5E20] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#2E7D32] transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Passport</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900">Amoxicillin Trihydrate 15%</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                    Completed Regimen
                  </span>
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Indication: Subclinical Mastitis • Dose: 10 mg/kg (IM) • Prescribed by Dr. R. Sharma (BVSc)
                </div>
                <div className="text-[10px] text-gray-400 font-bold">Administered: Aug 12, 2024</div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              {animal.health_status === 'under_treatment' ? (
                <div className="p-4 rounded-2xl border-2 border-red-300 bg-red-50 text-xs text-red-900 space-y-2">
                  <div className="flex items-center justify-between font-black">
                    <span>Active Chemical Withdrawal Embargo</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-[10px]">
                      WITHHOLD MILK
                    </span>
                  </div>
                  <p className="font-medium text-red-800 text-[11px]">
                    Medicine: Oxytetracycline LA. Residues are clearing. Safe for consumer milk supply on target date.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-700">No Active Product Embargoes</p>
                  <p className="text-[11px] text-gray-500">
                    Animal has zero drug residues exceeding Maximum Residue Limits.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vaccines' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl border border-gray-200 bg-[#FAFAFA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-gray-900 block">Foot-and-Mouth Disease (FMD) Quadrivalent</span>
                  <span className="text-[11px] text-gray-500 font-medium">Batch #FMD-2024-09A • Govt. National Control Programme</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Up to Date
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-gray-200 bg-[#FAFAFA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-gray-900 block">Hemorrhagic Septicemia (HS) Alum Precipitated</span>
                  <span className="text-[11px] text-gray-500 font-medium">Next Booster Due: October 2024</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                  Due Soon
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReportIssue}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs border border-amber-300 transition cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Report Sickness</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogTreatment}
              className="px-4 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Log Treatment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

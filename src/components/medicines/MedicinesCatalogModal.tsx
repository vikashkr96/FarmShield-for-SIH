'use client';

import React, { useState } from 'react';
import {
  Pill,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  ArrowLeft,
  X,
  FileCheck,
  AlertOctagon,
} from 'lucide-react';
import { MedicineDetailModal } from './MedicineDetailModal';
import { Medicine } from '../../types/database';

export interface MedicineEntry {
  id: string;
  name: string;
  active_ingredient: string;
  antimicrobial_class: string;
  strength: string;
  who_classification: 'HPCIA' | 'CIA' | 'HIA' | 'Standard';
  withdrawal_days_milk: number;
  withdrawal_days_meat: number;
  mrl: string;
  banned_status?: boolean;
}

interface MedicinesCatalogProps {
  onBack?: () => void;
}

export const MedicinesCatalogModal: React.FC<MedicinesCatalogProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const medicines: MedicineEntry[] = [
    {
      id: 'm1',
      name: 'Amoxicillin Trihydrate 15%',
      active_ingredient: 'Amoxicillin',
      antimicrobial_class: 'Penicillins',
      strength: '150 mg/ml',
      who_classification: 'CIA',
      withdrawal_days_milk: 3,
      withdrawal_days_meat: 14,
      mrl: '4.0 ug/kg (Milk), 50 ug/kg (Meat)',
    },
    {
      id: 'm2',
      name: 'Oxytetracycline LA 20%',
      active_ingredient: 'Oxytetracycline',
      antimicrobial_class: 'Tetracyclines',
      strength: '200 mg/ml',
      who_classification: 'HIA',
      withdrawal_days_milk: 7,
      withdrawal_days_meat: 28,
      mrl: '100 ug/kg (Milk), 200 ug/kg (Meat)',
    },
    {
      id: 'm3',
      name: 'Enrofloxacin 10% Sterile',
      active_ingredient: 'Enrofloxacin',
      antimicrobial_class: 'Fluoroquinolones (HPCIA)',
      strength: '100 mg/ml',
      who_classification: 'HPCIA',
      withdrawal_days_milk: 5,
      withdrawal_days_meat: 14,
      mrl: '100 ug/kg (Fat/Muscle)',
    },
    {
      id: 'm4',
      name: 'Ceftiofur Sodium 50mg/ml',
      active_ingredient: 'Ceftiofur',
      antimicrobial_class: '3rd Gen Cephalosporins',
      strength: '50 mg/ml',
      who_classification: 'HPCIA',
      withdrawal_days_milk: 0,
      withdrawal_days_meat: 4,
      mrl: '100 ug/kg (Milk)',
    },
    {
      id: 'm5',
      name: 'Sulfadiazine + Trimethoprim',
      active_ingredient: 'Sulfadiazine',
      antimicrobial_class: 'Sulfonamides',
      strength: '2g + 400mg Bolus',
      who_classification: 'HIA',
      withdrawal_days_milk: 5,
      withdrawal_days_meat: 10,
      mrl: '100 ug/kg (Total Sulfas)',
    },
    {
      id: 'm6',
      name: 'Chloramphenicol 250mg',
      active_ingredient: 'Chloramphenicol',
      antimicrobial_class: 'Amphenicols (PROHIBITED)',
      strength: '250 mg',
      who_classification: 'HPCIA',
      withdrawal_days_milk: 999,
      withdrawal_days_meat: 999,
      mrl: 'ZERO TOLERANCE - STRICTLY PROHIBITED',
      banned_status: true,
    },
  ];

  const classes = ['All', 'Penicillins', 'Tetracyclines', 'Fluoroquinolones (HPCIA)', '3rd Gen Cephalosporins', 'Sulfonamides'];

  const filtered = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.active_ingredient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All' || m.antimicrobial_class.includes(selectedClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg">
            <Pill className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Approved Veterinary Pharmaceuticals & MRL Standards
              <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-0.5 rounded-full font-black border border-[#A5D6A7]">
                FSSAI REGULATED
              </span>
            </h1>
            <p className="text-xs text-gray-600 font-bold">
              Codex Alimentarius & WHO Classification of Critically Important Antimicrobials (CIA)
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine brand, active chemical ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 bg-white text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#1B5E20] outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer ${
                selectedClass === c
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-3xl border-2 bg-white shadow-md space-y-4 relative overflow-hidden transition-all hover:shadow-lg ${
              item.banned_status
                ? 'border-red-500/60 bg-red-50/20'
                : item.who_classification === 'HPCIA'
                ? 'border-amber-300/80'
                : 'border-gray-200'
            }`}
          >
            {item.banned_status && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                PROHIBITED SUBSTANCE
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    item.who_classification === 'HPCIA'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  WHO {item.who_classification}
                </span>
                <span className="text-xs text-gray-500 font-bold">{item.strength}</span>
              </div>
              <h3 className="text-base font-black text-gray-900">{item.name}</h3>
              <p className="text-xs text-gray-500 font-bold">Active: {item.active_ingredient}</p>
            </div>

            <div className="bg-[#FAFAFA] p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold">Milk Withdrawal:</span>
                <span className="font-black text-gray-900">
                  {item.banned_status ? 'BANNED' : `${item.withdrawal_days_milk} Days`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold">Meat Withdrawal:</span>
                <span className="font-black text-gray-900">
                  {item.banned_status ? 'BANNED' : `${item.withdrawal_days_meat} Days`}
                </span>
              </div>

              <div className="pt-1 border-t border-gray-200 text-[11px] text-gray-600 flex justify-between">
                <span className="font-bold">MRL Limit:</span>
                <span className="font-black text-[#1B5E20]">{item.mrl}</span>
              </div>
            </div>

            {item.banned_status ? (
              <p className="text-[11px] text-red-600 font-bold flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                Illegal for use in food-producing animals under Gazette of India notification.
              </p>
            ) : (
              <button
                onClick={() =>
                  setSelectedMedicine({
                    id: item.id,
                    name: item.name,
                    active_ingredient: item.active_ingredient,
                    antimicrobial_class: item.antimicrobial_class,
                    strength: item.strength,
                    status: 'active',
                  })
                }
                className="w-full py-2 px-3 bg-gray-50 hover:bg-[#1B5E20] text-gray-700 hover:text-white font-bold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer"
              >
                Inspect MRL &amp; Dosage Guidelines →
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedMedicine && (
        <MedicineDetailModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
        />
      )}
    </div>
  );
};

'use client';

import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Building2,
} from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../providers/LanguageProvider';

export type UserRoleMode = 'farmer' | 'vet' | 'admin' | 'qr_scanner';

interface NavbarProps {
  currentRole?: UserRoleMode;
  onRoleChange?: (role: UserRoleMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole = 'farmer',
  onRoleChange,
}) => {
  const { t, language } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#1B5E20]/20 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Official Ministry Affiliation */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
          onClick={() => onRoleChange?.('farmer')}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] group-hover:bg-[#2E7D32] transition-colors flex items-center justify-center shadow-lg text-white">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1B5E20]">
                FarmShield
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                SIH25007
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-700 font-bold leading-tight">
              {language === 'en'
                ? 'Ministry of Fisheries, Animal Husbandry & Dairying • Govt. of India'
                : 'मत्स्यपालन, पशुपालन और डेयरी मंत्रालय • भारत सरकार'}
            </p>
          </div>
        </div>

        {/* Center: Clean 3-Role Switcher (Farmer Portal, Veterinarian, Admin / Govt. Body) */}
        {onRoleChange && (
          <div className="flex items-center bg-[#E8F5E9] border-2 border-[#1B5E20]/30 p-1.5 rounded-2xl gap-1 text-xs font-black shadow-inner">
            {/* 1. Farmer Portal */}
            <button
              onClick={() => onRoleChange('farmer')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                currentRole === 'farmer'
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'text-[#1B5E20] hover:bg-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{language === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}</span>
            </button>

            {/* 2. Veterinarian */}
            <button
              onClick={() => onRoleChange('vet')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                currentRole === 'vet'
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'text-[#1B5E20] hover:bg-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'en' ? 'Veterinarian' : 'पशु चिकित्सक'}</span>
            </button>

            {/* 3. Admin / Govt. Body */}
            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                currentRole === 'admin'
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'text-[#1B5E20] hover:bg-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Admin / Govt. Body' : 'प्रशासक / सरकारी विभाग'}</span>
            </button>
          </div>
        )}

        {/* Right: Global 12 Languages Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

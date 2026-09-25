'use client';

import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Building2,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';

export type UserRoleMode = 'farmer' | 'vet' | 'admin' | 'qr_scanner';

interface NavbarProps {
  currentRole?: UserRoleMode;
  onRoleChange?: (role: UserRoleMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const { language } = useLanguage();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const handleRoleClick = (targetRole: UserRoleMode) => {
    if (!isAuthenticated) {
      openAuthModal('login', targetRole);
    } else {
      onRoleChange?.(targetRole);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#1B5E20]/20 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Official Ministry Affiliation */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
          onClick={() => {
            if (isAuthenticated) onRoleChange?.('farmer');
          }}
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

        {/* Center: Clean 3-Role Switcher */}
        <div className="flex items-center bg-[#E8F5E9] border-2 border-[#1B5E20]/30 p-1.5 rounded-2xl gap-1 text-xs font-black shadow-inner">
          {/* 1. Farmer Portal */}
          <button
            onClick={() => handleRoleClick('farmer')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer ${
              isAuthenticated && currentRole === 'farmer'
                ? 'bg-[#1B5E20] text-white shadow-md'
                : 'text-[#1B5E20] hover:bg-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}</span>
          </button>

          {/* 2. Veterinarian */}
          <button
            onClick={() => handleRoleClick('vet')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer ${
              isAuthenticated && currentRole === 'vet'
                ? 'bg-[#1B5E20] text-white shadow-md'
                : 'text-[#1B5E20] hover:bg-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{language === 'en' ? 'Veterinarian' : 'पशु चिकित्सक'}</span>
          </button>

          {/* 3. Admin / Govt. Body */}
          <button
            onClick={() => handleRoleClick('admin')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer ${
              isAuthenticated && currentRole === 'admin'
                ? 'bg-[#1B5E20] text-white shadow-md'
                : 'text-[#1B5E20] hover:bg-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'en' ? 'Admin / Govt. Body' : 'प्रशासक / सरकारी विभाग'}</span>
          </button>
        </div>

        {/* Right: Auth Profile / Login Button + Global 12 Languages Selector */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 p-1.5 rounded-2xl">
              <div className="hidden md:flex items-center space-x-1.5 px-2 text-xs font-bold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-white hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 transition-colors flex items-center gap-1 text-xs font-black cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign In' : 'लॉग इन'}</span>
            </button>
          )}

          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

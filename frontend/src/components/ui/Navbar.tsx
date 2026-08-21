'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../providers/LanguageProvider';
import { ShieldCheck, UserCheck, Stethoscope, Building2, LogIn, LogOut, Globe, Lock } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

export type UserRoleMode = 'farmer' | 'vet' | 'admin';

interface NavbarProps {
  currentRole?: UserRoleMode;
  onRoleChange?: (role: UserRoleMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const handleRoleClick = (targetRole: UserRoleMode) => {
    if (!isAuthenticated) {
      router.push(`/login?role=${targetRole}`);
    } else if (user?.role === targetRole) {
      onRoleChange?.(targetRole);
    }
  };

  const isRoleDisabled = (targetRole: UserRoleMode): boolean => {
    return Boolean(isAuthenticated && user && user.role !== targetRole);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#1B5E20]/20 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Official Ministry Affiliation */}
        <Link
          href="/"
          className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] group-hover:bg-[#2E7D32] transition-colors flex items-center justify-center shadow-lg text-white">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1B5E20]">
                FarmShield
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B5E20] text-white">
                SIH25007
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-700 font-bold leading-tight">
              {language === 'en'
                ? 'Ministry of Fisheries, Animal Husbandry & Dairying • Govt. of India'
                : 'मत्स्यपालन, पशुपालन और डेयरी मंत्रालय • भारत सरकार'}
            </p>
          </div>
        </Link>

        {/* Center: 3-Role Switcher (Locked & Disabled for Non-Active Roles when Logged In) */}
        <div className="flex items-center bg-[#E8F5E9] border-2 border-[#1B5E20]/30 p-1.5 rounded-2xl gap-1 text-xs font-black shadow-inner">
          {/* 1. Farmer Portal */}
          <button
            onClick={() => handleRoleClick('farmer')}
            disabled={isRoleDisabled('farmer')}
            title={
              isRoleDisabled('farmer')
                ? `Portal locked for ${user?.role} account. Please logout first.`
                : 'Farmer Portal'
            }
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all ${
              isAuthenticated && user?.role === 'farmer'
                ? 'bg-[#1B5E20] text-white shadow-md cursor-pointer'
                : isRoleDisabled('farmer')
                ? 'opacity-40 text-gray-400 cursor-not-allowed hover:bg-transparent'
                : 'text-[#1B5E20] hover:bg-white cursor-pointer'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}</span>
            {isRoleDisabled('farmer') && <Lock className="w-3 h-3 text-gray-400 ml-0.5" />}
          </button>

          {/* 2. Veterinarian */}
          <button
            onClick={() => handleRoleClick('vet')}
            disabled={isRoleDisabled('vet')}
            title={
              isRoleDisabled('vet')
                ? `Portal locked for ${user?.role} account. Please logout first.`
                : 'Veterinarian Portal'
            }
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all ${
              isAuthenticated && user?.role === 'vet'
                ? 'bg-[#1B5E20] text-white shadow-md cursor-pointer'
                : isRoleDisabled('vet')
                ? 'opacity-40 text-gray-400 cursor-not-allowed hover:bg-transparent'
                : 'text-[#1B5E20] hover:bg-white cursor-pointer'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{language === 'en' ? 'Veterinarian' : 'पशु चिकित्सक'}</span>
            {isRoleDisabled('vet') && <Lock className="w-3 h-3 text-gray-400 ml-0.5" />}
          </button>

          {/* 3. Admin / Govt. Body */}
          <button
            onClick={() => handleRoleClick('admin')}
            disabled={isRoleDisabled('admin')}
            title={
              isRoleDisabled('admin')
                ? `Portal locked for ${user?.role} account. Please logout first.`
                : 'Admin & Govt. Body Portal'
            }
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all ${
              isAuthenticated && user?.role === 'admin'
                ? 'bg-[#1B5E20] text-white shadow-md cursor-pointer'
                : isRoleDisabled('admin')
                ? 'opacity-40 text-gray-400 cursor-not-allowed hover:bg-transparent'
                : 'text-[#1B5E20] hover:bg-white cursor-pointer'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'en' ? 'Admin / Govt. Body' : 'प्रशासक / सरकारी विभाग'}</span>
            {isRoleDisabled('admin') && <Lock className="w-3 h-3 text-gray-400 ml-0.5" />}
          </button>
        </div>

        {/* Right: Auth Profile / Login Button + Multilingual Language Toggle */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 p-1.5 rounded-2xl">
              <div className="hidden md:flex items-center space-x-1.5 px-2 text-xs font-bold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#1B5E20] text-white">
                  {user.role}
                </span>
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
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Multilingual Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#E8F5E9]/50 text-xs font-black text-[#1B5E20] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

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
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleRoleClick = (targetRole: UserRoleMode) => {
    if (!isAuthenticated) {
      router.push(`/login?role=${targetRole}`);
    } else {
      // If user is already authenticated, update session role or switch active dashboard directly
      if (user && user.role !== targetRole) {
        login({
          ...user,
          role: targetRole,
          farmId: targetRole === 'farmer' ? (user.farmId || 'IND-UP-8842') : undefined,
          licenseNo: targetRole === 'vet' ? (user.licenseNo || 'VCI-GUJ-4091') : targetRole === 'admin' ? (user.licenseNo || 'DAHD-ADM-001') : undefined,
        });
      }
      onRoleChange?.(targetRole);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Official Ministry Affiliation */}
        <Link
          href="/"
          className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#072716] via-[#0E4D2B] to-[#166534] group-hover:scale-105 transition-all flex items-center justify-center shadow-md text-white">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0E4D2B]">
                FarmShield
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                SIH Finalist
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold leading-tight">
              {language === 'en'
                ? 'National Livestock Surveillance & MRL Compliance'
                : 'राष्ट्रीय पशुधन निगरानी एवं एमआरएल अनुपालन मंच'}
            </p>
          </div>
        </Link>

        {/* Center: 3-Role Switcher + Surveillance Link */}
        <div className="hidden lg:flex items-center bg-slate-100/90 border border-slate-200 p-1.5 rounded-2xl gap-1 text-xs font-bold">
          {/* 1. Farmer Portal */}
          <button
            onClick={() => handleRoleClick('farmer')}
            title={
              isAuthenticated && user?.role === 'farmer'
                ? 'Active Farmer Portal'
                : 'Switch or Login to Farmer Portal'
            }
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              (currentRole === 'farmer' || (isAuthenticated && user?.role === 'farmer'))
                ? 'bg-[#0E4D2B] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0E4D2B] hover:bg-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}</span>
          </button>

          {/* 2. Veterinarian */}
          <button
            onClick={() => handleRoleClick('vet')}
            title={
              isAuthenticated && user?.role === 'vet'
                ? 'Active Veterinarian Portal'
                : 'Switch or Login to Veterinarian Portal'
            }
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              (currentRole === 'vet' || (isAuthenticated && user?.role === 'vet'))
                ? 'bg-[#0E4D2B] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0E4D2B] hover:bg-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{language === 'en' ? 'Veterinarian' : 'पशु चिकित्सक'}</span>
          </button>

          {/* 3. Admin / Govt. Body */}
          <button
            onClick={() => handleRoleClick('admin')}
            title={
              isAuthenticated && user?.role === 'admin'
                ? 'Active Admin Portal'
                : 'Switch or Login to Admin & Govt. Portal'
            }
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              (currentRole === 'admin' || (isAuthenticated && user?.role === 'admin'))
                ? 'bg-[#0E4D2B] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0E4D2B] hover:bg-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'en' ? 'Govt / Admin' : 'प्रशासक'}</span>
          </button>

          {/* Surveillance Map Portal Link */}
          <Link
            href="/surveillance/map"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-800 bg-[#DCFCE7]/70 hover:bg-[#DCFCE7] transition-all font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>{language === 'en' ? 'Surveillance Map' : 'निगरानी नक्शा'}</span>
          </Link>
        </div>

        {/* Right: Auth Profile / Login Button + Multilingual Language Toggle */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 p-1.5 rounded-2xl">
              <div className="hidden md:flex items-center space-x-1.5 px-2 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#0E4D2B] text-white">
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#0E4D2B] hover:bg-[#166534] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Multilingual Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#0E4D2B] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Building2,
  LogIn,
  LogOut,
  Calendar,
  MapPin,
  Pill,
  FlaskConical,
  FileText,
  Cpu,
  LayoutDashboard,
  ShieldAlert,
  FolderHeart,
  Activity,
  QrCode,
  Store,
} from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';

export type UserRoleMode = 'farmer' | 'vet' | 'veterinarian' | 'admin' | 'qr_scanner';

interface NavbarProps {
  currentRole?: UserRoleMode;
  onRoleChange?: (role: UserRoleMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole: propRole,
  onRoleChange,
}) => {
  const { language } = useLanguage();
  const { user, isAuthenticated, logout, openAuthModal, switchRole } = useAuth();
  const effectiveRole = propRole || user?.role || 'farmer';

  const handleRoleClick = (targetRole: UserRoleMode) => {
    if (!isAuthenticated) {
      openAuthModal('login', targetRole);
    } else {
      switchRole(targetRole);
      onRoleChange?.(targetRole);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#1B5E20]/20 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Official Ministry Affiliation */}
        <Link
          href="/"
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1B5E20] group-hover:bg-[#2E7D32] transition-colors flex items-center justify-center shadow-md text-white shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-base sm:text-xl font-black tracking-tight text-[#1B5E20]">
                FarmShield
              </span>
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                SIH25007
              </span>
            </div>
            <p className="hidden sm:block text-[9px] sm:text-[10px] text-gray-600 font-medium leading-tight">
              {language === 'en'
                ? 'Digital Livestock Health & Surveillance Platform'
                : 'डिजिटल पशुधन स्वास्थ्य एवं निगरानी मंच'}
            </p>
          </div>
        </Link>

        {/* Center: Compact 3-Role Switcher */}
        <div className="hidden md:flex items-center bg-[#E8F5E9] border border-[#1B5E20]/30 p-1 rounded-xl gap-1 text-xs font-black shadow-inner">
          {/* 1. Farmer Portal */}
          <button
            onClick={() => handleRoleClick('farmer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isAuthenticated && effectiveRole === 'farmer'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-[#1B5E20] hover:bg-white/80'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}</span>
          </button>

          {/* 2. Veterinarian */}
          <button
            onClick={() => handleRoleClick('vet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isAuthenticated && (effectiveRole === 'vet' || effectiveRole === 'veterinarian')
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-[#1B5E20] hover:bg-white/80'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Veterinarian' : 'पशु चिकित्सक'}</span>
          </button>

          {/* 3. Admin / Govt. Body */}
          <button
            onClick={() => handleRoleClick('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isAuthenticated && effectiveRole === 'admin'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-[#1B5E20] hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Admin / Govt. Body' : 'प्रशासक / विभाग'}</span>
          </button>
        </div>

        {/* Right: Farm Switcher + Notifications + Auth Profile + Global Languages */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Farm Switcher Dropdown */}
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#1B5E20]" />
            <select
              aria-label="Select Farm Unit"
              defaultValue="farm-pb-01"
              className="bg-transparent text-xs font-bold text-gray-800 outline-hidden cursor-pointer"
            >
              <option value="farm-pb-01">Punjab Dairy Unit #1 (Ludhiana)</option>
              <option value="farm-pb-02">Malwa Commercial Dairy #2</option>
              <option value="farm-aqua-01">Sutlej Freshwater Fishery Pond #1</option>
              <option value="farm-pl-01">Doaba Broiler & Layer Farm</option>
            </select>
          </div>

          {/* Realtime Notification Drawer */}
          <NotificationDrawer />

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 p-1 rounded-xl">
              <Link
                href="/profile"
                className="hidden md:flex items-center space-x-1.5 px-2 text-xs font-bold text-gray-700 hover:text-[#1B5E20] transition-colors"
                title="View Profile"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 transition-colors flex items-center gap-1 text-xs font-black cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign In' : 'लॉग इन'}</span>
            </button>
          )}

          <LanguageSelector />
        </div>
      </div>

      {/* Quick Navigation Strip for Flutter Parity Modules */}
      <nav className="bg-[#FAFAFA] border-t border-gray-200/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-black">
          {/* Mobile Role Switcher */}
          <div className="flex md:hidden items-center bg-[#E8F5E9] border border-[#1B5E20]/30 p-1 rounded-xl gap-1 shrink-0">
            <button
              onClick={() => handleRoleClick('farmer')}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                isAuthenticated && effectiveRole === 'farmer'
                  ? 'bg-[#1B5E20] text-white'
                  : 'text-[#1B5E20]'
              }`}
            >
              Farmer
            </button>
            <button
              onClick={() => handleRoleClick('vet')}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                isAuthenticated && (effectiveRole === 'vet' || effectiveRole === 'veterinarian')
                  ? 'bg-[#1B5E20] text-white'
                  : 'text-[#1B5E20]'
              }`}
            >
              Vet
            </button>
            <button
              onClick={() => handleRoleClick('admin')}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                isAuthenticated && effectiveRole === 'admin'
                  ? 'bg-[#1B5E20] text-white'
                  : 'text-[#1B5E20]'
              }`}
            >
              Govt
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#1B5E20]" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/livestock"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <FolderHeart className="w-3.5 h-3.5 text-[#1B5E20]" />
            <span>Livestock Directory</span>
          </Link>

          <Link
            href="/herd-health"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Herd Health</span>
          </Link>

          <Link
            href="/calendar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Withdrawal Calendar</span>
          </Link>

          <Link
            href="/surveillance/map"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>Outbreak GIS Map</span>
          </Link>

          <Link
            href="/syndromic-report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>Syndromic Triage</span>
          </Link>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scan Passport</span>
          </Link>

          <Link
            href="/medicines"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <Pill className="w-3.5 h-3.5 text-sky-600" />
            <span>Medicines & MRLs</span>
          </Link>

          <Link
            href="/lab-results"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>Lab Residue Tests</span>
          </Link>

          <Link
            href="/risk-assessment"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Risk Assessment</span>
          </Link>

          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white text-gray-700 hover:text-[#1B5E20] transition shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Certificates & Reports</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Bell, 
  Globe, 
  UserCheck, 
  Layers, 
  LogOut, 
  QrCode, 
  Building2, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface HeaderProps {
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { 
    currentUser, 
    language, 
    setLanguage, 
    t, 
    notifications, 
    setIsQRScannerOpen,
    setIsRoleSwitcherOpen 
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleLabels = {
    farmer: { label: t.roleFarmer, color: 'bg-emerald-600' },
    vet: { label: t.roleVet, color: 'bg-teal-600' },
    admin: { label: t.roleAdmin, color: 'bg-sky-700' }
  };

  return (
    <>
      {/* Top Tricolor Government Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] flex" />

      <header className="gov-gradient-header text-white sticky top-0 z-40 shadow-lg border-b border-teal-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2">
            
            {/* Brand / Emblem & Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                    {t.portalTitle}
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      Govt. of India
                    </span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-teal-100/90 font-medium hidden md:block">
                  {t.portalSubTitle} • <span className="text-emerald-300 font-semibold">{t.portalTagline}</span>
                </p>
              </div>
            </div>

            {/* Actions & Role Switcher */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Quick Role Switcher Trigger Button */}
              <button
                onClick={() => setIsRoleSwitcherOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-semibold transition shadow-sm text-teal-100 hover:text-white"
                title="Switch Stakeholder View (Farmer / Vet / Admin)"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">{t.switchRole}</span>
                <span className="inline sm:hidden">Role</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${roleLabels[currentUser.role].color}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </button>

              {/* QR Scanner Trigger Button */}
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition border border-emerald-400/40 shadow-sm"
                title="Scan Animal QR Code for Food Safety Passport"
              >
                <QrCode className="w-4 h-4 text-emerald-100" />
                <span className="hidden md:inline">{t.scanQR}</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-teal-100 hover:text-white transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-teal-100 hover:text-white transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full ring-2 ring-teal-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Profile Pill & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition text-left"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-300"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-bold leading-tight truncate max-w-[120px]">{currentUser.name}</div>
                    <div className="text-[10px] text-teal-200 leading-none truncate max-w-[120px]">
                      {currentUser.role === 'farmer' ? currentUser.farmName : currentUser.role === 'vet' ? currentUser.licenseNumber : 'DAHD Inspector'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-200" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500">{t.activeRole}</p>
                      <p className="text-sm font-bold text-teal-950 mt-0.5">{roleLabels[currentUser.role].label}</p>
                      <p className="text-xs text-slate-600 font-medium truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser.phone}</p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsRoleSwitcherOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-teal-600" />
                        {t.switchRole}
                      </button>

                      {onLogout && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 mt-1"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          {t.logout}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

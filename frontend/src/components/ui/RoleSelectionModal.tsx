'use client';

import React from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { UserRoleMode } from './Navbar';
import { ShieldCheck, UserCheck, Stethoscope, Settings, QrCode, ArrowRight, Sparkles, X } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRoleMode) => void;
  onClose: () => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const roles = [
    {
      id: 'farmer' as UserRoleMode,
      icon: '👨‍🌾',
      title: language === 'en' ? 'Farmer & Farm Manager' : 'किसान एवं फार्म प्रबंधक',
      subtitle: language === 'en' ? 'Register Cattle, Herd & Fishery Ponds, Track Medicine & Print QR Ear Tags' : 'पशुधन एवं मत्स्य तालाब पंजीकृत करें, दवा ट्रैक करें और QR टैग प्रिंट करें',
      badge: 'Livestock & Aquaculture',
      color: 'border-[#1B5E20] hover:border-[#2E7D32] bg-gradient-to-br from-white to-[#F1F8E9]',
      btnBg: 'bg-[#1B5E20]',
      features: ['🐄 Cattle & 🐟 Fishery', '💊 Withdrawal Countdown', '🏷️ Instant QR Tags'],
    },
    {
      id: 'vet' as UserRoleMode,
      icon: '🩺',
      title: language === 'en' ? 'Veterinary Doctor' : 'पशु चिकित्सक',
      subtitle: language === 'en' ? 'AMU Clinical Approvals, Antimicrobial Stewardship & AI AMR Risk Alerts' : 'दवा अनुमोदन, एंटीमाइक्रोबियल निगरानी और AI जोखिम अलर्ट',
      badge: 'Clinical Support',
      color: 'border-blue-600 hover:border-blue-700 bg-gradient-to-br from-white to-blue-50/50',
      btnBg: 'bg-blue-700',
      features: ['🧠 AI Risk Models', '📊 AMU Biomass Trends', '⚠️ Therapy Alarms'],
    },
    {
      id: 'qr_scanner' as UserRoleMode,
      icon: '🥛',
      title: language === 'en' ? 'Milk Center & Food Safety Inspector' : 'दूध संकलन केंद्र व खाद्य सुरक्षा निरीक्षक',
      subtitle: language === 'en' ? 'Scan QR Codes to Verify MRL Food Safety Passports Before Collection' : 'दूध या मत्स्य उपज संकलन से पहले QR कोड स्कैन करके खाद्य सुरक्षा जांचें',
      badge: 'Supply Chain Clearance',
      color: 'border-emerald-600 hover:border-emerald-700 bg-gradient-to-br from-white to-emerald-50/50',
      btnBg: 'bg-emerald-700',
      features: ['📷 Camera Live Scanner', '🟢 Safe/Active Badges', '🔒 Public Passport'],
    },
    {
      id: 'admin' as UserRoleMode,
      icon: '🏛️',
      title: language === 'en' ? 'Government Auditor / Admin' : 'सरकारी ऑडिटर / प्रशासक',
      subtitle: language === 'en' ? 'National MRL Standards, Regional AMU Surveillance & Regulatory Audit' : 'राष्ट्रीय MRL मानक, क्षेत्रीय AMU निगरानी और नियम ऑडिट',
      badge: 'FSSAI & Codex Compliance',
      color: 'border-amber-600 hover:border-amber-700 bg-gradient-to-br from-white to-amber-50/50',
      btnBg: 'bg-amber-700',
      features: ['📋 Regulatory MRL Rules', '🗺️ Regional AMU Heatmaps', '📑 Compliance Export'],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2 relative z-10 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[11px] font-black text-[#1B5E20] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FarmShield Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B5E20] tracking-tight">
            {t('roleModal.title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-bold max-w-xl mx-auto">
            {t('roleModal.subtitle')}
          </p>
        </div>

        {/* 4 Interactive Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              className={`border-2 ${r.color} p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group relative`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-gray-200/80 shadow-md flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {r.icon}
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 bg-white/90 border border-gray-200 rounded-full text-gray-800 shadow-sm">
                    {r.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-[#1B5E20] transition-colors flex items-center justify-between">
                    <span>{r.title}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B5E20] group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    {r.subtitle}
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap gap-1">
                  {r.features.map((feat, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-white/80 border border-gray-200/60 rounded-md text-gray-700">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-200/60">
                <button
                  className={`w-full py-2.5 rounded-xl ${r.btnBg} text-white font-black text-xs shadow-md transition-opacity group-hover:opacity-95 flex items-center justify-center gap-2`}
                >
                  <span>{t('roleModal.enterPortal')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-500 font-bold border-t border-gray-100 pt-3">
          🔒 Certified by FSSAI MRL Standards & WOAH Farm-Level AMU Guidelines
        </p>
      </div>
    </div>
  );
};

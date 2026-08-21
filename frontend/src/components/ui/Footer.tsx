'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  HeartHandshake,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowUp,
  Shield,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface FooterProps {
  onNavigateFarmerView?: (view: 'home' | 'animals' | 'treatment' | 'milk_safety' | 'alerts' | 'history' | 'qr_scan') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateFarmerView }) => {
  const { language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 bg-[#0E3B14] text-white font-sans border-t-4 border-[#1B5E20] relative overflow-hidden">
      {/* 🇮🇳 National Tricolor Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10 space-y-12">
        {/* Top Section: Brand Identity & Quick Stats / Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-emerald-800/80 items-center justify-between">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#1B5E20] flex items-center justify-center shadow-lg shrink-0">
                <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    FarmShield
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF9933] text-black shadow-sm">
                    SIH25007
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600/80 text-emerald-100 border border-emerald-400/30">
                    National Portal
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-bold">
                  {language === 'en'
                    ? 'Ministry of Fisheries, Animal Husbandry & Dairying • Government of India'
                    : 'मत्स्यपालन, पशुपालन और डेयरी मंत्रालय • भारत सरकार'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-2xl pt-1">
              {language === 'en'
                ? "India's integrated digital platform for Maximum Residue Limits (MRL) compliance, Antimicrobial Usage (AMU) stewardship, and tamper-proof livestock traceability under One Health framework."
                : 'वन हेल्थ फ्रेमवर्क के तहत अधिकतम अवशेष सीमा (MRL) अनुपालन, एंटीमाइक्रोबियल उपयोग (AMU) प्रबंधन और पशुधन ट्रेसेबिलिटी के लिए भारत का एकीकृत डिजिटल राष्ट्रीय मंच।'}
            </p>
          </div>

          {/* Quick Helplines Callout */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/10 hover:bg-white/15 border border-emerald-700/60 rounded-2xl p-3.5 transition-all flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF9933] text-white flex items-center justify-center shrink-0 shadow-md">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                  {language === 'en' ? 'Kisan Call Centre (24x7)' : 'किसान कॉल सेंटर'}
                </span>
                <a href="tel:18001801551" className="text-sm font-black text-white hover:text-yellow-300 transition-colors">
                  1800-180-1551
                </a>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 border border-emerald-700/60 rounded-2xl p-3.5 transition-all flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                  {language === 'en' ? 'Animal Health Helpline' : 'पशु स्वास्थ्य हेल्पलाइन'}
                </span>
                <a href="tel:1962" className="text-sm font-black text-white hover:text-yellow-300 transition-colors">
                  1962 (Toll-Free)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: 4 Nav Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          {/* Column 1: Core Portal Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-800 pb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span>{language === 'en' ? 'Portal Services' : 'पोर्टल सेवाएं'}</span>
            </h4>
            <ul className="space-y-2 font-semibold text-emerald-200">
              <li>
                <Link
                  href="/login?role=farmer"
                  className="hover:text-white hover:translate-x-1 transition-transform inline-flex items-center gap-1.5"
                >
                  <span>➔</span> {language === 'en' ? 'Farmer Digital Dashboard' : 'किसान डिजिटल डैशबोर्ड'}
                </Link>
              </li>
              <li>
                <Link
                  href="/login?role=vet"
                  className="hover:text-white hover:translate-x-1 transition-transform inline-flex items-center gap-1.5"
                >
                  <span>➔</span> {language === 'en' ? 'Veterinarian E-Prescription' : 'पशु चिकित्सक ई-पर्चा'}
                </Link>
              </li>
              <li>
                <Link
                  href="/login?role=admin"
                  className="hover:text-white hover:translate-x-1 transition-transform inline-flex items-center gap-1.5"
                >
                  <span>➔</span> {language === 'en' ? 'Admin & Regulatory Oversight' : 'प्रशासक एवं सरकारी निगरानी'}
                </Link>
              </li>
              <li>
                {onNavigateFarmerView ? (
                  <button
                    onClick={() => onNavigateFarmerView('qr_scan')}
                    className="hover:text-white hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 text-left"
                  >
                    <span>➔</span> {language === 'en' ? 'Instant QR Passport Lookup' : 'QR पासपोर्ट सत्यापन'}
                  </button>
                ) : (
                  <Link
                    href="/qr/sample"
                    className="hover:text-white hover:translate-x-1 transition-transform inline-flex items-center gap-1.5"
                  >
                    <span>➔</span> {language === 'en' ? 'Instant QR Passport Lookup' : 'QR पासपोर्ट सत्यापन'}
                  </Link>
                )}
              </li>
              <li>
                {onNavigateFarmerView ? (
                  <button
                    onClick={() => onNavigateFarmerView('milk_safety')}
                    className="hover:text-white hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 text-left"
                  >
                    <span>➔</span> {language === 'en' ? 'MRL Safe Milk Harvest Check' : 'दूध सुरक्षा व निकासी गणना'}
                  </button>
                ) : (
                  <span className="text-emerald-300">
                    <span>➔</span> {language === 'en' ? 'MRL Safe Milk Harvest Check' : 'दूध सुरक्षा व निकासी गणना'}
                  </span>
                )}
              </li>
            </ul>
          </div>

          {/* Column 2: Regulatory Framework & Standards */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-800 pb-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{language === 'en' ? 'Standards & MRL' : 'मानक एवं MRL'}</span>
            </h4>
            <ul className="space-y-2 font-semibold text-emerald-200">
              <li>
                <a
                  href="https://www.fssai.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>FSSAI Statutory MRL Limits</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.fao.org/fao-who-codexalimentarius/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>Codex Alimentarius (FAO/WHO)</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.woah.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>WOAH Terrestrial Animal Code</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <span className="text-emerald-300">National AMR Action Plan (NAP-AMR 2.0)</span>
              </li>
              <li>
                <span className="text-emerald-300">NDLM Digital Ear Tag Specifications</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Ministry & Partner Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-800 pb-2">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>{language === 'en' ? 'Government Bodies' : 'संबद्ध विभाग'}</span>
            </h4>
            <ul className="space-y-2 font-semibold text-emerald-200">
              <li>
                <a
                  href="https://dahd.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>Dept. of Animal Husbandry (DAHD)</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://icar.org.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>Indian Council of Agricultural Research</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nddb.coop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>National Dairy Development Board</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://sih.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center justify-between group"
                >
                  <span>Smart India Hackathon (SIH 2026)</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Headquarters */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-800 pb-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>{language === 'en' ? 'Contact & Support' : 'संपर्क व सहायता'}</span>
            </h4>
            <ul className="space-y-2.5 font-medium text-emerald-200">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  Krishi Bhawan / DAHD Office, New Delhi - 110001, India
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="mailto:support@farmshield.gov.in"
                  className="text-[11px] hover:text-white transition-colors"
                >
                  support@farmshield.gov.in
                </a>
              </li>
              <li className="pt-2">
                <div className="bg-emerald-900/60 rounded-xl p-2.5 border border-emerald-700/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-yellow-300 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>System Status: Operational</span>
                  </div>
                  <p className="text-[10px] text-emerald-200">
                    High-availability cloud nodes • 99.98% Uptime
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* National Initiatives Ribbon */}
        <div className="bg-emerald-950/80 rounded-2xl p-4 border border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-emerald-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-black flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Key National Initiatives:
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-800/60 text-white">🇮🇳 Digital India</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-800/60 text-white">🥛 Zero-Residue Dairy</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-800/60 text-white">🧬 One Health Mission</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-800/60 text-white">🐟 Sustainable Aquaculture</span>
          </div>

          <button
            onClick={scrollToTop}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            title="Scroll to Top"
          >
            <span>{language === 'en' ? 'Back to Top' : 'ऊपर जाएं'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Sub-Footer: Copyright & Legal Policies */}
        <div className="pt-6 border-t border-emerald-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-emerald-300 font-medium">
          <div className="space-y-1">
            <p className="text-white font-bold">
              © 2026 FarmShield Digital Farm Portal • Ministry of Fisheries, Animal Husbandry & Dairying (DAHD), Govt. of India.
            </p>
            <p className="text-emerald-400/80 text-[10px]">
              Designed & Developed for Smart India Hackathon (SIH 2026) • Problem Statement ID: SIH25007
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 text-[11px] text-emerald-200">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Hyperlink Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Accessibility Statement</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Security Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

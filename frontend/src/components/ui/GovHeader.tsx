'use client';

import React from 'react';
import { Sparkles, Video, ExternalLink, HelpCircle, PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface GovHeaderProps {
  onOpenVideo?: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ onOpenVideo }) => {
  const { language } = useLanguage();

  return (
    <div className="w-full bg-[#1B5E20] text-white border-b border-emerald-800 text-xs font-sans">
      {/* Tricolor Accent Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Official Ministry Identification */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          {/* Ashoka Chakra / Gov Emblem icon */}
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏛️</span>
            <div className="leading-tight">
              <div className="font-extrabold tracking-wide text-[11px] sm:text-xs text-white">
                {language === 'en'
                  ? 'Ministry of Fisheries, Animal Husbandry & Dairying'
                  : 'मत्स्यपालन, पशुपालन और डेयरी मंत्रालय'}
              </div>
              <div className="text-[10px] text-emerald-200 font-semibold">
                {language === 'en'
                  ? 'Department of Animal Husbandry and Dairying (DAHD) • Government of India'
                  : 'पशुपालन और डेयरी विभाग (DAHD) • भारत सरकार'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: SIH 2026 Banner & Video Demonstration Link */}
        <div className="flex items-center flex-wrap justify-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 font-bold text-white shadow-inner">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>SIH 2026 Official Solution</span>
          </span>

          {onOpenVideo && (
            <button
              onClick={onOpenVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9933] hover:bg-[#F57C00] text-white font-black shadow-md transition-all hover:scale-105"
            >
              <Video className="w-3.5 h-3.5 text-white" />
              <span>Watch Portal Video Demo</span>
            </button>
          )}

          <a
            href="https://www.vasudha-dahd.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-emerald-200 hover:text-white font-semibold transition-colors"
          >
            <span>DAHD Vasudha</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

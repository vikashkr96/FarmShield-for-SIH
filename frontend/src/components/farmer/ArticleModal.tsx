'use client';

import React from 'react';
import { X, BookOpen, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Share2, Printer } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

export interface ArticleData {
  id: string;
  image: string;
  category: string;
  readTime: string;
  badge: string;
  badgeColor: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  contentEn: {
    sectionTitle: string;
    paragraphs: string[];
    tips?: string[];
  }[];
  contentHi: {
    sectionTitle: string;
    paragraphs: string[];
    tips?: string[];
  }[];
  keyTakeawaysEn: string[];
  keyTakeawaysHi: string[];
}

interface ArticleModalProps {
  article: ArticleData | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { language } = useLanguage();

  if (!article) return null;

  const title = language === 'en' ? article.titleEn : article.titleHi;
  const subtitle = language === 'en' ? article.subtitleEn : article.subtitleHi;
  const sections = language === 'en' ? article.contentEn : article.contentHi;
  const takeaways = language === 'en' ? article.keyTakeawaysEn : article.keyTakeawaysHi;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white border-2 border-[#1B5E20] rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto relative flex flex-col">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${article.badgeColor}`}>
              {article.badge}
            </span>
            <span className="text-xs font-bold text-gray-500">
              {article.category} • {article.readTime}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <h1 className="text-xl sm:text-2xl font-black drop-shadow-md leading-snug">
              {title}
            </h1>
            <p className="text-xs text-gray-200 font-medium drop-shadow">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 text-gray-800 text-xs sm:text-sm leading-relaxed">
          {/* Key Takeaways Box */}
          <div className="bg-[#FFFDF5] border-2 border-[#1B5E20]/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-[#1B5E20] font-black text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>{language === 'en' ? 'Core Statutory Takeaways & Action Points' : 'प्रमुख वैधानिक बिंदु एवं दिशानिर्देश'}</span>
            </div>
            <ul className="space-y-2">
              {takeaways.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Paragraph Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-[#1B5E20] border-b border-gray-200 pb-1.5">
                {section.sectionTitle}
              </h3>
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-gray-700 font-medium text-xs sm:text-sm leading-relaxed">
                  {p}
                </p>
              ))}
              {section.tips && section.tips.length > 0 && (
                <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#A5D6A7] space-y-1.5">
                  <span className="text-[11px] font-black text-[#1B5E20] uppercase tracking-wider block">
                    💡 {language === 'en' ? 'Practical Farm Tip' : 'व्यावहारिक सुझाव'}
                  </span>
                  {section.tips.map((tip, tIdx) => (
                    <p key={tIdx} className="text-xs font-bold text-gray-800">
                      • {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-bold">
            Certified by FSSAI & National MRL Surveillance Cell
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-black transition-colors"
          >
            {language === 'en' ? 'Close Guide' : 'गाइड बंद करें'}
          </button>
        </div>
      </div>
    </div>
  );
};

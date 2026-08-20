'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Sparkles,
  PlusCircle,
  QrCode,
  Pill,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';
import { FarmSlider } from './FarmSlider';
import { FarmShieldVideoShowcase } from './FarmShieldVideoShowcase';
import { ArticleModal, ArticleData } from './ArticleModal';

interface FarmerHomeProps {
  onNavigate: (view: 'animals' | 'treatment' | 'milk_safety' | 'alerts' | 'history' | 'qr_scan') => void;
  onOpenRegisterAnimal?: () => void;
  stats: {
    totalAnimals: number;
    underTreatment: number;
    underWithdrawal: number;
    clearedCount: number;
  };
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({ onNavigate, onOpenRegisterAnimal, stats }) => {
  const { t, language } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);

  const handleProtectedAction = (action: () => void) => {
    if (!isAuthenticated) {
      openAuthModal('login', 'farmer');
    } else {
      action();
    }
  };

  const richArticles: ArticleData[] = [
    {
      id: 'mrl-guide',
      image: '/images/cows-pasture.jpg',
      category: 'Dairy Food Safety & MRL',
      readTime: '4 min read',
      badge: 'FSSAI Statutory Standard',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      titleEn: 'FSSAI Maximum Residue Limits (MRL) Guide for Dairy Milk',
      titleHi: 'डेयरी दूध के लिए FSSAI अधिकतम अवशेष सीमा (MRL) दिशानिर्देश',
      subtitleEn: 'Why observing statutory withdrawal times guarantees zero-residue, export-grade milk.',
      subtitleHi: 'निकासी समय का पालन किस प्रकार दूध को शत-प्रतिशत रासायनिक अवशेष मुक्त रखता है।',
      contentEn: [
        {
          sectionTitle: 'What is a Maximum Residue Limit (MRL)?',
          paragraphs: [
            'A Maximum Residue Limit (MRL) is the highest level of an antimicrobial or drug residue legally permitted in dairy products by the Food Safety and Standards Authority of India (FSSAI) and the international Codex Alimentarius commission.',
            'When dairy cows receive antibiotics like Amoxicillin or Oxytetracycline, the active compound is metabolized and excreted into the milk over several days. Consuming this milk before the withdrawal period ends poses human health hazards and triggers Antimicrobial Resistance (AMR).',
          ],
          tips: [
            'Never mix milk from treated cows with bulk herd tanks during active withdrawal.',
            'Always verify safe clearance date on your animal QR tag before supplying to collection centers.',
          ],
        },
        {
          sectionTitle: 'Understanding Withdrawal Times',
          paragraphs: [
            'The statutory withdrawal period is the exact number of days required for medicine concentrations in the animal’s body to drop below legal MRL thresholds.',
            'Our FarmShield portal calculates this automatically based on animal weight, dosage, and active molecule half-life.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'अधिकतम अवशेष सीमा (MRL) क्या है?',
          paragraphs: [
            'MRL वह उच्चतम कानूनी सीमा है जो FSSAI और कोडेक्स द्वारा दूध में दवा अवशेषों के लिए निर्धारित की गई है।',
            'जब गाय या भैंस को एंटीबायोटिक दी जाती है, तो दवा शरीर से धीरे-धीरे निकलती है। इस दौरान दूध बेचना या पीना स्वास्थ्य के लिए हानिकारक हो सकता है।',
          ],
          tips: [
            'उपचार के दौरान पशु का दूध अलग रखें और सामान्य दूध में न मिलाएं।',
            'दूध संकलन केंद्र पर ले जाने से पहले QR टैग पर सुरक्षित तारीख अवश्य जांचें।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Strictly observe 5 to 7 days withdrawal for common beta-lactams & tetracyclines.',
        'Zero chemical residue ensures full compliance with dairy cooperative acceptance tests.',
        'Prevents penicillin hypersensitivity reactions in human consumers.',
      ],
      keyTakeawaysHi: [
        'सामान्य एंटीबायोटिक दवाओं में 5 से 7 दिन की निकासी अवधि का पूरा पालन करें।',
        'दूध जांच परीक्षण में फेल होने और आर्थिक नुकसान से बचाव करें।',
        'उपभोक्ताओं को सुरक्षित व शुद्ध दूध उपलब्ध कराएं।',
      ],
    },
    {
      id: 'ear-tagging',
      image: '/images/ear-tagged-calves.jpg',
      category: 'Livestock Traceability',
      readTime: '3 min read',
      badge: 'Digital Passport Standard',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      titleEn: 'Digital Ear-Tagging & QR Passports for Modern Livestock',
      titleHi: 'पशुधन के लिए डिजिटल ईयर-टैगिंग और QR हेल्थ पासपोर्ट',
      subtitleEn: 'How individual tamper-proof identification protects herd health and streamlines dairy audits.',
      subtitleHi: 'डिजिटल ईयर-टैग किस प्रकार पशु स्वास्थ्य और दूध संकलन सत्यापन को आसान बनाता है।',
      contentEn: [
        {
          sectionTitle: 'The Role of Individual Ear-Tagging',
          paragraphs: [
            'Visual and digital ear tags provide a unique lifetime identity for every cattle and calf in your herd. In the FarmShield ecosystem, each tag is paired with an encrypted QR code containing the animal’s breed, age, treatment history, and real-time food safety status.',
            'Milk collection inspectors and veterinary doctors can scan this tag instantly using any mobile camera without requiring special hardware.',
          ],
          tips: [
            'Attach laser-printed QR tags in the inner central cartilage of the ear.',
            'Download and laminate the high-resolution QR pass directly from FarmShield.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'ईयर-टैगिंग का महत्व',
          paragraphs: [
            'ईयर-टैग प्रत्येक पशु को एक अलग पहचान संख्या प्रदान करता है। FarmShield पोर्टल पर यह नंबर सीधे QR कोड से जुड़ जाता है जिसमें पशु का इलाज और दूध सुरक्षा स्थिति दर्ज रहती है।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Eliminates paper-based treatment logs and prescription loss.',
        'Enables 1-second camera verification at milk collection booths.',
        'Complies with National Digital Livestock Mission (NDLM) standards.',
      ],
      keyTakeawaysHi: [
        'कागजी पर्चियों के खोने की समस्या से मुक्ति।',
        'मोबाइल कैमरे से तुरंत 1 सेकंड में पशु की जांच।',
        'राष्ट्रीय डिजिटल पशुधन मिशन के अनुरूप।',
      ],
    },
    {
      id: 'buffalo-care',
      image: '/images/buffalo-calf.jpg',
      category: 'Buffalo Herd Health',
      readTime: '4 min read',
      badge: 'Dairy Management',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      titleEn: 'Murrah Buffalo Dairy Safety & Managing Antibiotic Withdrawal',
      titleHi: 'मुर्राह भैंस डेयरी स्वास्थ्य व एंटीबायोटिक निकासी प्रबंधन',
      subtitleEn: 'Clinical dosage guidelines, mastitis management, and protecting fat-rich buffalo milk.',
      subtitleHi: 'उच्च वसायुक्त भैंस के दूध में सुरक्षित दवा उपयोग और थनैला रोग प्रबंधन।',
      contentEn: [
        {
          sectionTitle: 'Buffalo Physiology and Drug Elimination',
          paragraphs: [
            'Dairy buffaloes possess higher fat content in milk, which influences the distribution and clearance of lipophilic antimicrobial agents. Under-dosing or premature milk harvesting can cause sub-therapeutic antibiotic residues.',
            'Maintaining precise digital logs prevents repeat treatments and safeguards high-yield buffalo herds.',
          ],
          tips: [
            'Calibrate dosage strictly by live weight (e.g. 500-600 kg for adult Murrah buffaloes).',
            'Consult your veterinary officer before switching antibiotic classes.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'भैंसों में दवा निष्कासन की विशेषताएँ',
          paragraphs: [
            'भैंस के दूध में वसा की मात्रा अधिक होती है, जिससे कुछ दवाएँ शरीर में अधिक समय तक रह सकती हैं। इसलिए निकासी समय का सटीक पालन अत्यंत आवश्यक है।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Adjust withdrawal timelines based on body mass and high fat percentage.',
        'Prevent recurring mastitis through clean milking protocols.',
        'Ensure full economic value by preventing contaminated milk supply penalties.',
      ],
      keyTakeawaysHi: [
        'वजन के अनुसार सही दवा खुराक का प्रयोग करें।',
        'दूध दोहन के समय स्वच्छता का विशेष ध्यान रखें।',
        'दूध रिजेक्ट होने के नुकसान से बचें।',
      ],
    },
    {
      id: 'aquaculture-biomass',
      image: '/images/aquaculture-pond.png',
      category: 'Aquaculture Stewardship',
      readTime: '5 min read',
      badge: 'Fishery Guidelines',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      titleEn: 'Aquaculture & Fishery Biomass: Managing Chemicals in Pond Units',
      titleHi: 'मत्स्य पालन तालाब बायोमास: सामूहिक जल दवा प्रबंधन',
      subtitleEn: 'Collective biomass calculation per metric ton and pre-harvest chemical testing for clean exports.',
      subtitleHi: 'प्रति मीट्रिक टन सुरक्षित दवा उपयोग व मछली निकासी पूर्व जांच।',
      contentEn: [
        {
          sectionTitle: 'Collective Pond Unit Management',
          paragraphs: [
            'Unlike individual cattle, aquaculture operates as a collective biological pond unit. Treating a pond requires calculating active substance dosage based on total biomass (kg/metric ton) and water volume.',
            'Chemical withdrawal periods must be observed for the entire pond ecosystem before initiating harvesting or supply to commercial fish markets.',
          ],
          tips: [
            'Maintain continuous water aeration during and after chemical treatments.',
            'Never harvest pond biomass until the full statutory clearance date is reached.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'तालाब बायोमास का सामूहिक प्रबंधन',
          paragraphs: [
            'मत्स्य पालन में दवा पूरे तालाब के पानी और कुल बायोमास (किलोग्राम) के आधार पर दी जाती है। पूरी फसल निकालने से पहले निकासी समय का पूर्ण पालन अनिवार्य है।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Treat ponds as single collective units rather than individual fish.',
        'Strictly follow zero-chloramphenicol and zero-nitrofuran statutory bans.',
        'Assures compliance for premium domestic markets and seafood export certifications.',
      ],
      keyTakeawaysHi: [
        'तालाब को एक संपूर्ण इकाई मानकर दवा का हिसाब रखें।',
        'प्रतिबंधित रसायनों का कदापि प्रयोग न करें।',
        'मत्स्य निर्यात व स्थानीय बाजार के लिए प्रमाणित गुणवत्ता प्राप्त करें।',
      ],
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 max-w-6xl mx-auto px-4 py-1 font-sans">
      {/* ========================================================================= */}
      {/* 🌟 1ST IMPRESSION HERO SECTION (FULL IMPACT ABOVE THE FOLD) */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        {/* 1. MOVING ANIMATED HERO SLIDER WITH CALIBRATED HEIGHT */}
        <FarmSlider />

        {/* 2. OVERVIEW SUBTITLE & 2 HERO ACTION BUTTONS */}
        <div className="text-center space-y-2.5 max-w-4xl mx-auto pt-1 pb-1">
          <p className="text-xs sm:text-sm md:text-base text-gray-700 font-bold leading-relaxed px-2">
            {language === 'en'
              ? "A comprehensive digital platform for Maximum Residue Limits (MRL) monitoring and Antimicrobial Usage (AMU) management in India's livestock sector, ensuring food safety and regulatory compliance."
              : 'भारत के पशुधन और मत्स्य क्षेत्र में अधिकतम अवशेष सीमा (MRL) निगरानी और एंटीमाइक्रोबियल उपयोग (AMU) प्रबंधन के लिए एक व्यापक डिजिटल मंच, जो खाद्य सुरक्षा और नियमों का अनुपालन सुनिश्चित करता है।'}
          </p>

          <div className="flex items-center justify-center gap-3.5 pt-0.5">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('login', 'farmer');
                } else {
                  const el = document.getElementById('farmer-primary-actions');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else if (onOpenRegisterAnimal) onOpenRegisterAnimal();
                  else onNavigate('animals');
                }
              }}
              className="px-6 py-2.5 sm:py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span>{language === 'en' ? 'Get Started' : 'शुरू करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('knowledge-hub-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-800 font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all hover:border-[#1B5E20] cursor-pointer"
            >
              <span>{language === 'en' ? 'Learn More' : 'और जानें'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎬 WATCH VASUDHA / FARMSHIELD IN ACTION (VIDEO DEMONSTRATION) */}
      {/* ========================================================================= */}
      <FarmShieldVideoShowcase />

      {/* ========================================================================= */}
      {/* 🚀 2. THE 2 PRIMARY ACTION CARDS */}
      {/* ========================================================================= */}
      <div id="farmer-primary-actions" className="space-y-4 pt-4 border-t-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#1B5E20]" />
            <h2 className="text-2xl font-black text-[#1B5E20]">
              {t('farmerHome.primaryActions.title')}
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500">{t('farmerHome.primaryActions.subTitle')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRIMARY ACTION 1: REGISTER ANIMAL / FISHERY UNIT */}
          <div
            onClick={() =>
              handleProtectedAction(() => {
                if (onOpenRegisterAnimal) onOpenRegisterAnimal();
                else onNavigate('animals');
              })
            }
            className="bg-gradient-to-br from-white to-[#F1F8E9] border-2 border-[#1B5E20] hover:border-[#2E7D32] p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A5D6A7]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-18 h-18 rounded-3xl bg-[#1B5E20] text-white flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform p-3">
                  🐄🐟
                </div>
                <Badge variant="success" className="bg-[#1B5E20] text-white border-none font-black text-xs px-3 py-1">
                  Instant QR Tag
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-[#1B5E20] transition-colors flex items-center justify-between">
                  <span>{t('farmerHome.primaryActions.registerTitle')}</span>
                  <ArrowRight className="w-6 h-6 text-[#1B5E20] group-hover:translate-x-2 transition-transform" />
                </h3>
                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                  {t('farmerHome.primaryActions.registerDesc')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-[#A5D6A7] rounded-lg text-[#1B5E20]">
                  📷 Photo Upload
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-[#A5D6A7] rounded-lg text-[#1B5E20]">
                  🏷️ Auto ID & QR
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-[#A5D6A7] rounded-lg text-[#1B5E20]">
                  🐟 Pond Biomass Unit
                </span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-[#A5D6A7]/40">
              <div className="w-full py-3 rounded-2xl bg-[#1B5E20] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md group-hover:bg-[#2E7D32] transition-colors">
                <PlusCircle className="w-5 h-5" />
                <span>{t('farmerHome.primaryActions.registerBtn')}</span>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTION 2: SCAN QR OR ENTER ANIMAL ID */}
          <div
            onClick={() => handleProtectedAction(() => onNavigate('qr_scan'))}
            className="bg-gradient-to-br from-white to-blue-50/60 border-2 border-blue-600 hover:border-blue-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-18 h-18 rounded-3xl bg-blue-700 text-white flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform p-3">
                  📷🔍
                </div>
                <Badge variant="warning" className="bg-blue-700 text-white border-none font-black text-xs px-3 py-1">
                  Passport Lookup
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-800 transition-colors flex items-center justify-between">
                  <span>{t('farmerHome.primaryActions.scanTitle')}</span>
                  <ArrowRight className="w-6 h-6 text-blue-700 group-hover:translate-x-2 transition-transform" />
                </h3>
                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                  {t('farmerHome.primaryActions.scanDesc')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-800">
                  📱 Camera Live Scanner
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-800">
                  🥛 Safe Milk Countdown
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-800">
                  💊 Treatment Timeline
                </span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-200">
              <div className="w-full py-3 rounded-2xl bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md group-hover:bg-blue-800 transition-colors">
                <QrCode className="w-5 h-5" />
                <span>{t('farmerHome.primaryActions.scanBtn')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOUR KEY STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs sm:text-sm text-[#1B5E20] font-black">{t('farmerHome.stats.totalAnimals')}</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-[#1B5E20]">{stats.totalAnimals}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1B5E20]/40 rounded-3xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs sm:text-sm text-[#1B5E20] font-black">{t('farmerHome.stats.underTreatment')}</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-[#1B5E20]">{stats.underTreatment}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-red-500/60 rounded-3xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs sm:text-sm text-red-700 font-black">{t('farmerHome.stats.underWithdrawal')}</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-red-700">{stats.underWithdrawal}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs sm:text-sm text-[#1B5E20] font-black">{t('farmerHome.stats.cleared')}</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-[#1B5E20]">{stats.clearedCount}</span>
          </div>
        </div>
      </div>

      {/* 4. SECONDARY QUICK ACTIONS */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#1B5E20]">
          {language === 'en' ? 'Quick Actions' : 'अन्य सुविधाएं'}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            variant="glass"
            hoverEffect
            onClick={() => handleProtectedAction(() => onNavigate('animals'))}
            className="cursor-pointer border-2 border-[#1B5E20]/30 hover:bg-[#E8F5E9]/50 p-5 flex flex-col justify-between group text-center items-center space-y-2"
          >
            <span className="text-3xl">🐄</span>
            <span className="text-sm font-black text-[#1B5E20]">{t('farmerHome.actions.myAnimals')}</span>
          </Card>

          <Card
            variant="glass"
            hoverEffect
            onClick={() => handleProtectedAction(() => onNavigate('treatment'))}
            className="cursor-pointer border-2 border-[#1B5E20]/30 hover:bg-[#E8F5E9]/50 p-5 flex flex-col justify-between group text-center items-center space-y-2"
          >
            <span className="text-3xl">💊</span>
            <span className="text-sm font-black text-[#1B5E20]">{t('farmerHome.actions.recordMedicine')}</span>
          </Card>

          <Card
            variant="glass"
            hoverEffect
            onClick={() => handleProtectedAction(() => onNavigate('milk_safety'))}
            className="cursor-pointer border-2 border-[#1B5E20]/30 hover:bg-[#E8F5E9]/50 p-5 flex flex-col justify-between group text-center items-center space-y-2"
          >
            <span className="text-3xl">🥛</span>
            <span className="text-sm font-black text-[#1B5E20]">{t('farmerHome.actions.isMilkSafe')}</span>
          </Card>

          <Card
            variant="glass"
            hoverEffect
            onClick={() => handleProtectedAction(() => onNavigate('alerts'))}
            className="cursor-pointer border-2 border-[#1B5E20]/30 hover:bg-[#E8F5E9]/50 p-5 flex flex-col justify-between group text-center items-center space-y-2"
          >
            <span className="text-3xl">⚠️</span>
            <span className="text-sm font-black text-[#1B5E20]">{t('farmerHome.actions.warnings')}</span>
          </Card>
        </div>
      </div>

      {/* 5. 📖 RICH ILLUSTRATED KNOWLEDGE HUB & ARTICLES */}
      <div id="knowledge-hub-section" className="space-y-6 pt-4 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-[#1B5E20]" />
              <h2 className="text-2xl font-black text-[#1B5E20]">
                {t('farmerHome.knowledgeHub.title')}
              </h2>
            </div>
            <p className="text-xs text-gray-600 font-bold">
              {t('farmerHome.knowledgeHub.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {richArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white border-2 border-gray-200 hover:border-[#1B5E20] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              {/* Top Image Preview */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={article.image}
                  alt={language === 'en' ? article.titleEn : article.titleHi}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${article.badgeColor}`}>
                    {article.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                    {article.category} • {article.readTime}
                  </span>
                  <h3 className="text-base sm:text-lg font-black leading-snug drop-shadow-md">
                    {language === 'en' ? article.titleEn : article.titleHi}
                  </h3>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 space-y-3">
                <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">
                  {language === 'en' ? article.subtitleEn : article.subtitleHi}
                </p>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-black text-[#1B5E20]">
                  <span>{language === 'en' ? 'Read Full Guidelines & Tips' : 'पूरा दिशानिर्देश पढ़ें'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Interactive Article Reading Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};

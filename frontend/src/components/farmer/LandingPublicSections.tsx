'use client';

import React from 'react';
import {
  ShieldCheck,
  Package,
  BarChart3,
  Users2,
  FileCheck2,
  Globe,
  HeartPulse,
  Building2,
  FileText,
  User,
  Calculator,
  Truck,
  FlaskConical,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';
import { IndiaUsersMapSection } from './IndiaUsersMapSection';

export const LandingPublicSections: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      iconColor: 'text-[#1B5E20]',
      titleEn: 'Maximum Residue Limits (MRL) Monitoring',
      titleHi: 'अधिकतम अवशेष सीमा (MRL) निगरानी',
      descEn: 'Advanced tracking and compliance monitoring for drug residues in livestock products.',
      descHi: 'पशुधन उत्पादों में दवा अवशेषों के लिए उन्नत ट्रैकिंग और वैधानिक अनुपालन निगरानी।',
    },
    {
      icon: Package,
      iconColor: 'text-[#1B5E20]',
      titleEn: 'Antimicrobial Usage (AMU) Management',
      titleHi: 'एंटीमाइक्रोबियल उपयोग (AMU) प्रबंधन',
      descEn: 'Comprehensive management of antimicrobial usage patterns and stewardship.',
      descHi: 'एंटीबायोटिक दवाओं के उपयोग पैटर्न और सुरक्षित प्रबंधन की व्यापक डिजिटल प्रणाली।',
    },
    {
      icon: BarChart3,
      iconColor: 'text-[#1B5E20]',
      titleEn: 'Real-time Analytics',
      titleHi: 'वास्तविक समय विश्लेषण',
      descEn: 'Data-driven insights for better decision making and compliance management.',
      descHi: 'सटीक निर्णय लेने और गुणवत्ता प्रबंधन के लिए डेटा-आधारित वास्तविक समय अंतर्दृष्टि।',
    },
    {
      icon: Users2,
      iconColor: 'text-[#1B5E20]',
      titleEn: 'Multi-stakeholder Platform',
      titleHi: 'बहु-हितधारक मंच',
      descEn: 'Connecting farmers, veterinarians, labs, and regulators in one ecosystem.',
      descHi: 'किसानों, पशु चिकित्सकों, प्रयोगशालाओं और नियामकों को एक एकीकृत मंच पर जोड़ना।',
    },
    {
      icon: FileCheck2,
      iconColor: 'text-[#1B5E20]',
      titleEn: 'Compliance Reporting',
      titleHi: 'अनुपालन रिपोर्टिंग',
      descEn: 'Automated compliance reports and audit trails for regulatory requirements.',
      descHi: 'नियामक आवश्यकताओं के लिए स्वचालित अनुपालन रिपोर्ट और डिजिटल ऑडिट ट्रेल्स।',
    },
    {
      icon: Globe,
      iconColor: 'text-[#1B5E20]',
      titleEn: 'National Coverage',
      titleHi: 'राष्ट्रव्यापी कवरेज',
      descEn: "Nationwide implementation supporting India's livestock sector digitization.",
      descHi: 'भारत के पशुधन और डेयरी क्षेत्र के डिजिटलीकरण का राष्ट्रव्यापी क्रियान्वयन।',
    },
  ];

  const workflowSteps = [
    {
      step: 1,
      icon: HeartPulse,
      titleEn: 'Digital Prescription',
      titleHi: 'डिजिटल ई-प्रिस्क्रिप्शन',
      fromToEn: 'Veterinarian ➔ Farmer',
      fromToHi: 'पशु चिकित्सक ➔ किसान',
      descEn: "Veterinarian issues a digital e-prescription via their portal to the Farmer's app, creating the first verifiable record.",
      descHi: 'पशु चिकित्सक किसान के ऐप पर डिजिटल ई-पर्चा जारी करते हैं, जिससे पहला सत्यापित रिकॉर्ड बनता है।',
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      step: 2,
      icon: Building2,
      titleEn: 'Medicine Dispensing',
      titleHi: 'दवा वितरण व सत्यापन',
      fromToEn: 'Farmer ➔ Pharmaceutical Retailer',
      fromToHi: 'किसान ➔ दवा विक्रेता',
      descEn: 'Farmer takes mobile app with e-prescription QR code to Retailer for medicine dispensing and verification.',
      descHi: 'किसान मोबाइल ऐप से ई-पर्चा QR कोड दिखाकर दवा विक्रेता से दवा प्राप्त व सत्यापित करते हैं।',
      iconBg: 'bg-cyan-50 text-cyan-700',
    },
    {
      step: 3,
      icon: FileText,
      titleEn: 'Sale Recording',
      titleHi: 'दवा बिक्री डिजिटल प्रविष्टि',
      fromToEn: 'Pharmaceutical Retailer ➔ Platform',
      fromToHi: 'दवा विक्रेता ➔ फार्मशील्ड',
      descEn: 'Retailer logs the sale against e-prescription ID on blockchain, recording which drug was sold, when, and to whom.',
      descHi: 'विक्रेता ई-प्रिस्क्रिप्शन ID के विरुद्ध दवा की बिक्री, बैच नंबर और तारीख दर्ज करता है।',
      iconBg: 'bg-blue-50 text-blue-700',
    },
    {
      step: 4,
      icon: User,
      titleEn: 'Treatment Logging',
      titleHi: 'उपचार व खुराक प्रविष्टि',
      fromToEn: 'Farmer ➔ FarmShield Platform',
      fromToHi: 'किसान ➔ फार्मशील्ड',
      descEn: "Farmer administers drug and logs treatment by scanning the bottle, linking it to the animal's unique ID.",
      descHi: 'किसान दवा देते समय बोतल का बारकोड स्कैन कर पशु के विशिष्ट ID से लिंक करते हैं।',
      iconBg: 'bg-purple-50 text-purple-700',
    },
    {
      step: 5,
      icon: Calculator,
      titleEn: 'MRL Calculation',
      titleHi: 'MRL निकासी अवधि गणना',
      fromToEn: 'Platform ➔ Farmer & Collector',
      fromToHi: 'फार्मशील्ड ➔ किसान व संकलन केंद्र',
      descEn: 'MRL Engine calculates withdrawal period automatically and sends RED/GREEN status alerts to ensure safety.',
      descHi: 'MRL इंजन निकासी समय की सटीक गणना कर दूध सुरक्षा के लिए RED/GREEN अलर्ट भेजता है।',
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      step: 6,
      icon: Truck,
      titleEn: 'Safe Collection',
      titleHi: 'सुरक्षित दूध संकलन',
      fromToEn: 'Collector ➔ FarmShield Platform',
      fromToHi: 'संकलन केंद्र ➔ फार्मशील्ड',
      descEn: 'Collector scans farm QR code, receives GREEN signal after withdrawal period, and triggers Smart Contract logging.',
      descHi: 'संकलन केंद्र पर पशु का QR स्कैन कर GREEN सिग्नल मिलने पर ही सुरक्षित दूध स्वीकार किया जाता है।',
      iconBg: 'bg-rose-50 text-rose-700',
    },
    {
      step: 7,
      icon: FlaskConical,
      titleEn: 'Lab Testing',
      titleHi: 'प्रयोगशाला गुणवत्ता जांच',
      fromToEn: 'Laboratory ➔ FarmShield Platform',
      fromToHi: 'प्रयोगशाला ➔ फार्मशील्ड',
      descEn: "Laboratory uploads official MRL test results as the final independent audit of the batch's digital record.",
      descHi: 'मान्यता प्राप्त प्रयोगशालाएं आधिकारिक MRL परीक्षण रिपोर्ट डिजिटल रूप से पोर्टल पर अपलोड करती हैं।',
      iconBg: 'bg-indigo-50 text-indigo-700',
    },
    {
      step: 8,
      icon: Shield,
      titleEn: 'Regulatory Oversight',
      titleHi: 'नियामक निगरानी व नियंत्रण',
      fromToEn: 'Regulator ➔ FarmShield Platform',
      fromToHi: 'सरकारी नियामक ➔ फार्मशील्ड',
      descEn: 'Regulator views dashboard with real-time heatmaps showing the complete, unbroken chain from prescription to lab results.',
      descHi: 'नियामक पर्चे से लेकर अंतिम परीक्षण तक पूरी पारदर्शी आपूर्ति श्रृंखला की निगरानी करते हैं।',
      iconBg: 'bg-teal-50 text-teal-700',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pt-10 pb-8 font-sans text-gray-900">
      {/* ========================================================================= */}
      {/* SECTION 1: COMPREHENSIVE LIVESTOCK MANAGEMENT (6 FEATURE CARDS) */}
      {/* ========================================================================= */}
      <section className="space-y-8 text-center max-w-6xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {language === 'en' ? 'Comprehensive Livestock Management' : 'व्यापक पशुधन एवं डेयरी प्रबंधन'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium max-w-2xl mx-auto">
            {language === 'en'
              ? "Supporting India's livestock sector with advanced digital tools for safety, compliance, and productivity"
              : 'सुरक्षा, अनुपालन और उत्पादकता के लिए उन्नत डिजिटल टूल्स के साथ भारत के पशुधन क्षेत्र को सशक्त बनाना'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-[#1B5E20] transition-colors leading-snug">
                    {language === 'en' ? feat.titleEn : feat.titleHi}
                  </h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {language === 'en' ? feat.descEn : feat.descHi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: HOW FARMSHIELD WORKS (8-STEP WORKFLOW CARDS) */}
      {/* ========================================================================= */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {language === 'en' ? 'How FarmShield Works' : 'फार्मशील्ड कैसे कार्य करता है'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium max-w-3xl mx-auto">
            {language === 'en'
              ? 'An integrated workflow connecting stakeholders for complete traceability and compliance in livestock management.'
              : 'पशुधन प्रबंधन में पूर्ण ट्रेसेबिलिटी और अनुपालन के लिए हितधारकों को जोड़ने वाला एक एकीकृत कार्यप्रवाह।'}
          </p>
        </div>

        {/* 8-Step Grid (4 in top row, 4 in bottom row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {workflowSteps.map((step) => {
            const IconComp = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-3 relative group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-black text-xs shadow-md">
                    {step.step}
                  </div>
                  <div className={`p-2 rounded-xl ${step.iconBg}`}>
                    <IconComp className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#1B5E20] transition-colors leading-tight">
                    {language === 'en' ? step.titleEn : step.titleHi}
                  </h3>

                  {/* Role Badge */}
                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {language === 'en' ? step.fromToEn : step.fromToHi}
                  </span>

                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed pt-1">
                    {language === 'en' ? step.descEn : step.descHi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: FARMSHIELD USERS ACROSS INDIA (INTERACTIVE GEOGRAPHIC MAP) */}
      {/* ========================================================================= */}
      <IndiaUsersMapSection />

      {/* ========================================================================= */}
      {/* SECTION 4: ABOUT FARMSHIELD INITIATIVE (OBJECTIVES + IMPACT STATS) */}
      {/* ========================================================================= */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {language === 'en' ? 'About FarmShield Initiative' : 'फार्मशील्ड राष्ट्रीय पहल के बारे में'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium max-w-3xl mx-auto">
            {language === 'en'
              ? "FarmShield is a comprehensive digital platform developed by the Ministry of Fisheries, Animal Husbandry & Dairying, Government of India, to ensure food safety and regulatory compliance in India's livestock sector."
              : 'फार्मशील्ड मत्स्यपालन, पशुपालन और डेयरी मंत्रालय, भारत सरकार द्वारा विकसित एक व्यापक डिजिटल मंच है, जो भारत के पशुधन क्षेत्र में खाद्य सुरक्षा और वैधानिक अनुपालन सुनिश्चित करता है।'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
          {/* Left Column: Key Objectives */}
          <div className="lg:col-span-6 space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-black text-gray-900">
              {language === 'en' ? 'Key Objectives' : 'मुख्य उद्देश्य'}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">
                    {language === 'en' ? 'Food Safety Assurance' : 'खाद्य सुरक्षा आश्वासन'}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'en'
                      ? 'Ensuring livestock products meet maximum residue limit standards.'
                      : 'पशुधन उत्पाद अधिकतम अवशेष सीमा मानकों का पूर्ण अनुपालन करते हैं।'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <FileCheck2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">
                    {language === 'en' ? 'Regulatory Compliance' : 'वैधानिक अनुपालन'}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'en'
                      ? 'Automated compliance monitoring and reporting system.'
                      : 'स्वचालित अनुपालन निगरानी और पारदर्शी रिपोर्टिंग प्रणाली।'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <BarChart3 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">
                    {language === 'en' ? 'Data-Driven Insights' : 'डेटा-संचालित अंतर्दृष्टि'}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'en'
                      ? 'Real-time analytics for better decision making.'
                      : 'उन्नत निर्णय लेने के लिए वास्तविक समय का डेटा विश्लेषण।'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Globe className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">
                    {language === 'en' ? 'National Implementation' : 'राष्ट्रव्यापी क्रियान्वयन'}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'en'
                      ? 'Nationwide coverage supporting digital transformation.'
                      : 'डिजिटल परिवर्तन को समर्थन देने वाला राष्ट्रव्यापी तंत्र।'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Impact Statistics Card (Light Green Card) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#C8E6C9]/40 p-8 sm:p-10 rounded-3xl border border-[#A5D6A7]/50 shadow-md flex flex-col justify-between space-y-6">
            <h3 className="text-lg font-black text-gray-900">
              {language === 'en' ? 'Impact Statistics' : 'राष्ट्रीय प्रभाव आंकड़े'}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[#1B5E20]">500K+</div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">
                  {language === 'en' ? 'Farmers Registered' : 'पंजीकृत किसान'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[#1B5E20]">2.5M+</div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">
                  {language === 'en' ? 'Animals Tracked' : 'ट्रैक किए गए पशु'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[#1B5E20]">10K+</div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">
                  {language === 'en' ? 'Veterinarians' : 'पशु चिकित्सक'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[#1B5E20]">1000+</div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">
                  {language === 'en' ? 'Laboratories' : 'जांच प्रयोगशालाएं'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#A5D6A7]/50 text-xs text-gray-600 font-bold flex items-center justify-between">
              <span>🇮🇳 National Livestock Mission</span>
              <span>100% Real-time Cloud Sync</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

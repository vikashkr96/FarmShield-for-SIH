'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, BookOpen } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';
import { ArticleModal, ArticleData } from './ArticleModal';

export const NewsAndArticlesSection: React.FC = () => {
  const { language } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);

  const newsArticles: (ArticleData & { date: string })[] = [
    {
      id: 'fssai-mrl-standards',
      date: 'Aug 20, 2026',
      image: '/images/cows-pasture.jpg',
      category: 'Dairy Food Safety',
      readTime: '4 min read',
      badge: 'FSSAI Statutory Standard',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      titleEn: 'FSSAI Issues Revised Maximum Residue Limits (MRL) for Dairy Milk & Animal Products',
      titleHi: 'डेयरी दूध और पशु उत्पादों के लिए FSSAI ने जारी किए संशोधित MRL सुरक्षा मानक',
      subtitleEn: 'Strict enforcement of statutory antibiotic withdrawal periods to ensure chemical-free, export-quality milk across all dairy cooperatives.',
      subtitleHi: 'सभी डेयरी संकलन केंद्रों पर रासायनिक अवशेष मुक्त दूध सुनिश्चित करने के लिए निकासी समय का कड़ाई से पालन।',
      contentEn: [
        {
          sectionTitle: 'Understanding the New FSSAI MRL Tolerances',
          paragraphs: [
            'The Food Safety and Standards Authority of India (FSSAI) in coordination with Codex Alimentarius has reinforced Maximum Residue Limits for common veterinary antimicrobials including Amoxicillin, Oxytetracycline, and Enrofloxacin.',
            'Milk containing antibiotic residues above statutory tolerances will face immediate rejection at computerized chilling centers, protecting public health from antimicrobial resistance (AMR).',
          ],
          tips: [
            'Never mix milk from an animal undergoing active antibiotic treatment with bulk tanks.',
            'Check your FarmShield digital passport before each milk dispatch.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'FSSAI के नए MRL सुरक्षा मानक',
          paragraphs: [
            'FSSAI और कोडेक्स द्वारा दूध में एंटीबायोटिक दवाओं के अधिकतम कानूनी अवशेष की सीमाएं निर्धारित की गई हैं। निर्धारित समय से पहले निकाला गया दूध परीक्षण में अमान्य घोषित कर दिया जाएगा।',
          ],
          tips: [
            'उपचार के दौरान पशु का दूध अलग रखें और सामान्य दूध में न मिलाएं।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Mandatory 5-7 days milk withdrawal for standard beta-lactams.',
        'Prevents dairy rejection penalties and ensures consumer safety.',
        'Full compatibility with automated testing at milk collection booths.',
      ],
      keyTakeawaysHi: [
        'एंटीबायोटिक दवाओं में 5 से 7 दिन की निकासी अवधि का पूरा पालन करें।',
        'दूध रिजेक्ट होने के आर्थिक नुकसान से बचें।',
      ],
    },
    {
      id: 'digital-ear-tagging-ndlm',
      date: 'Aug 18, 2026',
      image: '/images/ear-tagged-calves.jpg',
      category: 'National Livestock Mission',
      readTime: '3 min read',
      badge: 'NDLM Standard',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      titleEn: 'Digital Ear-Tagging & Encrypted QR Passports: Revolutionizing Herd Traceability',
      titleHi: 'डिजिटल ईयर-टैगिंग और QR हेल्थ पासपोर्ट: पशुधन ट्रेसेबिलिटी में नया डिजिटल युग',
      subtitleEn: 'How tamper-proof digital ear tags paired with camera-scannable QR tokens streamline veterinary audits and collection verification.',
      subtitleHi: 'डिजिटल ईयर-टैग किस प्रकार पशु स्वास्थ्य इतिहास और दूध संकलन सत्यापन को 1 सेकंड में सुलभ बनाते हैं।',
      contentEn: [
        {
          sectionTitle: 'Universal Digital Identification for Cattle & Buffaloes',
          paragraphs: [
            'Under the National Digital Livestock Mission, each livestock animal is assigned a tamper-evident visual tag and encrypted QR code linking directly to its digital health record on the FarmShield cloud.',
            'Veterinarians and milk inspectors can scan the tag with any standard smartphone to verify vaccination status, treatment timeline, and milk safety clearance in real time.',
          ],
          tips: [
            'Ensure ear tags are attached securely in the central cartilage.',
            'Download and laminate your animal’s QR card directly from the FarmShield portal.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'पशुधन के लिए डिजिटल पहचान',
          paragraphs: [
            'प्रत्येक पशु को एक विशिष्ट QR कोड आवंटित होता है, जिसे मोबाइल कैमरे से स्कैन करके उसका पूरा इलाज और दूध सुरक्षा स्थिति 1 सेकंड में जांची जा सकती है।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Instant 1-second camera verification without proprietary scanner hardware.',
        'Eliminates lost paper prescriptions and handwritten treatment errors.',
      ],
      keyTakeawaysHi: [
        'कागजी पर्चियों के खोने की समस्या से मुक्ति।',
        'मोबाइल से तुरंत 1 सेकंड में लाइव सत्यापन।',
      ],
    },
    {
      id: 'buffalo-mastitis-management',
      date: 'Aug 15, 2026',
      image: '/images/buffalo-calf.jpg',
      category: 'Buffalo Herd Health',
      readTime: '4 min read',
      badge: 'Clinical Protocol',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      titleEn: 'Murrah Buffalo Health: Managing Mastitis Therapy & High-Fat Milk Safety',
      titleHi: 'मुर्राह भैंस स्वास्थ्य: थनैला रोग उपचार और उच्च वसायुक्त दूध सुरक्षा प्रबंधन',
      subtitleEn: 'Clinical dosage guidelines and drug elimination dynamics in dairy buffaloes to safeguard fat-rich milk yield.',
      subtitleHi: 'भैंसों में सटीक दवा खुराक, थनैला नियंत्रण और शुद्ध दूध उत्पादन के वैज्ञानिक दिशानिर्देश।',
      contentEn: [
        {
          sectionTitle: 'Buffalo Physiology and Drug Half-Life',
          paragraphs: [
            'Dairy buffaloes exhibit different pharmacokinetics compared to cattle due to higher lipid content in milk and distinct metabolic rates. Adhering to weight-calibrated dosing prevents lingering sub-therapeutic residues.',
          ],
          tips: [
            'Always measure animal live weight before administering parenteral antibiotics.',
            'Maintain strict hygiene during milking to prevent recurring mastitis.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'भैंसों में सुरक्षित दवा उपयोग',
          paragraphs: [
            'भैंस के दूध में अधिक वसा होने के कारण कुछ दवाएं शरीर में अधिक समय तक रह सकती हैं। निकासी समय का सटीक पालन अत्यंत आवश्यक है।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Adjust withdrawal timelines based on high fat percentage.',
        'Prevent repeat treatments through hygienic pre-milking teat sanitization.',
      ],
      keyTakeawaysHi: [
        'वजन के अनुसार सही दवा खुराक का प्रयोग करें।',
        'दूध दोहन के समय स्वच्छता का विशेष ध्यान रखें।',
      ],
    },
    {
      id: 'aquaculture-biomass-stewardship',
      date: 'Aug 12, 2026',
      image: '/images/aquaculture-pond.png',
      category: 'Aquaculture Stewardship',
      readTime: '5 min read',
      badge: 'Fishery Guidelines',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      titleEn: 'Aquaculture Pond Biomass: Collective Water Dosing & Zero-Residue Seafood Harvest',
      titleHi: 'मत्स्य पालन तालाब बायोमास: सामूहिक जल दवा प्रबंधन व रसायन मुक्त मछली उत्पादन',
      subtitleEn: 'Calculating chemical dosage per metric ton of water biomass and conducting mandatory pre-harvest withdrawal checks.',
      subtitleHi: 'तालाब बायोमास में प्रति मीट्रिक टन सुरक्षित दवा उपयोग व मछली निकासी पूर्व जांच।',
      contentEn: [
        {
          sectionTitle: 'Collective Biological Unit Management in Fisheries',
          paragraphs: [
            'In aquaculture, individual treatment is impossible. Water bodies are treated as collective biomass units. FarmShield calculates exact therapeutic dosage per metric ton of biomass and enforces whole-pond harvest clearance dates.',
          ],
          tips: [
            'Never harvest pond biomass until the full statutory clearance date is reached.',
            'Strict zero-tolerance for banned nitrofurans and chloramphenicol.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'तालाब बायोमास का सामूहिक प्रबंधन',
          paragraphs: [
            'मत्स्य पालन में दवा पूरे तालाब के पानी और कुल बायोमास (किलोग्राम) के आधार पर दी जाती है। पूरी फसल निकालने से पहले निकासी समय का पालन अनिवार्य है।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Enforces statutory chemical bans for export-grade seafood certification.',
        'Calculates dosage dynamically by water volume and total biomass weight.',
      ],
      keyTakeawaysHi: [
        'प्रतिबंधित रसायनों का कदापि प्रयोग न करें।',
        'मत्स्य निर्यात के लिए प्रमाणित गुणवत्ता प्राप्त करें।',
      ],
    },
    {
      id: 'national-amr-surveillance',
      date: 'Aug 10, 2026',
      image: '/images/cows-pasture.jpg',
      category: 'One Health Policy',
      readTime: '3 min read',
      badge: 'National Policy',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      titleEn: 'National AMR Surveillance: Dual XGBoost Machine Learning for AMU Overuse Prevention',
      titleHi: 'राष्ट्रीय AMR निगरानी: एंटीबायोटिक अति-उपयोग रोकने हेतु डुअल XGBoost AI इंजन',
      subtitleEn: 'How automated AI risk scoring assists veterinary doctors in selecting first-line narrow-spectrum antimicrobials.',
      subtitleHi: 'मशीन लर्निंग मॉडल किस प्रकार पशु चिकित्सकों को एंटीबायोटिक दवाओं के सही चयन में सहायता करता है।',
      contentEn: [
        {
          sectionTitle: 'AI-Powered Decision Support in Veterinary Practice',
          paragraphs: [
            'FarmShield incorporates two specialized machine learning models (Model A for AMU Overuse Risk and Model B for MRL Non-Compliance Risk) to identify high-risk prescriptions before administration.',
          ],
          tips: [
            'Prioritize narrow-spectrum antibiotics over critical broad-spectrum agents.',
            'Consult the integrated AI risk indicators before prescribing multiple drug courses.',
          ],
        },
      ],
      contentHi: [
        {
          sectionTitle: 'पशु चिकित्सा में AI निर्णय समर्थन',
          paragraphs: [
            'फार्मशील्ड में दो मशीन लर्निंग मॉडल शामिल हैं जो एंटीबायोटिक दवाओं के अत्यधिक उपयोग को रोकते हैं और सुरक्षित उपचार सुझाते हैं।',
          ],
        },
      ],
      keyTakeawaysEn: [
        'Macro F1 score of 0.82 for compliance risk prediction.',
        'Protects critically important antimicrobials for human and veterinary medicine.',
      ],
      keyTakeawaysHi: [
        'सटीक AI पूर्वानुमान द्वारा दवाओं के सुरक्षित उपयोग में मदद।',
      ],
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto py-12 sm:py-16 space-y-8 font-sans">
      {/* Top Header Badge & Title Matching Screenshot */}
      <div className="text-center space-y-2">
        <div className="inline-block">
          <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
            {language === 'en' ? 'OUR BLOG' : 'ताज़ा समाचार एवं लेख'}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          News & <span className="font-serif italic font-normal text-[#1B5E20]">Articles</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-2xl mx-auto">
          {language === 'en'
            ? 'Stay informed with the latest statutory guidelines, dairy safety research, and national livestock news.'
            : 'नवीनतम वैधानिक दिशानिर्देशों, डेयरी सुरक्षा अनुसंधान और राष्ट्रीय पशुधन समाचारों से अपडेट रहें।'}
        </p>
      </div>

      {/* Interactive News & Articles List Matching Screenshot */}
      <div className="space-y-4 divide-y divide-gray-100 bg-white rounded-3xl border border-gray-200/80 shadow-lg p-4 sm:p-8">
        {newsArticles.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="pt-4 first:pt-0 pb-4 first:pb-4 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 group cursor-pointer hover:bg-gray-50/80 p-3 sm:p-4 rounded-2xl transition-all"
          >
            {/* Left Thumbnail Image */}
            <div className="w-24 sm:w-28 h-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-900 border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img
                src={item.image}
                alt={language === 'en' ? item.titleEn : item.titleHi}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Center Content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                <span>{item.date}</span>
                <span>•</span>
                <span className="text-[#1B5E20] font-black">{item.category}</span>
                <span>•</span>
                <span>{item.readTime}</span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#1B5E20] transition-colors leading-snug">
                {language === 'en' ? item.titleEn : item.titleHi}
              </h3>

              <p className="text-xs text-gray-500 font-medium line-clamp-1">
                {language === 'en' ? item.subtitleEn : item.subtitleHi}
              </p>
            </div>

            {/* Right Action Button */}
            <div className="shrink-0 flex items-center gap-1 text-xs font-black text-orange-600 group-hover:text-[#1B5E20] transition-colors self-end sm:self-center">
              <span>{language === 'en' ? 'Read' : 'पढ़ें'}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Full Reading Article Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </section>
  );
};

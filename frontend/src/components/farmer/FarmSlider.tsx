'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface Slide {
  id: string;
  image: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
}

export const FarmSlider: React.FC = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides: Slide[] = [
    {
      id: 'dairy-cows',
      image: '/images/cows-pasture.jpg',
      titleEn: 'Zero-Residue Dairy Farming & MRL Compliance',
      titleHi: 'रसायन मुक्त डेयरी उत्पादन व MRL सुरक्षा मानक',
      descEn: 'Ensuring 100% statutory adherence to withdrawal times so every drop of milk is pure, residue-free, and safe for society.',
      descHi: 'दवा निकासी समय का पालन करके हर बूंद दूध को रासायनिक अवशेषों से पूरी तरह सुरक्षित और मानक अनुरूप बनाएं।',
    },
    {
      id: 'ear-tagged-calves',
      image: '/images/ear-tagged-calves.jpg',
      titleEn: 'Instant QR Health Passports for Every Cattle',
      titleHi: 'प्रत्येक पशु के लिए तत्काल QR डिजिटल हेल्थ पासपोर्ट',
      descEn: 'Assign unique tamper-proof ear-tag IDs linked to treatment history, antibiotic withdrawal countdowns, and milk collection verification.',
      descHi: 'प्रत्येक पशु को विशिष्ट QR टैग आवंटित करें जिससे दवा का इतिहास, वापसी समय और दूध संकलन सत्यापन तुरंत देखा जा सके।',
    },
    {
      id: 'buffalo-herd',
      image: '/images/buffalo-calf.jpg',
      titleEn: 'High-Yield Buffalo Herd Monitoring & Safe Therapy',
      titleHi: 'उच्च उपज भैंस डेयरी प्रबंधन व सुरक्षित उपचार',
      descEn: 'Track mastitis treatments, dosage logs, and automated safe clearance dates tailored to dairy buffalo physiology.',
      descHi: 'थनैल व अन्य बीमारियों में सटीक दवा खुराक, उपचार इतिहास और सुरक्षित दूध निकासी तारीख का स्वचालित हिसाब रखें।',
    },
    {
      id: 'aquaculture-pond',
      image: '/images/aquaculture-pond.png',
      titleEn: 'United Fishery Pond Biomass & Zero-Residue Harvest',
      titleHi: 'सामूहिक मत्स्य तालाब बायोमास व रसायन मुक्त निकासी',
      descEn: 'Manage collective pond water dosing per metric ton and pre-harvest chemical testing for clean aquaculture exports.',
      descHi: 'मत्स्य तालाब बायोमास में प्रति मीट्रिक टन सुरक्षित दवा उपयोग व निकासी से पूर्व रासायनिक जांच प्रबंधन।',
    },
  ];

  // Auto-advance slides every 3 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-xl border-2 border-[#1B5E20]/30 select-none group bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Crisp, Crystal Clear Image Container */}
      <div className="relative h-[280px] sm:h-[320px] md:h-[350px] w-full overflow-hidden">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.titleEn}
              className="w-full h-full object-cover object-center"
              style={{ imageRendering: 'auto' }}
            />
            {/* Subtle bottom gradient preserving 100% crispness */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Content Overlay (Bottom Only) */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end text-white z-10 pointer-events-none">
          {/* Bottom Title & Description */}
          <div className="space-y-1.5 max-w-2xl pb-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] leading-tight">
              {language === 'en' ? currentSlide.titleEn : currentSlide.titleHi}
            </h2>
            <p className="text-xs sm:text-sm text-gray-100 font-bold leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] line-clamp-2">
              {language === 'en' ? currentSlide.descEn : currentSlide.descHi}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Pagination Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-7 bg-[#A5D6A7]' : 'w-1.5 bg-white/60 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

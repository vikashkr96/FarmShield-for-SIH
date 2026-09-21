'use client';

import React, { useState } from 'react';
import { Play, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

export const FarmShieldVideoShowcase: React.FC = () => {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // User provided YouTube demonstration video link (HTCLwz5mdZM)
  const youtubeEmbedUrl = 'https://www.youtube.com/embed/HTCLwz5mdZM?autoplay=1&rel=0';

  return (
    <section className="w-full max-w-5xl mx-auto py-6 sm:py-8 space-y-4 font-sans text-center">
      {/* Section Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {language === 'en' ? 'Watch FarmShield in Action' : 'फार्मशील्ड को कार्य करते देखें'}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium max-w-2xl mx-auto">
          {language === 'en'
            ? 'Discover how FarmShield is transforming livestock management across India'
            : 'जानिए कैसे फार्मशील्ड पूरे भारत में पशुधन और डेयरी प्रबंधन में डिजिटल क्रांति ला रहा है'}
        </p>
      </div>

      {/* Video Display Container */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 bg-slate-950 group">
        {isPlaying ? (
          <iframe
            className="w-full h-full"
            src={youtubeEmbedUrl}
            title="FarmShield: Digital Revolution in Indian Livestock Sector"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
          >
            {/* Background Thumbnail Image with Indian Flag & Mobile Mockup Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('/images/cows-pasture.jpg')`,
              }}
            />
            {/* Dark & Vibrant Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />

            {/* Video Title Header Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-left z-10 pointer-events-none">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-md">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm md:text-base font-black leading-tight drop-shadow-md">
                    FarmShield: Digital Revolution in Indian Livestock Sector
                  </h3>
                  <p className="text-[10px] sm:text-xs text-emerald-300 font-bold">
                    फार्मशील्ड: भारतीय पशुधन क्षेत्र में डिजिटल क्रांति • DAHD Govt of India
                  </p>
                </div>
              </div>
            </div>

            {/* Central YouTube Style Play Button */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-2xl bg-red-600 group-hover:bg-red-700 flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110 border border-white/20">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
              <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 drop-shadow">
                Click to Watch Demonstration Video
              </span>
            </div>

            {/* Bottom YouTube Badge */}
            <a
              href="https://youtu.be/HTCLwz5mdZM"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 transition-colors"
            >
              <span>Watch on</span>
              <span className="text-red-500 font-black">YouTube</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

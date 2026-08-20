'use client';

import React, { useState } from 'react';
import { X, Video, Sparkles, ExternalLink, Play, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface VideoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoShowcaseModal: React.FC<VideoShowcaseModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const chapters = [
    {
      time: '00:00 - 01:30',
      title: 'Project Problem Statement & Ministry of Fisheries, Animal Husbandry & Dairying Goals',
      desc: 'Addressing Antimicrobial Resistance (AMR) and Maximum Residue Limits (MRL) in dairy livestock & fisheries.',
    },
    {
      time: '01:30 - 03:15',
      title: 'Farmer Digital Workflow & Instant QR Food Safety Passport',
      desc: 'Registering cattle, buffalo, and united fishery pond units with instant high-res QR ear-tag generation.',
    },
    {
      time: '03:15 - 05:00',
      title: 'Dual Machine Learning Decision Engine (Model A & B)',
      desc: 'XGBoost Multi-Class Classifier predicting AMU Overuse Risk (Macro F1 0.77) and MRL Compliance Risk (Macro F1 0.82) with SHAP explainability.',
    },
    {
      time: '05:00 - 06:30',
      title: 'Milk Collection Center & Supply Chain Inspection',
      desc: 'Live camera scanning of animal QR tokens to verify withdrawal clearance before milk collection or fish harvest.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl my-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[11px] font-black text-[#1B5E20]">
            <Sparkles className="w-3.5 h-3.5 text-[#1B5E20]" />
            <span>Ministry of Fisheries, Animal Husbandry & Dairying • SIH 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B5E20] tracking-tight">
            Portal Video Demonstration & Solution Walkthrough
          </h1>
          <p className="text-xs text-gray-600 font-bold">
            Interactive demonstration of Maximum Residue Limits (MRL) & Antimicrobial Usage (AMU) monitoring system.
          </p>
        </div>

        {/* Video Player Display Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#1B5E20] shadow-2xl flex items-center justify-center group">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/HTCLwz5mdZM?autoplay=0&rel=0"
            title="FarmShield MRL & AMU Portal Walkthrough"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Chapters & Architectural Features */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1B5E20]" />
            <span>Video Chapters & Key System Capabilities</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chapters.map((ch, idx) => (
              <div key={idx} className="p-3.5 bg-[#FFFDF5] border border-gray-200 hover:border-[#1B5E20] rounded-2xl space-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#1B5E20] text-white">
                    {ch.time}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#1B5E20]" />
                </div>
                <h4 className="text-xs font-black text-gray-900">{ch.title}</h4>
                <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Link & Close */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200 text-xs">
          <a
            href="https://youtu.be/HTCLwz5mdZM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-black text-[#1B5E20] hover:underline"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1B5E20] text-white font-black hover:bg-[#2E7D32] transition-colors"
          >
            Close Video
          </button>
        </div>
      </div>
    </div>
  );
};

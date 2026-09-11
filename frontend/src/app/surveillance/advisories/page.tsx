'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Radio, Users } from 'lucide-react';

export default function AdvisoriesBroadcastPage() {
  const [district, setDistrict] = useState('Pune');
  const [block, setBlock] = useState('Haveli');
  const [disease, setDisease] = useState('Foot-and-Mouth Disease (FMD)');
  const [channels, setChannels] = useState({ sms: true, inApp: true, ivrCall: false });
  const [sent, setSent] = useState(false);

  const englishAdvisory = `[ANIMAL HEALTH ALERT - ${district.toUpperCase()}] Suspected outbreak of ${disease} reported in ${block} block. Isolate infected cattle immediately. Do not sell unpasteurized milk. Ring vaccination camp open tomorrow at Subcenter. Helpline: 1800-VET-CARE.`;

  const hindiAdvisory = `[पशु स्वास्थ्य चेतावनी - ${district}] ${block} ब्लॉक में ${disease} का प्रकोप देखा गया है। प्रभावित पशुओं को तुरंत अलग करें। कच्चा दूध न बेचें। नजदीकी पशु औषधालय में मुफ्त टीकाकरण कराएं।`;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      alert(`Broadcast dispatched to 4,820 registered livestock owners in ${district} - ${block} block via SMS & App.`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/surveillance/map" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Geo-Targeted Multilingual Advisory Broadcast
            </h1>
            <p className="text-xs text-slate-400">
              Dispatches Instant Containment Warnings via NIC/CDAC SMS, Voice Calls & App Push Notifications
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleDispatch} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target District</label>
              <select 
                value={district} 
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="Pune">Pune (Maharashtra)</option>
                <option value="Mathura">Mathura (Uttar Pradesh)</option>
                <option value="Ludhiana">Ludhiana (Punjab)</option>
                <option value="Baramati">Baramati (Maharashtra)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target Block</label>
              <select 
                value={block} 
                onChange={(e) => setBlock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="Haveli">Haveli Block</option>
                <option value="Manjari">Manjari Sub-block</option>
                <option value="Govardhan">Govardhan Block</option>
                <option value="Jagraon">Jagraon Block</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Disease Threat</label>
              <select 
                value={disease} 
                onChange={(e) => setDisease(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="Foot-and-Mouth Disease (FMD)">Foot-and-Mouth Disease (FMD)</option>
                <option value="Anthrax">Anthrax (Zoonotic Alert)</option>
                <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                <option value="Hemorrhagic Septicemia">Hemorrhagic Septicemia (HS)</option>
              </select>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Delivery Mechanisms</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={channels.sms} 
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0" 
                />
                SMS Broadcast (Telecom DLT)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={channels.inApp} 
                  onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0" 
                />
                In-App Push Alert
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={channels.ivrCall} 
                  onChange={(e) => setChannels({ ...channels, ivrCall: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0" 
                />
                Automated IVR Outbound Voice Call
              </label>
            </div>
          </div>

          {/* Bilingual Preview Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> English Advisory Preview (SMS)
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">{englishAdvisory}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Hindi Advisory Preview (हिंदी संदेश)
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{hindiAdvisory}</p>
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" /> DISPATCH EMERGENCY CONTAINMENT BROADCAST
          </button>
        </form>
      </div>
    </div>
  );
}

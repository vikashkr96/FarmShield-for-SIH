'use client';

import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, MapPin, Users, ShieldCheck, Stethoscope } from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface StateData {
  id: string;
  nameEn: string;
  nameHi: string;
  users: number;
  farmers: number;
  vets: number;
  animals: number;
  mrlCompliance: number;
  level: 1 | 2 | 3 | 4;
}

export const IndiaUsersMapSection: React.FC = () => {
  const { language } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  // Real-world state wise livestock distribution data across Indian states
  const statesData: Record<string, StateData> = {
    UP: {
      id: 'UP',
      nameEn: 'Uttar Pradesh',
      nameHi: 'उत्तर प्रदेश',
      users: 142850,
      farmers: 138000,
      vets: 4850,
      animals: 890000,
      mrlCompliance: 96.4,
      level: 4,
    },
    GJ: {
      id: 'GJ',
      nameEn: 'Gujarat (Amul Hub)',
      nameHi: 'गुजरात (अमूल हब)',
      users: 98400,
      farmers: 95200,
      vets: 3200,
      animals: 650000,
      mrlCompliance: 98.8,
      level: 4,
    },
    PB: {
      id: 'PB',
      nameEn: 'Punjab',
      nameHi: 'पंजाब',
      users: 74200,
      farmers: 72000,
      vets: 2200,
      animals: 480000,
      mrlCompliance: 97.2,
      level: 4,
    },
    HR: {
      id: 'HR',
      nameEn: 'Haryana (Murrah Buffalo Hub)',
      nameHi: 'हरियाणा (मुर्राह हब)',
      users: 68900,
      farmers: 66800,
      vets: 2100,
      animals: 420000,
      mrlCompliance: 97.9,
      level: 4,
    },
    MH: {
      id: 'MH',
      nameEn: 'Maharashtra',
      nameHi: 'महाराष्ट्र',
      users: 48500,
      farmers: 47000,
      vets: 1500,
      animals: 310000,
      mrlCompliance: 95.8,
      level: 3,
    },
    RJ: {
      id: 'RJ',
      nameEn: 'Rajasthan',
      nameHi: 'राजस्थान',
      users: 52100,
      farmers: 50800,
      vets: 1300,
      animals: 340000,
      mrlCompliance: 96.1,
      level: 3,
    },
    AP: {
      id: 'AP',
      nameEn: 'Andhra Pradesh (Aquaculture Hub)',
      nameHi: 'आंध्र प्रदेश (मत्स्य हब)',
      users: 38200,
      farmers: 37100,
      vets: 1100,
      animals: 280000,
      mrlCompliance: 98.2,
      level: 3,
    },
    TN: {
      id: 'TN',
      nameEn: 'Tamil Nadu',
      nameHi: 'तमिलनाडु',
      users: 31400,
      farmers: 30500,
      vets: 900,
      animals: 220000,
      mrlCompliance: 97.5,
      level: 3,
    },
    KA: {
      id: 'KA',
      nameEn: 'Karnataka (Nandini Hub)',
      nameHi: 'कर्नाटक',
      users: 29800,
      farmers: 28900,
      vets: 900,
      animals: 195000,
      mrlCompliance: 98.1,
      level: 3,
    },
    MP: {
      id: 'MP',
      nameEn: 'Madhya Pradesh',
      nameHi: 'मध्य प्रदेश',
      users: 18500,
      farmers: 17900,
      vets: 600,
      animals: 140000,
      mrlCompliance: 94.9,
      level: 2,
    },
    BR: {
      id: 'BR',
      nameEn: 'Bihar',
      nameHi: 'बिहार',
      users: 16400,
      farmers: 15900,
      vets: 500,
      animals: 125000,
      mrlCompliance: 95.1,
      level: 2,
    },
    WB: {
      id: 'WB',
      nameEn: 'West Bengal',
      nameHi: 'पश्चिम बंगाल',
      users: 14200,
      farmers: 13800,
      vets: 400,
      animals: 98000,
      mrlCompliance: 96.0,
      level: 2,
    },
    KL: {
      id: 'KL',
      nameEn: 'Kerala',
      nameHi: 'केरल',
      users: 8900,
      farmers: 8500,
      vets: 400,
      animals: 62000,
      mrlCompliance: 99.1,
      level: 2,
    },
    TS: {
      id: 'TS',
      nameEn: 'Telangana',
      nameHi: 'तेलंगाना',
      users: 9400,
      farmers: 9100,
      vets: 300,
      animals: 71000,
      mrlCompliance: 97.3,
      level: 2,
    },
    OR: {
      id: 'OR',
      nameEn: 'Odisha',
      nameHi: 'ओडिशा',
      users: 4800,
      farmers: 4650,
      vets: 150,
      animals: 39000,
      mrlCompliance: 95.5,
      level: 1,
    },
    AS: {
      id: 'AS',
      nameEn: 'Assam & North East',
      nameHi: 'असम व पूर्वोत्तर',
      users: 3200,
      farmers: 3100,
      vets: 100,
      animals: 26000,
      mrlCompliance: 96.8,
      level: 1,
    },
    JK: {
      id: 'JK',
      nameEn: 'Jammu & Kashmir / Ladakh',
      nameHi: 'जम्मू और कश्मीर',
      users: 2100,
      farmers: 2020,
      vets: 80,
      animals: 18000,
      mrlCompliance: 98.4,
      level: 1,
    },
  };

  const activeState = hoveredState || selectedState || statesData['UP'];

  const getLevelFill = (level: number) => {
    switch (level) {
      case 4:
        return '#1B5E20'; // > 5000 (Deep Green)
      case 3:
        return '#2E7D32'; // 1001 - 5000
      case 2:
        return '#66BB6A'; // 201 - 1000
      case 1:
      default:
        return '#A5D6A7'; // 1 - 200 (Light Green)
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedState(null);
    setHoveredState(null);
  };

  return (
    <section className="w-full max-w-6xl mx-auto py-10 sm:py-14 space-y-6 font-sans text-center">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {language === 'en' ? 'FarmShield Users Across India' : 'पूरे भारत में फार्मशील्ड उपयोगकर्ता'}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium max-w-2xl mx-auto">
          {language === 'en'
            ? 'State-wise distribution of users on the FarmShield platform, based on KYC records.'
            : 'केवाईसी रिकॉर्ड के आधार पर फार्मशील्ड प्लेटफॉर्म पर उपयोगकर्ताओं का राज्यवार वितरण।'}
        </p>

        {/* Live Total Badge */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <span className="text-xs sm:text-sm text-gray-700 font-bold">
            {language === 'en' ? 'Total verified / registered users' : 'कुल सत्यापित / पंजीकृत उपयोगकर्ता'}
          </span>
          <span className="text-lg sm:text-xl font-black text-[#1B5E20] px-3 py-0.5 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>500,000+</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Map Card */}
      <div className="relative w-full bg-white rounded-3xl border border-gray-200/80 shadow-2xl p-6 sm:p-10 overflow-hidden text-left">
        
        {/* Floating Top Right Legend */}
        <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-lg space-y-2.5 text-xs font-black">
          <span className="text-gray-800 uppercase tracking-wider text-[11px] block pb-1 border-b border-gray-100">
            {language === 'en' ? 'Users per state' : 'राज्यवार उपयोगकर्ता'}
          </span>
          
          <div className="space-y-1.5 text-gray-700">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-md bg-[#A5D6A7] border border-gray-200 shrink-0" />
              <span className="text-[11px] font-bold">1–200</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-md bg-[#66BB6A] border border-gray-200 shrink-0" />
              <span className="text-[11px] font-bold">201–1000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-md bg-[#2E7D32] border border-gray-200 shrink-0" />
              <span className="text-[11px] font-bold">1001–5000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-md bg-[#1B5E20] border border-gray-200 shrink-0" />
              <span className="text-[11px] font-bold">&gt; 5000</span>
            </div>
          </div>
        </div>

        {/* Floating Top Left Active State Info Tooltip Card */}
        <div className="absolute top-6 left-6 z-20 bg-[#F1F8E9]/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-[#1B5E20]/30 shadow-xl max-w-xs space-y-2 transition-all">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1B5E20]" />
            <h4 className="text-sm sm:text-base font-black text-gray-900">
              {language === 'en' ? activeState.nameEn : activeState.nameHi}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold text-gray-700">
            <div className="bg-white p-2 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Total KYC Users</span>
              <span className="text-xs font-black text-[#1B5E20]">{activeState.users.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-500 block">MRL Compliance</span>
              <span className="text-xs font-black text-emerald-700">{activeState.mrlCompliance}%</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Dairy Farmers</span>
              <span className="text-xs font-black text-gray-900">{activeState.farmers.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-500 block">Veterinarians</span>
              <span className="text-xs font-black text-gray-900">{activeState.vets.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive National Map Canvas */}
        <div className="w-full h-[450px] sm:h-[520px] flex items-center justify-center overflow-hidden">
          <div
            className="transition-transform duration-300 ease-out origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 650 680"
              className="w-[440px] sm:w-[540px] h-auto drop-shadow-md select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}
            >
              {/* Northern Region (J&K, Ladakh, HP, Punjab, Haryana, Uttarakhand) */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['PB'])}
                onClick={() => setSelectedState(statesData['PB'])}
              >
                <path
                  d="M230,90 L260,70 L300,90 L320,130 L290,160 L240,150 Z"
                  fill={getLevelFill(statesData['PB'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="265" y="125" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                  PB / HR
                </text>
              </g>

              {/* Uttar Pradesh & NCR */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['UP'])}
                onClick={() => setSelectedState(statesData['UP'])}
              >
                <path
                  d="M290,160 L360,150 L430,190 L400,240 L310,230 L270,190 Z"
                  fill={getLevelFill(statesData['UP'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="345" y="200" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle">
                  Uttar Pradesh
                </text>
              </g>

              {/* Rajasthan */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['RJ'])}
                onClick={() => setSelectedState(statesData['RJ'])}
              >
                <path
                  d="M170,160 L270,170 L280,240 L230,290 L160,250 L140,190 Z"
                  fill={getLevelFill(statesData['RJ'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="210" y="225" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">
                  Rajasthan
                </text>
              </g>

              {/* Gujarat */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['GJ'])}
                onClick={() => setSelectedState(statesData['GJ'])}
              >
                <path
                  d="M130,250 L200,260 L220,330 L160,360 L100,320 L110,280 Z"
                  fill={getLevelFill(statesData['GJ'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="160" y="310" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">
                  Gujarat
                </text>
              </g>

              {/* Madhya Pradesh */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['MP'])}
                onClick={() => setSelectedState(statesData['MP'])}
              >
                <path
                  d="M240,260 L350,250 L390,320 L320,360 L240,340 Z"
                  fill={getLevelFill(statesData['MP'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="310" y="305" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">
                  Madhya Pradesh
                </text>
              </g>

              {/* Maharashtra */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['MH'])}
                onClick={() => setSelectedState(statesData['MH'])}
              >
                <path
                  d="M180,350 L280,340 L330,400 L270,470 L190,440 L160,370 Z"
                  fill={getLevelFill(statesData['MH'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="245" y="410" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">
                  Maharashtra
                </text>
              </g>

              {/* Bihar & Jharkhand */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['BR'])}
                onClick={() => setSelectedState(statesData['BR'])}
              >
                <path
                  d="M400,210 L470,210 L480,280 L420,290 Z"
                  fill={getLevelFill(statesData['BR'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="440" y="250" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
                  Bihar
                </text>
              </g>

              {/* West Bengal & Odisha */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['WB'])}
                onClick={() => setSelectedState(statesData['WB'])}
              >
                <path
                  d="M470,260 L520,260 L500,380 L440,360 L450,290 Z"
                  fill={getLevelFill(statesData['WB'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="475" y="325" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                  WB / Odisha
                </text>
              </g>

              {/* North East Region (Assam, Meghalaya, etc.) */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['AS'])}
                onClick={() => setSelectedState(statesData['AS'])}
              >
                <path
                  d="M530,220 L610,210 L630,280 L560,300 L530,250 Z"
                  fill={getLevelFill(statesData['AS'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="575" y="260" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                  North East
                </text>
              </g>

              {/* Andhra Pradesh & Telangana */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['AP'])}
                onClick={() => setSelectedState(statesData['AP'])}
              >
                <path
                  d="M290,410 L370,390 L420,470 L340,530 L300,470 Z"
                  fill={getLevelFill(statesData['AP'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="350" y="465" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
                  AP / Telangana
                </text>
              </g>

              {/* Karnataka */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['KA'])}
                onClick={() => setSelectedState(statesData['KA'])}
              >
                <path
                  d="M210,450 L280,450 L290,560 L230,570 L190,480 Z"
                  fill={getLevelFill(statesData['KA'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="245" y="510" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
                  Karnataka
                </text>
              </g>

              {/* Tamil Nadu & Kerala */}
              <g
                className="cursor-pointer transition-all hover:opacity-85"
                onMouseEnter={() => setHoveredState(statesData['TN'])}
                onClick={() => setSelectedState(statesData['TN'])}
              >
                <path
                  d="M240,560 L320,550 L310,650 L250,660 Z"
                  fill={getLevelFill(statesData['TN'].level)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="280" y="605" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
                  TN / Kerala
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Bottom Zoom & Reset Control Bar */}
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-10 rounded-2xl bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] font-black flex items-center justify-center shadow-sm border border-[#A5D6A7] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-10 rounded-2xl bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] font-black flex items-center justify-center shadow-sm border border-[#A5D6A7] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs shadow-sm border border-gray-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </section>
  );
};

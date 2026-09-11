'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  thi: number;
  riskCategory: 'NORMAL' | 'ALERT' | 'DANGER' | 'EMERGENCY';
  vectorRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

export const WeatherTHICard: React.FC = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28.5,
    humidity: 75,
    precipitation: 0.0,
    windSpeed: 12.0,
    thi: 78.4,
    riskCategory: 'ALERT',
    vectorRisk: 'HIGH',
  });

  const calculateTHI = (tempC: number, rhPct: number) => {
    // Standard Livestock THI formula:
    // THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
    const thiVal = (1.8 * tempC + 32) - (0.55 - 0.0055 * rhPct) * (1.8 * tempC - 26);
    return Math.round(thiVal * 10) / 10;
  };

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Default to Pune/Maharashtra coordinates (lat: 18.5793, lon: 73.9824)
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=18.5793&longitude=73.9824&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m'
      );
      if (res.ok) {
        const data = await res.json();
        const t = data.current?.temperature_2m ?? 28.5;
        const rh = data.current?.relative_humidity_2m ?? 75;
        const precip = data.current?.precipitation ?? 0.0;
        const wind = data.current?.wind_speed_10m ?? 12.0;

        const thiScore = calculateTHI(t, rh);
        let category: 'NORMAL' | 'ALERT' | 'DANGER' | 'EMERGENCY' = 'NORMAL';
        if (thiScore > 88) category = 'EMERGENCY';
        else if (thiScore >= 79) category = 'DANGER';
        else if (thiScore >= 72) category = 'ALERT';

        let vectorSurge: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
        if (t > 26 && rh > 70) vectorSurge = 'HIGH';
        if (t > 30 && rh > 80) vectorSurge = 'EXTREME';

        setWeather({
          temperature: t,
          humidity: rh,
          precipitation: precip,
          windSpeed: wind,
          thi: thiScore,
          riskCategory: category,
          vectorRisk: vectorSurge,
        });
      }
    } catch {
      // Retain fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <Card className="border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#072716] via-[#0E4D2B] to-[#166534] text-white shadow-sm">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#0E4D2B]">
              {language === 'en' ? 'Biometeorological THI & Heat Stress' : 'मौसम एवं पशु ताप तनाव सूचकांक (THI)'}
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              Live Open-Meteo Satellite Feed • Real-Time Hazard Alert
            </span>
          </div>
        </div>

        <button
          onClick={fetchWeather}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh weather"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#10B981]' : ''}`} />
        </button>
      </div>

      {/* Grid of Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-rose-500" />
            <span>Temp</span>
          </span>
          <div className="text-lg font-black text-slate-800 mt-0.5">{weather.temperature}°C</div>
          <span className="text-[10px] text-slate-500 font-medium">Ambient Dry Bulb</span>
        </div>

        {/* Humidity */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-500" />
            <span>Humidity</span>
          </span>
          <div className="text-lg font-black text-slate-800 mt-0.5">{weather.humidity}%</div>
          <span className="text-[10px] text-slate-500 font-medium">Relative RH</span>
        </div>

        {/* THI Index */}
        <div className="p-3 bg-[#E8F5E9]/60 rounded-xl border border-[#DCFCE7]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E4D2B] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#10B981]" />
            <span>THI Index</span>
          </span>
          <div className="text-lg font-black text-[#0E4D2B] mt-0.5">{weather.thi}</div>
          <span className="text-[10px] font-bold text-[#166534]">{weather.riskCategory} Zone</span>
        </div>

        {/* Vector Surge */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Vector Surge</span>
          </span>
          <div className="text-lg font-black text-amber-900 mt-0.5">{weather.vectorRisk}</div>
          <span className="text-[10px] text-amber-700 font-medium">Tick/Fly Surge Risk</span>
        </div>
      </div>

      {/* Advisory Message */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#0E4D2B] shrink-0 mt-0.5" />
        <div>
          {weather.riskCategory === 'NORMAL' ? (
            <p>
              <strong>Optimal Thermal Comfort:</strong> Cattle are in thermo-neutral zone. Standard feeding and milking routines continue without heat stress abatement.
            </p>
          ) : weather.riskCategory === 'ALERT' ? (
            <p>
              <strong>Mild Heat Stress (THI 72-78):</strong> Provide continuous cool drinking water, activate shade curtains, and increase roughage feeding in early mornings to minimize metabolic heat load.
            </p>
          ) : (
            <p>
              <strong>Severe Heat Stress (THI &gt; 79):</strong> High risk of milk yield drop and panting. Run cooling sprinklers and ceiling fans immediately. Watch for vector-borne blood protozoans (Babesiosis/Theileriosis).
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

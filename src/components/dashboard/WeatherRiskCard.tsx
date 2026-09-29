'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Thermometer, Droplets, Wind, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WeatherRiskData, WeatherService } from '../../lib/services/weather.service';

interface WeatherRiskCardProps {
  latitude?: number;
  longitude?: number;
  initialData?: WeatherRiskData;
}

export const WeatherRiskCard: React.FC<WeatherRiskCardProps> = ({
  latitude = 18.5793,
  longitude = 73.9824,
  initialData,
}) => {
  const [data, setData] = useState<WeatherRiskData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);

  const fetchWeather = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const result = await WeatherService.getWeatherRisk(latitude, longitude, forceRefresh);
      setData(result);
    } catch {
      // Keep previous or fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  if (!data && loading) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm animate-pulse flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1B5E20]" />
          Connecting to Open-Meteo Satellite Feed...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getVectorRiskBadge = (level: string) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'MODERATE':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
  };

  const getThiBadge = (cat: string) => {
    switch (cat) {
      case 'Emergency':
      case 'Danger':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'Alert':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl border-2 border-[#1B5E20]/20 shadow-md font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center shadow-sm">
            <Cloud className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
              Meteorological Risk Intelligence
              <span className="text-[10px] bg-[#E8F5E9] text-[#1B5E20] px-2 py-0.5 rounded-full font-black border border-[#A5D6A7]">
                LIVE METEO
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 font-semibold">
              Open-Meteo Integration • Real-time THI & Vector Surveillance
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchWeather(true)}
          disabled={loading}
          title="Refresh Weather Forecast"
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1B5E20]' : ''}`} />
        </button>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#FAFAFA] border border-gray-200/80 rounded-2xl p-3 text-center space-y-1">
          <Thermometer className="w-4 h-4 text-[#1B5E20] mx-auto" />
          <div className="text-base font-black text-gray-900">{data.temperatureC.toFixed(1)}°C</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase">Temperature</div>
        </div>

        <div className="bg-[#FAFAFA] border border-gray-200/80 rounded-2xl p-3 text-center space-y-1">
          <Droplets className="w-4 h-4 text-sky-600 mx-auto" />
          <div className="text-base font-black text-gray-900">{data.humidityPct.toFixed(0)}%</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase">Rel. Humidity</div>
        </div>

        <div className="bg-[#FAFAFA] border border-gray-200/80 rounded-2xl p-3 text-center space-y-1">
          <Cloud className="w-4 h-4 text-indigo-600 mx-auto" />
          <div className="text-base font-black text-gray-900">{data.precipitationMm.toFixed(1)} mm</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase">Precipitation</div>
        </div>

        <div className="bg-[#FAFAFA] border border-gray-200/80 rounded-2xl p-3 text-center space-y-1">
          <Wind className="w-4 h-4 text-gray-600 mx-auto" />
          <div className="text-base font-black text-gray-900">{data.windSpeedKmh.toFixed(0)} km/h</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase">Wind Speed</div>
        </div>
      </div>

      {/* Dual Risk Gauges: THI Index & Vector Proliferation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* THI Gauge */}
        <div className={`p-3.5 rounded-2xl border ${getThiBadge(data.heatStressCategory)} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Heat Stress Index (THI)
            </span>
            <span className="text-sm font-black block mt-0.5">
              {data.heatStressCategory} Stress
            </span>
          </div>
          <div className="text-xl font-black font-mono">
            {data.thi.toFixed(1)}
          </div>
        </div>

        {/* Vector Multiplier Gauge */}
        <div className={`p-3.5 rounded-2xl border ${getVectorRiskBadge(data.vectorRiskLevel)} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Vector Multiplier
            </span>
            <span className="text-sm font-black block mt-0.5">
              {data.vectorRiskLevel} Surge
            </span>
          </div>
          <div className="text-xl font-black font-mono">
            {data.epidemicMultiplier}x
          </div>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1B5E20] shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 font-medium leading-relaxed">
          {data.climateAdvisory}
        </p>
      </div>
    </div>
  );
};

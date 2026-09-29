'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  Layers, 
  RefreshCw, 
  Compass, 
  Thermometer, 
  Droplets, 
  Wind,
  CheckCircle,
  Clock
} from 'lucide-react';

interface IncidentFeature {
  properties: {
    featureType: string;
    id: string;
    disease: string;
    severity: 'LOW' | 'MODERATE' | 'CRITICAL' | 'ZOONOTIC';
    species: string;
    affected_count: number;
    mortality_count: number;
    status: string;
    date: string;
    is_cluster: boolean;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export default function SurveillanceMapPage() {
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'critical' | 'containment'>('all');
  
  // Weather metrics state
  const [weather, setWeather] = useState({
    temp: 28.4,
    humidity: 78,
    riskMultiplier: 2.4,
    level: 'EXTREME',
    advisory: 'High humidity and warm temperatures encourage vector-borne transmission.'
  });

  const incidents: IncidentFeature[] = [
    {
      geometry: { coordinates: [73.9824, 18.5793] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_01',
        disease: 'Foot-and-Mouth Disease (FMD)',
        severity: 'CRITICAL',
        species: 'Cow',
        affected_count: 5,
        mortality_count: 0,
        status: 'investigating',
        date: '10 Mins ago',
        is_cluster: true,
      }
    },
    {
      geometry: { coordinates: [73.9850, 18.5810] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_02',
        disease: 'Foot-and-Mouth Disease (FMD)',
        severity: 'CRITICAL',
        species: 'Buffalo',
        affected_count: 2,
        mortality_count: 0,
        status: 'reported',
        date: '25 Mins ago',
        is_cluster: true,
      }
    },
    {
      geometry: { coordinates: [77.4984, 27.5258] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_03',
        disease: 'Suspected Anthrax',
        severity: 'ZOONOTIC',
        species: 'Cow',
        affected_count: 1,
        mortality_count: 1,
        status: 'reported',
        date: '1 Hour ago',
        is_cluster: false,
      }
    },
    {
      geometry: { coordinates: [74.5772, 18.1539] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_04',
        disease: 'Lumpy Skin Disease (LSD)',
        severity: 'MODERATE',
        species: 'Cow',
        affected_count: 4,
        mortality_count: 0,
        status: 'investigating',
        date: '3 Hours ago',
        is_cluster: false,
      }
    }
  ];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-800/90 border-b border-slate-700 px-6 py-4 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/40">
            <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              National Livestock Surveillance & Outbreak GIS Map
              <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full border border-red-700">
                LIVE SURVEILLANCE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-Time Syndromic Triage, PostGIS 5km Containment Rings & Vector Weather Forecasting
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <Link href="/surveillance/map" className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md shadow">
            GIS Outbreak Map
          </Link>
          <Link href="/surveillance/triage-queue" className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md">
            Triage SLA Queue
          </Link>
          <Link href="/surveillance/vaccination-coverage" className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md">
            Vaccination Coverage
          </Link>
          <Link href="/surveillance/advisories" className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md">
            Emergency Broadcast
          </Link>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left Side: Interactive Map Simulation Canvas */}
        <div className="lg:col-span-3 relative bg-slate-950 flex flex-col justify-between p-6 border-r border-slate-800">
          {/* Map Controls Floating Bar */}
          <div className="absolute top-6 left-6 z-10 flex gap-2">
            <button 
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded shadow flex items-center gap-1.5 ${
                activeLayer === 'all' ? 'bg-slate-700 text-white border border-slate-500' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Incidents ({incidents.length})
            </button>
            <button 
              onClick={() => setActiveLayer('critical')}
              className={`px-3 py-1.5 text-xs font-medium rounded shadow flex items-center gap-1.5 ${
                activeLayer === 'critical' ? 'bg-red-900/70 text-red-200 border border-red-600' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" /> Critical / Zoonotic
            </button>
            <button 
              onClick={() => setActiveLayer('containment')}
              className={`px-3 py-1.5 text-xs font-medium rounded shadow flex items-center gap-1.5 ${
                activeLayer === 'containment' ? 'bg-amber-900/70 text-amber-200 border border-amber-600' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> 5km Containment Rings (Active)
            </button>
          </div>

          {/* Interactive Simulated GIS Map Canvas */}
          <div className="relative w-full h-[580px] bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

            {/* Simulated 5km Containment Zone Ring */}
            <div className="absolute w-80 h-80 rounded-full border-2 border-dashed border-red-500/50 bg-red-500/10 flex items-center justify-center animate-pulse">
              {/* 10km Surveillance Outer Ring */}
              <div className="w-[480px] h-[480px] rounded-full border border-amber-500/30 bg-amber-500/5 absolute pointer-events-none" />
              <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-red-500/40">
                5km Strict Containment Core (Pune-Haveli)
              </div>
            </div>

            {/* Interactive Pulse Markers */}
            {incidents.map((inc, i) => {
              const isSelected = selectedIncident?.properties.id === inc.properties.id;
              // Simple spread offsets for visual canvas representation
              const offsets = [
                { top: '48%', left: '46%' },
                { top: '53%', left: '52%' },
                { top: '25%', left: '70%' },
                { top: '65%', left: '35%' },
              ];

              return (
                <div
                  key={inc.properties.id}
                  style={offsets[i]}
                  onClick={() => setSelectedIncident(inc)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all`}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing Aura for Critical Incidents */}
                    {inc.properties.severity === 'CRITICAL' || inc.properties.severity === 'ZOONOTIC' ? (
                      <div className="w-8 h-8 rounded-full bg-red-500/40 animate-ping absolute" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-500/30 animate-pulse absolute" />
                    )}
                    
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-lg ${
                      inc.properties.severity === 'ZOONOTIC' 
                        ? 'bg-purple-600 border-purple-300' 
                        : inc.properties.severity === 'CRITICAL' 
                        ? 'bg-red-600 border-red-200' 
                        : 'bg-amber-600 border-amber-200'
                    }`}>
                      <span className="text-[9px] font-bold text-white">!</span>
                    </div>

                    {/* Hover Pin Label */}
                    <div className="hidden group-hover:block absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded shadow-xl pointer-events-none z-30">
                      <div className="font-bold text-white">{inc.properties.disease}</div>
                      <div className="text-[10px] text-slate-400">
                        {inc.properties.species} • {inc.properties.affected_count} affected
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 border border-purple-300" />
                <span>Zoonotic Hazard (Anthrax)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-red-200" />
                <span>Critical Contagion (FMD / PPR)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-200" />
                <span>Moderate (LSD)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded bg-red-500/20 border border-red-500" />
                <span>5km Movement Restriction Ring</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              CRS: EPSG:4326 (WGS84) • PostGIS Spatial Engine
            </div>
          </div>
        </div>

        {/* Right Sidebar: Details & Climate Intelligence */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto bg-slate-900/70">
          {/* Selected Incident Drawer */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Incident Inspector</span>
              {selectedIncident && (
                <span className="text-[10px] bg-red-900/60 text-red-300 px-2 py-0.5 rounded border border-red-700">
                  {selectedIncident.properties.severity}
                </span>
              )}
            </h2>

            {selectedIncident ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400">Suspected Disease</div>
                  <div className="text-base font-bold text-white">{selectedIncident.properties.disease}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Species</div>
                    <div className="font-semibold text-slate-200">{selectedIncident.properties.species}</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Affected / Deaths</div>
                    <div className="font-semibold text-slate-200">
                      {selectedIncident.properties.affected_count} / {selectedIncident.properties.mortality_count}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Coordinates (Lat, Lon)</div>
                  <div className="font-mono text-slate-300">
                    {selectedIncident.geometry.coordinates[1]}, {selectedIncident.geometry.coordinates[0]}
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Link
                    href={`/surveillance/triage-queue`}
                    className="flex-1 text-center py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded shadow transition"
                  >
                    Dispatch Officer
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Click on any pulsing map marker to inspect clinical symptoms, casualty numbers, and dispatch protocols.
              </div>
            )}
          </div>

          {/* Real-Time Weather Correlation Gauge (Open-Meteo Integration) */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Vector Weather Risk</span>
              <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-700">
                LIVE METEO
              </span>
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-center">
                <Thermometer className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <div className="text-[10px] text-slate-400">Temp</div>
                <div className="font-bold text-white">{weather.temp}°C</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-center">
                <Droplets className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                <div className="text-[10px] text-slate-400">Humidity</div>
                <div className="font-bold text-white">{weather.humidity}%</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-center">
                <Wind className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <div className="text-[10px] text-slate-400">Risk Mult.</div>
                <div className="font-bold text-red-400">{weather.riskMultiplier}x</div>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-800/60 rounded p-2.5 text-xs text-red-200">
              <div className="font-bold mb-1 flex items-center gap-1.5 text-red-300">
                <AlertTriangle className="w-3.5 h-3.5" /> High Vector Multiplication Alert
              </div>
              <p className="text-[11px] leading-relaxed text-red-300/90">{weather.advisory}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

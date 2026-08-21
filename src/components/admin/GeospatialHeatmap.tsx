import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockDistrictHeatmaps } from '../../data/mockData';
import { DistrictHeatmapData } from '../../types';
import { 
  MapPin, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Filter, 
  Compass,
  Activity,
  Building2
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const GeospatialHeatmap: React.FC = () => {
  const { t } = useApp();

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictHeatmapData>(mockDistrictHeatmaps[0]);
  const [metricFilter, setMetricFilter] = useState<'amu' | 'violations' | 'animals'>('amu');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-700" />
              National & District Geospatial AMU Surveillance Map
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
              GIS Heatmap Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial distribution of Antimicrobial Usage Intensity (mg/PCU), residue non-compliance hotspots, and inspection priorities.
          </p>
        </div>

        {/* Metric Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setMetricFilter('amu')}
            className={`px-3 py-1.5 rounded-lg transition ${
              metricFilter === 'amu' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AMU Intensity
          </button>
          <button
            onClick={() => setMetricFilter('violations')}
            className={`px-3 py-1.5 rounded-lg transition ${
              metricFilter === 'violations' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Violation Rate
          </button>
        </div>
      </div>

      {/* Interactive Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Map Representation */}
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[420px] border border-slate-800 shadow-xl">
          {/* Subtle Grid Lines Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-mono text-teal-300 bg-slate-900/90 px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              National GIS Node: Live Coordinate Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">Projection: WGS84 (India Subcontinent)</span>
          </div>

          {/* Interactive Stylized District Nodes on Map Canvas */}
          <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mockDistrictHeatmaps.map(dist => {
              const isSelected = selectedDistrict.district === dist.district;
              const isHighRisk = dist.amuRiskLevel === 'HIGH';
              const isMedRisk = dist.amuRiskLevel === 'MEDIUM';

              return (
                <div
                  key={dist.district}
                  onClick={() => setSelectedDistrict(dist)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-teal-900/80 border-teal-400 shadow-lg ring-4 ring-teal-500/20' 
                      : 'bg-slate-900/70 border-slate-800 hover:border-teal-500/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{dist.district}</h4>
                      <span className="text-[10px] text-slate-400">{dist.state}</span>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${
                      isHighRisk ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : isMedRisk ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] block">AMU Index</span>
                    <span className="text-base font-black font-mono text-teal-300">{dist.monthlyAMU_mg_pcu} <span className="text-[10px] font-normal text-slate-400">mg/PCU</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 gap-2">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Low AMU (&lt; 60)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate (60-90)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Intensity (&gt; 90)</span>
            </div>
          </div>
        </div>

        {/* Selected District Drill-Down Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">District Drill-down</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedDistrict.district}</h3>
                <span className="text-xs text-teal-800 font-semibold">{selectedDistrict.state} Province</span>
              </div>
              <RiskBadge riskLevel={selectedDistrict.amuRiskLevel} labelPrefix="AMU Risk" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">Registered Producer Farms</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">{selectedDistrict.registeredFarms}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">Monitored Livestock Census</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">{selectedDistrict.monitoredAnimals} animals</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">MRL Residue Non-Compliance</span>
                <span className="text-sm font-extrabold text-rose-700 font-mono">{selectedDistrict.mrlViolationRatePct}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">Pending Vet Authorizations</span>
                <span className="text-sm font-extrabold text-amber-700 font-mono">{selectedDistrict.pendingApprovals}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-950">
            <span className="font-bold block text-teal-900 mb-1">State Regulatory Recommendation:</span>
            <p className="leading-relaxed">
              {selectedDistrict.amuRiskLevel === 'HIGH'
                ? `Prioritize unannounced inspection audits at commercial poultry/dairy clusters in ${selectedDistrict.district}. Restrict fluoroquinolone OTC sales.`
                : `Maintain routine surveillance and sample collection protocols in ${selectedDistrict.district}.`
              }
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

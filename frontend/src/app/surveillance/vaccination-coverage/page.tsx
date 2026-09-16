'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function VaccinationCoveragePage() {
  const blockData = [
    { block: 'Haveli (Pune)', target: 24000, vaccinated: 21500, rate: 89 },
    { block: 'Baramati', target: 31000, vaccinated: 28200, rate: 91 },
    { block: 'Govardhan (Mathura)', target: 18000, vaccinated: 12400, rate: 68 },
    { block: 'Jagraon (Ludhiana)', target: 29000, vaccinated: 27100, rate: 93 },
    { block: 'Shirur', target: 22000, vaccinated: 14500, rate: 66 },
  ];

  const diseasePie = [
    { name: 'Foot-and-Mouth (FMD)', value: 45000, color: '#3b82f6' },
    { name: 'Brucellosis (Calfhood)', value: 22000, color: '#10b981' },
    { name: 'Lumpy Skin Disease', value: 18000, color: '#f59e0b' },
    { name: 'PPR (Goat/Sheep)', value: 14000, color: '#8b5cf6' },
    { name: 'Hemorrhagic Septicemia', value: 11000, color: '#ec4899' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/surveillance/map" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                National Animal Disease Control Program (NADCP) Coverage
              </h1>
              <p className="text-xs text-slate-400">
                Block-Level Vaccination Rates • Herd Immunity Threshold (85% Target) • Ear-Tag Digitization
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">82.4%</div>
            <div className="text-[11px] text-slate-400">Regional Herd Immunity</div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Target vs Vaccinated per Block */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Block Targets vs Actuals (Doses)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="block" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  />
                  <Bar dataKey="target" fill="#475569" name="Target Target" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="vaccinated" fill="#10b981" name="Administered Doses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Vaccine Coverage by Disease Target */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Vaccine Doses by Pathogen Target
            </h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseasePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {diseasePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
              {diseasePie.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-300">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Coverage Warning Callout */}
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Immediate Drive Alert:</span> Govardhan (Mathura) and Shirur blocks are below the 70% threshold. Vulnerable to seasonal FMD and HS wash.
            </div>
          </div>
          <button 
            onClick={() => alert('Dispatched mobile paravet vaccination camps to Govardhan and Shirur blocks.')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow shrink-0"
          >
            Deploy Emergency Camps
          </button>
        </div>
      </div>
    </div>
  );
}

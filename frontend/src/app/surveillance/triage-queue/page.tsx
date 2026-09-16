'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  FileText, 
  UserCheck, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

interface ReportItem {
  id: string;
  species: string;
  disease: string;
  severity: 'LOW' | 'MODERATE' | 'CRITICAL' | 'ZOONOTIC';
  village: string;
  affected: number;
  mortality: number;
  reportedAt: string;
  slaRemainingMinutes: number;
  status: 'reported' | 'investigating' | 'sample_collected' | 'confirmed';
}

export default function TriageQueuePage() {
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep_03',
      species: 'Cow',
      disease: 'Suspected Anthrax',
      severity: 'ZOONOTIC',
      village: 'Radhakund (Mathura)',
      affected: 1,
      mortality: 1,
      reportedAt: '45 mins ago',
      slaRemainingMinutes: 45,
      status: 'reported'
    },
    {
      id: 'rep_01',
      species: 'Cow',
      disease: 'Foot-and-Mouth Disease (FMD)',
      severity: 'CRITICAL',
      village: 'Wagholi (Pune)',
      affected: 5,
      mortality: 0,
      reportedAt: '1 hour ago',
      slaRemainingMinutes: 120,
      status: 'reported'
    },
    {
      id: 'rep_02',
      species: 'Buffalo',
      disease: 'Foot-and-Mouth Disease (FMD)',
      severity: 'CRITICAL',
      village: 'Manjari (Pune)',
      affected: 2,
      mortality: 0,
      reportedAt: '2 hours ago',
      slaRemainingMinutes: 60,
      status: 'investigating'
    },
    {
      id: 'rep_04',
      species: 'Cow',
      disease: 'Lumpy Skin Disease (LSD)',
      severity: 'MODERATE',
      village: 'Malegaon (Baramati)',
      affected: 4,
      mortality: 0,
      reportedAt: '3 hours ago',
      slaRemainingMinutes: 180,
      status: 'investigating'
    }
  ]);

  const handleAssign = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'investigating' } : r));
    alert(`Veterinary Rapid Response Unit dispatched for Case ${id}.`);
  };

  const handleReferLab = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'sample_collected' } : r));
    alert(`Diagnostic Lab Chain-of-Custody created for Case ${id}. Barcode: SMP-2026-${id.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/surveillance/map" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Outbreak Triage & Officer Escalation Queue
              </h1>
              <p className="text-xs text-slate-400">
                4-Hour SLA Escalation Tracking • Diagnostic Sample Dispatch • Rapid Response Coordination
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-red-900/60 border border-red-700 text-red-300 text-xs font-bold rounded-md flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> 1 Zoonotic Priority
            </span>
            <span className="px-3 py-1 bg-amber-900/60 border border-amber-700 text-amber-300 text-xs font-bold rounded-md flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 2 Critical SLA Pending
            </span>
          </div>
        </div>

        {/* Queue Table Card */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Disease & Severity</th>
                <th className="px-4 py-3">Village / District</th>
                <th className="px-4 py-3">Herd Impact</th>
                <th className="px-4 py-3">SLA Countdown</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Emergency Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-700/40 transition">
                  <td className="px-4 py-4 font-mono font-bold text-slate-300">{r.id}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-white text-sm">{r.disease}</div>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 ${
                      r.severity === 'ZOONOTIC' 
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : r.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300 font-medium">{r.village}</td>
                  <td className="px-4 py-4">
                    <div className="text-slate-200">{r.species} ({r.affected} affected)</div>
                    {r.mortality > 0 && (
                      <div className="text-red-400 font-bold">{r.mortality} Dead</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className={`font-mono font-bold flex items-center gap-1.5 ${
                      r.slaRemainingMinutes < 60 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" /> {r.slaRemainingMinutes}m left
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      r.status === 'reported' ? 'bg-red-900/60 text-red-200' : 'bg-blue-900/60 text-blue-200'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAssign(r.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded shadow text-xs font-semibold flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Dispatch Paravet
                      </button>
                      <button
                        onClick={() => handleReferLab(r.id)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded shadow text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Refer to Lab
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

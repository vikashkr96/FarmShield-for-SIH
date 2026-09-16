'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Cpu,
  HelpCircle,
} from 'lucide-react';

interface RiskAssessmentProps {
  onBack?: () => void;
}

export const RiskAssessmentModal: React.FC<RiskAssessmentProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overuse' | 'compliance'>('overuse');

  // Model A: Overuse Risk Inputs
  const [treatments30d, setTreatments30d] = useState<number>(2);
  const [totalAmuMg, setTotalAmuMg] = useState<number>(150);
  const [durationDays, setDurationDays] = useState<number>(4);

  // Model B: Withdrawal Compliance Inputs
  const [elapsedDays, setElapsedDays] = useState<number>(3);
  const [officialWdDays, setOfficialWdDays] = useState<number>(7);
  const [animalWeight, setAnimalWeight] = useState<number>(420);
  const [actualDose, setActualDose] = useState<number>(8);

  // Compute Model A Overuse Risk Score
  const computeOveruseScore = () => {
    let score = 0.15;
    if (treatments30d > 3) score += 0.35;
    if (totalAmuMg > 200) score += 0.25;
    if (durationDays > 7) score += 0.2;
    score = Math.min(0.98, Math.max(0.05, score));

    const level = score > 0.65 ? 'HIGH' : score > 0.35 ? 'MEDIUM' : 'LOW';
    const reasons: string[] = [];
    if (treatments30d > 3) reasons.push(`Repeated antimicrobial treatments (${treatments30d} courses in 30 days)`);
    if (totalAmuMg > 200) reasons.push(`High cumulative AMU volume (${totalAmuMg} mg active compound)`);
    if (durationDays > 7) reasons.push('Extended treatment duration exceeding standard clinical protocol');
    if (reasons.length === 0) reasons.push('Within safe standard veterinary dosage and frequency guidelines');

    const action =
      level === 'HIGH'
        ? 'URGENT: Request bacterial culture & antimicrobial sensitivity testing. Rotate antimicrobial class.'
        : level === 'MEDIUM'
        ? 'Review dosage frequency and evaluate animal clinical response before repeat dosing.'
        : 'Continue standard herd antimicrobial stewardship protocol.';

    return { score, level, reasons, action };
  };

  // Compute Model B Compliance Risk Score
  const computeComplianceScore = () => {
    const remainingWd = Math.max(0, officialWdDays - elapsedDays);
    let score = Math.min(0.99, Math.max(0.05, remainingWd / officialWdDays));
    if (actualDose > 10) score = Math.min(0.99, score + 0.2);

    const level = score > 0.6 ? 'HIGH' : score > 0.25 ? 'MEDIUM' : 'LOW';
    const reasons: string[] = [];
    if (remainingWd > 0)
      reasons.push(
        `Active withdrawal period: ${remainingWd} days remaining of ${officialWdDays} statutory days`
      );
    if (actualDose > 8)
      reasons.push(`Higher than standard therapeutic dose (${actualDose} mg/kg for ${animalWeight} kg animal)`);
    if (reasons.length === 0)
      reasons.push('Statutory withdrawal period completed with zero detectable MRL violation risk');

    const action =
      level === 'HIGH'
        ? `CRITICAL EMBARGO: DO NOT SELL MILK OR ANIMAL PRODUCTS. Must withhold for ${remainingWd} more days.`
        : level === 'MEDIUM'
        ? 'Caution: Nearing clearance date. Verify with rapid milk residue test before bulk tank addition.'
        : 'CLEARED: Safe for consumer supply and market release.';

    return { score, level, reasons, action, remainingWd };
  };

  const overuseResult = computeOveruseScore();
  const complianceResult = computeComplianceScore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg">
            <Cpu className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              AI Risk Assessment & Compliance Inference Engine
              <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-0.5 rounded-full font-black border border-[#A5D6A7]">
                ML POWERED
              </span>
            </h1>
            <p className="text-xs text-gray-600 font-bold">
              Predictive Antimicrobial Resistance (AMR) & Statutory MRL Violation Risk
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 gap-2 text-xs font-black shadow-sm">
        <button
          onClick={() => setActiveTab('overuse')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'overuse'
              ? 'bg-[#1B5E20] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Model A: AMU Overuse & AMR Risk Predictor
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'compliance'
              ? 'bg-[#1B5E20] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Model B: Withdrawal MRL Breach Predictor
        </button>
      </div>

      {/* Model A Container */}
      {activeTab === 'overuse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-md space-y-5 text-xs font-bold text-gray-700">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1B5E20]" />
              Adjust Herd Treatment Variables
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Treatments Administered (Last 30 Days):</span>
                <span className="text-sm font-black text-[#1B5E20]">{treatments30d} courses</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={treatments30d}
                onChange={(e) => setTreatments30d(parseInt(e.target.value))}
                className="w-full accent-[#1B5E20]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cumulative Active AMU Dosage:</span>
                <span className="text-sm font-black text-[#1B5E20]">{totalAmuMg} mg</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={totalAmuMg}
                onChange={(e) => setTotalAmuMg(parseInt(e.target.value))}
                className="w-full accent-[#1B5E20]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Single Regimen Duration:</span>
                <span className="text-sm font-black text-[#1B5E20]">{durationDays} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full accent-[#1B5E20]"
              />
            </div>
          </div>

          {/* Model Inference Card */}
          <div className="bg-white p-6 rounded-3xl border-2 border-[#1B5E20]/30 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Predicted Overuse Risk
              </span>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  overuseResult.level === 'HIGH'
                    ? 'bg-red-600 text-white animate-pulse'
                    : overuseResult.level === 'MEDIUM'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {overuseResult.level} RISK
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900 font-mono">
                {(overuseResult.score * 100).toFixed(0)}%
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    overuseResult.level === 'HIGH'
                      ? 'bg-red-500'
                      : overuseResult.level === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${overuseResult.score * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <span className="font-black text-gray-900 block">Contributing Clinical Factors:</span>
              <ul className="space-y-1 text-gray-600">
                {overuseResult.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#1B5E20] font-black">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-[#FFFDF5] border border-amber-200 rounded-2xl text-xs font-medium text-gray-800">
              <span className="font-black text-amber-900 block mb-1">Recommended Action:</span>
              {overuseResult.action}
            </div>
          </div>
        </div>
      )}

      {/* Model B Container */}
      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-md space-y-5 text-xs font-bold text-gray-700">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1B5E20]" />
              Adjust Clearance Parameters
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Days Elapsed Since Treatment:</span>
                <span className="text-sm font-black text-[#1B5E20]">{elapsedDays} days</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                value={elapsedDays}
                onChange={(e) => setElapsedDays(parseInt(e.target.value))}
                className="w-full accent-[#1B5E20]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Official Statutory Withdrawal Period:</span>
                <span className="text-sm font-black text-[#1B5E20]">{officialWdDays} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="28"
                value={officialWdDays}
                onChange={(e) => setOfficialWdDays(parseInt(e.target.value))}
                className="w-full accent-[#1B5E20]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Administered Dose Intensity:</span>
                <span className="text-sm font-black text-[#1B5E20]">{actualDose} mg/kg</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={actualDose}
                onChange={(e) => setActualDose(parseInt(e.target.value))}
                className="w-full accent-[#1B5E20]"
              />
            </div>
          </div>

          {/* Model B Inference Card */}
          <div className="bg-white p-6 rounded-3xl border-2 border-[#1B5E20]/30 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Predicted MRL Violation Risk
              </span>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  complianceResult.level === 'HIGH'
                    ? 'bg-red-600 text-white animate-pulse'
                    : complianceResult.level === 'MEDIUM'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {complianceResult.level} RISK
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900 font-mono">
                {(complianceResult.score * 100).toFixed(0)}%
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    complianceResult.level === 'HIGH'
                      ? 'bg-red-500'
                      : complianceResult.level === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${complianceResult.score * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <span className="font-black text-gray-900 block">Pharmacokinetic Risk Indicators:</span>
              <ul className="space-y-1 text-gray-600">
                {complianceResult.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#1B5E20] font-black">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-[#FFFDF5] border border-amber-200 rounded-2xl text-xs font-medium text-gray-800">
              <span className="font-black text-amber-900 block mb-1">Stewardship Advisory:</span>
              {complianceResult.action}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

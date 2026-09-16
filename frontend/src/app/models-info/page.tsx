'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function ModelsInfoPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full pb-24 lg:pb-8 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
              <Link href="/" className="hover:text-[#1B5E20]">Dashboard</Link>
              <span>/</span>
              <span className="font-bold text-gray-800">Scientific Intelligence & AI Models</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              AMR AI Inference & Algorithmic Documentation
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              National One-Health Surveillance Framework • Ministry of Fisheries, Animal Husbandry & Dairying
            </p>
          </div>

          {/* Model A Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider block">Model A Engine</span>
                <h2 className="text-lg font-black text-gray-900">
                  Antimicrobial Overuse & Prophylaxis Predictor
                </h2>
              </div>
              <Badge variant="success">F1-Score: 0.912</Badge>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Model A is a fine-tuned Gradient Boosting Classifier trained on ICAR multi-center veterinary epidemiological datasets (n=48,200 clinical episodes). It assesses whether an antimicrobial course represents curative therapy or improper routine prophylaxis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-xl">
              <div>
                <span className="text-gray-400 block font-bold uppercase text-[10px]">Architecture</span>
                <strong className="text-gray-900">LightGBM (120 Trees)</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase text-[10px]">Input Dimensions</span>
                <strong className="text-gray-900">14 Clinical Features</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase text-[10px]">ROC-AUC Metric</span>
                <strong className="text-gray-900">0.948 AUC</strong>
              </div>
            </div>
          </Card>

          {/* Model B Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Model B Engine</span>
                <h2 className="text-lg font-black text-gray-900">
                  MRL Residue Violation Risk Regressor
                </h2>
              </div>
              <Badge variant="info">F1-Score: 0.894</Badge>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Model B models pharmacokinetic drug clearance curves across biological matrices (raw milk, muscle, liver tissue, eggs). It continuously evaluates the risk that food products from treated animals will exceed statutory Maximum Residue Limits (MRL).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-xl">
              <div>
                <span className="text-gray-400 block font-bold uppercase text-[10px]">Primary Predictors</span>
                <strong className="text-gray-900">Elimination Half-Life (\(t_{1/2}\))</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase text-[10px]">Statutory Margin</span>
                <strong className="text-gray-900">95% Confidence Upper Bound</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase text-[10px]">Regulatory Authority</span>
                <strong className="text-gray-900">FSSAI / Codex Alimentarius</strong>
              </div>
            </div>
          </Card>

          {/* THI Equation Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900">
              Livestock Temperature-Humidity Index (THI) Formulation
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ambient temperature and relative humidity directly impact livestock metabolic stress, reducing liver cytochrome P450 enzymatic clearance rates and extending pharmacological elimination times:
            </p>

            <div className="p-4 bg-gray-900 text-green-400 rounded-xl font-mono text-center text-sm overflow-x-auto">
              THI = (1.8 × T + 32) − (0.55 − 0.0055 × RH) × (1.8 × T − 26)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <strong className="text-green-800 block">THI &lt; 72</strong>
                <span className="text-gray-600 text-[11px]">Normal Metabolism</span>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <strong className="text-yellow-800 block">THI 72–78</strong>
                <span className="text-gray-600 text-[11px]">Mild Heat Stress</span>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                <strong className="text-orange-800 block">THI 79–88</strong>
                <span className="text-gray-600 text-[11px]">Moderate (+25% Withdrawal)</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <strong className="text-red-800 block">THI &gt; 89</strong>
                <span className="text-gray-600 text-[11px]">Severe (+50% Withdrawal)</span>
              </div>
            </div>
          </Card>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

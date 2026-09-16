'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Stethoscope, Activity, AlertTriangle, ShieldCheck, FileText, CheckCircle2, Cpu, BarChart3, AlertOctagon } from 'lucide-react';
import { AMUAnalytics } from './AMUAnalytics';

export const VetDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'clinical' | 'amu' | 'ml_models'>('clinical');
  const [modelsMetadata, setModelsMetadata] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/ml/models-info')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success') {
          setModelsMetadata(json.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Vet Header Banner */}
      <div className="bg-[#1B5E20] text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#1B5E20] flex items-center justify-center text-3xl shadow-lg">
              🩺
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{t('vet.title')}</h1>
                <Badge variant="success" className="bg-white text-[#1B5E20] border-none font-black">
                  Dr. Sharma (VET-882)
                </Badge>
              </div>
              <p className="text-xs text-[#E8F5E9] font-bold">{t('vet.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center bg-white border-2 border-white p-1.5 rounded-2xl text-xs font-black self-end sm:self-center">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === 'clinical' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-[#1B5E20] hover:bg-[#E8F5E9]'
              }`}
            >
              {t('vet.activeTreatments')}
            </button>
            <button
              onClick={() => setActiveTab('amu')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === 'amu' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-[#1B5E20] hover:bg-[#E8F5E9]'
              }`}
            >
              {t('vet.amuTrend')}
            </button>
            <button
              onClick={() => setActiveTab('ml_models')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'ml_models' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-[#1B5E20] hover:bg-[#E8F5E9]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Risk Models</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'amu' && <AMUAnalytics />}

      {activeTab === 'ml_models' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A Card */}
            <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-6 h-6 text-[#1B5E20]" />
                  <div>
                    <h3 className="text-base font-black text-gray-900">Model A: AMU Overuse Risk</h3>
                    <span className="text-[11px] text-gray-500 font-bold">XGBoost Classifier (multi:softprob)</span>
                  </div>
                </div>
                <Badge variant="success" className="bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]">Active ML</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#F1F8E9] rounded-2xl border border-[#C8E6C9]">
                  <span className="text-[10px] text-gray-600 font-bold block">MACRO F1 SCORE</span>
                  <span className="text-2xl font-black text-[#1B5E20]">
                    {modelsMetadata?.model_a?.macro_f1 ? modelsMetadata.model_a.macro_f1.toFixed(3) : '0.770'}
                  </span>
                </div>
                <div className="p-3 bg-[#F1F8E9] rounded-2xl border border-[#C8E6C9]">
                  <span className="text-[10px] text-gray-600 font-bold block">ROC-AUC (OvR)</span>
                  <span className="text-2xl font-black text-[#1B5E20]">
                    {modelsMetadata?.model_a?.roc_auc_ovr ? modelsMetadata.model_a.roc_auc_ovr.toFixed(3) : '0.933'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-700 font-semibold bg-[#FFFDF5] p-3 rounded-xl border border-gray-200">
                <span className="font-bold text-[#1B5E20] block">🔍 Top AI Risk Indicators:</span>
                <p>• Treatment Frequency: $\ge 3$ courses in past 30 days triggers escalation flag.</p>
                <p>• Repeated Active Molecule: Successive therapy with identical compound.</p>
                <p>• CIA Class Use: 3rd/4th Gen Cephalosporins & Fluoroquinolones flagged for stewardship.</p>
              </div>
            </Card>

            {/* Model B Card */}
            <Card variant="glass" className="space-y-4 border-2 border-[#2E7D32] bg-white p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-6 h-6 text-[#2E7D32]" />
                  <div>
                    <h3 className="text-base font-black text-gray-900">Model B: MRL Compliance Risk</h3>
                    <span className="text-[11px] text-gray-500 font-bold">XGBoost Classifier (multi:softprob)</span>
                  </div>
                </div>
                <Badge variant="success" className="bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]">Active ML</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7]">
                  <span className="text-[10px] text-gray-600 font-bold block">MACRO F1 SCORE</span>
                  <span className="text-2xl font-black text-[#2E7D32]">
                    {modelsMetadata?.model_b?.macro_f1 ? modelsMetadata.model_b.macro_f1.toFixed(3) : '0.819'}
                  </span>
                </div>
                <div className="p-3 bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7]">
                  <span className="text-[10px] text-gray-600 font-bold block">ROC-AUC (OvR)</span>
                  <span className="text-2xl font-black text-[#2E7D32]">
                    {modelsMetadata?.model_b?.roc_auc_ovr ? modelsMetadata.model_b.roc_auc_ovr.toFixed(3) : '0.946'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-700 font-semibold bg-[#FFFDF5] p-3 rounded-xl border border-gray-200">
                <span className="font-bold text-[#2E7D32] block">🔍 Top AI Compliance Indicators:</span>
                <p>• Premature Harvest Margin: Elapsed days vs official withdrawal period.</p>
                <p>• Dose Discrepancy: Administered dose deviation &gt; 15% from prescription.</p>
                <p>• Lactation Prohibition: Flags off-label use in dairy milking animals.</p>
              </div>
            </Card>
          </div>

          {/* High Risk Veterinary Action Queue */}
          <Card variant="glass" className="space-y-4 border-2 border-[#FFC107] bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-[#B78103]" />
                <span>AI Early Warning Queue (High Risk Livestock Pending Review)</span>
              </h3>
              <Badge variant="warning">1 Animal Requiring Action</Badge>
            </div>

            <div className="bg-[#FFF8E1] p-5 rounded-2xl border-2 border-[#FFC107]/40 space-y-3 text-xs font-bold text-gray-900">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-black text-base text-[#B78103] block">COW-102 (Gir Cross, 430 kg)</span>
                  <span className="text-gray-600 font-semibold">Diagnosis: Acute Mastitis • Primary Drug: Amoxicillin</span>
                </div>
                <Badge variant="error" pulse>Risk Score: 0.9998 (HIGH)</Badge>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#FFC107]/40 space-y-1">
                <span className="text-[#B78103] font-bold block">AI Reason Code:</span>
                <p className="text-gray-700">🚨 HIGH_30D_FREQUENCY: Animal received $\ge 3$ antimicrobial courses in past 30 days. High risk of treatment failure or AMR emergence.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="primary" size="sm" className="bg-[#1B5E20] flex-1">
                  Approve Therapy
                </Button>
                <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50 flex-1">
                  Recommend Alternative
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'clinical' && (
        <div className="space-y-6">
          {/* Active Clinical Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass" className="space-y-4 border-2 border-[#FFC107] bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-[#B78103]" />
                  <span>{t('vet.repeatedAlerts')}</span>
                </h3>
                <Badge variant="warning">1 Alert</Badge>
              </div>

              <div className="bg-[#FFF8E1] p-5 rounded-2xl border-2 border-[#FFC107]/40 space-y-3 text-xs font-bold text-gray-900">
                <div className="flex justify-between items-center">
                  <span className="font-black text-base text-[#B78103]">COW-102 (Gir Cross)</span>
                  <span className="text-gray-700">Farm: Sharma Dairy</span>
                </div>
                <p className="text-gray-800 leading-relaxed font-semibold">
                  ⚠️ 2nd Antimicrobial course of Amoxicillin recorded within 30 days. Risk of AMR (Antimicrobial Resistance).
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="md" className="w-full justify-center bg-[#1B5E20] text-white">
                    {t('vet.approveTreatment')}
                  </Button>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#1B5E20]" />
                  <span>Withdrawal Compliance Reviews</span>
                </h3>
                <Badge variant="success">FSSAI Compliant</Badge>
              </div>

              <div className="bg-[#E8F5E9] p-5 rounded-2xl border-2 border-[#1B5E20]/30 space-y-3 text-xs font-bold text-gray-900">
                <div className="flex justify-between items-center">
                  <span className="font-black text-base text-[#1B5E20]">BUF-201 (Murrah Buffalo)</span>
                  <Badge variant="success">Cleared</Badge>
                </div>
                <p className="text-gray-800 leading-relaxed font-semibold">
                  Oxytetracycline LA treatment completed. 7-day milk withdrawal successfully observed.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

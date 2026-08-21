import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Treatment } from '../../types';
import { 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  X, 
  FileText,
  FileCheck,
  AlertOctagon
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const MLRiskReviewPanel: React.FC = () => {
  const { treatments, overrideMLRisk, showToast, t } = useApp();

  const [selectedTrtForOverride, setSelectedTrtForOverride] = useState<Treatment | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Flagged cases: high or medium risk
  const flaggedCases = treatments.filter(t => t.overuseRisk === 'HIGH' || t.overuseRisk === 'MEDIUM' || t.complianceRisk === 'HIGH');

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrtForOverride || !overrideReason) {
      showToast('Validation', 'A clinical justification reason is mandatory to override an AI risk flag.', 'error');
      return;
    }

    overrideMLRisk(selectedTrtForOverride.id, overrideReason);
    setSelectedTrtForOverride(null);
    setOverrideReason('');
  };

  const handleEscalate = (trt: Treatment) => {
    showToast(
      'Case Escalated to State Epidemiologist',
      `Treatment ${trt.treatmentNumber} for ${trt.animalTagId} forwarded for district AMR surveillance review.`,
      'info'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-700" />
              Machine Learning AMU & Compliance Risk Review
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
              v2.4 AMR-Predict Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-assisted surveillance identifying Critically Important Antimicrobial overuse patterns, rapid re-treatments, and MRL compliance risks.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 self-start sm:self-auto">
          {flaggedCases.length} Flagged High-Priority Cases
        </span>
      </div>

      {/* Flagged Cases Grid */}
      <div className="space-y-4">
        {flaggedCases.map(trt => (
          <div
            key={trt.id}
            className={`p-5 rounded-2xl bg-white border transition shadow-xs space-y-4 ${
              trt.overuseRisk === 'HIGH' ? 'border-rose-300 ring-2 ring-rose-400/20' : 'border-amber-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  trt.overuseRisk === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 font-mono">{trt.treatmentNumber}</h4>
                    <span className="text-xs font-bold text-slate-600">({trt.farmName})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Animal Tag: <strong className="font-mono text-slate-800">{trt.animalTagId}</strong> ({trt.animalSpecies}) • Medicine: <strong className="text-teal-800">{trt.medicineName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RiskBadge riskLevel={trt.overuseRisk} confidenceScore={trt.mlConfidenceScore} labelPrefix="Overuse Risk" />
              </div>
            </div>

            {/* AI Attribution & Contributing Factors */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Model Decision Drivers & Contributing Risk Factors:
              </span>
              <ul className="space-y-1 text-xs text-slate-700 pl-2">
                {trt.mlContributingFactors?.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Override Log if Already Overridden */}
            {trt.vetOverrideReason && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950">
                <span className="font-bold block text-teal-900 mb-0.5">Clinical Override Logged:</span>
                <p className="italic">"{trt.vetOverrideReason}"</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400">
                * Overriding AI decision support requires mandatory recorded clinical justification for state audit.
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEscalate(trt)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  Escalate to State AMR Cell
                </button>

                <button
                  onClick={() => {
                    setSelectedTrtForOverride(trt);
                    setOverrideReason(`Clinical justification: Severe systemic infection unresponsive to first-line agents. Culture sample sent to referral lab. Strict ${trt.statutoryWithdrawalDays}-day withholding enforced.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Override & Authorize
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Override Dialog Modal */}
      {selectedTrtForOverride && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Log Clinical Override Justification</h3>
                <p className="text-xs text-teal-200">Mandatory recording for National AMR Surveillance Ledger</p>
              </div>
              <button
                onClick={() => setSelectedTrtForOverride(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Ref:</span> <strong className="font-mono text-slate-800">{selectedTrtForOverride.treatmentNumber}</strong>
                <span className="mx-2">•</span>
                <span className="text-slate-500">Medicine:</span> <strong className="text-rose-700">{selectedTrtForOverride.medicineName}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinical Override Justification *
                </label>
                <textarea
                  rows={4}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State the clinical diagnostic rationale for approving this restricted or high-risk antimicrobial treatment..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTrtForOverride(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Override to Audit Trail
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

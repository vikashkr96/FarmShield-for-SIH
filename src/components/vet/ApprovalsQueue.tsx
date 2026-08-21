import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Treatment } from '../../types';
import { 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Sparkles, 
  FileText, 
  MessageSquare,
  ShieldAlert,
  X
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const ApprovalsQueue: React.FC = () => {
  const { treatments, coSignTreatment, showToast, t } = useApp();

  const [selectedTrt, setSelectedTrt] = useState<Treatment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');

  const pendingTreatments = treatments.filter(t => t.status === 'PENDING_VET_REVIEW');

  const handleCoSign = (trtId: string) => {
    if (!clinicalNotes) {
      showToast('Validation', 'Please provide clinical validation observations before co-signing.', 'error');
      return;
    }

    coSignTreatment(trtId, clinicalNotes);
    setSelectedTrt(null);
    setClinicalNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-700" />
            Veterinary Co-Signature & Prescription Review Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and co-sign antimicrobial treatments entered by farmers across your linked veterinary jurisdiction.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
          {pendingTreatments.length} Treatments Awaiting Co-Signature
        </span>
      </div>

      {/* Pending Items List */}
      {pendingTreatments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
          <h3 className="text-base font-bold text-slate-800">All Treatments Reviewed</h3>
          <p className="text-xs text-slate-500 mt-1">There are no pending treatments awaiting veterinary co-signature at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTreatments.map(trt => (
            <div
              key={trt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-teal-500 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    {trt.treatmentNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {trt.farmName} • <span className="font-mono text-teal-800">{trt.animalTagId}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Target: {trt.animalSpecies} • Recorded by Farmer: <strong>{trt.recordedByUserName}</strong> on {trt.createdAt?.substring(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <RiskBadge riskLevel={trt.overuseRisk} labelPrefix="AMR Risk" />
                </div>
              </div>

              {/* Medicine & Dosing Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Medicine / Active</span>
                  <span className="font-bold text-slate-800">{trt.medicineName}</span>
                  <span className="text-[10px] text-slate-500 block">({trt.activeIngredient})</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Class & Route</span>
                  <span className="font-semibold text-slate-700">{trt.antimicrobialClass}</span>
                  <span className="text-[10px] text-slate-500 block">{trt.route}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Dose & Duration</span>
                  <span className="font-semibold text-slate-700">{trt.dose} ({trt.frequency})</span>
                  <span className="text-[10px] text-slate-500 block">{trt.durationDays} Days Course</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Withholding Clearance</span>
                  <span className="font-bold text-rose-700">{trt.calculatedClearanceDate}</span>
                  <span className="text-[10px] text-slate-500 block">{trt.statutoryWithdrawalDays} days withholding</span>
                </div>
              </div>

              {/* Farmer Diagnosis */}
              <div className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                <span className="font-bold text-amber-900 block mb-0.5">Reported Clinical Symptoms:</span>
                <p className="italic text-slate-700">"{trt.reasonForTreatment}"</p>
              </div>

              {/* ML Contributing Factors if High */}
              {trt.mlContributingFactors && trt.mlContributingFactors.length > 0 && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    AI Surveillance Risk Factors:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {trt.mlContributingFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button to Open Co-Sign Dialog */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setSelectedTrt(trt);
                    setClinicalNotes(`Clinical verification complete for ${trt.animalTagId}. Approved treatment course with ${trt.medicineName}. Strict milk/meat withholding enforced until ${trt.calculatedClearanceDate}.`);
                  }}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Review & Co-Sign Treatment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Co-Sign Modal */}
      {selectedTrt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Veterinary Validation & Co-Signature</h3>
                <p className="text-xs text-teal-200 font-mono">Ref: {selectedTrt.treatmentNumber}</p>
              </div>
              <button
                onClick={() => setSelectedTrt(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Target:</span> <strong className="text-slate-800">{selectedTrt.animalTagId} ({selectedTrt.animalSpecies})</strong>
                <span className="mx-2">•</span>
                <span className="text-slate-500">Medicine:</span> <strong className="text-teal-800">{selectedTrt.medicineName}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinical Examination & Co-Sign Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter clinical examination findings, culture sample details, or statutory withholding instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-950 flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <p>
                  By co-signing, you certify that this antimicrobial prescription adheres to VCI guidelines and the Food Safety and Standards Authority of India (FSSAI) MRL limits.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTrt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCoSign(selectedTrt.id)}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Sign & Authorize
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

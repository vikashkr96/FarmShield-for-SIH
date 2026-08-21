import React from 'react';
import { useApp } from '../../context/AppContext';
import { Animal, Treatment } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertOctagon, 
  QrCode, 
  FileText, 
  Plus, 
  Activity, 
  Pill,
  UserCheck
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';

interface AnimalDetailModalProps {
  animal: Animal | null;
  onClose: () => void;
  onOpenNewTreatment: (animalId: string) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  onClose,
  onOpenNewTreatment
}) => {
  const { treatments, setSelectedAnimalForPassport, t } = useApp();

  if (!animal) return null;

  const animalTreatments = treatments.filter(t => t.animalId === animal.id || t.animalTagId === animal.tagId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-teal-950 to-teal-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <img
              src={animal.photoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=150'}
              alt={animal.tagId}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-mono">{animal.tagId}</h3>
                <StatusBadge status={animal.currentStatus} daysRemaining={animal.daysRemainingInWithdrawal} size="sm" />
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                {animal.species} • {animal.breed} • {animal.gender} • {animal.weightKg} kg • {animal.purpose}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedAnimalForPassport(animal);
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-600/80 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              Food Passport
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Withdrawal Status Card */}
          <div className={`p-4 rounded-2xl border ${
            animal.currentStatus === 'CLEARED'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Clearance Status
                </span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">
                  {animal.currentStatus === 'CLEARED' 
                    ? '🟢 Cleared for Food Supply Chain' 
                    : `🔴 Active Withholding: ${animal.activeWithdrawalType || 'Milk & Meat'}`
                  }
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {animal.currentStatus === 'CLEARED'
                    ? 'No active antimicrobial residues detected. Milk and meat are safe for commercial release.'
                    : `Statutory withdrawal period expires on ${animal.earliestClearanceDate} (${animal.daysRemainingInWithdrawal} days remaining).`
                  }
                </p>
              </div>

              <button
                onClick={() => onOpenNewTreatment(animal.id)}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Record New Treatment
              </button>
            </div>
          </div>

          {/* Key Animal Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Date of Birth / Age</span>
              <span className="text-xs font-bold text-slate-800">{animal.dob} ({animal.ageMonths} mo)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Live Weight</span>
              <span className="text-xs font-bold text-slate-800">{animal.weightKg} kg</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Registered Farm</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{animal.farmName}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Registration Date</span>
              <span className="text-xs font-bold text-slate-800">{animal.registeredAt}</span>
            </div>
          </div>

          {/* Health Notes */}
          {animal.healthNotes && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-1">Clinical Notes & Baseline</span>
              <p className="text-xs text-slate-600 leading-relaxed">{animal.healthNotes}</p>
            </div>
          )}

          {/* Medical & Treatment History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                Treatment & MRL History ({animalTreatments.length})
              </h4>
            </div>

            {animalTreatments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <Pill className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs">No prior veterinary treatments recorded for this animal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {animalTreatments.map(trt => (
                  <div
                    key={trt.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-slate-900">{trt.medicineName}</h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {trt.treatmentNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            trt.status === 'APPROVED_BY_VET' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {trt.status === 'APPROVED_BY_VET' ? 'Vet Co-Signed' : 'Pending Co-Signature'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Active Ingredient: <strong className="text-slate-700">{trt.activeIngredient}</strong> ({trt.antimicrobialClass})
                        </p>
                      </div>

                      <RiskBadge riskLevel={trt.overuseRisk} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-400 block">Dose & Route:</span>
                        <span className="font-semibold text-slate-700">{trt.dose} • {trt.route}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Course Duration:</span>
                        <span className="font-semibold text-slate-700">{trt.startDate} ({trt.durationDays} days)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Withholding:</span>
                        <span className="font-semibold text-rose-700">{trt.statutoryWithdrawalDays} days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Clearance Date:</span>
                        <span className="font-bold text-emerald-700">{trt.calculatedClearanceDate}</span>
                      </div>
                    </div>

                    {trt.vetClinicalNotes && (
                      <div className="text-[11px] bg-teal-50/70 p-2 rounded-lg text-teal-900 flex items-start gap-1.5 border border-teal-100">
                        <UserCheck className="w-3.5 h-3.5 text-teal-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>{trt.prescribedByVetName || 'Veterinarian'}:</strong> {trt.vetClinicalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

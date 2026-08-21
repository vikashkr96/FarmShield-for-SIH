import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Animal, Medicine } from '../../types';
import { 
  X, 
  Pill, 
  Calendar, 
  Calculator, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface NewTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAnimalId?: string;
}

export const NewTreatmentModal: React.FC<NewTreatmentModalProps> = ({
  isOpen,
  onClose,
  preselectedAnimalId
}) => {
  const { animals, medicines, recordTreatment, showToast, t } = useApp();

  const [selectedAnimalId, setSelectedAnimalId] = useState(preselectedAnimalId || animals[0]?.id || '');
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [route, setRoute] = useState('Intramuscular (IM)');
  const [dose, setDose] = useState('15 ml');
  const [frequency, setFrequency] = useState<'Once Daily (QD)' | 'Twice Daily (BID)' | 'Single Dose' | 'Every 48 Hours'>('Once Daily (QD)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState(3);
  const [reason, setReason] = useState('Bovine respiratory disease with elevated body temperature.');
  const [affectedProducts, setAffectedProducts] = useState<('Milk' | 'Meat' | 'Eggs')[]>(['Milk', 'Meat']);

  const targetAnimal = animals.find(a => a.id === selectedAnimalId);
  const targetMedicine = medicines.find(m => m.id === selectedMedId);

  // Live Auto-Calculation of Withdrawal Period and Clearance Date
  const calculationResult = useMemo(() => {
    if (!targetAnimal || !targetMedicine) return null;

    const speciesRule = targetMedicine.defaultWithdrawalDays.find(
      s => s.species === targetAnimal.species
    ) || {
      species: targetAnimal.species,
      milkDays: 4,
      meatDays: 14,
      eggsDays: 0
    };

    let statutoryWithdrawalDays = 0;
    if (affectedProducts.includes('Milk')) {
      statutoryWithdrawalDays = Math.max(statutoryWithdrawalDays, speciesRule.milkDays);
    }
    if (affectedProducts.includes('Meat')) {
      statutoryWithdrawalDays = Math.max(statutoryWithdrawalDays, speciesRule.meatDays);
    }
    if (affectedProducts.includes('Eggs')) {
      statutoryWithdrawalDays = Math.max(statutoryWithdrawalDays, speciesRule.eggsDays);
    }

    if (statutoryWithdrawalDays === 0) {
      statutoryWithdrawalDays = speciesRule.milkDays || speciesRule.meatDays || 3;
    }

    // Clearance Date = Start Date + Duration + Statutory Days
    const start = new Date(startDate);
    const endTreatment = new Date(start);
    endTreatment.setDate(endTreatment.getDate() + Number(durationDays));

    const clearanceDate = new Date(endTreatment);
    clearanceDate.setDate(clearanceDate.getDate() + statutoryWithdrawalDays);

    const clearanceDateStr = clearanceDate.toISOString().split('T')[0];
    const endTreatmentStr = endTreatment.toISOString().split('T')[0];

    // ML Risk Simulation
    let mlRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let riskReason = 'Standard therapeutic dosage compliant with national MRL thresholds.';

    if (targetMedicine.isCIA) {
      mlRisk = 'HIGH';
      riskReason = 'Highest Priority Critically Important Antimicrobial (CIA). Requires mandatory Veterinary Co-Signature.';
    } else if (durationDays > 5) {
      mlRisk = 'MEDIUM';
      riskReason = 'Extended duration exceeding 5-day empirical threshold.';
    }

    return {
      speciesRule,
      statutoryWithdrawalDays,
      endTreatmentStr,
      clearanceDateStr,
      mlRisk,
      riskReason
    };
  }, [targetAnimal, targetMedicine, startDate, durationDays, affectedProducts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalId || !selectedMedId) {
      showToast('Validation Error', 'Please select both an animal and a medicine.', 'error');
      return;
    }

    recordTreatment({
      animalId: selectedAnimalId,
      medicineId: selectedMedId,
      route,
      dose,
      frequency,
      startDate,
      durationDays: Number(durationDays),
      reasonForTreatment: reason,
      affectedProducts
    });

    onClose();
  };

  const toggleProduct = (prod: 'Milk' | 'Meat' | 'Eggs') => {
    setAffectedProducts(prev => 
      prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Pill className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Record Veterinary Treatment</h3>
              <p className="text-xs text-teal-200">Real-time statutory MRL withdrawal calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Animal & Medicine Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Livestock Animal *
              </label>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {animals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.tagId} ({a.species} - {a.breed}, {a.weightKg}kg)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Medicine from Master Catalog *
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => {
                  setSelectedMedId(e.target.value);
                  const med = medicines.find(m => m.id === e.target.value);
                  if (med && med.routes.length > 0) {
                    setRoute(med.routes[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.brandName} ({m.activeIngredient}) {m.isCIA ? '🔴 [CIA]' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administration Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                {targetMedicine?.routes.map(r => (
                  <option key={r} value={r}>{r}</option>
                )) || <option value="Intramuscular (IM)">Intramuscular (IM)</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dose & Unit</label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 15 ml (3.5 mg/kg)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e: any) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="Once Daily (QD)">Once Daily (QD)</option>
                <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                <option value="Single Dose">Single Dose</option>
                <option value="Every 48 Hours">Every 48 Hours</option>
              </select>
            </div>
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Affected Food Products</label>
              <div className="flex gap-1.5 pt-1">
                {(['Milk', 'Meat', 'Eggs'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProduct(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      affectedProducts.includes(p)
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis / Symptoms</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Acute coliform mastitis in hind quarter"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* LIVE AUTO-CALCULATED WITHDRAWAL ENGINE BOX */}
          {calculationResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-700" />
                  <span className="font-extrabold text-xs text-teal-950 uppercase tracking-wider">
                    Live Withdrawal Engine Output
                  </span>
                </div>
                <RiskBadge riskLevel={calculationResult.mlRisk} labelPrefix="AMR Risk" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Statutory Withholding</span>
                  <span className="text-base font-extrabold text-rose-700 font-mono">
                    {calculationResult.statutoryWithdrawalDays} Days
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Post-treatment cycle</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Treatment Ends</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {calculationResult.endTreatmentStr}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Final dose administered</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border-2 border-emerald-500 col-span-2 sm:col-span-1 shadow-xs">
                  <span className="text-[10px] text-emerald-800 font-bold block">🟢 Earliest Clearance Date</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {calculationResult.clearanceDateStr}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Safe for dairy/abattoir</span>
                </div>
              </div>

              <div className="text-[11px] text-teal-900 bg-white/70 p-2.5 rounded-lg border border-teal-200/80 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Regulatory Basis:</strong> {targetMedicine?.guidelineReference}. {calculationResult.riskReason}
                </p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Treatment & Lock Withdrawal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

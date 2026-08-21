import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radar, 
  AlertTriangle, 
  Repeat, 
  ShieldAlert, 
  Pill, 
  Clock, 
  Activity,
  UserCheck
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const RepeatedTreatmentRadar: React.FC = () => {
  const { animals, treatments, t } = useApp();

  // Find animals with >= 2 treatments
  const repeatedCases = animals.map(animal => {
    const animalTrts = treatments.filter(t => t.animalId === animal.id || t.animalTagId === animal.tagId);
    return {
      animal,
      treatments: animalTrts,
      count: animalTrts.length
    };
  }).filter(c => c.count >= 2);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-teal-700" />
              Repeated Antimicrobial Treatment Radar
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              AMR Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance monitor detecting animals or herds undergoing multiple antimicrobial cycles within short intervals.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 self-start sm:self-auto">
          {repeatedCases.length} Animals with Multiple Treatment Cycles
        </span>
      </div>

      {/* Radar Cards */}
      <div className="space-y-4">
        {repeatedCases.map(({ animal, treatments: trts, count }) => (
          <div
            key={animal.id}
            className="p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black font-mono">
                  {count}x
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-mono">
                    {animal.tagId} <span className="font-sans font-normal text-slate-500">({animal.species} • {animal.breed})</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Farm: <strong className="text-slate-700">{animal.farmName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Chronic Cycle Risk
                </span>
              </div>
            </div>

            {/* Treatment Timeline History */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Antimicrobial Regimen Sequence:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trts.map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">Cycle #{idx + 1}: {t.medicineName}</span>
                      <span className="text-[10px] text-slate-500">{t.startDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Active: <strong>{t.activeIngredient}</strong> ({t.dose}, {t.durationDays}d)
                    </p>
                    <p className="text-[10px] text-slate-500 italic">
                      Diagnosis: "{t.reasonForTreatment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory Box */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2">
              <Activity className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Clinical Stewardship Recommendation:</strong> Conduct an Antimicrobial Susceptibility Test (AST / Antibiogram) before initiating any further 3rd-generation cephalosporins or fluoroquinolones.
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

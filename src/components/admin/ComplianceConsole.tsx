import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabSample } from '../../types';
import { 
  ShieldAlert, 
  Plus, 
  FlaskConical, 
  CheckCircle2, 
  AlertOctagon, 
  FileText, 
  Download, 
  Calendar, 
  Building, 
  X 
} from 'lucide-react';

export const ComplianceConsole: React.FC = () => {
  const { labSamples, recordLabSample, animals, showToast, t } = useApp();

  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [sampleCode, setSampleCode] = useState(`NRL-DAHD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [farmName, setFarmName] = useState('Green Meadows Dairy & Breeding Farm');
  const [animalTagId, setAnimalTagId] = useState('IN-HAR-2024-8842');
  const [sampleType, setSampleType] = useState<'Raw Milk' | 'Muscle Meat' | 'Liver' | 'Eggs'>('Raw Milk');
  const [testingLabName, setTestingLabName] = useState('National Referral Lab for Dairy Quality, ICAR-NDRI Karnal');
  const [testingMethod, setTestingMethod] = useState<'LC-MS/MS' | 'HPLC' | 'ELISA' | 'Rapid Strip'>('LC-MS/MS');
  const [targetedSubstance, setTargetedSubstance] = useState('Enrofloxacin & Ciprofloxacin');
  const [residueLevel_ug_kg, setResidueLevel_ug_kg] = useState(45.2);
  const [statutoryMRL_ug_kg, setStatutoryMRL_ug_kg] = useState(100.0);
  const [officerName, setOfficerName] = useState('Dr. S. K. Murthy (Joint Commissioner)');

  const handleRecordSample = (e: React.FormEvent) => {
    e.preventDefault();
    const isViolation = Number(residueLevel_ug_kg) > Number(statutoryMRL_ug_kg);
    const verdict = isViolation ? 'VIOLATION (MRL Exceeded)' : 'COMPLIANT (Within MRL)';

    recordLabSample({
      sampleCode,
      farmId: 'farm-hr-01',
      farmName,
      animalTagId,
      sampleType,
      collectionDate: new Date().toISOString().split('T')[0],
      testingLabName,
      testingMethod,
      targetedSubstance,
      residueLevel_ug_kg: Number(residueLevel_ug_kg),
      statutoryMRL_ug_kg: Number(statutoryMRL_ug_kg),
      verdict,
      actionTaken: isViolation ? 'Quarantine & product withholding notice dispatched.' : undefined,
      officerName
    });

    setIsRecordOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-700" />
              National Laboratory MRL Residue Testing Console
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ISO/IEC 17025 Accredited Labs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log official analytical laboratory test samples (LC-MS/MS, HPLC), compare against statutory MRLs, and issue automatic enforcement notices.
          </p>
        </div>

        <button
          onClick={() => setIsRecordOpen(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Lab Residue Test Result
        </button>
      </div>

      {/* Lab Samples Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Sample Code / Date</th>
                <th className="py-3.5 px-4">Origin Farm & Animal</th>
                <th className="py-3.5 px-4">Testing Laboratory</th>
                <th className="py-3.5 px-4">Substance & Method</th>
                <th className="py-3.5 px-4">Residue vs MRL (µg/kg)</th>
                <th className="py-3.5 px-4">Compliance Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labSamples.map(sample => {
                const isViolation = sample.verdict.includes('VIOLATION');

                return (
                  <tr key={sample.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{sample.sampleCode}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sample.collectionDate}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{sample.farmName}</span>
                      <span className="text-[11px] font-mono text-teal-800">Tag: {sample.animalTagId}</span>
                      <span className="block text-[10px] text-slate-400">Matrix: {sample.sampleType}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 block max-w-[200px] leading-tight">
                        {sample.testingLabName}
                      </span>
                      <span className="text-[10px] text-slate-400">Analyst: {sample.officerName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{sample.targetedSubstance}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-0.5">
                        {sample.testingMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-black ${isViolation ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {sample.residueLevel_ug_kg}
                        </span>
                        <span className="text-[11px] text-slate-400">/ {sample.statutoryMRL_ug_kg} µg/kg</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isViolation ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                          MRL VIOLATION
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          COMPLIANT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Lab Sample Modal */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Official Analytical Lab Result</h3>
                <p className="text-xs text-teal-200">Statutory MRL Surveillance Ledger</p>
              </div>
              <button
                onClick={() => setIsRecordOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSample} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sample Tracking Code *</label>
                  <input
                    type="text"
                    required
                    value={sampleCode}
                    onChange={(e) => setSampleCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Animal Ear Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={animalTagId}
                    onChange={(e) => setAnimalTagId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin Producer Farm</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Food Matrix / Product</label>
                  <select
                    value={sampleType}
                    onChange={(e: any) => setSampleType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Raw Milk">Raw Milk</option>
                    <option value="Muscle Meat">Muscle Meat</option>
                    <option value="Liver">Liver Tissue</option>
                    <option value="Eggs">Table Eggs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Analytical Testing Method</label>
                  <select
                    value={testingMethod}
                    onChange={(e: any) => setTestingMethod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="LC-MS/MS">LC-MS/MS (Confirmatory)</option>
                    <option value="HPLC">HPLC-UV / FLD</option>
                    <option value="ELISA">ELISA Quantitative</option>
                    <option value="Rapid Strip">Rapid Lateral Flow Strip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Testing Laboratory Name</label>
                  <input
                    type="text"
                    value={testingLabName}
                    onChange={(e) => setTestingLabName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Targeted Antimicrobial Substance</label>
                <input
                  type="text"
                  value={targetedSubstance}
                  onChange={(e) => setTargetedSubstance(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detected Residue (µg/kg) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={residueLevel_ug_kg}
                    onChange={(e) => setResidueLevel_ug_kg(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statutory MRL Limit (µg/kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={statutoryMRL_ug_kg}
                    onChange={(e) => setStatutoryMRL_ug_kg(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Save & Publish Residue Report
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

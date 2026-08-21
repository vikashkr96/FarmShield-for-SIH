import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RegulatoryRule, AnimalSpecies } from '../../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  X,
  Sparkles
} from 'lucide-react';

export const RegulatoryDataManager: React.FC = () => {
  const { regulatoryRules, addRegulatoryRule, deleteRegulatoryRule, t } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [ruleCode, setRuleCode] = useState(`MRL-NEW-${Math.floor(100 + Math.random() * 900)}`);
  const [activeIngredient, setActiveIngredient] = useState('Amoxicillin');
  const [species, setSpecies] = useState<AnimalSpecies>('Cattle');
  const [productType, setProductType] = useState<'Milk' | 'Meat' | 'Kidney' | 'Liver' | 'Eggs'>('Milk');
  const [mrl_ug_kg, setMrl_ug_kg] = useState(4);
  const [mandatoryWithdrawalPeriodDays, setMandatoryWithdrawalPeriodDays] = useState(3);
  const [version, setVersion] = useState('v1.0');
  const [authority, setAuthority] = useState<'FSSAI' | 'DAHD' | 'Codex Alimentarius'>('FSSAI');
  const [gazetteNotificationRef, setGazetteNotificationRef] = useState('FSSAI Gazette Standards 2026 Notification S.O. 418(E)');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    addRegulatoryRule({
      ruleCode,
      version,
      activeIngredient,
      species,
      productType,
      mrl_ug_kg: Number(mrl_ug_kg),
      mandatoryWithdrawalPeriodDays: Number(mandatoryWithdrawalPeriodDays),
      effectiveDate: new Date().toISOString().split('T')[0],
      gazetteNotificationRef,
      authority,
      status: 'Active'
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              Statutory MRL & Withdrawal Rules Reference Master
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
              Live Regulatory Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage versioned statutory Maximum Residue Limits (µg/kg) and mandatory withholding days. All application calculations dynamically reference this database.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Statutory Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Rule Code / Ver</th>
                <th className="py-3.5 px-4">Active Ingredient</th>
                <th className="py-3.5 px-4">Species & Matrix</th>
                <th className="py-3.5 px-4">MRL Limit (µg/kg)</th>
                <th className="py-3.5 px-4">Statutory Withholding</th>
                <th className="py-3.5 px-4">Authority & Gazette Ref</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regulatoryRules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{rule.ruleCode}</span>
                    <span className="text-[10px] text-teal-700 font-bold">{rule.version}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 text-xs">{rule.activeIngredient}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{rule.species}</span>
                    <span className="block text-[10px] text-slate-500">{rule.productType}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-extrabold text-teal-800 text-sm">
                      {rule.mrl_ug_kg}
                    </span>
                    <span className="text-[10px] text-slate-400 block">µg/kg (ppb)</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-rose-700 text-sm">
                      {rule.mandatoryWithdrawalPeriodDays} Days
                    </span>
                    <span className="text-[10px] text-slate-400 block">Mandatory Withholding</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-700 text-[11px] block">{rule.authority}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px] block">
                      {rule.gazetteNotificationRef}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteRegulatoryRule(rule.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Archive Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Statutory MRL & Withdrawal Rule</h3>
                <p className="text-xs text-teal-200">Enacted under FSSAI / DAHD Gazette Notification</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rule Identifier Code *</label>
                  <input
                    type="text"
                    required
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Ingredient Substance *</label>
                <input
                  type="text"
                  required
                  value={activeIngredient}
                  onChange={(e) => setActiveIngredient(e.target.value)}
                  placeholder="e.g. Enrofloxacin / Ceftiofur / Ivermectin"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Species *</label>
                  <select
                    value={species}
                    onChange={(e: any) => setSpecies(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Cattle">Cattle (Cow)</option>
                    <option value="Buffalo">Buffalo</option>
                    <option value="Broiler Poultry">Broiler Poultry</option>
                    <option value="Layer Poultry">Layer Poultry</option>
                    <option value="Goat">Goat</option>
                    <option value="Sheep">Sheep</option>
                    <option value="Pig">Pig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Food Matrix / Product *</label>
                  <select
                    value={productType}
                    onChange={(e: any) => setProductType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Milk">Raw Milk</option>
                    <option value="Meat">Muscle Meat</option>
                    <option value="Kidney">Kidney Tissue</option>
                    <option value="Liver">Liver Tissue</option>
                    <option value="Eggs">Table Eggs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statutory MRL (µg/kg) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={mrl_ug_kg}
                    onChange={(e) => setMrl_ug_kg(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Withholding (Days) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={mandatoryWithdrawalPeriodDays}
                    onChange={(e) => setMandatoryWithdrawalPeriodDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Regulatory Authority</label>
                  <select
                    value={authority}
                    onChange={(e: any) => setAuthority(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="FSSAI">FSSAI</option>
                    <option value="DAHD">DAHD (Dept of Animal Husbandry)</option>
                    <option value="Codex Alimentarius">Codex Alimentarius (FAO/WHO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gazette Notification Ref</label>
                  <input
                    type="text"
                    value={gazetteNotificationRef}
                    onChange={(e) => setGazetteNotificationRef(e.target.value)}
                    placeholder="e.g. FSSAI Gazette Notification S.O. 123"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Publish Statutory Rule
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

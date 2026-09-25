'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Settings, PlusCircle, Database, Shield, FileText, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medActiveIng, setMedActiveIng] = useState('');
  const [medClass, setMedClass] = useState('Penicillins');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMeds, resRules] = await Promise.all([
        fetch('http://localhost:5000/api/medicines'),
        fetch('http://localhost:5000/api/regulatory-rules'),
      ]);
      const dataMeds = await resMeds.json();
      const dataRules = await resRules.json();

      if (dataMeds.status === 'success') setMedicines(dataMeds.data);
      if (dataRules.status === 'success') setRules(dataRules.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medActiveIng) return;

    try {
      await fetch('http://localhost:5000/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: medName, active_ingredient: medActiveIng, antimicrobial_class: medClass }),
      });
      setShowAddMed(false);
      setMedName('');
      setMedActiveIng('');
      fetchData();
    } catch {
      // Error handling
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Admin Header Banner */}
      <div className="bg-[#1B5E20] text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#1B5E20] flex items-center justify-center text-3xl shadow-lg">
            ⚙️
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{t('admin.title')}</h1>
            <p className="text-xs text-[#E8F5E9] font-bold">{t('admin.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Medicines Catalog & Regulatory Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicines Catalog */}
        <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#1B5E20]" />
              <span>{t('admin.manageMedicines')}</span>
            </h3>
            <Button variant="primary" size="sm" onClick={() => setShowAddMed(true)} leftIcon={<PlusCircle className="w-4 h-4 text-white" />} className="bg-[#1B5E20]">
              {t('admin.addMedicine')}
            </Button>
          </div>

          <div className="space-y-3 text-xs font-bold">
            {medicines.map((m) => (
              <div key={m.id} className="bg-[#E8F5E9] p-4 rounded-2xl border border-[#A5D6A7] flex justify-between items-center">
                <div>
                  <h4 className="font-black text-[#1B5E20] text-sm">{m.name}</h4>
                  <span className="text-gray-700">{m.active_ingredient} • {m.antimicrobial_class}</span>
                </div>
                <Badge variant="success" className="bg-white text-[#1B5E20] border-[#1B5E20]">{m.strength || 'Active'}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* FSSAI Regulatory Rules */}
        <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1B5E20]" />
              <span>{t('admin.manageRules')}</span>
            </h3>
            <Badge variant="info" className="bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]">FSSAI Standards 2026</Badge>
          </div>

          <div className="space-y-3 text-xs font-bold">
            {rules.map((r) => (
              <div key={r.id} className="bg-[#E8F5E9] p-4 rounded-2xl border border-[#A5D6A7] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[#1B5E20] text-sm capitalize">{r.species} - {r.product}</span>
                  <span className="text-[#1B5E20] font-black">{r.withdrawal_days} Days Wait</span>
                </div>
                <div className="flex justify-between text-gray-700 text-[11px]">
                  <span>MRL Limit: {r.mrl}</span>
                  <span>Jurisdiction: {r.jurisdiction}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Medicine Modal */}
      {showAddMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-4 text-xs font-bold text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-lg font-black text-[#1B5E20]">{t('admin.addMedicine')}</h2>
              <button onClick={() => setShowAddMed(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Medicine Trade Name *</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Cefquinome Inj"
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Active Ingredient *</label>
                <input
                  type="text"
                  required
                  value={medActiveIng}
                  onChange={(e) => setMedActiveIng(e.target.value)}
                  placeholder="e.g. Cefquinome Sulfate"
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <Button type="button" variant="ghost" onClick={() => setShowAddMed(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary" className="bg-[#1B5E20]">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

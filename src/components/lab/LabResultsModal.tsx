'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  Upload,
} from 'lucide-react';
import { LabResult, TargetProduct } from '../../types/database';

interface LabResultsProps {
  onBack?: () => void;
}

export const LabResultsModal: React.FC<LabResultsProps> = ({ onBack }) => {
  const [results, setResults] = useState<LabResult[]>([
    {
      id: 'lab-01',
      animal_id: 'a101',
      product: 'milk',
      analyte: 'Amoxicillin Residue',
      result: 2.1,
      unit: 'ug/kg',
      test_date: '2024-09-10',
      laboratory: 'National Dairy Research Institute (NDRI) Analytical Lab',
      mrl_limit: 4.0,
      is_compliant: true,
    },
    {
      id: 'lab-02',
      animal_id: 'a102',
      product: 'milk',
      analyte: 'Oxytetracycline Residue',
      result: 145.0,
      unit: 'ug/kg',
      test_date: '2024-09-12',
      laboratory: 'State Veterinary Diagnostic Lab (Pune)',
      mrl_limit: 100.0,
      is_compliant: false,
    },
    {
      id: 'lab-03',
      animal_id: 'a101',
      product: 'milk',
      analyte: 'Somatic Cell Count (SCC)',
      result: 180000,
      unit: 'cells/ml',
      test_date: '2024-09-14',
      laboratory: 'District Veterinary Polyclinic Lab',
      mrl_limit: 400000,
      is_compliant: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [analyte, setAnalyte] = useState<string>('Amoxicillin Residue');
  const [product, setProduct] = useState<TargetProduct>('milk');
  const [measuredValue, setMeasuredValue] = useState<number>(3.0);
  const [unit, setUnit] = useState<string>('ug/kg');
  const [mrlLimit, setMrlLimit] = useState<number>(4.0);
  const [laboratory, setLaboratory] = useState<string>('District Veterinary Polyclinic Lab');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCompliant = measuredValue <= mrlLimit;
    const newRecord: LabResult = {
      id: `lab-${Date.now()}`,
      animal_id: 'a101',
      product,
      analyte,
      result: measuredValue,
      unit,
      test_date: new Date().toISOString().split('T')[0],
      laboratory,
      mrl_limit: mrlLimit,
      is_compliant: isCompliant,
    };
    setResults([newRecord, ...results]);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg">
            <FlaskConical className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Laboratory Residue & Somatic Diagnostic Records
              <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-0.5 rounded-full font-black border border-[#A5D6A7]">
                NABL AUDITED
              </span>
            </h1>
            <p className="text-xs text-gray-600 font-bold">
              FSSAI Milk & Meat MRL Quantitative Testing • HPLC & Screening Assays
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Upload Lab Result'}</span>
        </button>
      </div>

      {/* Add New Test Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-6 bg-white rounded-3xl border-2 border-[#1B5E20]/30 shadow-lg space-y-4 text-xs font-bold text-gray-700"
        >
          <h3 className="text-sm font-black text-gray-900">Record New Analytical Certificate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-gray-600">Analyte / Test Parameter</label>
              <input
                type="text"
                value={analyte}
                onChange={(e) => setAnalyte(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-black text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Measured Value</label>
              <input
                type="number"
                step="0.1"
                value={measuredValue}
                onChange={(e) => setMeasuredValue(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-black text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Statutory MRL Limit</label>
              <input
                type="number"
                step="0.1"
                value={mrlLimit}
                onChange={(e) => setMrlLimit(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-black text-gray-900 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#1B5E20] text-white rounded-xl font-black shadow"
            >
              Save Certificate
            </button>
          </div>
        </form>
      )}

      {/* Lab Results Table / Cards */}
      <div className="space-y-4">
        {results.map((res) => (
          <div
            key={res.id}
            className={`p-5 bg-white rounded-3xl border-2 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
              res.is_compliant ? 'border-emerald-200' : 'border-red-300 bg-red-50/20'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-gray-500">
                  {res.product} Sample
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    res.is_compliant
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800 animate-pulse'
                  }`}
                >
                  {res.is_compliant ? '✓ Compliant with MRL' : '⚠️ Exceeds MRL'}
                </span>
              </div>
              <h3 className="text-base font-black text-gray-900">{res.analyte}</h3>
              <p className="text-xs text-gray-500 font-medium">
                Tested by: <span className="font-bold text-gray-700">{res.laboratory}</span> • Date: {res.test_date}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
              <div className="text-xl font-black font-mono text-gray-900">
                {(res.result ?? res.result_value ?? 0).toLocaleString()} <span className="text-xs font-bold text-gray-500">{res.unit}</span>
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">
                Threshold: ≤ {res.mrl_limit != null ? res.mrl_limit.toLocaleString() : 'N/A'} {res.unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  FileText,
  ArrowLeft,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';

interface ReportsProps {
  onBack?: () => void;
}

export const ReportsModal: React.FC<ReportsProps> = ({ onBack }) => {
  const [selectedReportType, setSelectedReportType] = useState<
    'amu_ledger' | 'withdrawal_cert' | 'herd_health'
  >('amu_ledger');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to dashboard"
              className="p-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg shrink-0">
            <FileText className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 flex-wrap">
              Statutory Regulatory Reports & Audit Certificates
              <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-0.5 rounded-full font-black border border-[#A5D6A7]">
                OFFICIAL
              </span>
            </h1>
            <p className="text-xs text-gray-600 font-bold">
              Printable & Exportable Declarations for Dairy Co-ops, Insurance & Veterinary Audits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            aria-label="Print Official Certificate"
            className="px-4 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-col sm:flex-row border-b border-gray-200 bg-white rounded-2xl p-1.5 gap-2 text-xs font-black shadow-sm">
        <button
          onClick={() => setSelectedReportType('amu_ledger')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            selectedReportType === 'amu_ledger'
              ? 'bg-[#1B5E20] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          1. Farm AMU Compliance Ledger
        </button>

        <button
          onClick={() => setSelectedReportType('withdrawal_cert')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            selectedReportType === 'withdrawal_cert'
              ? 'bg-[#1B5E20] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          2. Withdrawal MRL Safe Clearance Certificate
        </button>

        <button
          onClick={() => setSelectedReportType('herd_health')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            selectedReportType === 'herd_health'
              ? 'bg-[#1B5E20] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          3. Herd Vaccination & Quarantine Audit
        </button>
      </div>

      {/* Certificate Preview Sheet (Styled like official Gov of India certificate) */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-gray-300 shadow-xl space-y-8 font-serif print:border-none print:shadow-none print:p-0">
        {/* Certificate Letterhead */}
        <div className="text-center space-y-2 border-b-2 border-[#1B5E20]/40 pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg font-sans">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-sm font-sans font-black tracking-widest text-[#1B5E20] uppercase">
            Government of India • Ministry of Fisheries, Animal Husbandry & Dairying
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-sans tracking-tight">
            {selectedReportType === 'amu_ledger' && 'Official Farm AMU Stewardship Ledger'}
            {selectedReportType === 'withdrawal_cert' && 'Statutory MRL Food Safety Clearance Certificate'}
            {selectedReportType === 'herd_health' && 'Herd Biosecurity & Vaccination Compliance Record'}
          </h2>
          <p className="text-xs text-gray-600 font-sans font-bold">
            Certified via FarmShield Digital Verification Network • Token ID: FS-AUDIT-{Date.now().toString().slice(-6)}
          </p>
        </div>

        {/* Farm Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans border-b border-gray-200 pb-6">
          <div>
            <span className="text-gray-500 font-bold block">Farm Name:</span>
            <span className="text-sm font-black text-gray-900">Patil Dairy & Livestock Farm</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block">Location / District:</span>
            <span className="text-sm font-black text-gray-900">Pune, Maharashtra</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block">Audit Period:</span>
            <span className="text-sm font-black text-gray-900">Past 30 Days (Current Cycle)</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block">Compliance Status:</span>
            <span className="text-sm font-black text-emerald-700">98.4% FSSAI Compliant</span>
          </div>
        </div>

        {/* Certificate Body Data */}
        <div className="font-sans space-y-4">
          <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-[#E8F5E9] text-[#1B5E20] font-black uppercase text-[10px]">
              <tr>
                <th className="p-3">Animal Tag</th>
                <th className="p-3">Species / Breed</th>
                <th className="p-3">Pharmaceutical</th>
                <th className="p-3">Withdrawal Duration</th>
                <th className="p-3">Food Safety Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
              <tr>
                <td className="p-3 font-bold text-gray-900">COW-101</td>
                <td className="p-3">Cattle (Gir Milch)</td>
                <td className="p-3">Amoxicillin Trihydrate</td>
                <td className="p-3">3 Days (Milk)</td>
                <td className="p-3 text-emerald-700 font-bold">✓ CLEARED - SAFE</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-gray-900">BUF-201</td>
                <td className="p-3">Buffalo (Murrah)</td>
                <td className="p-3">Oxytetracycline LA</td>
                <td className="p-3">7 Days (Milk)</td>
                <td className="p-3 text-emerald-700 font-bold">✓ CLEARED - SAFE</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-gray-900">COW-102</td>
                <td className="p-3">Cattle (HF Cross)</td>
                <td className="p-3">Ceftiofur Sodium</td>
                <td className="p-3">2 Days (Milk)</td>
                <td className="p-3 text-emerald-700 font-bold">✓ CLEARED - SAFE</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures & Seal */}
        <div className="pt-8 border-t-2 border-gray-200 font-sans flex items-end justify-between text-xs">
          <div className="space-y-1">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#1B5E20] flex items-center justify-center text-[10px] text-[#1B5E20] font-black text-center p-2">
              OFFICIAL FSSAI VERIFIED
            </div>
            <p className="text-[10px] text-gray-500 font-bold">Digital Certificate Hash #88FA92</p>
          </div>

          <div className="text-right space-y-1">
            <div className="w-36 border-b border-gray-400 mx-auto mb-1" />
            <span className="font-black text-gray-900 block">Authorized Field Veterinarian</span>
            <span className="text-gray-500 text-[11px] block">BVSc & AH • State Veterinary Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  FileCheck,
  PlusCircle,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Check,
  X,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface LabResultItem {
  id: string;
  animal_code: string;
  sample_type: string;
  test_name: string;
  result_value: string;
  mrl_limit: string;
  is_compliant: boolean;
  certificate_url?: string;
  tested_at: string;
  lab_name: string;
}

const DEFAULT_LAB_RECORDS: LabResultItem[] = [
  {
    id: 'lab_01',
    animal_code: 'COW-101',
    sample_type: 'Bulk Raw Milk',
    test_name: 'Charm II Beta-Lactam Microbial Receptor Assay',
    result_value: '2.1 µg/kg',
    mrl_limit: '4.0 µg/kg (FSSAI)',
    is_compliant: true,
    tested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lab_name: 'State Veterinary Diagnostic Lab, Pune',
    certificate_url: 'https://farmshield.in/certs/cert_lab_01.pdf',
  },
  {
    id: 'lab_02',
    animal_code: 'COW-102',
    sample_type: 'Morning Stripping Milk',
    test_name: 'Delvotest SP-NT Microbial Inhibition Test',
    result_value: '14.8 µg/kg',
    mrl_limit: '4.0 µg/kg (FSSAI)',
    is_compliant: false,
    tested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lab_name: 'District Animal Disease Diagnostic Lab',
    certificate_url: 'https://farmshield.in/certs/cert_lab_02.pdf',
  },
  {
    id: 'lab_03',
    animal_code: 'BUF-201',
    sample_type: 'Blood Smear Examination',
    test_name: 'Giemsa Stained Microscopic Protozoan Screen',
    result_value: 'Negative (Zero Piroplasms)',
    mrl_limit: 'N/A',
    is_compliant: true,
    tested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lab_name: 'Regional Veterinary College Central Lab',
  },
];

export const LabResultsSection: React.FC = () => {
  const { language } = useLanguage();
  const [results, setResults] = useState<LabResultItem[]>(DEFAULT_LAB_RECORDS);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form State
  const [animalCode, setAnimalCode] = useState('COW-101');
  const [sampleType, setSampleType] = useState('Bulk Raw Milk');
  const [testName, setTestName] = useState('Charm II Beta-Lactam Screen');
  const [resultValue, setResultValue] = useState('');
  const [mrlLimit, setMrlLimit] = useState('4 µg/kg (FSSAI)');
  const [isCompliant, setIsCompliant] = useState(true);
  const [labName, setLabName] = useState('Central Diagnostic Lab');
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certUrl, setCertUrl] = useState('');

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCert(true);
    try {
      const res = await uploadToCloudinary(file, 'farmshield_lab_certs');
      setCertUrl(res.secure_url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload certificate');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalCode || !testName || !resultValue) return;

    const newRecord: LabResultItem = {
      id: `lab_${Date.now()}`,
      animal_code: animalCode,
      sample_type: sampleType,
      test_name: testName,
      result_value: resultValue,
      mrl_limit: mrlLimit,
      is_compliant: isCompliant,
      tested_at: new Date().toISOString(),
      lab_name: labName,
      certificate_url: certUrl || undefined,
    };

    setResults((prev) => [newRecord, ...prev]);
    setShowAddForm(false);
    setResultValue('');
    setCertUrl('');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0E4D2B] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#10B981]" />
            <span>{language === 'en' ? 'Laboratory Testing & MRL Screening' : 'प्रयोगशाला परीक्षण एवं एमआरएल जांच'}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Standard Operating Procedures (SOP) • Chain-of-Custody Certificates • Cloudinary Document Storage
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          leftIcon={<PlusCircle className="w-4 h-4 text-white" />}
        >
          {showAddForm ? 'Cancel' : 'Log New Lab Report'}
        </Button>
      </div>

      {/* Add Report Drawer */}
      {showAddForm && (
        <Card className="bg-slate-50 border border-slate-200 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E4D2B]">
            Record Laboratory Test Result & Attach PDF/Image Certificate
          </h3>
          <form onSubmit={handleAddResult} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Animal Tag Code</label>
                <input
                  type="text"
                  value={animalCode}
                  onChange={(e) => setAnimalCode(e.target.value)}
                  required
                  placeholder="e.g. COW-101"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sample Matrix</label>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                >
                  <option value="Bulk Raw Milk">Bulk Raw Milk</option>
                  <option value="Morning Stripping Milk">Morning Stripping Milk</option>
                  <option value="Blood Smear">Blood Smear</option>
                  <option value="Tissue / Muscle">Tissue / Muscle</option>
                  <option value="Pond Aquaculture Water">Pond Aquaculture Water</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Test Protocol</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantitative Result</label>
                <input
                  type="text"
                  placeholder="e.g. 2.1 µg/kg or Negative"
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">FSSAI Statutory MRL</label>
                <input
                  type="text"
                  value={mrlLimit}
                  onChange={(e) => setMrlLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Compliance Outcome</label>
                <select
                  value={isCompliant ? 'safe' : 'fail'}
                  onChange={(e) => setIsCompliant(e.target.value === 'safe')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                >
                  <option value="safe">Passes MRL (Safe for Consumption)</option>
                  <option value="fail">Exceeds MRL (Violative Residue - Hold)</option>
                </select>
              </div>
            </div>

            {/* Cloudinary Certificate Attachment */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-200 pt-3 gap-3">
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2 bg-white border border-slate-300 hover:border-[#10B981] rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-4 h-4 text-[#0E4D2B]" />
                  <span>{uploadingCert ? 'Uploading to Cloudinary...' : 'Upload Lab Slip / PDF (Cloudinary)'}</span>
                  <input type="file" accept="image/*,application/pdf" onChange={handleCertUpload} className="hidden" />
                </label>
                {certUrl && (
                  <span className="text-xs text-[#166534] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Certificate Linked
                  </span>
                )}
              </div>

              <Button variant="primary" size="sm" type="submit">
                Save Diagnostic Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lab Results Table */}
      <div className="space-y-3">
        {results.map((item) => (
          <Card key={item.id} className="p-5 border border-slate-200 hover:border-[#10B981] bg-white transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-[#0E4D2B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.animal_code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{item.test_name}</h4>
                  <Badge variant={item.is_compliant ? 'success' : 'error'}>
                    {item.is_compliant ? 'Compliant with MRL' : 'MRL Violation'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  <strong>Matrix:</strong> {item.sample_type} • <strong>Lab:</strong> {item.lab_name}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Tested: {new Date(item.tested_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Measured: <strong className="text-slate-800">{item.result_value}</strong></span>
                  <span>•</span>
                  <span>Threshold: {item.mrl_limit}</span>
                </div>
              </div>

              {item.certificate_url && (
                <a
                  href={item.certificate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#E8F5E9] text-xs font-bold text-[#0E4D2B] border border-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>View Lab Slip</span>
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

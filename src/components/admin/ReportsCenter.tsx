import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Award, 
  BarChart, 
  Calendar, 
  Layers 
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const { treatments, labSamples, regulatoryRules, auditLogs, showToast, t } = useApp();

  const handleDownloadDataset = (datasetName: string) => {
    let data: any[] = [];
    let headers: string[] = [];

    if (datasetName === 'amu') {
      headers = ['Treatment No', 'Date', 'Farm', 'Animal Tag', 'Species', 'Medicine', 'Active Ingredient', 'Class', 'Dose', 'Clearance Date'];
      data = treatments.map(t => [t.treatmentNumber, t.startDate, `"${t.farmName}"`, t.animalTagId, t.animalSpecies, `"${t.medicineName}"`, `"${t.activeIngredient}"`, `"${t.antimicrobialClass}"`, `"${t.dose}"`, t.calculatedClearanceDate]);
    } else if (datasetName === 'mrl') {
      headers = ['Sample Code', 'Collection Date', 'Farm', 'Animal Tag', 'Matrix', 'Substance', 'Detected (ug/kg)', 'MRL (ug/kg)', 'Verdict', 'Lab'];
      data = labSamples.map(s => [s.sampleCode, s.collectionDate, `"${s.farmName}"`, s.animalTagId, s.sampleType, `"${s.targetedSubstance}"`, s.residueLevel_ug_kg, s.statutoryMRL_ug_kg, `"${s.verdict}"`, `"${s.testingLabName}"`]);
    } else {
      headers = ['Audit ID', 'Timestamp', 'User', 'Role', 'Action', 'Entity', 'Details'];
      data = auditLogs.map(l => [l.id, l.timestamp, `"${l.userName}"`, l.userRole, l.action, l.entityType, `"${l.details}"`]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...data.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `National_${datasetName.toUpperCase()}_Surveillance_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report Generated', `Downloaded ${datasetName.toUpperCase()} statutory surveillance dataset.`, 'success');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-700" />
              National Statutory Surveillance Reports & Export Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Official Regulatory Exports
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export aggregated national AMU surveillance dossiers, MRL non-compliance audit ledgers, and parliamentary reports.
          </p>
        </div>

        <button
          onClick={handlePrintDossier}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print / Export Full Annual Dossier
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Report 1: National AMU Surveillance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500 transition">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <BarChart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">National AMU Consumption Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete transactional history of antimicrobial treatments, mg/PCU metric calculations, and WHO Critically Important Antimicrobial (CIA) shares.
            </p>
          </div>

          <button
            onClick={() => handleDownloadDataset('amu')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV ({treatments.length} records)
          </button>
        </div>

        {/* Report 2: MRL Residue Testing Violations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500 transition">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">MRL Residue Violation Dossier</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Laboratory testing records with quantitative residues (µg/kg), statutory limit comparisons, and issued administrative enforcement notices.
            </p>
          </div>

          <button
            onClick={() => handleDownloadDataset('mrl')}
            className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV ({labSamples.length} records)
          </button>
        </div>

        {/* Report 3: Audit Trail & Integrity Log */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500 transition">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Governance & Audit Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Timestamped cryptographic log of every prescription creation, veterinary co-signature, AI risk override, and regulatory rule amendment.
            </p>
          </div>

          <button
            onClick={() => handleDownloadDataset('audit')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV ({auditLogs.length} records)
          </button>
        </div>

      </div>

    </div>
  );
};

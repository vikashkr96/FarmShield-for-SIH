import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText,
  Activity,
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { mockMonthlyAMUTrend, mockAntimicrobialClassDistribution } from '../../data/mockData';

export const FarmerAMUAnalytics: React.FC = () => {
  const { currentUser, treatments, animals, showToast, t } = useApp();

  const handleExportCSV = () => {
    const headers = ['Treatment ID', 'Date', 'Animal Tag', 'Species', 'Medicine', 'Active Ingredient', 'Antimicrobial Class', 'Dose', 'Clearance Date', 'Status'];
    const rows = treatments.map(t => [
      t.treatmentNumber,
      t.startDate,
      t.animalTagId,
      t.animalSpecies,
      `"${t.medicineName}"`,
      `"${t.activeIngredient}"`,
      `"${t.antimicrobialClass}"`,
      `"${t.dose}"`,
      t.calculatedClearanceDate,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriTrace_AMU_Report_${currentUser.farmName || 'Farm'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Export Ready', 'Downloaded full antimicrobial usage transaction history.', 'success');
  };

  const handlePrintPDF = () => {
    window.print();
    showToast('PDF Dossier Generated', 'Print dialog initiated for Farm AMU Compliance Certificate.', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-700" />
              Farm AMU Surveillance & MRL Compliance Dossier
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              NAP-AMR Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time calculation of Antimicrobial Usage Intensity (mg/PCU) and Critically Important Antimicrobial (CIA) ratio.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV Data
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Current AMU Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono">59.4</span>
            <span className="text-xs font-semibold text-slate-500">mg / PCU</span>
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            13.5% reduction vs prior quarter
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            CIA Antimicrobial Share
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-600 font-mono">20.3%</span>
            <span className="text-xs font-semibold text-slate-500">of total treatments</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Target benchmark: &lt; 25% Highest Priority CIAs
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            MRL Audit Compliance Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-teal-700 font-mono">98.8%</span>
            <span className="text-xs font-semibold text-slate-500">rating</span>
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero active residue violations
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Area Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">AMU Trend (mg/PCU) vs Benchmark</h3>
              <p className="text-[11px] text-slate-400">Monthly antimicrobial consumption trajectory</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Last 6 Months
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthlyAMUTrend}>
                <defs>
                  <linearGradient id="amuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" mg" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area 
                  type="monotone" 
                  dataKey="totalAMU_mg_pcu" 
                  name="Total Farm AMU (mg/PCU)" 
                  stroke="#0F766E" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#amuGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="targetBenchmark" 
                  name="National Benchmark Target" 
                  stroke="#EF4444" 
                  strokeDasharray="4 4"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Antimicrobial Class Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Usage by Antimicrobial Class</h3>
              <p className="text-[11px] text-slate-400">Relative proportion across antibiotic categories</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockAntimicrobialClassDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {mockAntimicrobialClassDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Official Government Printable Dossier Preview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mt-0.5">
            <Award className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Official Veterinary Health & MRL Clearance Dossier</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Certified document recognized by food safety regulators (FSSAI), cooperative dairies, and export authorities.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrintPDF}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          Generate Official Dossier
        </button>
      </div>

    </div>
  );
};

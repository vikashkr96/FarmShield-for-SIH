import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const MLModelMonitoring: React.FC = () => {
  const { treatments, showToast, t } = useApp();

  const mockModelEvaluation = [
    { date: 'Aug 01', precision: 93.8, recall: 90.4, driftScore: 0.02 },
    { date: 'Aug 05', precision: 94.1, recall: 91.2, driftScore: 0.03 },
    { date: 'Aug 10', precision: 94.5, recall: 91.0, driftScore: 0.02 },
    { date: 'Aug 15', precision: 94.2, recall: 92.4, driftScore: 0.04 },
    { date: 'Aug 20', precision: 94.8, recall: 92.1, driftScore: 0.03 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-700" />
              Machine Learning Surveillance Model Diagnostics & Drift Monitor
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
              v2.4 AMR-Predict
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry on algorithmic inference volume, model precision/recall performance, and data distribution drift indicators.
          </p>
        </div>

        <button
          onClick={() => showToast('Inference Pipeline Healthy', 'Model latency: 42ms, Drift metric within normal bounds (<0.05).', 'success')}
          className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Run Health Diagnostics
        </button>
      </div>

      {/* Model KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Model Precision</span>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">94.8%</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ 0.6% vs baseline</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Model Recall</span>
          <div className="text-3xl font-black text-teal-700 font-mono mt-1">92.1%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Coverage of high-risk cases</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inference Volume</span>
          <div className="text-3xl font-black text-sky-700 font-mono mt-1">{treatments.length * 142}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Evaluations this month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Population Drift (PSI)</span>
          <div className="text-3xl font-black text-emerald-600 font-mono mt-1">0.03</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">🟢 Minimal distribution drift</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Precision & Recall Telemetry Over Time</h3>
            <p className="text-[11px] text-slate-400">Weekly evaluation benchmarks on clinical ground truth</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockModelEvaluation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="precision" name="Precision (%)" stroke="#0F766E" strokeWidth={2.5} />
              <Line type="monotone" dataKey="recall" name="Recall (%)" stroke="#0284C7" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

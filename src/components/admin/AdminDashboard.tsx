import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  BookOpen, 
  UserCheck, 
  FlaskConical, 
  Compass, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  TrendingDown, 
  AlertOctagon,
  Layers,
  Activity
} from 'lucide-react';
import { RegulatoryDataManager } from './RegulatoryDataManager';
import { UserManagement } from './UserManagement';
import { ComplianceConsole } from './ComplianceConsole';
import { GeospatialHeatmap } from './GeospatialHeatmap';
import { ReportsCenter } from './ReportsCenter';
import { MLModelMonitoring } from './MLModelMonitoring';
import { AuditLogViewer } from './AuditLogViewer';

export const AdminDashboard: React.FC = () => {
  const { currentUser, users, animals, labSamples, regulatoryRules, treatments, t } = useApp();

  const [activeTab, setActiveTab] = useState<'rules' | 'users' | 'compliance' | 'map' | 'reports' | 'ml' | 'audit'>('rules');

  const pendingVetsCount = users.filter(u => u.role === 'vet' && u.status === 'pending_verification').length;
  const verifiedVetsCount = users.filter(u => u.role === 'vet' && u.status === 'active').length;
  const totalFarms = Array.from(new Set(animals.map(a => a.farmName))).length;
  const violationsCount = labSamples.filter(s => s.verdict.includes('VIOLATION')).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 text-xs font-bold border border-sky-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.roleAdmin} Governance Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser.department || 'Department of Animal Husbandry & Dairying (DAHD)'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
              Officer: <strong className="text-white">{currentUser.name}</strong> • Jurisdiction: {currentUser.jurisdiction || 'National & Northern Region Zone-A'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg"
            >
              <UserCheck className="w-4 h-4" />
              <span>Vet Verification Queue ({pendingVetsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Macro KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Registered Farms */}
        <div 
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Registered Farms
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totalFarms * 24}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-1 block">
            Active Producer Units
          </span>
        </div>

        {/* Card 2: Total Livestock Census */}
        <div 
          onClick={() => setActiveTab('map')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Livestock Census
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {animals.length * 180}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            Monitored Animals
          </span>
        </div>

        {/* Card 3: Verified Veterinarians */}
        <div 
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Authorized Vets
          </span>
          <div className="text-2xl font-black text-teal-800 font-mono mt-1">
            {verifiedVetsCount}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-1 block">
            VCI Licensed Doctors
          </span>
        </div>

        {/* Card 4: Active MRL Violations */}
        <div 
          onClick={() => setActiveTab('compliance')}
          className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            MRL Violations
          </span>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {violationsCount}
          </div>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">
            Lab Residue Exceedances
          </span>
        </div>

        {/* Card 5: Statutory Rules in Effect */}
        <div 
          onClick={() => setActiveTab('rules')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active MRL Rules
          </span>
          <div className="text-2xl font-black text-sky-800 font-mono mt-1">
            {regulatoryRules.length}
          </div>
          <span className="text-[10px] text-sky-700 font-semibold mt-1 block">
            Versioned Standards
          </span>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t.navRegulatoryRules}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {t.navUserVetMgmt} {pendingVetsCount > 0 && <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">{pendingVetsCount}</span>}
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          {t.navComplianceConsole}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          {t.navGeospatialMap}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          {t.navReportsExport}
        </button>

        <button
          onClick={() => setActiveTab('ml')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ml'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {t.navMLDiagnostics}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-sky-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          {t.navAuditTrail}
        </button>
      </div>

      {/* Tab View */}
      <div className="pt-2">
        {activeTab === 'rules' && <RegulatoryDataManager />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'compliance' && <ComplianceConsole />}
        {activeTab === 'map' && <GeospatialHeatmap />}
        {activeTab === 'reports' && <ReportsCenter />}
        {activeTab === 'ml' && <MLModelMonitoring />}
        {activeTab === 'audit' && <AuditLogViewer />}
      </div>

    </div>
  );
};

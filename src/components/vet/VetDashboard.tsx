import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Animal } from '../../types';
import { 
  Stethoscope, 
  FileCheck, 
  Building2, 
  Sparkles, 
  Repeat, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';
import { ApprovalsQueue } from './ApprovalsQueue';
import { VetAnimalBrowser } from './VetAnimalBrowser';
import { MLRiskReviewPanel } from './MLRiskReviewPanel';
import { RepeatedTreatmentRadar } from './RepeatedTreatmentRadar';
import { VetActivityLog } from './VetActivityLog';
import { AnimalDetailModal } from '../farmer/AnimalDetailModal';
import { NewTreatmentModal } from '../farmer/NewTreatmentModal';

export const VetDashboard: React.FC = () => {
  const { currentUser, treatments, animals, t } = useApp();

  const [activeTab, setActiveTab] = useState<'approvals' | 'farms' | 'risk' | 'repeated' | 'activity'>('approvals');
  const [selectedAnimalForDetail, setSelectedAnimalForDetail] = useState<Animal | null>(null);
  const [isNewTreatmentOpen, setIsNewTreatmentOpen] = useState(false);
  const [selectedAnimalForTreatment, setSelectedAnimalForTreatment] = useState<string | undefined>(undefined);

  const isPendingVerification = currentUser.status === 'pending_verification';

  const pendingCount = treatments.filter(t => t.status === 'PENDING_VET_REVIEW').length;
  const highRiskCount = treatments.filter(t => t.overuseRisk === 'HIGH').length;
  const linkedFarmsCount = Array.from(new Set(animals.map(a => a.farmName))).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Pending Verification Notice if applicable */}
      {isPendingVerification && (
        <div className="p-4 bg-amber-500 text-slate-950 rounded-2xl shadow-md border border-amber-600 flex items-start gap-3">
          <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-extrabold text-sm">Account Status: Pending Regulatory Verification</h4>
            <p className="mt-0.5">
              Your license credentials (<strong>{currentUser.licenseNumber}</strong>) have been submitted to the Department of Animal Husbandry & Dairying (DAHD) for verification. You may preview workflows in read-only mode until full authorization is granted by an Administrator.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t.roleVet} Stewardship Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-200/90 font-medium">
              VCI Reg No: <strong className="text-white font-mono">{currentUser.licenseNumber || 'VCI-HAR-2018-0941'}</strong> • Affiliation: {currentUser.clinicAffiliation || 'Central Veterinary Polyclinic, Karnal'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-4 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg"
            >
              <FileCheck className="w-4 h-4" />
              <span>Pending Co-Signs ({pendingCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Approvals */}
        <div
          onClick={() => setActiveTab('approvals')}
          className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-xs hover:border-amber-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Pending Co-Signs
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1 flex items-center gap-2">
            {pendingCount}
            {pendingCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <span className="text-[10px] text-amber-800 font-semibold mt-1 block">
            Treatments Awaiting Sign
          </span>
        </div>

        {/* Card 2: Linked Farms */}
        <div
          onClick={() => setActiveTab('farms')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Linked Producer Farms
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {linkedFarmsCount}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-1 block">
            Under Clinical Care
          </span>
        </div>

        {/* Card 3: Monitored Animals */}
        <div
          onClick={() => setActiveTab('farms')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Monitored Livestock
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {animals.length}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            Tagged in Jurisdiction
          </span>
        </div>

        {/* Card 4: High-Risk Flags */}
        <div
          onClick={() => setActiveTab('risk')}
          className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            AI High-Risk Flags
          </span>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {highRiskCount}
          </div>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">
            Overuse / AMR Watch
          </span>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          {t.navApprovalsQueue} ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('farms')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'farms'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {t.navLinkedFarms}
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'risk'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {t.navRiskSurveillance}
        </button>

        <button
          onClick={() => setActiveTab('repeated')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'repeated'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-4 h-4" />
          {t.navRepeatedRadar}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          {t.navVetActivity}
        </button>
      </div>

      {/* Active Tab View */}
      <div className="pt-2">
        {activeTab === 'approvals' && <ApprovalsQueue />}
        {activeTab === 'farms' && <VetAnimalBrowser onSelectAnimal={(a) => setSelectedAnimalForDetail(a)} />}
        {activeTab === 'risk' && <MLRiskReviewPanel />}
        {activeTab === 'repeated' && <RepeatedTreatmentRadar />}
        {activeTab === 'activity' && <VetActivityLog />}
      </div>

      {/* Animal Detail Modal */}
      <AnimalDetailModal
        animal={selectedAnimalForDetail}
        onClose={() => setSelectedAnimalForDetail(null)}
        onOpenNewTreatment={(id) => {
          setSelectedAnimalForDetail(null);
          setSelectedAnimalForTreatment(id);
          setIsNewTreatmentOpen(true);
        }}
      />

      <NewTreatmentModal
        isOpen={isNewTreatmentOpen}
        onClose={() => {
          setIsNewTreatmentOpen(false);
          setSelectedAnimalForTreatment(undefined);
        }}
        preselectedAnimalId={selectedAnimalForTreatment}
      />

    </div>
  );
};

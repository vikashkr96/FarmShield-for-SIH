import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Animal } from '../../types';
import { 
  Tractor, 
  Plus, 
  Calendar, 
  Package, 
  BarChart3, 
  Bell, 
  ShieldCheck, 
  AlertOctagon, 
  Activity, 
  TrendingDown,
  Sparkles,
  QrCode,
  Layers
} from 'lucide-react';
import { LivestockRegistry } from './LivestockRegistry';
import { WithdrawalCalendar } from './WithdrawalCalendar';
import { MedicineStockTracker } from './MedicineStockTracker';
import { FarmerAMUAnalytics } from './FarmerAMUAnalytics';
import { FarmerAlertsView } from './FarmerAlertsView';
import { AddAnimalModal } from './AddAnimalModal';
import { NewTreatmentModal } from './NewTreatmentModal';
import { AnimalDetailModal } from './AnimalDetailModal';

export const FarmerDashboard: React.FC = () => {
  const { currentUser, animals, treatments, notifications, medicineStocks, t } = useApp();

  const [activeTab, setActiveTab] = useState<'registry' | 'calendar' | 'stock' | 'analytics' | 'alerts'>('registry');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [isNewTreatmentOpen, setIsNewTreatmentOpen] = useState(false);
  const [selectedAnimalForTreatment, setSelectedAnimalForTreatment] = useState<string | undefined>(undefined);
  const [selectedAnimalForDetail, setSelectedAnimalForDetail] = useState<Animal | null>(null);

  // Compute Summary KPI counts
  const totalCount = animals.length;
  const underTreatmentCount = animals.filter(a => a.activeTreatmentId).length;
  const inWithdrawalCount = animals.filter(a => a.currentStatus === 'WITHDRAWAL_ACTIVE' || a.currentStatus === 'REVIEW_REQUIRED').length;
  const clearedCount = animals.filter(a => a.currentStatus === 'CLEARED').length;
  const alertCount = notifications.filter(n => (n.targetRole === 'farmer' || n.targetRole === 'all') && !n.isRead).length;

  const handleOpenTreatmentForAnimal = (animalId?: string) => {
    setSelectedAnimalForTreatment(animalId);
    setIsNewTreatmentOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner with Farm Identification */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              <Tractor className="w-3.5 h-3.5" />
              <span>{t.roleFarmer} Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser.farmName || 'Green Meadows Dairy Farm'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-200/90 font-medium">
              Location: {currentUser.village || 'Nilokheri'}, {currentUser.district || 'Karnal'}, {currentUser.state || 'Haryana'} • Registered Owner: <strong className="text-white">{currentUser.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenTreatmentForAnimal()}
              className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              {t.recordNewTreatment}
            </button>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition border border-white/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              {t.addNewAnimal}
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Card 1: Total Livestock */}
        <div 
          onClick={() => setActiveTab('registry')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {t.totalAnimals}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totalCount}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-1 block">
            Tagged Livestock
          </span>
        </div>

        {/* Card 2: Under Treatment */}
        <div 
          onClick={() => setActiveTab('registry')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {t.animalsUnderTreatment}
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {underTreatmentCount}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
            Active Med Courses
          </span>
        </div>

        {/* Card 3: In Withdrawal (🔴) */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block truncate">
            {t.animalsInWithdrawal}
          </span>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {inWithdrawalCount}
          </div>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">
            🔴 Withhold Milk/Meat
          </span>
        </div>

        {/* Card 4: Food Safety Cleared (🟢) */}
        <div 
          onClick={() => setActiveTab('registry')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block truncate">
            {t.animalsCleared}
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {clearedCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            🟢 Safe for Supply
          </span>
        </div>

        {/* Card 5: Active Alerts */}
        <div 
          onClick={() => setActiveTab('alerts')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {t.activeAlertsCount}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1 flex items-center gap-2">
            {alertCount}
            {alertCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            Regulatory Notices
          </span>
        </div>

        {/* Card 6: This Month's AMU */}
        <div 
          onClick={() => setActiveTab('analytics')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {t.monthlyAMUIndex}
          </span>
          <div className="text-xl font-black text-teal-800 font-mono mt-1">
            59.4 <span className="text-xs font-normal text-slate-500">mg/PCU</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            ↓ 13.5% vs target
          </span>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('registry')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'registry'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Tractor className="w-4 h-4" />
          {t.navLivestock} ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          {t.navWithdrawalCal}
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stock'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          {t.navMedicineStock} ({medicineStocks.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {t.navAMUAnalytics}
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          {t.navAlerts} {alertCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">{alertCount}</span>}
        </button>
      </div>

      {/* Active Tab Views */}
      <div className="pt-2">
        {activeTab === 'registry' && (
          <LivestockRegistry
            onOpenAddModal={() => setIsAddAnimalOpen(true)}
            onOpenNewTreatment={(id) => handleOpenTreatmentForAnimal(id)}
            onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
          />
        )}

        {activeTab === 'calendar' && <WithdrawalCalendar />}

        {activeTab === 'stock' && <MedicineStockTracker />}

        {activeTab === 'analytics' && <FarmerAMUAnalytics />}

        {activeTab === 'alerts' && <FarmerAlertsView />}
      </div>

      {/* Modals */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
      />

      <NewTreatmentModal
        isOpen={isNewTreatmentOpen}
        onClose={() => {
          setIsNewTreatmentOpen(false);
          setSelectedAnimalForTreatment(undefined);
        }}
        preselectedAnimalId={selectedAnimalForTreatment}
      />

      <AnimalDetailModal
        animal={selectedAnimalForDetail}
        onClose={() => setSelectedAnimalForDetail(null)}
        onOpenNewTreatment={(id) => {
          setSelectedAnimalForDetail(null);
          handleOpenTreatmentForAnimal(id);
        }}
      />

    </div>
  );
};

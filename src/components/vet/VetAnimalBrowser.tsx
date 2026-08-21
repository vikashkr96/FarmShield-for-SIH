import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Animal } from '../../types';
import { 
  Building2, 
  Search, 
  Filter, 
  QrCode, 
  Eye, 
  Activity, 
  ShieldCheck,
  AlertOctagon,
  Calendar
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface VetAnimalBrowserProps {
  onSelectAnimal: (animal: Animal) => void;
}

export const VetAnimalBrowser: React.FC<VetAnimalBrowserProps> = ({ onSelectAnimal }) => {
  const { animals, setSelectedAnimalForPassport, t } = useApp();

  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const farms = Array.from(new Set(animals.map(a => a.farmName)));

  const filtered = animals.filter(a => {
    const matchesSearch = 
      a.tagId.toLowerCase().includes(search.toLowerCase()) ||
      a.breed.toLowerCase().includes(search.toLowerCase()) ||
      a.farmName.toLowerCase().includes(search.toLowerCase());

    const matchesFarm = farmFilter === 'All' || a.farmName === farmFilter;
    const matchesStatus = statusFilter === 'All' || a.currentStatus === statusFilter;

    return matchesSearch && matchesFarm && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            Cross-Farm Livestock Health Browser
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect medical records, withdrawal schedules, and food safety passports across all affiliated farms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Tag ID, Farm, Breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <select
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="All">All Linked Farms</option>
              {farms.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="All">All Clearance States</option>
              <option value="CLEARED">🟢 Food Safety Cleared</option>
              <option value="WITHDRAWAL_ACTIVE">🔴 Active Withholding</option>
              <option value="REVIEW_REQUIRED">🟡 Review Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Animals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(animal => (
          <div
            key={animal.id}
            onClick={() => onSelectAnimal(animal)}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={animal.photoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=100'}
                  alt={animal.tagId}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="font-mono font-bold text-sm text-slate-900">{animal.tagId}</h4>
                  <p className="text-xs font-semibold text-teal-800">{animal.species} • {animal.breed}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{animal.farmName}</p>
                </div>
              </div>

              <StatusBadge status={animal.currentStatus} daysRemaining={animal.daysRemainingInWithdrawal} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Weight / Age:</span>
                <span className="font-semibold text-slate-700">{animal.weightKg} kg ({animal.ageMonths} mo)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Clearance Date:</span>
                <span className={animal.currentStatus === 'CLEARED' ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                  {animal.earliestClearanceDate || 'Cleared'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnimalForPassport(animal);
                }}
                className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                Passport QR
              </button>

              <span className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-0.5">
                Inspect Details →
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

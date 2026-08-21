import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Animal, AnimalSpecies, WithdrawalStatus } from '../../types';
import { 
  Tractor, 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  Eye, 
  Pill, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  AlertOctagon,
  ArrowUpDown
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface LivestockRegistryProps {
  onOpenAddModal: () => void;
  onOpenNewTreatment: (animalId?: string) => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const LivestockRegistry: React.FC<LivestockRegistryProps> = ({
  onOpenAddModal,
  onOpenNewTreatment,
  onSelectAnimal
}) => {
  const { animals, setSelectedAnimalForPassport, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.healthNotes && animal.healthNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecies = speciesFilter === 'All' || animal.species === speciesFilter;
    const matchesStatus = statusFilter === 'All' || animal.currentStatus === statusFilter;

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tractor className="w-5 h-5 text-teal-700" />
              National Livestock Registry & Traceability Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage tagged animals, food clearance passports, and electronic treatment logs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {t.addNewAnimal}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Species Filter */}
          <div>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-medium"
            >
              <option value="All">All Species (Bovine, Poultry, Small Ruminants)</option>
              <option value="Cattle">Cattle (Cow)</option>
              <option value="Buffalo">Buffalo</option>
              <option value="Broiler Poultry">Broiler Poultry</option>
              <option value="Layer Poultry">Layer Poultry</option>
              <option value="Goat">Goat</option>
              <option value="Sheep">Sheep</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-medium"
            >
              <option value="All">All Food Safety Statuses</option>
              <option value="CLEARED">🟢 Cleared for Food Chain</option>
              <option value="WITHDRAWAL_ACTIVE">🔴 Active Withholding (Withdrawal)</option>
              <option value="REVIEW_REQUIRED">🟡 Review Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Livestock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Animal / Ear-Tag ID</th>
                <th className="py-3.5 px-4">Species & Breed</th>
                <th className="py-3.5 px-4">Weight & Purpose</th>
                <th className="py-3.5 px-4">Food Safety Status</th>
                <th className="py-3.5 px-4">Withdrawal Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnimals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No livestock records found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredAnimals.map(animal => (
                  <tr
                    key={animal.id}
                    className="hover:bg-teal-50/40 transition group cursor-pointer"
                    onClick={() => onSelectAnimal(animal)}
                  >
                    {/* Animal Tag */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={animal.photoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=100'}
                          alt={animal.tagId}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold font-mono text-slate-900 text-xs sm:text-sm group-hover:text-teal-800">
                            {animal.tagId}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {animal.gender} • {animal.ageMonths} mo
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Species & Breed */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{animal.species}</div>
                      <div className="text-[11px] text-slate-500">{animal.breed}</div>
                    </td>

                    {/* Weight & Purpose */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{animal.weightKg} kg</div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {animal.purpose}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge 
                        status={animal.currentStatus} 
                        daysRemaining={animal.daysRemainingInWithdrawal} 
                        size="sm" 
                      />
                    </td>

                    {/* Withdrawal Date */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {animal.currentStatus === 'CLEARED' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cleared
                        </span>
                      ) : (
                        <div>
                          <span className="font-bold text-rose-700">{animal.earliestClearanceDate}</span>
                          <span className="block text-[10px] text-slate-400">
                            {animal.daysRemainingInWithdrawal} days withholding left
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedAnimalForPassport(animal)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition"
                          title="View Food Safety Passport QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenNewTreatment(animal.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          title="Record Treatment"
                        >
                          <Pill className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectAnimal(animal)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

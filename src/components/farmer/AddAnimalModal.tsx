import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnimalSpecies } from '../../types';
import { X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({ isOpen, onClose }) => {
  const { addAnimal, currentUser, t } = useApp();

  const [tagId, setTagId] = useState(`IN-HAR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [species, setSpecies] = useState<AnimalSpecies>('Cattle');
  const [breed, setBreed] = useState('Holstein Friesian Cross');
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [dob, setDob] = useState('2023-01-15');
  const [ageMonths, setAgeMonths] = useState(36);
  const [weightKg, setWeightKg] = useState(450);
  const [purpose, setPurpose] = useState<'Milk' | 'Meat' | 'Eggs' | 'Breeding' | 'Dual Purpose'>('Milk');
  const [healthNotes, setHealthNotes] = useState('Healthy, normal lactation cycle.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAnimal({
      tagId,
      farmId: currentUser.farmId || 'farm-hr-01',
      farmName: currentUser.farmName || 'Green Meadows Dairy',
      species,
      breed,
      gender,
      dob,
      ageMonths: Number(ageMonths),
      weightKg: Number(weightKg),
      purpose,
      currentStatus: 'CLEARED',
      healthNotes,
      photoUrl: species === 'Cattle' 
        ? 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=300' 
        : species === 'Buffalo' 
        ? 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=300' 
        : species === 'Broiler Poultry' 
        ? 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=300' 
        : 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=300'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Register New Livestock Animal</h3>
            <p className="text-xs text-teal-200">Auto-generates official National Ear-Tag QR Code</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Ear-Tag ID *</label>
              <input
                type="text"
                required
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Species *</label>
              <select
                value={species}
                onChange={(e: any) => setSpecies(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="Cattle">Cattle (Cow)</option>
                <option value="Buffalo">Buffalo</option>
                <option value="Broiler Poultry">Broiler Poultry</option>
                <option value="Layer Poultry">Layer Poultry</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
                <option value="Pig">Pig</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Murrah / Sahiwal / Gir"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age (Months)</label>
              <input
                type="number"
                value={ageMonths}
                onChange={(e) => setAgeMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purpose</label>
              <select
                value={purpose}
                onChange={(e: any) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="Milk">Milk</option>
                <option value="Meat">Meat</option>
                <option value="Eggs">Eggs</option>
                <option value="Breeding">Breeding</option>
                <option value="Dual Purpose">Dual Purpose</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Health Notes / Baseline</label>
            <textarea
              rows={2}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Register Animal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

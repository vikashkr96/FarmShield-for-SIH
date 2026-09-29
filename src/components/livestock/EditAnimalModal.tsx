'use client';

import React, { useState } from 'react';
import { X, Save, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { Animal, HealthStatus, AnimalPurpose } from '../../types/database';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface EditAnimalModalProps {
  animal: Animal;
  onClose: () => void;
  onSave: (updated: Animal) => void;
}

export const EditAnimalModal: React.FC<EditAnimalModalProps> = ({
  animal,
  onClose,
  onSave,
}) => {
  const [weight, setWeight] = useState(String(animal.weight || ''));
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(animal.health_status);
  const [purpose, setPurpose] = useState<AnimalPurpose>(animal.purpose || 'milk');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedAnimal: Animal = {
      ...animal,
      weight: Number(weight) || animal.weight,
      health_status: healthStatus,
      purpose,
    };

    setTimeout(() => {
      setIsSaving(false);
      onSave(updatedAnimal);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-gray-900">
              Edit Animal: {animal.animal_code}
            </h3>
            <p className="text-xs text-gray-500">
              {animal.breed} • {animal.species.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Health Status Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Clinical Health Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHealthStatus('healthy')}
                className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
                  healthStatus === 'healthy'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Healthy</span>
              </button>

              <button
                type="button"
                onClick={() => setHealthStatus('under_treatment')}
                className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
                  healthStatus === 'under_treatment'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span>Treatment</span>
              </button>

              <button
                type="button"
                onClick={() => setHealthStatus('quarantine')}
                className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
                  healthStatus === 'quarantine'
                    ? 'bg-red-50 border-red-500 text-red-800 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Quarantine</span>
              </button>
            </div>
          </div>

          {/* Current Live Weight */}
          <div>
            <Input
              label="Live Body Weight (kg)"
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 420"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">Used for accurate pharmaceutical dosing per kg bodyweight.</p>
          </div>

          {/* Production Purpose */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Production Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as AnimalPurpose)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="milk">Commercial Dairy (Milk)</option>
              <option value="meat">Meat Production</option>
              <option value="breeding">Pedigree Breeding Stock</option>
              <option value="egg">Layer / Egg Production</option>
              <option value="aquaculture">Inland Aquaculture Commercial Harvest</option>
              <option value="other">Other Commercial Utility</option>
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Update Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

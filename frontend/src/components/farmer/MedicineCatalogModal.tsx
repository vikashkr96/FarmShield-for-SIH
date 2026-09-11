'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Pill,
  Search,
  Filter,
  PlusCircle,
  X,
  Upload,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../providers/LanguageProvider';
import { uploadToCloudinary, getOptimizedImageUrl } from '../../lib/cloudinary';

interface MedicineCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MedicineItem {
  id: string;
  name: string;
  active_ingredient: string;
  antimicrobial_class: string;
  strength: string;
  status: string;
  image_url?: string;
  withdrawal_milk_days?: number;
  withdrawal_meat_days?: number;
  mrl_limit?: string;
  cia_classification?: 'Access' | 'Watch' | 'Reserve';
}

const DEFAULT_MEDICINES: MedicineItem[] = [
  {
    id: 'med_01',
    name: 'Amoxicillin Trihydrate 15%',
    active_ingredient: 'Amoxicillin',
    antimicrobial_class: 'Beta-lactams (Penicillins)',
    strength: '150 mg/ml',
    status: 'active',
    withdrawal_milk_days: 3,
    withdrawal_meat_days: 14,
    mrl_limit: '4 µg/kg (FSSAI)',
    cia_classification: 'Access',
    image_url: '/images/med_amox.jpg',
  },
  {
    id: 'med_02',
    name: 'Oxytetracycline LA 200',
    active_ingredient: 'Oxytetracycline',
    antimicrobial_class: 'Tetracyclines',
    strength: '200 mg/ml',
    status: 'active',
    withdrawal_milk_days: 7,
    withdrawal_meat_days: 28,
    mrl_limit: '100 µg/kg (FSSAI)',
    cia_classification: 'Watch',
    image_url: '/images/med_oxy.jpg',
  },
  {
    id: 'med_03',
    name: 'Ceftiofur Sodium Sterile',
    active_ingredient: 'Ceftiofur',
    antimicrobial_class: '3rd Gen Cephalosporins',
    strength: '1 g / vial',
    status: 'active',
    withdrawal_milk_days: 0, // Zero milk discard claim
    withdrawal_meat_days: 4,
    mrl_limit: '100 µg/kg (FSSAI)',
    cia_classification: 'Reserve',
    image_url: '/images/med_ceft.jpg',
  },
  {
    id: 'med_04',
    name: 'Enrofloxacin 10% Injection',
    active_ingredient: 'Enrofloxacin',
    antimicrobial_class: 'Fluoroquinolones (CIA)',
    strength: '100 mg/ml',
    status: 'active',
    withdrawal_milk_days: 5,
    withdrawal_meat_days: 14,
    mrl_limit: '100 µg/kg (FSSAI)',
    cia_classification: 'Reserve',
    image_url: '/images/med_enro.jpg',
  },
  {
    id: 'med_05',
    name: 'Sulfadimidine 33.3% Injection',
    active_ingredient: 'Sulfadimidine',
    antimicrobial_class: 'Sulfonamides',
    strength: '333 mg/ml',
    status: 'active',
    withdrawal_milk_days: 7,
    withdrawal_meat_days: 21,
    mrl_limit: '100 µg/kg (FSSAI)',
    cia_classification: 'Watch',
    image_url: '/images/med_sulfa.jpg',
  },
];

export const MedicineCatalogModal: React.FC<MedicineCatalogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [medicines, setMedicines] = useState<MedicineItem[]>(DEFAULT_MEDICINES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Medicine Form State
  const [newName, setNewName] = useState<string>('');
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [newClass, setNewClass] = useState<string>('Penicillins');
  const [newStrength, setNewStrength] = useState<string>('');
  const [newMilkDays, setNewMilkDays] = useState<number>(3);
  const [newMeatDays, setNewMeatDays] = useState<number>(14);
  const [newMrl, setNewMrl] = useState<string>('100 µg/kg');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:5000/api/medicines')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          // Merge with default withdrawal guidelines
          setMedicines((prev) => {
            const fetched = json.data.map((item: any) => ({
              ...item,
              withdrawal_milk_days: item.withdrawal_milk_days ?? 5,
              withdrawal_meat_days: item.withdrawal_meat_days ?? 14,
              mrl_limit: item.mrl_limit ?? '100 µg/kg (FSSAI)',
              cia_classification: item.antimicrobial_class?.toLowerCase().includes('cephalosporin') || item.antimicrobial_class?.toLowerCase().includes('fluoroquinolone')
                ? 'Reserve'
                : 'Access',
            }));
            return fetched;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file, 'farmshield_medicines');
      setUploadedImageUrl(result.secure_url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo to Cloudinary');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newIngredient) return;

    const newMed: MedicineItem = {
      id: `med_${Date.now()}`,
      name: newName,
      active_ingredient: newIngredient,
      antimicrobial_class: newClass,
      strength: newStrength || '100 mg/ml',
      status: 'active',
      withdrawal_milk_days: newMilkDays,
      withdrawal_meat_days: newMeatDays,
      mrl_limit: newMrl,
      cia_classification: newClass.includes('Cephalosporin') ? 'Reserve' : 'Access',
      image_url: uploadedImageUrl,
    };

    setMedicines((prev) => [newMed, ...prev]);
    setShowAddForm(false);
    setNewName('');
    setNewIngredient('');
    setUploadedImageUrl('');

    try {
      await fetch('http://localhost:5000/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed),
      });
    } catch {}
  };

  const filtered = medicines.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.active_ingredient.toLowerCase().includes(q) ||
      m.antimicrobial_class.toLowerCase().includes(q);
    const matchesClass =
      selectedClass === 'all' ||
      (selectedClass === 'access' && m.cia_classification === 'Access') ||
      (selectedClass === 'watch' && m.cia_classification === 'Watch') ||
      (selectedClass === 'reserve' && m.cia_classification === 'Reserve');
    return matchesSearch && matchesClass;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#072716] via-[#0E4D2B] to-[#166534] text-white flex items-center justify-center shadow-md">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0E4D2B]">
                {language === 'en' ? 'Veterinary Medicine & MRL Catalog' : 'पशु चिकित्सा औषध एवं एमआरएल निर्देशिका'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en'
                  ? 'FSSAI Statutory MRL Limits • WHO AwaRe Classifications • Cloudinary Media Integration'
                  : 'FSSAI अधिकतम अवशेष सीमा (MRL) एवं सुरक्षित निकासी समय'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add New Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by medicine name, salt, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#10B981]"
            >
              <option value="all">All WHO Categories</option>
              <option value="access">Access (First-Line)</option>
              <option value="watch">Watch (Critical AMU)</option>
              <option value="reserve">Reserve (Highest Priority CIA)</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              leftIcon={<PlusCircle className="w-4 h-4 text-white" />}
            >
              {showAddForm ? 'Close Form' : 'Add Medicine'}
            </Button>
          </div>
        </div>

        {/* Add Medicine Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleCreateMedicine} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E4D2B]">
              Register New Medicine & Statutory MRL Rule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g., Amoxy-Care 15%"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Pharmaceutical Ingredient</label>
                <input
                  type="text"
                  placeholder="e.g., Amoxicillin Trihydrate"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Antimicrobial Class</label>
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                >
                  <option value="Beta-lactams (Penicillins)">Beta-lactams (Penicillins)</option>
                  <option value="Tetracyclines">Tetracyclines</option>
                  <option value="Cephalosporins (3rd/4th Gen)">Cephalosporins (3rd/4th Gen)</option>
                  <option value="Fluoroquinolones">Fluoroquinolones (CIA)</option>
                  <option value="Aminoglycosides">Aminoglycosides</option>
                  <option value="Sulfonamides">Sulfonamides</option>
                  <option value="Macrolides">Macrolides</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Strength / Concentration</label>
                <input
                  type="text"
                  placeholder="e.g., 200 mg/ml"
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Milk Withdrawal (Days)</label>
                <input
                  type="number"
                  min="0"
                  value={newMilkDays}
                  onChange={(e) => setNewMilkDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meat Withdrawal (Days)</label>
                <input
                  type="number"
                  min="0"
                  value={newMeatDays}
                  onChange={(e) => setNewMeatDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Cloudinary Packaging Photo Upload */}
            <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#10B981] text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-4 h-4 text-[#0E4D2B]" />
                  <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Bottle Photo (Cloudinary)'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                </label>
                {uploadedImageUrl && (
                  <span className="text-xs text-[#166534] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded to Cloud
                  </span>
                )}
              </div>

              <Button variant="primary" size="sm" type="submit">
                Save to Database
              </Button>
            </div>
          </form>
        )}

        {/* Medicines Grid */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No matching medicines found. Try adjusting your search query.
            </div>
          ) : (
            filtered.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#10B981] bg-white transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-slate-900">{med.name}</h4>
                    <span className="text-xs text-slate-500 font-semibold">({med.strength})</span>
                    <Badge
                      variant={
                        med.cia_classification === 'Reserve'
                          ? 'error'
                          : med.cia_classification === 'Watch'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      WHO {med.cia_classification}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    <strong className="text-slate-800 font-bold">Salt:</strong> {med.active_ingredient} •{' '}
                    <strong className="text-slate-800 font-bold">Class:</strong> {med.antimicrobial_class}
                  </p>
                </div>

                {/* Withdrawal & MRL Threshold Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      WITHDRAWAL
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E4D2B]">
                      <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Milk: {med.withdrawal_milk_days ?? 3}d</span>
                      <span className="text-slate-300">|</span>
                      <span>Meat: {med.withdrawal_meat_days ?? 14}d</span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 bg-[#E8F5E9] rounded-xl border border-[#DCFCE7] text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#166534] block">
                      FSSAI MRL
                    </span>
                    <span className="text-xs font-black text-[#0E4D2B]">{med.mrl_limit ?? '100 µg/kg'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  PlusCircle,
  QrCode,
  ArrowLeft,
  Scale,
  Calendar,
  Tag,
  Edit3,
  Eye,
  FileText,
  Pill,
  ShieldCheck,
  X,
  Download,
  Printer,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { generateClientQRDataUrl, downloadDataUrlAsFile } from '../../lib/qrHelper';

export interface AnimalItem {
  id: string;
  animal_code: string;
  species: 'cow' | 'buffalo' | 'goat' | 'sheep' | 'pig' | 'poultry' | 'fishery';
  breed: string;
  dob: string;
  sex: 'female' | 'male' | 'collective';
  weight: number; // For fishery: Biomass in kg
  purpose: string;
  health_status: 'healthy' | 'sick' | 'under_treatment' | 'quarantine';
  notes?: string;
  qr_token: string;
  image_url?: string;
  fishery_details?: {
    pond_id?: string;
    water_type?: 'freshwater' | 'brackish' | 'marine';
    biomass_kg?: number;
    target_harvest_date?: string;
  };
}

interface AnimalListProps {
  animals: AnimalItem[];
  onAddAnimal: (animal: Omit<AnimalItem, 'id' | 'qr_token' | 'health_status'>) => Promise<AnimalItem | void> | void;
  onEditAnimal?: (id: string, updates: Partial<AnimalItem>) => void;
  onSelectAnimalForQr: (qrToken: string) => void;
  onRecordMedicineForAnimal?: (animalId: string) => void;
  onBack: () => void;
  autoOpenRegister?: boolean;
}

export const AnimalList: React.FC<AnimalListProps> = ({
  animals,
  onAddAnimal,
  onEditAnimal,
  onSelectAnimalForQr,
  onRecordMedicineForAnimal,
  onBack,
  autoOpenRegister = false,
}) => {
  const { t, language } = useLanguage();

  // Modals state
  const [showFormModal, setShowFormModal] = useState<boolean>(autoOpenRegister);
  const [editingAnimal, setEditingAnimal] = useState<AnimalItem | null>(null);
  const [viewingAnimal, setViewingAnimal] = useState<AnimalItem | null>(null);
  const [animalProfileData, setAnimalProfileData] = useState<any>(null);

  // Dedicated QR Badge Modal State
  const [selectedAnimalForBadge, setSelectedAnimalForBadge] = useState<AnimalItem | null>(null);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [loadingQrBadge, setLoadingQrBadge] = useState<boolean>(false);

  // Registration Success / Instant QR Modal State
  const [justRegisteredAnimal, setJustRegisteredAnimal] = useState<AnimalItem | null>(null);

  // Live Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [animalCode, setAnimalCode] = useState('');
  const [species, setSpecies] = useState<'cow' | 'buffalo' | 'goat' | 'sheep' | 'pig' | 'poultry' | 'fishery'>('cow');
  const [breed, setBreed] = useState('');
  const [dob, setDob] = useState('2023-01-15');
  const [sex, setSex] = useState<'female' | 'male' | 'collective'>('female');
  const [weight, setWeight] = useState('400');
  const [purpose, setPurpose] = useState('milk');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'sick' | 'under_treatment' | 'quarantine'>('healthy');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [pondId, setPondId] = useState('POND-01');
  const [waterType, setWaterType] = useState<'freshwater' | 'brackish' | 'marine'>('freshwater');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openAddModal = () => {
    setEditingAnimal(null);
    setAnimalCode(`TAG-${Math.floor(100 + Math.random() * 900)}`);
    setSpecies('cow');
    setBreed('');
    setDob('2023-01-15');
    setSex('female');
    setWeight('400');
    setPurpose('milk');
    setHealthStatus('healthy');
    setNotes('');
    setImagePreview('');
    setPondId('POND-01');
    setWaterType('freshwater');
    setShowFormModal(true);
  };

  const openEditModal = (animal: AnimalItem) => {
    setEditingAnimal(animal);
    setAnimalCode(animal.animal_code);
    setSpecies(animal.species);
    setBreed(animal.breed);
    setDob(animal.dob || '2023-01-15');
    setSex(animal.sex || 'female');
    setWeight(String(animal.weight || 400));
    setPurpose(animal.purpose || 'milk');
    setHealthStatus(animal.health_status || 'healthy');
    setNotes(animal.notes || '');
    setImagePreview(animal.image_url || '');
    if (animal.fishery_details) {
      setPondId(animal.fishery_details.pond_id || 'POND-01');
      setWaterType(animal.fishery_details.water_type || 'freshwater');
    }
    setShowFormModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openViewProfile = async (animal: AnimalItem) => {
    setViewingAnimal(animal);
    setAnimalProfileData(null);
    try {
      const res = await fetch(`http://localhost:5000/api/animals/${animal.id}`);
      const json = await res.json();
      if (json.status === 'success') {
        setAnimalProfileData(json.data);
      }
    } catch {
      // Fallback
    }
  };

  const openQrBadgeModal = async (animal: AnimalItem) => {
    setSelectedAnimalForBadge(animal);
    setLoadingQrBadge(true);
    setGeneratedQrDataUrl('');

    try {
      const qrToken = animal.qr_token || `QR-${animal.animal_code.toUpperCase()}`;
      const clientQrUrl = await generateClientQRDataUrl(qrToken);
      setGeneratedQrDataUrl(clientQrUrl);
    } catch (err) {
      console.error('QR generation error:', err);
    } finally {
      setLoadingQrBadge(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalCode) return;

    if (editingAnimal && onEditAnimal) {
      onEditAnimal(editingAnimal.id, {
        animal_code: animalCode,
        species,
        breed: breed || (species === 'fishery' ? 'Rohu & Catla' : 'Indigenous'),
        dob,
        sex: species === 'fishery' ? 'collective' : sex,
        weight: Number(weight),
        purpose: species === 'fishery' ? 'aquaculture' : purpose,
        health_status: healthStatus,
        notes,
        image_url: imagePreview,
        fishery_details: species === 'fishery' ? { pond_id: pondId, water_type: waterType, biomass_kg: Number(weight) } : undefined,
      });
      setShowFormModal(false);
    } else {
      const payload: Omit<AnimalItem, 'id' | 'qr_token' | 'health_status'> = {
        animal_code: animalCode,
        species,
        breed: breed || (species === 'cow' ? 'Gir' : species === 'buffalo' ? 'Murrah' : species === 'fishery' ? 'Rohu & Catla Poly-culture' : 'Local'),
        dob,
        sex: species === 'fishery' ? 'collective' : sex,
        weight: Number(weight) || 350,
        purpose: species === 'fishery' ? 'aquaculture' : purpose,
        notes,
        image_url: imagePreview,
        fishery_details: species === 'fishery' ? { pond_id: pondId, water_type: waterType, biomass_kg: Number(weight) } : undefined,
      };

      const qrToken = `QR-${animalCode.toUpperCase().replace(/\s+/g, '-')}`;
      const createdItem: AnimalItem = {
        ...payload,
        id: `a_${Date.now()}`,
        qr_token: qrToken,
        health_status: 'healthy',
      };

      await onAddAnimal(payload);
      setShowFormModal(false);

      // Open Instant Success & QR Badge Modal!
      setJustRegisteredAnimal(createdItem);
      openQrBadgeModal(createdItem);
    }
  };

  const handleDownloadQR = (animal: AnimalItem) => {
    if (generatedQrDataUrl) {
      downloadDataUrlAsFile(generatedQrDataUrl, `QR_Tag_${animal.animal_code}.png`);
    } else {
      window.open(`http://localhost:5000/api/animals/${animal.id}/qr-image`, '_blank');
    }
  };

  const speciesEmoji = (s: string) => {
    switch (s.toLowerCase()) {
      case 'cow': return '🐄';
      case 'buffalo': return '🦬';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'pig': return '🐖';
      case 'poultry': return '🐔';
      case 'fishery': return '🐟';
      default: return '🐄';
    }
  };

  // Filter & Search Logic
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.purpose && animal.purpose.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecies =
      speciesFilter === 'all' ||
      (speciesFilter === 'fishery' ? animal.species === 'fishery' : animal.species !== 'fishery' && (speciesFilter === 'livestock' || animal.species === speciesFilter));

    const matchesStatus =
      statusFilter === 'all' ||
      animal.health_status === statusFilter;

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          {t('common.backToHome')}
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={openAddModal}
            leftIcon={<PlusCircle className="w-5 h-5 text-white" />}
            className="bg-[#1B5E20] hover:bg-[#2E7D32] shadow-lg text-sm font-black w-full sm:w-auto"
          >
            {t('animals.registerNew')}
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#1B5E20]">
          {t('animals.title')}
        </h1>
        <p className="text-xs text-gray-600 font-bold">
          {t('animals.subtitle')}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 🔍 LIVE SEARCH & FILTERING BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-[#1B5E20]/20 rounded-3xl p-4 sm:p-5 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#1B5E20] absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('animals.searchPlaceholder')}
              className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-900 font-bold focus:border-[#1B5E20] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 self-center">
            <button
              onClick={() => setSpeciesFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                speciesFilter === 'all' ? 'bg-[#1B5E20] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('animals.allUnits')} ({animals.length})
            </button>
            <button
              onClick={() => setSpeciesFilter('livestock')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                speciesFilter === 'livestock' ? 'bg-[#1B5E20] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🐄 {t('animals.livestockUnits')} ({animals.filter((a) => a.species !== 'fishery').length})
            </button>
            <button
              onClick={() => setSpeciesFilter('fishery')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                speciesFilter === 'fishery' ? 'bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🐟 {t('animals.fisheryUnits')} ({animals.filter((a) => a.species === 'fishery').length})
            </button>
          </div>
        </div>

        {/* Status Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs font-bold">
          <span className="text-gray-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{t('animals.healthStatus')}:</span>
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {t('animals.allStatus')}
          </button>
          <button
            onClick={() => setStatusFilter('healthy')}
            className={`px-2.5 py-1 rounded-lg ${statusFilter === 'healthy' ? 'bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
          >
            {t('animals.healthyStatus')}
          </button>
          <button
            onClick={() => setStatusFilter('under_treatment')}
            className={`px-2.5 py-1 rounded-lg ${statusFilter === 'under_treatment' ? 'bg-red-700 text-white' : 'text-red-700 hover:bg-red-50'}`}
          >
            {t('animals.underTreatmentStatus')}
          </button>
        </div>
      </div>

      {/* Showing Results Count */}
      <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
        <span>{t('animals.showingCount')}: {filteredAnimals.length} of {animals.length}</span>
        {searchQuery && <span>Search: "{searchQuery}"</span>}
      </div>

      {/* Animal Cards Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="text-lg font-black text-gray-800">{t('animals.noUnitsFound')}</h3>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSpeciesFilter('all'); setStatusFilter('all'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id} variant="glass" className="space-y-4 relative border-2 border-[#1B5E20]/20 p-6 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] border border-[#1B5E20]/30 flex items-center justify-center text-3xl shadow-md overflow-hidden relative">
                      {animal.image_url ? (
                        <img src={animal.image_url} alt={animal.animal_code} className="w-full h-full object-cover" />
                      ) : (
                        speciesEmoji(animal.species)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-[#1B5E20]" />
                        <span>{animal.animal_code}</span>
                      </h3>
                      <span className="text-xs text-gray-600 font-bold capitalize">
                        {animal.species === 'fishery' ? '🐟 Fishery Pond' : `${animal.species} • ${animal.breed}`}
                      </span>
                    </div>
                  </div>

                  {animal.health_status === 'healthy' ? (
                    <Badge variant="success">{t('animals.status.healthy')}</Badge>
                  ) : animal.health_status === 'under_treatment' ? (
                    <Badge variant="error" pulse>{t('animals.status.underTreatment')}</Badge>
                  ) : (
                    <Badge variant="warning">{t('animals.status.sick')}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FFFDF5] p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center space-x-1.5 text-gray-700 font-bold">
                    <Scale className="w-4 h-4 text-[#1B5E20]" />
                    <span>
                      {animal.species === 'fishery' ? `${animal.weight} kg Biomass` : `${animal.weight} kg`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-gray-700 font-bold capitalize">
                    <Calendar className="w-4 h-4 text-[#1B5E20]" />
                    <span>{animal.species === 'fishery' ? 'Pond Unit' : animal.purpose}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewProfile(animal)}
                  leftIcon={<Eye className="w-4 h-4 text-[#1B5E20]" />}
                  className="px-2 text-xs font-bold"
                >
                  {t('animals.profileBtn')}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(animal)}
                  leftIcon={<Edit3 className="w-4 h-4 text-[#1B5E20]" />}
                  className="px-2 text-xs font-bold"
                >
                  {t('animals.editBtn')}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openQrBadgeModal(animal)}
                  leftIcon={<QrCode className="w-4 h-4 text-white" />}
                  className="px-2 text-xs font-bold bg-[#1B5E20]"
                >
                  {t('animals.qrTagBtn')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏷️ INSTANT REGISTRATION SUCCESS & QR DOWNLOAD MODAL */}
      {/* ========================================================================= */}
      {justRegisteredAnimal && selectedAnimalForBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-7 h-7 text-[#1B5E20]" />
                <div>
                  <h2 className="text-xl font-black text-[#1B5E20]">{t('animals.registeredSuccessTitle')}</h2>
                  <span className="text-[11px] text-gray-500 font-bold">{t('animals.registeredSuccessSub')}</span>
                </div>
              </div>
              <button
                onClick={() => setJustRegisteredAnimal(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Ear Tag / Pond Board Badge */}
            <div className="bg-[#FFFDF5] border-2 border-[#1B5E20] rounded-2xl p-6 text-center space-y-4 shadow-md">
              <div className="bg-[#1B5E20] text-white -mx-6 -mt-6 p-3 rounded-t-xl flex items-center justify-between px-4">
                <span className="text-xs font-black tracking-widest uppercase">FARMSHIELD CERTIFIED PASSPORT</span>
                <span className="text-[10px] bg-white text-[#1B5E20] font-black px-2 py-0.5 rounded-full">FSSAI / WOAH</span>
              </div>

              {loadingQrBadge ? (
                <div className="py-12 text-xs text-gray-500 font-bold">Generating QR Code...</div>
              ) : generatedQrDataUrl ? (
                <div className="space-y-3">
                  <div className="inline-block p-2 bg-white rounded-2xl border-2 border-[#1B5E20]/30 shadow-inner">
                    <img
                      src={generatedQrDataUrl}
                      alt={`QR ${selectedAnimalForBadge.animal_code}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-[#1B5E20] block tracking-wide">{selectedAnimalForBadge.animal_code}</span>
                    <span className="text-xs text-gray-700 font-bold">
                      {selectedAnimalForBadge.species === 'fishery'
                        ? `🐟 FISHERY POND UNIT (${selectedAnimalForBadge.weight} kg Biomass)`
                        : `${selectedAnimalForBadge.species.toUpperCase()} • ${selectedAnimalForBadge.breed} (${selectedAnimalForBadge.weight} kg)`}
                    </span>
                    <span className="text-[11px] text-gray-500 block font-semibold mt-0.5">
                      Tag Token: {selectedAnimalForBadge.qr_token}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="p-2.5 bg-[#E8F5E9] rounded-xl border border-[#A5D6A7] text-[11px] text-[#1B5E20] font-bold">
                🟢 Ready to download or print for Physical Ear-Tag / Pond Marker Board
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownloadQR(selectedAnimalForBadge)}
                leftIcon={<Download className="w-4 h-4 text-[#1B5E20]" />}
                className="flex-1 text-xs font-bold py-3"
              >
                {t('animals.downloadPng')}
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4 text-white" />}
                className="flex-1 bg-[#1B5E20] text-xs font-bold py-3"
              >
                {t('animals.printTag')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏷️ DEDICATED QR EAR TAG & PASSPORT BADGE MODAL */}
      {/* ========================================================================= */}
      {!justRegisteredAnimal && selectedAnimalForBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-[#1B5E20]" />
                <h2 className="text-xl font-black text-[#1B5E20]">Livestock QR Ear Tag Badge</h2>
              </div>
              <button
                onClick={() => setSelectedAnimalForBadge(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Badge Card */}
            <div id="printable-badge" className="bg-[#FFFDF5] border-2 border-[#1B5E20] rounded-2xl p-6 text-center space-y-4 shadow-md">
              <div className="bg-[#1B5E20] text-white -mx-6 -mt-6 p-3 rounded-t-xl">
                <span className="text-xs font-black tracking-widest uppercase block">FARMSHIELD FOOD SAFETY PASSPORT</span>
                <span className="text-[10px] text-[#E8F5E9] font-bold">MRL & AMU Withdrawal Verified</span>
              </div>

              {loadingQrBadge ? (
                <div className="py-12 text-xs text-gray-500 font-bold">Generating QR Code...</div>
              ) : generatedQrDataUrl ? (
                <div className="space-y-3">
                  <div className="inline-block p-2 bg-white rounded-2xl border-2 border-[#1B5E20]/30 shadow-inner">
                    <img
                      src={generatedQrDataUrl}
                      alt={`QR ${selectedAnimalForBadge.animal_code}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-[#1B5E20] block tracking-wide">{selectedAnimalForBadge.animal_code}</span>
                    <span className="text-xs text-gray-700 font-bold">
                      {selectedAnimalForBadge.species === 'fishery'
                        ? `🐟 FISHERY POND UNIT (${selectedAnimalForBadge.weight} kg Biomass)`
                        : `${selectedAnimalForBadge.species.toUpperCase()} • ${selectedAnimalForBadge.breed} (${selectedAnimalForBadge.weight} kg)`}
                    </span>
                    <span className="text-[11px] text-gray-500 block font-semibold mt-0.5">
                      Farm ID: {selectedAnimalForBadge.qr_token || 'FARM-01'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-xs text-red-600 font-bold">QR Code error</div>
              )}

              <div className="p-2.5 bg-[#E8F5E9] rounded-xl border border-[#A5D6A7] text-[11px] text-[#1B5E20] font-bold">
                🔍 Scan with any mobile to verify Dairy Milk & Food Safety clearance status
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownloadQR(selectedAnimalForBadge)}
                leftIcon={<Download className="w-4 h-4 text-[#1B5E20]" />}
                className="flex-1 text-xs font-bold py-3"
              >
                {t('animals.downloadPng')}
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4 text-white" />}
                className="flex-1 bg-[#1B5E20] text-xs font-bold py-3"
              >
                {t('animals.printTag')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📋 ADD / EDIT ANIMAL & FISHERY POND FORM MODAL */}
      {/* ========================================================================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-[#1B5E20]" />
                <h2 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
                  {editingAnimal ? t('animals.editAnimal') : t('animals.registerNew')}
                </h2>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-gray-800">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-gray-700 mb-1">{t('animals.uploadPhoto')}</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#1B5E20]/40 rounded-2xl p-4 bg-[#FFFDF5] hover:bg-[#E8F5E9]/50 transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-black text-[#1B5E20] flex items-center gap-1.5">
                      <Upload className="w-4 h-4" />
                      <span>{imagePreview ? 'Change Photo' : 'Click to Upload Animal/Pond Photo'}</span>
                    </span>
                    <p className="text-[11px] text-gray-500 font-normal">{t('animals.photoHint')}</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tag Code & Category Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">{t('animals.animalCode')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COW-104, POND-01"
                    value={animalCode}
                    onChange={(e) => setAnimalCode(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">{t('animals.species')} *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  >
                    <option value="cow">🐄 {t('animals.speciesList.cow')}</option>
                    <option value="buffalo">🦬 {t('animals.speciesList.buffalo')}</option>
                    <option value="goat">🐐 {t('animals.speciesList.goat')}</option>
                    <option value="sheep">🐑 {t('animals.speciesList.sheep')}</option>
                    <option value="pig">🐖 {t('animals.speciesList.pig')}</option>
                    <option value="poultry">🐔 {t('animals.speciesList.poultry')}</option>
                    <option value="fishery">🐟 {t('animals.speciesList.fishery')}</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fishery Pond Fields or Livestock Breed */}
              {species === 'fishery' ? (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-blue-900 block">🐟 United Fishery Pond Parameters</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-blue-800 mb-1">Fish Varieties in Pond</label>
                      <input
                        type="text"
                        placeholder="e.g. Rohu, Catla, Mrigal Poly-culture"
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-800 mb-1">Water Type</label>
                      <select
                        value={waterType}
                        onChange={(e) => setWaterType(e.target.value as any)}
                        className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                      >
                        <option value="freshwater">Freshwater</option>
                        <option value="brackish">Brackish</option>
                        <option value="marine">Marine / Cage</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">{t('animals.breed')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Gir, Murrah, Sahiwal"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Sex</label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value as any)}
                      className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    {t('animals.weight')} *
                  </label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={species === 'fishery' ? '2500' : '400'}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    {t('animals.age')}
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">{t('animals.notes')}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Identification notes, medical history..."
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl p-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="ghost" onClick={() => setShowFormModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" className="bg-[#1B5E20] text-sm font-black shadow-lg py-3">
                  {editingAnimal ? t('animals.saveUpdates') : t('animals.saveAndGenerateQr')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 ANIMAL DETAILED PROFILE MODAL */}
      {/* ========================================================================= */}
      {viewingAnimal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{speciesEmoji(viewingAnimal.species)}</span>
                <div>
                  <h2 className="text-2xl font-black text-[#1B5E20]">{viewingAnimal.animal_code}</h2>
                  <p className="text-xs text-gray-600 font-bold capitalize">
                    {viewingAnimal.species === 'fishery'
                      ? '🐟 Fishery Pond Biomass Unit'
                      : `${viewingAnimal.species} • Breed: ${viewingAnimal.breed}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingAnimal(null)}
                className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clear Status Badges Display */}
            {viewingAnimal.species === 'cow' || viewingAnimal.species === 'buffalo' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#E8F5E9] border border-[#2E7D32]/30 rounded-2xl">
                  <span className="text-[11px] text-gray-600 font-bold block mb-1">DAIRY MILK SAFETY STATUS</span>
                  <span className="text-sm font-black text-[#2E7D32]">
                    {animalProfileData?.milkStatus || (viewingAnimal.health_status === 'under_treatment' ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED')}
                  </span>
                </div>

                <div className="p-3 bg-[#FFF8E1] border border-[#FFC107]/50 rounded-2xl">
                  <span className="text-[11px] text-gray-600 font-bold block mb-1">WITHDRAWAL COUNTDOWN</span>
                  <span className="text-sm font-black text-[#B78103]">
                    {animalProfileData?.withdrawalStatus || (viewingAnimal.health_status === 'under_treatment' ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED')}
                  </span>
                </div>
              </div>
            ) : viewingAnimal.species === 'fishery' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[11px] text-blue-900 font-bold block mb-1">AQUACULTURE HARVEST STATUS</span>
                  <span className="text-sm font-black text-blue-800">
                    {viewingAnimal.health_status === 'under_treatment' ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED'}
                  </span>
                </div>

                <div className="p-3 bg-[#FFF8E1] border border-[#FFC107]/50 rounded-2xl">
                  <span className="text-[11px] text-gray-600 font-bold block mb-1">WITHDRAWAL COUNTDOWN</span>
                  <span className="text-sm font-black text-[#B78103]">
                    {animalProfileData?.withdrawalStatus || (viewingAnimal.health_status === 'under_treatment' ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#E8F5E9] border border-[#2E7D32]/30 rounded-2xl">
                  <span className="text-[11px] text-gray-600 font-bold block mb-1">FOOD SAFETY STATUS</span>
                  <span className="text-sm font-black text-[#2E7D32]">
                    {animalProfileData?.milkStatus || '🟢 CLEARED'}
                  </span>
                </div>

                <div className="p-3 bg-[#FFF8E1] border border-[#FFC107]/50 rounded-2xl">
                  <span className="text-[11px] text-gray-600 font-bold block mb-1">WITHDRAWAL COUNTDOWN</span>
                  <span className="text-sm font-black text-[#B78103]">
                    {animalProfileData?.withdrawalStatus || (viewingAnimal.health_status === 'under_treatment' ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED')}
                  </span>
                </div>
              </div>
            )}

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FFFDF5] p-4 rounded-2xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Sex:</span>
                <span className="font-bold text-gray-900 capitalize">{viewingAnimal.sex || 'female'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Weight / Biomass:</span>
                <span className="font-bold text-gray-900">{viewingAnimal.weight} kg</span>
              </div>
              <div>
                <span className="text-gray-500 block">Age / Stocking:</span>
                <span className="font-bold text-gray-900">{viewingAnimal.dob || '2023-01-15'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Purpose:</span>
                <span className="font-bold text-gray-900 capitalize">{viewingAnimal.purpose}</span>
              </div>
            </div>

            {viewingAnimal.notes && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700">
                <span className="font-bold block mb-0.5">{t('animals.notes')}:</span>
                <p>{viewingAnimal.notes}</p>
              </div>
            )}

            {/* Treatment History Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-black text-[#1B5E20] flex items-center gap-1.5">
                <Pill className="w-4 h-4" />
                <span>{t('treatment.title')}</span>
              </h3>

              {animalProfileData?.treatmentHistory && animalProfileData.treatmentHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {animalProfileData.treatmentHistory.map((tItem: any) => (
                    <div key={tItem.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 block">{tItem.medicine_name} ({tItem.dose} {tItem.dose_unit})</span>
                        <span className="text-gray-500">{tItem.indication} • Duration: {tItem.duration} days</span>
                      </div>
                      <span className="text-xs font-bold text-[#1B5E20]">
                        {new Date(tItem.start_date).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-xs text-center text-gray-500">
                  No treatment records found for this unit.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setViewingAnimal(null);
                  openEditModal(viewingAnimal);
                }}
                leftIcon={<Edit3 className="w-4 h-4 text-[#1B5E20]" />}
                className="flex-1 py-2.5"
              >
                {t('animals.editBtn')}
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  setViewingAnimal(null);
                  openQrBadgeModal(viewingAnimal);
                }}
                leftIcon={<QrCode className="w-4 h-4 text-white" />}
                className="flex-1 bg-[#1B5E20] py-2.5"
              >
                {t('animals.qrTagBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

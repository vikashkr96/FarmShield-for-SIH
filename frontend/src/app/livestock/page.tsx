'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Animal, Species, HealthStatus, AnimalSex, AnimalPurpose } from '../../types/database';
import { AnimalRepository } from '../../lib/repositories/animal.repository';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { getBreedAsset, BREED_DATA } from '../../lib/breed_assets';
import { CloudinaryService } from '../../lib/services/cloudinary.service';

export default function LivestockPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<HealthStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'tag_asc' | 'weight_desc' | 'weight_asc' | 'date_desc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Add Animal Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSpecies, setNewSpecies] = useState<Species>('cow');
  const [newBreed, setNewBreed] = useState('Sahiwal');
  const [newTagId, setNewTagId] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newSex, setNewSex] = useState<AnimalSex>('female');
  const [newWeight, setNewWeight] = useState('400');
  const [newPurpose, setNewPurpose] = useState<AnimalPurpose>('milk');
  const [newPondId, setNewPondId] = useState('Pond #1');
  const [newStockingDensity, setNewStockingDensity] = useState('4.5');
  const [newWaterVolume, setNewWaterVolume] = useState('2500');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AnimalRepository.getAnimals();
      setAnimals(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load herd records');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  // Breeds list according to selected new animal species
  const breedOptions = useMemo(() => {
    const breedsForSpecies = BREED_DATA[newSpecies] || {};
    return Object.keys(breedsForSpecies).map((b) => ({ value: b, label: b }));
  }, [newSpecies]);

  // Auto-generate IN-PB Ear Tag
  const handleAutoGenerateTag = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setNewTagId(`IN-PB-2024-${randomSuffix}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleAddAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagId) {
      toast.error('Tag ID required', 'Please enter or generate a unique Ear Tag RFID');
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = uploadPreview;

      // Upload to Cloudinary if a custom file was chosen
      if (selectedFile) {
        try {
          const uploadRes = await CloudinaryService.uploadImage(selectedFile, {
            folder: 'farmshield_livestock',
            tags: ['animal', newSpecies],
          });
          finalImageUrl = uploadRes.secure_url;
        } catch (uploadErr) {
          console.warn('Cloudinary upload fallback to local preview:', uploadErr);
        }
      }

      if (!finalImageUrl) {
        finalImageUrl = getBreedAsset(newSpecies, newBreed).imageUrl;
      }

      const created = await AnimalRepository.createAnimal({
        animal_code: newTagId,
        species: newSpecies,
        breed: newBreed,
        dob: newDob || new Date().toISOString().split('T')[0],
        sex: newSex,
        weight: Number(newWeight) || 350,
        purpose: newPurpose,
        health_status: 'healthy',
        image_url: finalImageUrl,
        fishery_details: newSpecies === 'fishery' ? {
          pond_id: newPondId,
          water_type: 'freshwater',
          biomass_kg: Number(newWeight) || 100,
          stocking_density: Number(newStockingDensity) || 0,
          water_volume_m3: Number(newWaterVolume) || 0,
        } : undefined,
      });

      toast.success('Animal Registered', `Unit ${created.animal_code} added to herd`);
      setIsAddModalOpen(false);
      // Reset form
      setNewTagId('');
      setSelectedFile(null);
      setUploadPreview('');
      loadAnimals();
    } catch (err: any) {
      toast.error('Registration Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnimal = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to remove animal ${code} from herd records?`)) return;
    await AnimalRepository.deleteAnimal(id);
    toast.info('Record Removed', `Unit ${code} has been deleted`);
    loadAnimals();
  };

  // Filter and Sort animals
  const sortedAnimals = useMemo(() => {
    const filtered = animals.filter((a) => {
      if (selectedSpecies !== 'all' && a.species !== selectedSpecies) return false;
      if (selectedStatus !== 'all' && a.health_status !== selectedStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const codeMatch = a.animal_code.toLowerCase().includes(q);
        const breedMatch = a.breed?.toLowerCase().includes(q);
        if (!codeMatch && !breedMatch) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'tag_asc') return a.animal_code.localeCompare(b.animal_code);
      if (sortBy === 'weight_desc') return (b.weight || 0) - (a.weight || 0);
      if (sortBy === 'weight_asc') return (a.weight || 0) - (b.weight || 0);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [animals, selectedSpecies, selectedStatus, searchQuery, sortBy]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(sortedAnimals.length / pageSize));
  const paginatedAnimals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAnimals.slice(start, start + pageSize);
  }, [sortedAnimals, currentPage]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          {/* Header Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Livestock & Herd Management
                </h1>
                <span className="bg-[#E8F5E9] text-[#1B5E20] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-green-200">
                  {animals.length} Heads
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Centralized INAPH RFID Tagging, Health Dossiers, and MRL Embargo Tracking
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                handleAutoGenerateTag();
                setIsAddModalOpen(true);
              }}
              leftIcon={<span className="text-lg">+</span>}
            >
              Register Animal
            </Button>
          </div>

          {/* Search and Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search by Ear Tag RFID, Breed, or Animal Code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Status filter dropdown */}
              <div className="w-full sm:w-52">
                <Select
                  options={[
                    { value: 'all', label: 'All Health Statuses' },
                    { value: 'healthy', label: '🟢 Safe & Compliant' },
                    { value: 'under_treatment', label: '🔴 Under MRL Embargo' },
                    { value: 'quarantine', label: '🟡 Quarantine Protocol' },
                  ]}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as HealthStatus | 'all');
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Sort dropdown */}
              <div className="w-full sm:w-52">
                <Select
                  options={[
                    { value: 'date_desc', label: 'Sort: Recently Added' },
                    { value: 'tag_asc', label: 'Sort: Tag ID (A-Z)' },
                    { value: 'weight_desc', label: 'Sort: Weight (High-Low)' },
                    { value: 'weight_asc', label: 'Sort: Weight (Low-High)' },
                  ]}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                />
              </div>
            </div>

            {/* Species Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'All Species' },
                { id: 'cow', label: '🐄 Cattle' },
                { id: 'buffalo', label: '🐃 Buffalo' },
                { id: 'goat', label: '🐐 Goat' },
                { id: 'sheep', label: '🐑 Sheep' },
                { id: 'fishery', label: '🐟 Fishery & Aqua' },
                { id: 'poultry', label: '🐔 Poultry' },
              ].map((sp) => {
                const isSelected = selectedSpecies === sp.id;
                const count = sp.id === 'all' ? animals.length : animals.filter((a) => a.species === sp.id).length;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setSelectedSpecies(sp.id as Species | 'all');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1B5E20] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{sp.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Herd Grid Display */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <CardSkeleton lines={3} />
              <CardSkeleton lines={3} />
              <CardSkeleton lines={3} />
            </div>
          ) : sortedAnimals.length === 0 ? (
            <EmptyState
              title="No animals match the active filter"
              description="Try modifying your search keywords, clear the species filter, or register a new animal."
              actionLabel="Register New Animal"
              onAction={() => {
                handleAutoGenerateTag();
                setIsAddModalOpen(true);
              }}
              secondaryActionLabel="Reset Filters"
              onSecondaryAction={() => {
                setSearchQuery('');
                setSelectedSpecies('all');
                setSelectedStatus('all');
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedAnimals.map((animal) => {
                const asset = getBreedAsset(animal.species, animal.breed || '');
                const hasActiveWithdrawal = animal.health_status === 'under_treatment';

                return (
                  <div
                    key={animal.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Card Photo Header */}
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={animal.image_url || asset.imageUrl}
                        alt={animal.breed || animal.species}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Health Status Badge */}
                      <div className="absolute top-3 left-3">
                        {hasActiveWithdrawal ? (
                          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            MRL WITHDRAWAL ACTIVE
                          </span>
                        ) : animal.health_status === 'quarantine' ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                            QUARANTINE PROTOCOL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-[#1B5E20] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                            SAFE TO HARVEST
                          </span>
                        )}
                      </div>

                      {/* Tag RFID Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <div>
                          <p className="text-xs font-mono font-bold tracking-wider">{animal.animal_code}</p>
                          <p className="text-sm font-extrabold capitalize">{animal.breed} • {animal.species}</p>
                        </div>
                        <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg capitalize">
                          {animal.purpose}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 py-1 border-b border-gray-100">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Gender / Weight</span>
                          <span className="font-bold text-gray-800 capitalize">{animal.sex} • {animal.weight} kg</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Registered Date</span>
                          <span className="font-bold text-gray-800">
                            {new Date(animal.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href={`/livestock/${animal.id}`}
                          className="flex-1 py-2 px-3 text-center text-xs font-bold text-white bg-[#1B5E20] hover:bg-[#144716] rounded-xl transition-colors shadow-xs"
                        >
                          360° Dossier
                        </Link>
                        <Link
                          href={`/treatments/new?animalId=${animal.id}`}
                          title="Log Treatment"
                          className="p-2 text-xs font-bold text-[#1B5E20] bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
                        >
                          💊
                        </Link>
                        <Link
                          href={`/qr/${animal.qr_token}`}
                          title="Food Safety QR Passport"
                          className="p-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          🏷️
                        </Link>
                        <button
                          onClick={() => handleDeleteAnimal(animal.id, animal.animal_code)}
                          title="Delete Record"
                          className="p-2 text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">
                  Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedAnimals.length)} of {sortedAnimals.length} animals
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-bold text-gray-700 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        </main>
      </div>

      <MobileNav />

      {/* Add Animal Registration Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Livestock into National Traceability Network"
      >
        <form onSubmit={handleAddAnimalSubmit} className="space-y-4">
          {/* Species & Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Species *"
              options={[
                { value: 'cow', label: 'Cow (Bovine)' },
                { value: 'buffalo', label: 'Buffalo' },
                { value: 'goat', label: 'Goat (Caprine)' },
                { value: 'sheep', label: 'Sheep (Ovine)' },
                { value: 'fishery', label: 'Fishery / Aquaculture' },
                { value: 'poultry', label: 'Poultry' },
              ]}
              value={newSpecies}
              onChange={(e) => {
                const sp = e.target.value as Species;
                setNewSpecies(sp);
                const firstBreed = Object.keys(BREED_DATA[sp] || {})[0] || 'Generic';
                setNewBreed(firstBreed);
              }}
            />

            <Select
              label="Indigenous Breed *"
              options={breedOptions.length > 0 ? breedOptions : [{ value: 'Indigenous Cross', label: 'Indigenous Cross' }]}
              value={newBreed}
              onChange={(e) => setNewBreed(e.target.value)}
            />
          </div>

          {/* Ear Tag ID with Auto-Gen */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-gray-700">Official Ear Tag RFID / Code *</label>
              <button
                type="button"
                onClick={handleAutoGenerateTag}
                className="text-[11px] font-bold text-[#1B5E20] hover:underline"
              >
                Auto-Generate (IN-PB)
              </button>
            </div>
            <Input
              required
              placeholder="e.g. IN-PB-2024-9102"
              value={newTagId}
              onChange={(e) => setNewTagId(e.target.value)}
            />
          </div>

          {/* Sex, Weight, DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Sex"
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'collective', label: 'Collective (Aqua/Poultry)' },
              ]}
              value={newSex}
              onChange={(e) => setNewSex(e.target.value as AnimalSex)}
            />

            <Input
              label="Weight (kg)"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />

            <Input
              label="Date of Birth"
              type="date"
              value={newDob}
              onChange={(e) => setNewDob(e.target.value)}
            />
          </div>

          {/* Purpose */}
          <Select
            label="Primary Enterprise Purpose"
            options={[
              { value: 'milk', label: 'Dairy / Milk Production' },
              { value: 'meat', label: 'Meat / Carcass' },
              { value: 'breeding', label: 'Breeding Stock' },
              { value: 'aquaculture', label: 'Aquaculture Harvest' },
              { value: 'egg', label: 'Egg Production' },
            ]}
            value={newPurpose}
            onChange={(e) => setNewPurpose(e.target.value as AnimalPurpose)}
          />

          {/* Fishery / Aquaculture Specific Parameters */}
          {newSpecies === 'fishery' && (
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
              <span className="text-xs font-bold text-sky-900 block">
                🐟 Inland Fishery & Pond Hydrobiology Parameters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Pond / Tank ID"
                  placeholder="e.g. Pond #1"
                  value={newPondId}
                  onChange={(e) => setNewPondId(e.target.value)}
                />
                <Input
                  label="Stocking Density (pcs/m²)"
                  type="number"
                  step="0.1"
                  value={newStockingDensity}
                  onChange={(e) => setNewStockingDensity(e.target.value)}
                />
                <Input
                  label="Water Volume (m³)"
                  type="number"
                  value={newWaterVolume}
                  onChange={(e) => setNewWaterVolume(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5">
              Livestock Photograph (Optional)
            </label>
            <div className="flex items-center gap-3">
              {uploadPreview ? (
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-14 h-14 object-cover rounded-xl border"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
                  📷
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E8F5E9] file:text-[#1B5E20] hover:file:bg-[#C8E6C9] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Register Animal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

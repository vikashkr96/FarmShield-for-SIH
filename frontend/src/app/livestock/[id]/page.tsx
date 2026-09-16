'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useToast } from '../../../components/ui/Toast';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { Animal, Treatment, LabResult } from '../../../types/database';
import { AnimalRepository } from '../../../lib/repositories/animal.repository';
import { TreatmentRepository } from '../../../lib/repositories/treatment.repository';
import { LabRepository } from '../../../lib/repositories/lab.repository';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { getBreedAsset } from '../../../lib/breed_assets';
import { EditAnimalModal } from '../../../components/livestock/EditAnimalModal';

export default function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'withdrawal' | 'vaccines' | 'lab'>('timeline');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const a = await AnimalRepository.getAnimalById(animalId);
        if (a) {
          setAnimal(a);
          const [txList, labs] = await Promise.all([
            TreatmentRepository.getTreatments(a.id),
            LabRepository.getLabResults(a.id),
          ]);
          setTreatments(txList);
          setLabResults(labs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [animalId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B5E20]" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Animal Record Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">No livestock record matches code or ID &quot;{animalId}&quot;.</p>
        <Button variant="primary" onClick={() => router.push('/livestock')}>
          Return to Livestock List
        </Button>
      </div>
    );
  }

  const asset = getBreedAsset(animal.species, animal.breed || '');
  const activeWithdrawal = animal.withdrawals?.find((w) => w.status === 'active');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24 lg:pb-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
            <Link href="/livestock" className="hover:text-[#1B5E20] font-medium">
              Livestock Directory
            </Link>
            <span>/</span>
            <span className="font-bold text-gray-800 font-mono">{animal.animal_code}</span>
          </div>

          {/* Top 360° Profile Header Card */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div
                onClick={() => setShowPhotoModal(true)}
                className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border shadow-inner relative group cursor-pointer"
                title="Click to view full photo"
              >
                <img
                  src={animal.image_url || asset.imageUrl}
                  alt={animal.breed || animal.species}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  🔍 Zoom Photo
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                    {animal.animal_code}
                  </h1>
                  {activeWithdrawal ? (
                    <Badge variant="error">MRL WITHDRAWAL ACTIVE</Badge>
                  ) : animal.health_status === 'quarantine' ? (
                    <Badge variant="warning">QUARANTINE</Badge>
                  ) : (
                    <Badge variant="success">SAFE & COMPLIANT</Badge>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-bold capitalize">
                    {animal.purpose}
                  </span>
                </div>

                <p className="text-base font-bold text-gray-700 capitalize">
                  {animal.breed || 'Indigenous'} • {animal.species}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Gender</span>
                    <span className="font-bold text-gray-800 capitalize">{animal.sex}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Body Weight</span>
                    <span className="font-bold text-gray-800">{animal.weight} kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Farm Provenance</span>
                    <span className="font-bold text-gray-800 font-mono">{animal.farm_id}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Birth Date</span>
                    <span className="font-bold text-gray-800">{animal.dob || 'Unknown'}</span>
                  </div>
                </div>

                {animal.fishery_details && (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 mt-2">
                    <span className="text-[10px] font-bold text-sky-800 uppercase block">Inland Aquaculture Hydrology</span>
                    <div className="flex items-center gap-4 text-xs font-bold text-sky-950 mt-1">
                      <span>Pond: {animal.fishery_details.pond_id || 'Pond #1'}</span>
                      <span>Density: {animal.fishery_details.stocking_density || 4.5} pcs/m²</span>
                      <span>Volume: {animal.fishery_details.water_volume_m3 || 2500} m³</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                <Link
                  href={`/treatments/new?animalId=${animal.id}`}
                  className="py-2 px-4 text-center text-xs font-bold text-white bg-[#1B5E20] hover:bg-[#144716] rounded-xl shadow-xs transition-colors"
                >
                  Log Prescription
                </Link>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="py-2 px-4 text-center text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  ✏️ Edit Record
                </button>
                <Link
                  href={`/livestock/${animal.id}/passport`}
                  className="py-2 px-4 text-center text-xs font-bold text-[#1B5E20] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors"
                >
                  📜 Official Passport
                </Link>
                <button
                  onClick={() => window.print()}
                  className="py-2 px-4 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  🖨️ Print Dossier
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete animal ${animal.animal_code} permanently?`)) {
                      await AnimalRepository.deleteAnimal(animal.id);
                      toast.info('Record deleted');
                      router.push('/livestock');
                    }
                  }}
                  className="py-2 px-4 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </Card>

          {/* Dossier Tabs */}
          <Tabs
            variant="underline"
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            tabs={[
              { id: 'timeline', label: 'Medical Timeline', badge: treatments.length },
              { id: 'withdrawal', label: 'Withdrawal & MRLs', badge: activeWithdrawal ? 'Active' : 'Clear' },
              { id: 'vaccines', label: 'Vaccinations', badge: '3' },
              { id: 'lab', label: 'Lab Residue Tests', badge: labResults.length },
            ]}
            className="mb-6 bg-white rounded-t-2xl px-4 pt-2 border border-gray-200"
          />

          {/* Tab 1: Medical Timeline */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Veterinary Prescriptions & Treatments</h3>
                <Link
                  href={`/treatments/new?animalId=${animal.id}`}
                  className="text-xs font-bold text-[#1B5E20] hover:underline"
                >
                  + Add Prescription
                </Link>
              </div>

              {treatments.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No prior treatments recorded for this animal.</p>
              ) : (
                <div className="space-y-3">
                  {treatments.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          {tx.medicine?.name || 'Veterinary Antibiotic'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(tx.start_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        <strong>Dosage:</strong> {tx.dose} {tx.dose_unit} • <strong>Route:</strong> {tx.route} • <strong>Frequency:</strong> {tx.frequency}
                      </p>
                      {tx.indication && (
                        <p className="text-xs text-gray-600">
                          <strong>Clinical Diagnosis:</strong> {tx.indication}
                        </p>
                      )}
                      {tx.notes && (
                        <p className="text-xs text-gray-500 italic">
                          &quot;{tx.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Withdrawal Embargo */}
          {activeTab === 'withdrawal' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900">Statutory MRL Withdrawal Embargo Status</h3>

              {activeWithdrawal ? (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl">
                    ⏱️
                  </div>
                  <h4 className="text-lg font-black text-red-800">MRL WITHDRAWAL ACTIVE</h4>
                  <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
                    Food products ({activeWithdrawal.product.toUpperCase()}) from this animal are currently prohibited from entering the human food chain until full clearance.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-red-200 inline-block font-mono text-xs">
                    <span className="text-gray-500 block">Scheduled Clearance Date</span>
                    <strong className="text-base text-gray-900">
                      {new Date(activeWithdrawal.end_date).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-[#1B5E20] flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-green-900">Zero Active Embargoes</h4>
                  <p className="text-xs text-green-700">
                    This animal has cleared all statutory withdrawal periods. Milk, meat, and eggs are certified compliant with FSSAI MRL standards.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Vaccines */}
          {activeTab === 'vaccines' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900">National Immunization & Vaccination Ledger</h3>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Foot-and-Mouth Disease (FMD) Bi-Annual</p>
                    <p className="text-gray-500">Batch: FMD-VET-2024-99 • DAHD Free Vaccination Scheme</p>
                  </div>
                  <Badge variant="success">Completed</Badge>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Brucellosis S19 (Calfhood Vaccination)</p>
                    <p className="text-gray-500">Single Lifetime Dose Administered</p>
                  </div>
                  <Badge variant="success">Immune</Badge>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Hemorrhagic Septicemia (HS) Annual</p>
                    <p className="text-gray-500">Pre-monsoon booster scheduled for July 2024</p>
                  </div>
                  <Badge variant="info">Upcoming</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Lab Residue Tests */}
          {activeTab === 'lab' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">NABL Laboratory Diagnostics</h3>
                <Link href="/lab-results" className="text-xs font-bold text-[#1B5E20] hover:underline">
                  View Central Lab Registry →
                </Link>
              </div>

              {labResults.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No lab test certificates on file for this animal.</p>
              ) : (
                <div className="space-y-3">
                  {labResults.map((lab) => (
                    <div key={lab.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{lab.test_type}</span>
                        {lab.is_compliant ? (
                          <Badge variant="success">PASS (Compliant)</Badge>
                        ) : (
                          <Badge variant="error">MRL EXCEEDED</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Result</span>
                          <strong className="text-gray-900">{lab.result_value}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Statutory MRL Limit</span>
                          <span className="text-gray-900">{lab.mrl_limit}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Testing Facility</span>
                          <span className="text-gray-900 truncate block">{lab.lab_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Animal Modal */}
          {showEditModal && (
            <EditAnimalModal
              animal={animal}
              onClose={() => setShowEditModal(false)}
              onSave={(updated) => {
                setAnimal(updated);
                setShowEditModal(false);
                toast.success('Animal dossier updated');
              }}
            />
          )}

          {/* Full Screen Photo Zoom Modal */}
          {showPhotoModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowPhotoModal(false)}
            >
              <div className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl bg-black">
                <img
                  src={animal.image_url || asset.imageUrl}
                  alt={animal.animal_code}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white flex items-center justify-between">
                  <span className="text-sm font-black font-mono">{animal.animal_code} • {animal.breed}</span>
                  <span className="text-xs text-gray-300">Click anywhere to close</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

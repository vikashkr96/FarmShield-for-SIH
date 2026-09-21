'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useToast } from '../../../components/ui/Toast';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { Animal, Medicine, TargetProduct } from '../../../types/database';
import { AnimalRepository } from '../../../lib/repositories/animal.repository';
import { MedicineRepository } from '../../../lib/repositories/medicine.repository';
import { TreatmentRepository } from '../../../lib/repositories/treatment.repository';
import { WithdrawalService } from '../../../lib/services/withdrawal.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';

function TreatmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAnimalId = searchParams.get('animalId') || '';

  const { user } = useAuth();
  const toast = useToast();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [selectedAnimalId, setSelectedAnimalId] = useState(preselectedAnimalId);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [dose, setDose] = useState('15');
  const [doseUnit, setDoseUnit] = useState('ml');
  const [route, setRoute] = useState('Injection (IM)');
  const [frequency, setFrequency] = useState('Once daily');
  const [duration, setDuration] = useState('3');
  const [productAffected, setProductAffected] = useState<TargetProduct>('milk');
  const [indication, setIndication] = useState('Acute Clinical Mastitis');
  const [notes, setNotes] = useState('');
  const [isOffLabel, setIsOffLabel] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [aList, mList] = await Promise.all([
          AnimalRepository.getAnimals(),
          MedicineRepository.getMedicines(),
        ]);
        setAnimals(aList);
        setMedicines(mList);
        if (mList.length > 0 && !selectedMedicineId) {
          setSelectedMedicineId(mList[0].id);
        }
        if (aList.length > 0 && !selectedAnimalId) {
          setSelectedAnimalId(aList[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [preselectedAnimalId]);

  const currentAnimal = animals.find((a) => a.id === selectedAnimalId);
  const currentMedicine = medicines.find((m) => m.id === selectedMedicineId);

  // Real-time Withdrawal Preview Calculation
  const withdrawalPreview = useMemo(() => {
    if (!currentMedicine) return null;
    return WithdrawalService.calculateWithdrawal({
      startDate: new Date(),
      durationDays: Number(duration) || 1,
      activeIngredient: currentMedicine.active_ingredient,
      species: currentAnimal?.species || 'cow',
      product: productAffected,
      isOffLabel,
    });
  }, [currentMedicine, currentAnimal, duration, productAffected, isOffLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalId || !selectedMedicineId) {
      toast.error('Missing fields', 'Please select both an animal and a medicine');
      return;
    }

    setSubmitting(true);
    try {
      const res = await TreatmentRepository.createTreatment({
        animalId: selectedAnimalId,
        medicineId: selectedMedicineId,
        veterinarianId: user?.id || 'vet-current',
        dose: Number(dose) || 10,
        doseUnit,
        route,
        frequency,
        durationDays: Number(duration) || 3,
        productAffected,
        indication,
        notes,
        isOffLabel,
      });

      toast.success('Prescription Logged', `MRL withdrawal embargo active until ${new Date(res.withdrawal.end_date).toLocaleDateString()}`);
      router.push(`/livestock/${selectedAnimalId}`);
    } catch (err: any) {
      toast.error('Failed to log treatment', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24 lg:pb-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Veterinary Prescription & Treatment Log
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Statutory Antimicrobial Administration and MRL Withdrawal Duration Computation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Animal Selection Card */}
            <Card className="p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🐄</span> Step 1: Select Livestock Patient
              </h2>
              <Select
                label="Animal Patient *"
                options={animals.map((a) => ({
                  value: a.id,
                  label: `${a.animal_code} • ${a.breed || a.species} (${a.weight} kg, ${a.purpose})`,
                }))}
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
              />
            </Card>

            {/* Pharmaceutical Selection Card */}
            <Card className="p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>💊</span> Step 2: Veterinary Pharmaceutical & Dosage
              </h2>

              <div className="space-y-4">
                <Select
                  label="Antimicrobial Formulation *"
                  options={medicines.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.active_ingredient}) — WHO ${m.who_classification || 'Standard'}`,
                  }))}
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                />

                {currentMedicine?.who_classification === 'HPCIA' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
                    ⚠️ <strong>WHO Highest Priority CIA:</strong> Use only when bacteriological culture/sensitivity testing confirms no alternative first-line therapy.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Administered Dose"
                    type="number"
                    required
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                  />

                  <Select
                    label="Unit"
                    options={[
                      { value: 'ml', label: 'ml (Millilitres)' },
                      { value: 'mg/kg', label: 'mg/kg bodyweight' },
                      { value: 'mg', label: 'mg (Milligrams)' },
                      { value: 'g', label: 'g (Grams)' },
                      { value: 'IU', label: 'IU (International Units)' },
                      { value: 'bolus', label: 'Bolus / Tablet' },
                    ]}
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                  />

                  <Select
                    label="Route of Administration"
                    options={[
                      { value: 'Injection (IM)', label: 'Intramuscular (IM)' },
                      { value: 'Injection (SC)', label: 'Subcutaneous (SC)' },
                      { value: 'Injection (IV)', label: 'Intravenous (IV)' },
                      { value: 'Oral', label: 'Oral Drench / Bolus' },
                      { value: 'Intramammary', label: 'Intramammary Infusion' },
                      { value: 'Water/Feed', label: 'In-feed / Water Soluble' },
                      { value: 'Bath', label: 'Bath / Immersion (Aquaculture)' },
                    ]}
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Frequency"
                    options={[
                      { value: 'Once daily', label: 'Once Daily (q24h)' },
                      { value: 'Twice daily', label: 'Twice Daily (q12h)' },
                      { value: 'Every 48 hours', label: 'Every 48 Hours' },
                      { value: 'Single dose', label: 'Single Long-Acting Dose' },
                    ]}
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  />

                  <Input
                    label="Course Duration (Days)"
                    type="number"
                    min="1"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />

                  <Select
                    label="Target Product Affected"
                    options={[
                      { value: 'milk', label: 'Milk (Dairy)' },
                      { value: 'meat', label: 'Meat / Muscle' },
                      { value: 'eggs', label: 'Eggs (Poultry)' },
                      { value: 'fish', label: 'Aquaculture Biomass' },
                    ]}
                    value={productAffected}
                    onChange={(e) => setProductAffected(e.target.value as TargetProduct)}
                  />
                </div>
              </div>
            </Card>

            {/* Clinical Notes & Off-Label Toggle */}
            <Card className="p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🩺</span> Step 3: Clinical Diagnosis & Regulatory Cascade
              </h2>

              <div className="space-y-4">
                <Input
                  label="Clinical Indication / Diagnosis *"
                  required
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="e.g. Acute Mastitis, Bacterial Enteritis"
                />

                <Input
                  label="Treatment Notes & Regimen"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional observations or supportive therapy"
                />

                {/* Off-label cascade checkbox */}
                <label className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOffLabel}
                    onChange={(e) => setIsOffLabel(e.target.checked)}
                    className="mt-1 rounded text-[#1B5E20] focus:ring-[#1B5E20]"
                  />
                  <div className="text-xs">
                    <strong className="text-amber-900 block font-bold">
                      Off-Label / Extra-Label Use (Statutory Cascade Penalty)
                    </strong>
                    <span className="text-amber-700">
                      Check if drug is prescribed outside standard manufacturer dosage or species label. Extends withdrawal by +50% per statutory MRL regulations.
                    </span>
                  </div>
                </label>
              </div>
            </Card>

            {/* Live Withdrawal Preview */}
            {withdrawalPreview && (
              <Card className="p-6 bg-green-50/60 border-green-200">
                <h2 className="text-sm font-bold text-[#1B5E20] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>⏱️</span> Statutory MRL Withdrawal Preview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-gray-500 block">Total Withdrawal Period</span>
                    <strong className="text-lg text-gray-900">{withdrawalPreview.totalWithdrawalDays} Days</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Scheduled Clearance Date</span>
                    <strong className="text-sm text-gray-900 font-mono">
                      {withdrawalPreview.clearanceDate.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Mandatory Discard</span>
                    <strong className="text-sm text-red-700 uppercase font-bold">
                      DO NOT HARVEST {productAffected}
                    </strong>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Sign & Authorize Treatment
              </Button>
            </div>
          </form>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default function NewTreatmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TreatmentForm />
    </Suspense>
  );
}

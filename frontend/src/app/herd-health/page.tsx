'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { AnimalRepository } from '../../lib/repositories/animal.repository';
import { Animal } from '../../types/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function HerdHealthPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarantineAnimal, setSelectedQuarantineAnimal] = useState<Animal | null>(null);
  const [observationTemp, setObservationTemp] = useState('38.5');
  const [observationNotes, setObservationNotes] = useState('');
  const [observationAppetite, setObservationAppetite] = useState('Normal');
  const [vaccineSchedule, setVaccineSchedule] = useState([
    { id: 'vac-1', name: 'Raksha Ovac', target: 'Foot-and-Mouth Disease (FMD)', freq: 'Bi-Annual (Sep & Mar)', protocol: 'All cattle & buffalo above 4 months', status: 'Completed' },
    { id: 'vac-2', name: 'Bruvax S19', target: 'Bovine Brucellosis', freq: 'Single Dose', protocol: 'Female calves between 4–8 months', status: 'Completed' },
    { id: 'vac-3', name: 'Hemorrhagic Septicemia Vaccine', target: 'Pasteurella multocida (HS)', freq: 'Annual (May–June)', protocol: 'Endemic lowlands pre-monsoon', status: 'Due in 45 Days' },
    { id: 'vac-4', name: 'Black Quarter (BQ) Vaccine', target: 'Clostridium chauvoei', freq: 'Annual', protocol: 'Young cattle 6 months – 2 years', status: 'Upcoming' },
  ]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await AnimalRepository.getAnimals();
      setAnimals(data);
      setLoading(false);
    }
    load();
  }, []);

  const quarantineAnimals = animals.filter((a) => a.health_status === 'quarantine');
  const underTreatmentAnimals = animals.filter((a) => a.health_status === 'under_treatment');
  const healthyCount = animals.filter((a) => a.health_status === 'healthy').length;
  const herdImmunityRate = animals.length > 0 ? Math.round((healthyCount / animals.length) * 100) : 100;

  const handleReleaseQuarantine = async (animalId: string, code: string) => {
    await AnimalRepository.updateAnimalStatus(animalId, 'healthy');
    toast.success('Quarantine Lifted', `Animal ${code} restored to active herd`);
    const data = await AnimalRepository.getAnimals();
    setAnimals(data);
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuarantineAnimal) return;
    toast.success(
      'Observation Recorded',
      `Temp ${observationTemp}°C, appetite ${observationAppetite} logged for ${selectedQuarantineAnimal.animal_code}`
    );
    setSelectedQuarantineAnimal(null);
    setObservationNotes('');
  };

  const handleAdministerVaccine = (vacId: string, vacName: string) => {
    setVaccineSchedule((prev) =>
      prev.map((v) => (v.id === vacId ? { ...v, status: 'Completed' } : v))
    );
    toast.success('Vaccination Logged', `National administration record created for ${vacName}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Herd Health & Biosecurity
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                DAHD National Immunization Schedules, Quarantine Enclosures, and Morbidity Metrics
              </p>
            </div>

            <Link
              href="/syndromic-report"
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              <span>🚨</span> Report Outbreak
            </Link>
          </div>

          {/* Herd KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Herd Immunity</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#1B5E20]">{herdImmunityRate}%</span>
                <span className="text-xs font-bold text-green-700">Protected</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">FMD & Brucellosis compliant</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Under Quarantine</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600">{quarantineAnimals.length}</span>
                <span className="text-xs font-bold text-amber-700">Isolated</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Biosecurity containment active</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">MRL Embargo Active</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-red-600">{underTreatmentAnimals.length}</span>
                <span className="text-xs font-bold text-red-700">Animals</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Milk & meat harvest paused</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Healthy Stock</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{healthyCount}</span>
                <span className="text-xs font-bold text-gray-500">of {animals.length}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Full production capacity</p>
            </Card>
          </div>

          {/* Active Quarantines Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>⚠️</span> Active Quarantine Enclosures
            </h2>

            {quarantineAnimals.length === 0 ? (
              <div className="p-6 rounded-xl bg-green-50 text-green-900 text-xs font-medium text-center">
                ✓ No animals currently under quarantine. All enclosures sanitized and biosecure.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {quarantineAnimals.map((q) => (
                  <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 font-mono">{q.animal_code}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {q.breed} • {q.species} • Weight: {q.weight} kg
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQuarantineAnimal(q)}
                        className="py-1.5 px-3 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <span>🌡️</span> Log Obs / Temp
                      </button>
                      <Link
                        href={`/livestock/${q.id}`}
                        className="py-1.5 px-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                      >
                        Inspect Dossier
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReleaseQuarantine(q.id, q.animal_code)}
                      >
                        Release from Isolation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* National Vaccination Schedule */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💉</span> National Livestock Immunization Calendar (DAHD / ICAR)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Vaccine Name</th>
                    <th className="pb-3">Target Disease</th>
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Standard Protocol</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {vaccineSchedule.map((v) => (
                    <tr key={v.id}>
                      <td className="py-3 font-bold text-gray-900">{v.name}</td>
                      <td className="py-3">{v.target}</td>
                      <td className="py-3">{v.freq}</td>
                      <td className="py-3">{v.protocol}</td>
                      <td className="py-3">
                        <Badge variant={v.status === 'Completed' ? 'success' : v.status.includes('Due') ? 'warning' : 'info'}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {v.status !== 'Completed' ? (
                          <button
                            onClick={() => handleAdministerVaccine(v.id, v.name)}
                            className="py-1 px-2.5 text-xs font-bold text-[#1B5E20] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Administered
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold">✓ Logged</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Record Quarantine Temperature & Observation Modal */}
          {selectedQuarantineAnimal && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quarantine-dialog-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedQuarantineAnimal(null);
              }}
            >
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                  <div>
                    <h3 id="quarantine-dialog-title" className="text-base font-black text-amber-950">
                      Quarantine Daily Log: {selectedQuarantineAnimal.animal_code}
                    </h3>
                    <p className="text-xs text-amber-700">
                      {selectedQuarantineAnimal.breed} • {selectedQuarantineAnimal.species}
                    </p>
                  </div>
                  <button
                    aria-label="Close quarantine observation dialog"
                    onClick={() => setSelectedQuarantineAnimal(null)}
                    className="p-1.5 text-amber-700 hover:text-amber-950 rounded-xl hover:bg-amber-200/60 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveObservation} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Rectal Body Temperature (°C) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={observationTemp}
                      onChange={(e) => setObservationTemp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Normal Bovine: 38.0°C – 39.3°C. Above 39.5°C indicates pyrexia.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Feed Intake &amp; Rumination
                    </label>
                    <select
                      value={observationAppetite}
                      onChange={(e) => setObservationAppetite(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 outline-hidden cursor-pointer"
                    >
                      <option value="Normal">Normal Rumination &amp; Feed Intake</option>
                      <option value="Reduced">Reduced / Depressed Appetite</option>
                      <option value="Anorexic">Complete Anorexia (Suspicious)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Clinical Notes / Lesions Checked
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mouth vesicles checked, hoof lesions, nasal discharge..."
                      value={observationNotes}
                      onChange={(e) => setObservationNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                    <Button variant="outline" size="sm" type="button" onClick={() => setSelectedQuarantineAnimal(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Save Observation
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

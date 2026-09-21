import { createClient } from '../supabase/client';
import { Treatment, Withdrawal, TargetProduct } from '../../types/database';
import { WithdrawalService } from '../services/withdrawal.service';
import { AnimalRepository } from './animal.repository';
import { MedicineRepository } from './medicine.repository';

const SEED_TREATMENTS: Treatment[] = [
  {
    id: 'tx-001',
    animal_id: 'anim-001',
    medicine_id: 'med-001',
    veterinarian_id: 'vet-001',
    dose: 20,
    dose_unit: 'ml',
    route: 'Injection (IM)',
    frequency: 'Once daily',
    duration: 3,
    start_date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    indication: 'Acute Clinical Mastitis in Left Hind Quarter',
    product_affected: 'milk',
    notes: 'Severe swelling noted, administer with NSAID support',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tx-002',
    animal_id: 'anim-004',
    medicine_id: 'med-003',
    veterinarian_id: 'vet-001',
    dose: 5,
    dose_unit: 'ml',
    route: 'Injection (SC)',
    frequency: 'Single dose',
    duration: 1,
    start_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    indication: 'Pneumonic Pasteurellosis / Shipping Fever',
    product_affected: 'meat',
    notes: 'Body temp 104.2 F, response observed within 24h',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

const SEED_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'wd-001',
    treatment_id: 'tx-001',
    animal_id: 'anim-001',
    product: 'milk',
    start_date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'wd-002',
    treatment_id: 'tx-002',
    animal_id: 'anim-004',
    product: 'meat',
    start_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
    status: 'active',
  },
];

export interface CreateTreatmentInput {
  animalId: string;
  medicineId: string;
  veterinarianId?: string;
  dose: number;
  doseUnit: string;
  route: string;
  frequency: string;
  durationDays: number;
  productAffected: TargetProduct;
  indication?: string;
  notes?: string;
  isOffLabel?: boolean;
}

export class TreatmentRepository {
  private static localTreatments: Treatment[] = [...SEED_TREATMENTS];
  private static localWithdrawals: Withdrawal[] = [...SEED_WITHDRAWALS];

  static async getTreatments(animalId?: string): Promise<Treatment[]> {
    const supabase = createClient();
    try {
      let query = supabase
        .from('treatments')
        .select('*, medicine:medicines(*), animal:animals(*)')
        .order('created_at', { ascending: false });

      if (animalId) {
        query = query.eq('animal_id', animalId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Treatment[];
      }
    } catch {}

    return animalId
      ? this.localTreatments.filter((t) => t.animal_id === animalId)
      : this.localTreatments;
  }

  static async getActiveWithdrawals(): Promise<Withdrawal[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, animal:animals(*), treatment:treatments(*)')
        .eq('status', 'active')
        .order('end_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Withdrawal[];
      }
    } catch {}

    // Attach animal objects to local withdrawals
    const active = this.localWithdrawals.filter((w) => w.status === 'active');
    for (const w of active) {
      if (!w.animal) {
        const animal = await AnimalRepository.getAnimalById(w.animal_id);
        if (animal) w.animal = animal;
      }
    }
    return active;
  }

  static async createTreatment(input: CreateTreatmentInput): Promise<{ treatment: Treatment; withdrawal: Withdrawal }> {
    const supabase = createClient();
    const animal = await AnimalRepository.getAnimalById(input.animalId);
    const medicine = await MedicineRepository.getMedicineById(input.medicineId);

    const startDate = new Date();
    const calculation = WithdrawalService.calculateWithdrawal({
      startDate,
      durationDays: input.durationDays,
      activeIngredient: medicine?.active_ingredient || 'Amoxicillin',
      species: animal?.species || 'cow',
      product: input.productAffected || 'milk',
      isOffLabel: input.isOffLabel,
    });

    const treatmentId = `tx-${Date.now()}`;
    const withdrawalId = `wd-${Date.now()}`;

    const newTreatment: Treatment = {
      id: treatmentId,
      animal_id: input.animalId,
      medicine_id: input.medicineId,
      veterinarian_id: input.veterinarianId || 'vet-current',
      dose: input.dose,
      dose_unit: input.doseUnit,
      route: input.route,
      frequency: input.frequency,
      duration: input.durationDays,
      start_date: startDate.toISOString(),
      end_date: calculation.clearanceDate.toISOString(),
      indication: input.indication,
      product_affected: input.productAffected,
      notes: input.notes,
      created_at: startDate.toISOString(),
      medicine: medicine || undefined,
      animal: animal || undefined,
    };

    const newWithdrawal: Withdrawal = {
      id: withdrawalId,
      treatment_id: treatmentId,
      animal_id: input.animalId,
      product: input.productAffected,
      start_date: startDate.toISOString(),
      end_date: calculation.clearanceDate.toISOString(),
      status: 'active',
      animal: animal || undefined,
      treatment: newTreatment,
    };

    try {
      await supabase.from('treatments').insert(newTreatment);
      await supabase.from('withdrawals').insert(newWithdrawal);
      await supabase.from('animals').update({ health_status: 'under_treatment' }).eq('id', input.animalId);
    } catch {}

    this.localTreatments.unshift(newTreatment);
    this.localWithdrawals.unshift(newWithdrawal);
    await AnimalRepository.updateAnimalStatus(input.animalId, 'under_treatment');

    return { treatment: newTreatment, withdrawal: newWithdrawal };
  }
}

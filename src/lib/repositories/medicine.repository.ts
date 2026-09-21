import { createClient } from '../supabase/client';
import { Medicine } from '../../types/database';

export const SEED_MEDICINES: Medicine[] = [
  {
    id: 'med-001',
    name: 'Amoxil-Vet 15% LA',
    active_ingredient: 'Amoxicillin Trihydrate',
    antimicrobial_class: 'Beta-lactams (Penicillins & Cephalosporins)',
    strength: '150 mg/ml',
    status: 'active',
    who_classification: 'CIA',
    default_withdrawal_days_milk: 3,
    default_withdrawal_days_meat: 14,
  },
  {
    id: 'med-002',
    name: 'Baytril 10% Injectable',
    active_ingredient: 'Enrofloxacin',
    antimicrobial_class: 'Quinolones / Fluoroquinolones',
    strength: '100 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 4,
    default_withdrawal_days_meat: 10,
  },
  {
    id: 'med-003',
    name: 'Excenel RTU',
    active_ingredient: 'Ceftiofur Hydrochloride',
    antimicrobial_class: 'Beta-lactams (Penicillins & Cephalosporins)',
    strength: '50 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 0, // Zero milk discard per approved label
    default_withdrawal_days_meat: 3,
  },
  {
    id: 'med-004',
    name: 'Terramycin LA 200',
    active_ingredient: 'Oxytetracycline Dihydrate',
    antimicrobial_class: 'Tetracyclines',
    strength: '200 mg/ml',
    status: 'active',
    who_classification: 'HIA',
    default_withdrawal_days_milk: 7,
    default_withdrawal_days_meat: 21,
  },
  {
    id: 'med-005',
    name: 'Micotil 300',
    active_ingredient: 'Tilmicosin Phosphate',
    antimicrobial_class: 'Macrolides',
    strength: '300 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 14,
    default_withdrawal_days_meat: 28,
  },
  {
    id: 'med-006',
    name: 'Sulpha-TMP Bolus',
    active_ingredient: 'Sulfadiazine + Trimethoprim',
    antimicrobial_class: 'Sulfonamides',
    strength: '2g + 400mg',
    status: 'active',
    who_classification: 'HIA',
    default_withdrawal_days_milk: 4,
    default_withdrawal_days_meat: 12,
  },
  {
    id: 'med-007',
    name: 'Gentamicin Sulphate 10%',
    active_ingredient: 'Gentamicin',
    antimicrobial_class: 'Aminoglycosides',
    strength: '100 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 5,
    default_withdrawal_days_meat: 30,
  },
  {
    id: 'med-008',
    name: 'Neovet Aqua 50%',
    active_ingredient: 'Neomycin Sulphate',
    antimicrobial_class: 'Aminoglycosides',
    strength: '500 mg/g',
    status: 'active',
    who_classification: 'CIA',
    default_withdrawal_days_milk: 3,
    default_withdrawal_days_meat: 10,
  },
];

export interface GetMedicinesFilter {
  whoClassification?: string;
  search?: string;
}

export class MedicineRepository {
  private static localMedicines: Medicine[] = [...SEED_MEDICINES];

  static async getMedicines(filter: GetMedicinesFilter = {}): Promise<Medicine[]> {
    const supabase = createClient();
    try {
      let query = supabase.from('medicines').select('*').order('name');
      if (filter.whoClassification && filter.whoClassification !== 'all') {
        query = query.eq('who_classification', filter.whoClassification);
      }
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,active_ingredient.ilike.%${filter.search}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Medicine[];
      }
    } catch {}

    return this.localMedicines.filter((m) => {
      if (filter.whoClassification && filter.whoClassification !== 'all' && m.who_classification !== filter.whoClassification) {
        return false;
      }
      if (filter.search) {
        const term = filter.search.toLowerCase();
        const nameMatch = m.name.toLowerCase().includes(term);
        const activeMatch = m.active_ingredient.toLowerCase().includes(term);
        if (!nameMatch && !activeMatch) return false;
      }
      return true;
    });
  }

  static async getMedicineById(id: string): Promise<Medicine | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from('medicines').select('*').eq('id', id).single();
      if (!error && data) return data as Medicine;
    } catch {}

    return this.localMedicines.find((m) => m.id === id) || null;
  }
}

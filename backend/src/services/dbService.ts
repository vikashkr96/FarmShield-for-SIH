import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';

// In-Memory Seed / Demo Database Store for Instant Local Verification
export interface Animal {
  id: string;
  farm_id: string;
  animal_code: string;
  species: 'cow' | 'buffalo' | 'goat' | 'sheep';
  breed: string;
  dob: string;
  sex: 'male' | 'female';
  weight: number;
  purpose: 'milk' | 'draught' | 'breeding' | 'aquaculture' | 'other';
  health_status: 'healthy' | 'sick' | 'under_treatment' | 'quarantine';
  notes?: string;
  qr_token: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  active_ingredient: string;
  antimicrobial_class: string;
  strength: string;
  status: 'active' | 'discontinued';
}

export interface RegulatoryRule {
  id: string;
  medicine_id: string;
  species: string;
  product: string;
  mrl: string;
  withdrawal_days: number;
  jurisdiction: string;
  approval_status: string;
}

export interface Treatment {
  id: string;
  animal_id: string;
  medicine_id: string;
  veterinarian_id?: string;
  dose: number;
  dose_unit: string;
  route: string;
  frequency: string;
  duration: number;
  start_date: string;
  end_date: string;
  indication: string;
  product_affected: string;
  notes?: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  treatment_id: string;
  animal_id: string;
  product: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  withdrawal_days: number;
}

export interface Alert {
  id: string;
  farm_id: string;
  animal_id?: string;
  type: 'critical' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  message: string;
  message_hi?: string;
  status: 'active' | 'resolved';
  created_at: string;
}

// Initial Demo Seed Data matching schema.sql
const demoMedicines: Medicine[] = [
  { id: 'm1', name: 'Amoxicillin Inj', active_ingredient: 'Amoxicillin', antimicrobial_class: 'Penicillins', strength: '150 mg/ml', status: 'active' },
  { id: 'm2', name: 'Oxytetracycline LA', active_ingredient: 'Oxytetracycline', antimicrobial_class: 'Tetracyclines', strength: '200 mg/ml', status: 'active' },
  { id: 'm3', name: 'Tylosin 200', active_ingredient: 'Tylosin', antimicrobial_class: 'Macrolides', strength: '200 mg/ml', status: 'active' },
  { id: 'm4', name: 'Enrofloxacin 10%', active_ingredient: 'Enrofloxacin', antimicrobial_class: 'Fluoroquinolones', strength: '100 mg/ml', status: 'active' },
];

const demoRules: RegulatoryRule[] = [
  { id: 'r1', medicine_id: 'm1', species: 'cow', product: 'milk', mrl: '4 ug/kg', withdrawal_days: 5, jurisdiction: 'India (FSSAI)', approval_status: 'approved' },
  { id: 'r2', medicine_id: 'm1', species: 'buffalo', product: 'milk', mrl: '4 ug/kg', withdrawal_days: 5, jurisdiction: 'India (FSSAI)', approval_status: 'approved' },
  { id: 'r3', medicine_id: 'm2', species: 'cow', product: 'milk', mrl: '100 ug/kg', withdrawal_days: 7, jurisdiction: 'India (FSSAI)', approval_status: 'approved' },
  { id: 'r4', medicine_id: 'm2', species: 'buffalo', product: 'milk', mrl: '100 ug/kg', withdrawal_days: 7, jurisdiction: 'India (FSSAI)', approval_status: 'approved' },
  { id: 'r5', medicine_id: 'm3', species: 'cow', product: 'milk', mrl: '50 ug/kg', withdrawal_days: 4, jurisdiction: 'India (FSSAI)', approval_status: 'approved' },
  { id: 'r6', medicine_id: 'm4', species: 'fishery', product: 'all', mrl: '10 ug/kg', withdrawal_days: 12, jurisdiction: 'India (FSSAI / MPEDA)', approval_status: 'approved' },
];

const demoAnimals: Animal[] = [
  {
    id: 'a101',
    farm_id: 'farm1',
    animal_code: 'COW-101',
    species: 'cow',
    breed: 'Gir',
    dob: '2022-03-15',
    sex: 'female',
    weight: 380,
    purpose: 'milk',
    health_status: 'healthy',
    notes: 'High yielding Gir breed cow',
    qr_token: 'QR-COW-101',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a102',
    farm_id: 'farm1',
    animal_code: 'COW-102',
    species: 'cow',
    breed: 'HF Cross',
    dob: '2021-08-10',
    sex: 'female',
    weight: 430,
    purpose: 'milk',
    health_status: 'under_treatment',
    notes: 'Currently being treated for Mastitis',
    qr_token: 'QR-COW-102',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a103',
    farm_id: 'farm1',
    animal_code: 'BUF-201',
    species: 'buffalo',
    breed: 'Murrah',
    dob: '2020-05-20',
    sex: 'female',
    weight: 510,
    purpose: 'milk',
    health_status: 'healthy',
    notes: 'Murrah buffalo - healthy milk producer',
    qr_token: 'QR-BUF-201',
    created_at: new Date().toISOString(),
  },
];

// Calculate seed withdrawal for COW-102 ending 4 days from now
const seedEndDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();

const demoTreatments: Treatment[] = [
  {
    id: 't1',
    animal_id: 'a102',
    medicine_id: 'm1',
    veterinarian_id: 'vet1',
    dose: 10,
    dose_unit: 'mg/kg',
    route: 'Injection',
    frequency: 'Once Daily',
    duration: 3,
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    indication: 'Mastitis',
    product_affected: 'milk',
    notes: 'Mild mastitis infection treated with Amoxicillin',
    created_at: new Date().toISOString(),
  },
];

const demoWithdrawals: Withdrawal[] = [
  {
    id: 'w1',
    treatment_id: 't1',
    animal_id: 'a102',
    product: 'milk',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: seedEndDate,
    status: 'active',
    withdrawal_days: 5,
  },
];

const demoAlerts: Alert[] = [
  {
    id: 'alt1',
    farm_id: 'farm1',
    animal_id: 'a102',
    type: 'critical',
    severity: 'high',
    message: 'COW-102 is under active withdrawal. Do not sell milk until safe date.',
    message_hi: 'गाय (COW-102) का दवा का असर चालू है। दूध अभी न बेचें।',
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

// Data Store Accessors
export const db = {
  animals: demoAnimals,
  medicines: demoMedicines,
  rules: demoRules,
  treatments: demoTreatments,
  withdrawals: demoWithdrawals,
  alerts: demoAlerts,
};

export const getAnimals = async (): Promise<Animal[]> => {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('animals').select('*');
      if (!error && data) return data as Animal[];
    }
  }
  return db.animals;
};

export const addAnimal = async (animal: Omit<Animal, 'id' | 'created_at'>): Promise<Animal> => {
  const newAnimal: Animal = {
    ...animal,
    id: `a_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('animals').insert([newAnimal]).select().single();
      if (!error && data) return data as Animal;
    }
  }

  db.animals.unshift(newAnimal);
  return newAnimal;
};

export const updateAnimal = async (id: string, updates: Partial<Animal>): Promise<Animal | null> => {
  const index = db.animals.findIndex((a) => a.id === id);
  if (index === -1) return null;

  db.animals[index] = { ...db.animals[index], ...updates };

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client.from('animals').update(updates).eq('id', id).select().single();
      if (data) return data as Animal;
    }
  }

  return db.animals[index];
};

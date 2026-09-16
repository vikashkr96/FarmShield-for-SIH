import { createClient } from '../supabase/client';
import { Animal, Species, HealthStatus } from '../../types/database';
import { getBreedAsset } from '../breed_assets';

// Realistic Seed Dataset for evaluation or when Supabase table is initialised
const SEED_ANIMALS: Animal[] = [
  {
    id: 'anim-001',
    farm_id: 'farm-pb-01',
    animal_code: 'IN-PB-2024-9102',
    species: 'cow',
    breed: 'Sahiwal',
    dob: '2021-03-15',
    sex: 'female',
    weight: 420,
    purpose: 'milk',
    health_status: 'under_treatment',
    qr_token: 'SHW-9102-MRL-SECURE',
    image_url: getBreedAsset('cow', 'Sahiwal').imageUrl,
    created_at: '2024-01-10T10:00:00Z',
    withdrawals: [
      {
        id: 'wd-001',
        treatment_id: 'tx-001',
        animal_id: 'anim-001',
        product: 'milk',
        start_date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        end_date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        status: 'active',
      },
    ],
  },
  {
    id: 'anim-002',
    farm_id: 'farm-pb-01',
    animal_code: 'IN-PB-2024-8841',
    species: 'buffalo',
    breed: 'Murrah',
    dob: '2020-07-22',
    sex: 'female',
    weight: 580,
    purpose: 'milk',
    health_status: 'healthy',
    qr_token: 'MRH-8841-MRL-SECURE',
    image_url: getBreedAsset('buffalo', 'Murrah').imageUrl,
    created_at: '2024-01-12T11:30:00Z',
  },
  {
    id: 'anim-003',
    farm_id: 'farm-pb-01',
    animal_code: 'IN-PB-2024-4412',
    species: 'cow',
    breed: 'Gir',
    dob: '2022-01-10',
    sex: 'female',
    weight: 395,
    purpose: 'milk',
    health_status: 'healthy',
    qr_token: 'GIR-4412-MRL-SECURE',
    image_url: getBreedAsset('cow', 'Gir').imageUrl,
    created_at: '2024-02-01T08:15:00Z',
  },
  {
    id: 'anim-004',
    farm_id: 'farm-pb-01',
    animal_code: 'IN-PB-2024-7729',
    species: 'goat',
    breed: 'Jamnapari',
    dob: '2023-04-18',
    sex: 'female',
    weight: 48,
    purpose: 'milk',
    health_status: 'under_treatment',
    qr_token: 'JMN-7729-MRL-SECURE',
    image_url: getBreedAsset('goat', 'Jamnapari').imageUrl,
    created_at: '2024-03-05T14:20:00Z',
    withdrawals: [
      {
        id: 'wd-002',
        treatment_id: 'tx-002',
        animal_id: 'anim-004',
        product: 'meat',
        start_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        end_date: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
        status: 'active',
      },
    ],
  },
  {
    id: 'anim-005',
    farm_id: 'farm-pb-01',
    animal_code: 'IN-PB-2024-1055',
    species: 'fishery',
    breed: 'Rohu (Labeo rohita)',
    dob: '2023-08-01',
    sex: 'collective',
    weight: 850,
    purpose: 'aquaculture',
    health_status: 'healthy',
    qr_token: 'ROH-1055-MRL-SECURE',
    image_url: getBreedAsset('fishery', 'Rohu').imageUrl,
    fishery_details: {
      pond_id: 'POND-NORTH-02',
      water_type: 'freshwater',
      biomass_kg: 850,
      stocking_density: 12,
    },
    created_at: '2024-04-01T09:00:00Z',
  },
  {
    id: 'anim-006',
    farm_id: 'farm-pb-01',
    animal_code: 'IN-PB-2024-3319',
    species: 'sheep',
    breed: 'Marwari',
    dob: '2022-11-05',
    sex: 'female',
    weight: 42,
    purpose: 'meat',
    health_status: 'quarantine',
    qr_token: 'MRW-3319-MRL-SECURE',
    image_url: getBreedAsset('sheep', 'Marwari').imageUrl,
    created_at: '2024-04-15T12:00:00Z',
  },
];

export interface GetAnimalsFilter {
  species?: Species | 'all';
  status?: HealthStatus | 'all';
  search?: string;
  farmId?: string;
}

export class AnimalRepository {
  private static localAnimals: Animal[] = [...SEED_ANIMALS];

  static async getAnimals(filter: GetAnimalsFilter = {}): Promise<Animal[]> {
    const supabase = createClient();
    try {
      let query = supabase
        .from('animals')
        .select('*, withdrawals(*), treatments(*)');

      if (filter.species && filter.species !== 'all') {
        query = query.eq('species', filter.species);
      }
      if (filter.status && filter.status !== 'all') {
        query = query.eq('health_status', filter.status);
      }
      if (filter.farmId) {
        query = query.eq('farm_id', filter.farmId);
      }
      if (filter.search) {
        query = query.or(`animal_code.ilike.%${filter.search}%,breed.ilike.%${filter.search}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Animal[];
      }
    } catch (err) {
      console.warn('Supabase fetch returned error or was unconfigured, using in-memory store:', err);
    }

    // Filter local memory store
    return this.localAnimals.filter((a) => {
      if (filter.species && filter.species !== 'all' && a.species !== filter.species) {
        return false;
      }
      if (filter.status && filter.status !== 'all' && a.health_status !== filter.status) {
        return false;
      }
      if (filter.search) {
        const term = filter.search.toLowerCase();
        const codeMatch = a.animal_code.toLowerCase().includes(term);
        const breedMatch = a.breed?.toLowerCase().includes(term);
        if (!codeMatch && !breedMatch) return false;
      }
      return true;
    });
  }

  static async getAnimalById(id: string): Promise<Animal | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*, withdrawals(*), treatments(*)')
        .or(`id.eq.${id},animal_code.eq.${id},qr_token.eq.${id}`)
        .single();

      if (!error && data) {
        return data as Animal;
      }
    } catch {
      // Fallback
    }

    return (
      this.localAnimals.find(
        (a) => a.id === id || a.animal_code === id || a.qr_token === id
      ) || null
    );
  }

  static async createAnimal(animal: Partial<Animal>): Promise<Animal> {
    const supabase = createClient();
    const qrToken = animal.qr_token || `FS-${Date.now().toString(36).toUpperCase()}-MRL`;
    const newAnimal: Animal = {
      id: animal.id || `anim-${Date.now()}`,
      farm_id: animal.farm_id || 'farm-pb-01',
      animal_code: animal.animal_code || `IN-PB-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      species: animal.species || 'cow',
      breed: animal.breed || 'Indigenous Bovine',
      dob: animal.dob || new Date().toISOString().split('T')[0],
      sex: animal.sex || 'female',
      weight: Number(animal.weight) || 350,
      purpose: animal.purpose || 'milk',
      health_status: animal.health_status || 'healthy',
      qr_token: qrToken,
      image_url: animal.image_url || getBreedAsset(animal.species || 'cow', animal.breed || '').imageUrl,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('animals')
        .insert(newAnimal)
        .select()
        .single();

      if (!error && data) {
        this.localAnimals.unshift(data as Animal);
        return data as Animal;
      }
    } catch {
      // Offline fallback
    }

    this.localAnimals.unshift(newAnimal);
    return newAnimal;
  }

  static async updateAnimalStatus(id: string, status: HealthStatus): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from('animals').update({ health_status: status }).eq('id', id);
    } catch {}

    const index = this.localAnimals.findIndex((a) => a.id === id || a.animal_code === id);
    if (index !== -1) {
      this.localAnimals[index].health_status = status;
      return true;
    }
    return false;
  }

  static async deleteAnimal(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from('animals').delete().eq('id', id);
    } catch {}

    this.localAnimals = this.localAnimals.filter((a) => a.id !== id && a.animal_code !== id);
    return true;
  }
}

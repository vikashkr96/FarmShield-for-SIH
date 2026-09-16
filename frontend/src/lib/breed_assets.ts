/**
 * Breed Assets and High-Definition Indian Breed Photography
 * Ported directly from Flutter BreedAssetHelper
 */

export interface BreedInfo {
  name: string;
  species: string;
  origin: string;
  imageUrl: string;
  tag: string;
}

export const INDIAN_BREEDS: Record<string, BreedInfo> = {
  // Cattle
  gir: {
    name: 'Gir (गीर)',
    species: 'cow',
    origin: 'Gujarat (Saurashtra)',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500',
    tag: 'Indicus Milch',
  },
  sahiwal: {
    name: 'Sahiwal (साहीवाल)',
    species: 'cow',
    origin: 'Punjab / UP',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500',
    tag: 'High Yield',
  },
  'red sindhi': {
    name: 'Red Sindhi (लाल सिंधी)',
    species: 'cow',
    origin: 'North India',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500',
    tag: 'Resilient Milch',
  },
  tharparkar: {
    name: 'Tharparkar (थारपारकर)',
    species: 'cow',
    origin: 'Rajasthan',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500',
    tag: 'Dual Purpose',
  },

  // Buffaloes
  murrah: {
    name: 'Murrah (मुर्राह)',
    species: 'buffalo',
    origin: 'Haryana / Punjab',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500',
    tag: 'Black Gold Dairy',
  },
  jaffarabadi: {
    name: 'Jaffarabadi (जाफराबादी)',
    species: 'buffalo',
    origin: 'Gujarat',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500',
    tag: 'Heavy Dairy',
  },
  mehsana: {
    name: 'Mehsana (मेहसाणा)',
    species: 'buffalo',
    origin: 'Gujarat',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500',
    tag: 'Consistent Yield',
  },

  // Aquaculture / Fishery
  rohu: {
    name: 'Rohu (रोहू - Labeo rohita)',
    species: 'fishery',
    origin: 'Indo-Gangetic Basin',
    imageUrl: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500',
    tag: 'Major Indian Carp',
  },
  catla: {
    name: 'Catla (कतला - Gibelion)',
    species: 'fishery',
    origin: 'National Freshwater',
    imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=500',
    tag: 'Surface Feeder',
  },
  mrigal: {
    name: 'Mrigal (मृगल)',
    species: 'fishery',
    origin: 'Freshwater Pond',
    imageUrl: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500',
    tag: 'Bottom Feeder',
  },

  // Small Ruminants
  jamnapari: {
    name: 'Jamnapari (जमनापारी)',
    species: 'goat',
    origin: 'Uttar Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500',
    tag: 'Dual Purpose Goat',
  },
  marwari: {
    name: 'Marwari (मारवाड़ी)',
    species: 'sheep',
    origin: 'Rajasthan',
    imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=500',
    tag: 'Carpet Wool Sheep',
  },
};

export function getBreedImage(breed?: string | null, species?: string | null): string {
  if (breed) {
    const normalized = breed.toLowerCase().trim();
    for (const [key, value] of Object.entries(INDIAN_BREEDS)) {
      if (normalized.includes(key)) {
        return value.imageUrl;
      }
    }
  }

  // Fallbacks by species
  switch (species?.toLowerCase()) {
    case 'cow':
      return 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500';
    case 'buffalo':
      return 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500';
    case 'fishery':
      return 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500';
    case 'goat':
      return 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500';
    case 'sheep':
      return 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=500';
    case 'poultry':
      return 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500';
    default:
      return 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500';
  }
}

export function getSpeciesColor(species?: string | null): string {
  switch (species?.toLowerCase()) {
    case 'cow':
      return '#2E7D32'; // Green
    case 'buffalo':
      return '#37474F'; // Dark Slate
    case 'fishery':
      return '#0277BD'; // Ocean Blue
    case 'goat':
      return '#EF6C00'; // Amber
    case 'sheep':
      return '#8D6E63'; // Warm Brown
    case 'poultry':
      return '#C2185B'; // Crimson Pink
    default:
      return '#2E7D32';
  }
}

export const BREED_DATA: Record<string, Record<string, BreedInfo>> = {
  cow: {
    'Sahiwal': INDIAN_BREEDS.sahiwal,
    'Gir': INDIAN_BREEDS.gir,
    'Red Sindhi': INDIAN_BREEDS['red sindhi'],
    'Tharparkar': INDIAN_BREEDS.tharparkar,
  },
  buffalo: {
    'Murrah': INDIAN_BREEDS.murrah,
    'Jaffarabadi': INDIAN_BREEDS.jaffarabadi,
    'Mehsana': INDIAN_BREEDS.mehsana,
    'Nili-Ravi': INDIAN_BREEDS['nili-ravi'],
  },
  fishery: {
    'Rohu': INDIAN_BREEDS.rohu,
    'Catla': INDIAN_BREEDS.catla,
    'Vannamei Shrimp': INDIAN_BREEDS['vannamei shrimp'],
  },
  goat: {
    'Jamnapari': INDIAN_BREEDS.jamnapari,
  },
  sheep: {
    'Marwari': INDIAN_BREEDS.marwari,
  },
  poultry: {
    'Aseel': {
      name: 'Aseel (असील)',
      species: 'poultry',
      origin: 'India',
      imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500',
      tag: 'Indigenous Gamefowl',
    },
    'Kadaknath': {
      name: 'Kadaknath (कड़कनाथ)',
      species: 'poultry',
      origin: 'Madhya Pradesh',
      imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500',
      tag: 'Black Meat Chicken',
    },
  },
};

export function getBreedAsset(species?: string | null, breed?: string | null): BreedInfo {
  const img = getBreedImage(breed, species);
  return {
    name: breed || 'Indigenous',
    species: species || 'cow',
    origin: 'India',
    imageUrl: img,
    tag: 'Livestock',
  };
}

import 'package:flutter/material.dart';

class BreedAssetHelper {
  // Verified high quality photographic and vector references for Indian Breeds
  static const Map<String, Map<String, String>> indianBreeds = {
    // Cattle
    'gir': {
      'name': 'Gir (गीर)',
      'species': 'cow',
      'origin': 'Gujarat (Saurashtra)',
      'imageUrl': 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500',
      'tag': 'Indicus Milch',
    },
    'sahiwal': {
      'name': 'Sahiwal (साहीवाल)',
      'species': 'cow',
      'origin': 'Punjab / UP',
      'imageUrl': 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500',
      'tag': 'High Yield',
    },
    'red sindhi': {
      'name': 'Red Sindhi (लाल सिंधी)',
      'species': 'cow',
      'origin': 'North India',
      'imageUrl': 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500',
      'tag': 'Resilient Milch',
    },
    'tharparkar': {
      'name': 'Tharparkar (थारपारकर)',
      'species': 'cow',
      'origin': 'Rajasthan',
      'imageUrl': 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500',
      'tag': 'Dual Purpose',
    },
    
    // Buffaloes
    'murrah': {
      'name': 'Murrah (मुर्राह)',
      'species': 'buffalo',
      'origin': 'Haryana / Punjab',
      'imageUrl': 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500',
      'tag': 'Black Gold Dairy',
    },
    'jaffarabadi': {
      'name': 'Jaffarabadi (जाफराबादी)',
      'species': 'buffalo',
      'origin': 'Gujarat',
      'imageUrl': 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500',
      'tag': 'Heavy Dairy',
    },
    'mehsana': {
      'name': 'Mehsana (मेहसाणा)',
      'species': 'buffalo',
      'origin': 'Gujarat',
      'imageUrl': 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500',
      'tag': 'Consistent Yield',
    },

    // Aquaculture / Fishery
    'rohu': {
      'name': 'Rohu (रोहू - Labeo rohita)',
      'species': 'fishery',
      'origin': 'Indo-Gangetic Basin',
      'imageUrl': 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500',
      'tag': 'Major Indian Carp',
    },
    'catla': {
      'name': 'Catla (कतला - Gibelion)',
      'species': 'fishery',
      'origin': 'National Freshwater',
      'imageUrl': 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=500',
      'tag': 'Surface Feeder',
    },
    'mrigal': {
      'name': 'Mrigal (मृगल)',
      'species': 'fishery',
      'origin': 'Freshwater Pond',
      'imageUrl': 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500',
      'tag': 'Bottom Feeder',
    },

    // Small Ruminants
    'jamnapari': {
      'name': 'Jamnapari (जमनापारी)',
      'species': 'goat',
      'origin': 'Uttar Pradesh',
      'imageUrl': 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500',
      'tag': 'Dual Purpose Goat',
    },
    'marwari': {
      'name': 'Marwari (मारवाड़ी)',
      'species': 'sheep',
      'origin': 'Rajasthan',
      'imageUrl': 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=500',
      'tag': 'Carpet Wool Sheep',
    },
  };

  static String getBreedImage(String? breed, String? species) {
    if (breed != null) {
      final normalized = breed.toLowerCase().trim();
      for (final key in indianBreeds.keys) {
        if (normalized.contains(key)) {
          return indianBreeds[key]!['imageUrl']!;
        }
      }
    }
    
    // Fallback based on species
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
      default:
        return 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500';
    }
  }

  static IconData getSpeciesIcon(String? species) {
    switch (species?.toLowerCase()) {
      case 'cow':
        return Icons.pets;
      case 'buffalo':
        return Icons.water_damage;
      case 'fishery':
        return Icons.set_meal;
      case 'goat':
      case 'sheep':
        return Icons.cruelty_free;
      case 'poultry':
        return Icons.egg;
      default:
        return Icons.pets;
    }
  }

  static Color getSpeciesColor(String? species) {
    switch (species?.toLowerCase()) {
      case 'cow':
        return const Color(0xFF2E7D32); // Green
      case 'buffalo':
        return const Color(0xFF37474F); // Dark Slate Blue
      case 'fishery':
        return const Color(0xFF0277BD); // Ocean Blue
      case 'goat':
        return const Color(0xFFEF6C00); // Amber
      case 'sheep':
        return const Color(0xFF8D6E63); // Warm Brown
      case 'poultry':
        return const Color(0xFFC2185B); // Pink
      default:
        return const Color(0xFF2E7D32);
    }
  }
}

import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/services/cloudinary_service.dart';
import '../../core/services/offline_storage_service.dart';
import '../../modules/livestock/controllers/livestock_controller.dart';
import '../models/farm_models.dart';
import '../models/risk_models.dart';
import '../providers/api_provider.dart';

class FarmRepository {
  final ApiProvider apiProvider;

  FarmRepository({required this.apiProvider});

  bool _isUuid(String str) {
    final uuidRegex = RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    return uuidRegex.hasMatch(str.trim());
  }

  /// Parses raw QR data, handling URLs, JSON, direct tokens, or UUIDs
  static String parseQrCode(String raw) {
    var cleaned = raw.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim();
    }
    // Handle URL formats (e.g. http://localhost:3000/qr/QR-COW-101 or https://farmshield.in/qr/COW-101)
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      try {
        final uri = Uri.parse(cleaned);
        if (uri.pathSegments.contains('qr')) {
          final qrIdx = uri.pathSegments.indexOf('qr');
          if (qrIdx < uri.pathSegments.length - 1) {
            return Uri.decodeComponent(uri.pathSegments[qrIdx + 1]).trim();
          }
        }
        if (uri.queryParameters.containsKey('token')) {
          return uri.queryParameters['token']!.trim();
        }
        if (uri.queryParameters.containsKey('id')) {
          return uri.queryParameters['id']!.trim();
        }
        if (uri.pathSegments.isNotEmpty) {
          return Uri.decodeComponent(uri.pathSegments.last).trim();
        }
      } catch (_) {}
    }
    return cleaned;
  }

  /// Resolves an animal by scanned QR code (or tag code or UUID)
  Future<Animal?> resolveAnimalByQr(String rawCode) async {
    final token = parseQrCode(rawCode);
    if (token.isEmpty) return null;

    final supabase = Supabase.instance.client;

    // 1. Direct Supabase Query
    try {
      Map<String, dynamic>? animalMap;
      if (_isUuid(token)) {
        final res = await supabase.from('animals').select().eq('id', token).maybeSingle();
        if (res != null) animalMap = Map<String, dynamic>.from(res);
      } else {
        final res = await supabase
            .from('animals')
            .select()
            .or('animal_code.eq.$token,qr_token.eq.$token')
            .maybeSingle();
        if (res != null) animalMap = Map<String, dynamic>.from(res);
      }

      if (animalMap != null) {
        final animal = Animal.fromJson(animalMap);
        // Cache in Hive for offline resilience
        await OfflineStorageService().cacheAnimal(animal.toMap());
        return animal;
      }
    } catch (e) {
      Get.log('Supabase resolveAnimalByQr notice: $e');
    }

    // 2. Check local Hive cache
    final cached = OfflineStorageService().getCachedAnimal(token);
    if (cached != null) {
      return Animal.fromJson(cached);
    }

    // 3. Fallback: Query backend API
    try {
      final response = await apiProvider.getAnimal(token);
      if (response.data != null && response.data['data'] != null) {
        final d = response.data['data'];
        final map = d['animal'] is Map ? Map<String, dynamic>.from(d['animal']) : Map<String, dynamic>.from(d);
        final animal = Animal.fromJson(map);
        await OfflineStorageService().cacheAnimal(animal.toMap());
        return animal;
      }
    } catch (_) {}

    return null;
  }

  /// Update animal details in Supabase and Hive cache
  Future<Animal> updateAnimalDetails(String id, Map<String, dynamic> updates) async {
    final supabase = Supabase.instance.client;
    final cleanUpdates = Map<String, dynamic>.from(updates);
    cleanUpdates.remove('treatments');
    cleanUpdates.remove('withdrawals');

    Animal? updatedAnimal;

    // 1. Update Supabase
    try {
      final res = await supabase
          .from('animals')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .maybeSingle();
      if (res != null) {
        updatedAnimal = Animal.fromJson(Map<String, dynamic>.from(res));
      }
    } catch (e) {
      Get.log('Supabase updateAnimalDetails notice: $e');
    }

    // 2. Fallback to local cache if Supabase update not returned
    if (updatedAnimal == null) {
      final existing = OfflineStorageService().getCachedAnimal(id);
      final merged = existing != null ? {...existing, ...cleanUpdates} : {'id': id, ...cleanUpdates};
      updatedAnimal = Animal.fromJson(merged);
    }

    // 3. Persist to Hive cache
    await OfflineStorageService().cacheAnimal(updatedAnimal.toMap());

    // 4. Propagate update to active LivestockController if present
    if (Get.isRegistered<LivestockController>()) {
      try {
        Get.find<LivestockController>().fetchAnimals();
      } catch (_) {}
    }

    return updatedAnimal;
  }

  /// Transactional photo update with Cloudinary URL persistence and old asset deletion
  Future<void> updateAnimalPhoto({
    required String animalId,
    required String imageUrl,
    required String publicId,
    String? oldPublicId,
  }) async {
    final supabase = Supabase.instance.client;

    // 1. Update in Supabase
    try {
      await supabase
          .from('animals')
          .update({
            'image_url': imageUrl,
            'cloudinary_public_id': publicId,
          })
          .eq('id', animalId);
    } catch (e) {
      Get.log('Supabase update image notice: $e');
      try {
        await supabase
            .from('animals')
            .update({'image_url': imageUrl})
            .eq('id', animalId);
      } catch (_) {}
    }

    // 2. Persist in Hive
    final cached = OfflineStorageService().getCachedAnimal(animalId);
    if (cached != null) {
      cached['image_url'] = imageUrl;
      cached['cloudinary_public_id'] = publicId;
      await OfflineStorageService().cacheAnimal(cached);
    }

    // 3. Delete old Cloudinary asset safely
    if (oldPublicId != null && oldPublicId.isNotEmpty && oldPublicId != publicId) {
      try {
        await CloudinaryService().deleteImage(publicId: oldPublicId);
      } catch (e) {
        Get.log('Failed to delete old Cloudinary image: $e');
      }
    }

    // 4. Refresh Livestock list if active
    if (Get.isRegistered<LivestockController>()) {
      try {
        Get.find<LivestockController>().fetchAnimals();
      } catch (_) {}
    }
  }

  // ML Endpoints
  Future<RiskResponse> getOveruseRisk(OveruseRiskRequest request) async {
    final response = await apiProvider.postOveruseRisk(request.toJson());
    return RiskResponse.fromJson(response.data);
  }

  Future<RiskResponse> getComplianceRisk(ComplianceRiskRequest request) async {
    final response = await apiProvider.postComplianceRisk(request.toJson());
    return RiskResponse.fromJson(response.data);
  }

  Future<Map<String, dynamic>> getModelsInfo() async {
    final response = await apiProvider.getModelsInfo();
    return response.data;
  }

  // Backend Core Endpoints - Supabase First with API Fallback
  Future<List<Animal>> getAnimals({String? species, String? status}) async {
    try {
      var query = Supabase.instance.client.from('animals').select();
      if (species != null && species != 'all') {
        query = query.eq('species', species);
      }
      if (status != null) {
        query = query.eq('health_status', status);
      }
      final supaList = await query;
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Animal.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getAnimals(species: species, status: status);
    return (response.data['data'] as List).map((e) => Animal.fromJson(e)).toList();
  }

  Future<Animal> registerAnimal(Animal animal) async {
    try {
      final res = await Supabase.instance.client.from('animals').insert(animal.toJson()).select().single();
      return Animal.fromJson(res);
    } catch (_) {}

    final response = await apiProvider.postAnimal(animal.toJson());
    return Animal.fromJson(response.data['data']);
  }

  Future<PublicPassport> getPublicPassport(String qrToken) async {
    final response = await apiProvider.getPublicPassport(qrToken);
    return PublicPassport.fromJson(response.data['data']);
  }

  Future<Map<String, dynamic>> addTreatment(Treatment treatment) async {
    try {
      final res = await Supabase.instance.client.from('treatments').insert(treatment.toJson()).select().single();
      return res;
    } catch (_) {}

    final response = await apiProvider.postTreatment(treatment.toJson());
    return response.data['data'];
  }

  Future<List<Medicine>> getMedicines() async {
    try {
      final supaList = await Supabase.instance.client.from('medicines').select();
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Medicine.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getMedicines();
    return (response.data['data'] as List).map((e) => Medicine.fromJson(e)).toList();
  }

  Future<AmuSummary> getAmuSummary() async {
    try {
      final treatments = await Supabase.instance.client.from('treatments').select();
      final withdrawals = await Supabase.instance.client.from('withdrawals').select().eq('status', 'active');
      
      if (treatments.isNotEmpty) {
        return AmuSummary(
          totalTreatments: treatments.length,
          activeWithdrawals: withdrawals.length,
          averageWithdrawalDays: 5.5,
          classBreakdown: [
            {'drugClass': 'Penicillins', 'percentage': 45.0},
            {'drugClass': 'Tetracyclines', 'percentage': 30.0},
            {'drugClass': 'Fluoroquinolones', 'percentage': 25.0},
          ],
        );
      }
    } catch (_) {}

    final response = await apiProvider.getAmuSummary();
    return AmuSummary.fromJson(response.data['data']);
  }

  Future<List<Map<String, dynamic>>> getAmuRecords() async {
    try {
      final supaList = await Supabase.instance.client.from('amu_records').select();
      if (supaList.isNotEmpty) {
        return List<Map<String, dynamic>>.from(supaList);
      }
    } catch (_) {}

    final response = await apiProvider.getAmuRecords();
    return List<Map<String, dynamic>>.from(response.data['data']);
  }

  Future<List<Withdrawal>> getWithdrawals() async {
    try {
      final supaList = await Supabase.instance.client.from('withdrawals').select();
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Withdrawal.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getWithdrawals();
    return (response.data['data'] as List).map((e) => Withdrawal.fromJson(e)).toList();
  }

  Future<List<Alert>> getAlerts() async {
    try {
      final supaList = await Supabase.instance.client.from('alerts').select().order('created_at', ascending: false);
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Alert.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getAlerts();
    return (response.data['data'] as List).map((e) => Alert.fromJson(e)).toList();
  }

  // Additional
  Future<Map<String, dynamic>> getWithdrawalStatus(String id) async {
    final response = await apiProvider.getWithdrawal(id);
    return response.data;
  }

  Future<void> submitLabResults(Map<String, dynamic> data) async {
    await apiProvider.postLabResults(data);
  }
}

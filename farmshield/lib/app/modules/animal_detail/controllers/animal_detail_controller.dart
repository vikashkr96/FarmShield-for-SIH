import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cloudinary_service.dart';
import '../../../core/services/offline_storage_service.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/models/health_models.dart';
import '../../../data/repositories/farm_repository.dart';

class AnimalDetailController extends GetxController with StateMixin<Map<String, dynamic>> {
  final FarmRepository repository;
  AnimalDetailController({required this.repository});

  final _supabase = Supabase.instance.client;
  final CloudinaryService _cloudinary = CloudinaryService();
  
  final RxBool isUploading = false.obs;
  final RxBool isLoadingHealth = false.obs;
  final healthStatus = HealthStatus.healthy.obs;
  final healthTimeline = <HealthEvent>[].obs;
  final vaccinations = <VaccinationRecord>[].obs;
  String animalId = '';

  Map<String, dynamic>? _passedAnimalData;

  @override
  void onInit() {
    super.onInit();
    final dynamic args = Get.arguments;
    if (args is Animal) {
      animalId = args.id ?? args.animalCode ?? '';
      _passedAnimalData = {
        'id': args.id ?? 'demo_${DateTime.now().millisecondsSinceEpoch}',
        'farm_id': args.farmId ?? 'farm1',
        'animal_code': args.animalCode ?? 'ANIMAL',
        'species': args.species ?? 'cow',
        'breed': args.breed ?? 'Indigenous',
        'dob': args.dob?.toIso8601String(),
        'sex': args.sex ?? 'female',
        'weight': args.weightKg ?? 350.0,
        'purpose': args.purpose ?? 'milk',
        'health_status': args.healthStatus ?? 'Healthy',
        'qr_token': args.qrToken ?? 'QR-${args.animalCode ?? "TAG"}',
        'image_url': args.imageUrl,
        'cloudinary_public_id': args.cloudinaryPublicId,
        'treatments': [],
        'withdrawals': [],
      };
      // Pre-seed state so UI immediately renders without 404 blank screen
      change(_passedAnimalData, status: RxStatus.success());
      OfflineStorageService().cacheAnimal(_passedAnimalData!);
    } else if (args is Map) {
      animalId = args['id']?.toString() ?? args['animal_code']?.toString() ?? '';
      _passedAnimalData = Map<String, dynamic>.from(args);
      _passedAnimalData!['treatments'] ??= [];
      _passedAnimalData!['withdrawals'] ??= [];
      change(_passedAnimalData, status: RxStatus.success());
      OfflineStorageService().cacheAnimal(_passedAnimalData!);
    } else if (args is String) {
      animalId = args.trim();
    }

    if (_passedAnimalData != null) {
      healthStatus.value = HealthStatus.fromString(_passedAnimalData!['health_status']?.toString());
    }

    if (animalId.isNotEmpty) {
      fetchAnimalFullProfile(animalId);
      fetchHealthIntelligence(animalId);
    } else if (_passedAnimalData == null) {
      change(null, status: RxStatus.error("Invalid Animal ID"));
    }
  }

  bool _isUuid(String str) {
    final uuidRegex = RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    return uuidRegex.hasMatch(str.trim());
  }

  Future<void> fetchAnimalFullProfile(String id) async {
    // If we already have preview data, keep showing it while fetching updates in background
    if (_passedAnimalData == null) {
      change(null, status: RxStatus.loading());
    }
    
    try {
      Map<String, dynamic>? animalData;

      if (_isUuid(id)) {
        final res = await _supabase.from('animals').select().eq('id', id).maybeSingle();
        if (res != null) animalData = Map<String, dynamic>.from(res);
      } else {
        // Query by animal_code or qr_token if not a UUID
        final res = await _supabase
            .from('animals')
            .select()
            .or('animal_code.eq.$id,qr_token.eq.$id')
            .maybeSingle();
        if (res != null) animalData = Map<String, dynamic>.from(res);
      }

      // If found in Supabase, fetch related treatments and withdrawals
      if (animalData != null) {
        final realId = animalData['id'].toString();
        List<dynamic> treatmentsData = [];
        List<dynamic> withdrawalsData = [];

        try {
          if (_isUuid(realId)) {
            final tRes = await _supabase.from('treatments').select().eq('animal_id', realId);
            treatmentsData = List<dynamic>.from(tRes);

            final wRes = await _supabase.from('withdrawals').select().eq('animal_id', realId);
            withdrawalsData = List<dynamic>.from(wRes);
          }
        } catch (_) {}

        if (treatmentsData.isNotEmpty) {
          final List<String> medicineIds = treatmentsData
              .map((t) => t['medicine_id'] as String?)
              .where((mid) => mid != null && _isUuid(mid))
              .toSet()
              .cast<String>()
              .toList();

          if (medicineIds.isNotEmpty) {
            try {
              final medicinesData = await _supabase
                  .from('medicines')
                  .select()
                  .inFilter('id', medicineIds);

              for (var t in treatmentsData) {
                t['medicine'] = (medicinesData as List).firstWhereOrNull(
                  (m) => m['id'] == t['medicine_id'],
                );
              }
            } catch (_) {}
          }
        }

        final Map<String, dynamic> fullData = Map<String, dynamic>.from(animalData);
        fullData['treatments'] = treatmentsData;
        fullData['withdrawals'] = withdrawalsData;

        // Persist to local cache
        await OfflineStorageService().cacheAnimal(fullData);
        
        change(fullData, status: RxStatus.success());
        return;
      }

      // Fallback: Check local Hive storage
      final cached = OfflineStorageService().getCachedAnimal(id);
      if (cached != null) {
        change(cached, status: RxStatus.success());
        return;
      }

      // Fallback: Fetch from Backend Express API
      try {
        final response = await repository.apiProvider.getAnimal(id);
        if (response.data != null && response.data['data'] != null) {
          final data = response.data['data'];
          if (data is Map<String, dynamic>) {
            final profileMap = Map<String, dynamic>.from(data['animal'] is Map ? data['animal'] : data);
            profileMap['treatments'] = data['treatmentHistory'] ?? data['treatments'] ?? [];
            profileMap['withdrawals'] = data['withdrawals'] ?? [];

            await OfflineStorageService().cacheAnimal(profileMap);
            change(profileMap, status: RxStatus.success());
            return;
          }
        }
      } catch (dioErr) {
        Get.log("Backend getAnimal API returned: $dioErr");
      }

      // Fallback: If we have pre-seeded animal data passed from previous screen, retain it
      if (_passedAnimalData != null) {
        change(_passedAnimalData, status: RxStatus.success());
        return;
      }

      // If not found anywhere, report clear error
      change(null, status: RxStatus.error("Animal not found in farm registry."));
    } catch (e) {
      Get.log("Fetch Animal Profile Exception: $e");
      if (_passedAnimalData != null) {
        change(_passedAnimalData, status: RxStatus.success());
      } else {
        change(null, status: RxStatus.error("Could not load animal profile. Please verify your connection."));
      }
    }
  }

  /// Update animal details and persist state
  Future<void> updateAnimalDetails(Map<String, dynamic> updates) async {
    try {
      final currentId = state?['id']?.toString() ?? animalId;
      final updatedAnimal = await repository.updateAnimalDetails(currentId, updates);

      final current = Map<String, dynamic>.from(state ?? {});
      current.addAll(updatedAnimal.toMap());
      change(current, status: RxStatus.success());

      Get.snackbar(
        'Success',
        'Animal details updated successfully.',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.log('updateAnimalDetails error: $e');
      // Optimistic update locally
      final current = Map<String, dynamic>.from(state ?? {});
      current.addAll(updates);
      await OfflineStorageService().cacheAnimal(current);
      change(current, status: RxStatus.success());

      Get.snackbar(
        'Updated',
        'Animal details saved to local cache.',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  /// Cross-platform photo upload to Cloudinary with old asset deletion
  Future<void> uploadAnimalPhotoBytes({
    required Uint8List bytes,
    required String fileName,
  }) async {
    try {
      isUploading.value = true;

      // 1. Upload new image to Cloudinary
      final uploadResult = await _cloudinary.uploadImage(
        bytes: bytes,
        fileName: fileName,
        folder: 'animals',
      );

      final currentId = state?['id']?.toString() ?? animalId;
      final oldPublicId = state?['cloudinary_public_id']?.toString() ??
          _cloudinary.extractPublicIdFromUrl(state?['image_url']?.toString());

      // 2. Persist in Supabase and local cache, and clean up old Cloudinary asset
      await repository.updateAnimalPhoto(
        animalId: currentId,
        imageUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        oldPublicId: oldPublicId,
      );

      // 3. Immediately refresh local reactive state
      final current = Map<String, dynamic>.from(state ?? {});
      current['image_url'] = uploadResult.secureUrl;
      current['cloudinary_public_id'] = uploadResult.publicId;
      change(current, status: RxStatus.success());

      Get.snackbar(
        'Photo Updated',
        'Animal photo updated successfully.',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.log('Upload photo error: $e');
      Get.snackbar(
        'Upload Failed',
        'Could not upload new photo. Your existing image is unchanged.',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploading.value = false;
    }
  }

  bool isWithdrawalActive(List<dynamic> withdrawals) {
    if (withdrawals.isEmpty) return false;
    final now = DateTime.now();
    return withdrawals.any((w) {
      final end = DateTime.tryParse(w['end_date'] ?? '');
      return end != null && end.isAfter(now);
    });
  }

  int getRemainingHours(List<dynamic> withdrawals) {
    if (withdrawals.isEmpty) return 0;
    final now = DateTime.now();
    DateTime? latestEnd;
    for (var w in withdrawals) {
      final end = DateTime.tryParse(w['end_date'] ?? '');
      if (end != null && (latestEnd == null || end.isAfter(latestEnd))) {
        latestEnd = end;
      }
    }
    if (latestEnd == null || latestEnd.isBefore(now)) return 0;
    return latestEnd.difference(now).inHours;
  }

  /// Load unified chronological health timeline & vaccination records
  Future<void> fetchHealthIntelligence(String id) async {
    isLoadingHealth.value = true;
    try {
      final events = await repository.getAnimalHealthTimeline(id);
      healthTimeline.assignAll(events);

      final vacs = await repository.getAnimalVaccinations(id);
      vaccinations.assignAll(vacs);

      final curStatus = state?['health_status']?.toString();
      if (curStatus != null) {
        healthStatus.value = HealthStatus.fromString(curStatus);
      }
    } catch (e) {
      Get.log('fetchHealthIntelligence notice: $e');
    } finally {
      isLoadingHealth.value = false;
    }
  }

  /// Submit syndromic report with transparent triage and update reactive UI state
  Future<void> reportHealthIssue({
    required Set<String> symptoms,
    required TriageAssessment triage,
    double? bodyTemperatureC,
    String? notes,
  }) async {
    final currentId = state?['id']?.toString() ?? animalId;
    final animalCode = state?['animal_code']?.toString() ?? 'ANIMAL';
    final species = state?['species']?.toString() ?? 'cow';

    await repository.reportHealthIssue(
      animalId: currentId,
      animalCode: animalCode,
      species: species,
      symptoms: symptoms,
      triage: triage,
      bodyTemperatureC: bodyTemperatureC,
      notes: notes,
    );

    // Map triage urgency to health status
    String newDbStatus = 'under_observation';
    if (triage.urgency == TriageUrgency.urgent) {
      newDbStatus = 'critical';
    } else if (triage.urgency == TriageUrgency.high) {
      newDbStatus = 'affected';
    } else if (triage.urgency == TriageUrgency.moderate) {
      newDbStatus = 'under_observation';
    } else {
      newDbStatus = 'healthy';
    }

    healthStatus.value = HealthStatus.fromString(newDbStatus);

    final current = Map<String, dynamic>.from(state ?? {});
    current['health_status'] = newDbStatus;
    change(current, status: RxStatus.success());

    // Refresh timeline with new event
    await fetchHealthIntelligence(currentId);

    Get.snackbar(
      'Health Report Logged',
      'Triage status set to ${triage.urgency.label.toUpperCase()}. Health record persisted.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: triage.urgency.color.withValues(alpha: 0.95),
      colorText: Colors.white,
    );
  }
}

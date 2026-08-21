import 'dart:io';
import 'package:dio/dio.dart' as dio_client;
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../core/values/constants.dart';
import '../../../data/models/farm_models.dart';

class AnimalDetailController extends GetxController with StateMixin<Map<String, dynamic>> {
  final FarmRepository repository;
  AnimalDetailController({required this.repository});

  final _supabase = Supabase.instance.client;
  final dio_client.Dio _dio = dio_client.Dio();
  
  final RxBool isUploading = false.obs;
  String animalId = '';

  @override
  void onInit() {
    super.onInit();
    // Safely handle arguments to avoid TypeErrors
    final dynamic args = Get.arguments;
    if (args is String) {
      animalId = args;
    } else if (args is Animal) {
      animalId = args.id ?? '';
    } else if (args is Map && args.containsKey('id')) {
      animalId = args['id'].toString();
    }

    if (animalId.isNotEmpty) {
      fetchAnimalFullProfile(animalId);
    } else {
      change(null, status: RxStatus.error("Invalid Animal ID"));
    }
  }

  bool _isUuid(String str) {
    final uuidRegex = RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    return uuidRegex.hasMatch(str.trim());
  }

  Future<void> fetchAnimalFullProfile(String id) async {
    change(null, status: RxStatus.loading());
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
        
        change(fullData, status: RxStatus.success());
        return;
      }

      // Fallback: Fetch from Backend Express API
      final response = await repository.apiProvider.getAnimal(id);
      if (response.data != null && response.data['data'] != null) {
        change(Map<String, dynamic>.from(response.data['data']), status: RxStatus.success());
        return;
      }

      change(null, status: RxStatus.error("Animal profile not found"));
    } catch (e) {
      Get.log("Fetch Animal Profile Error: $e");
      try {
        // Ultimate fallback to API
        final response = await repository.apiProvider.getAnimal(id);
        if (response.data != null && response.data['data'] != null) {
          change(Map<String, dynamic>.from(response.data['data']), status: RxStatus.success());
          return;
        }
      } catch (_) {}
      
      change(null, status: RxStatus.error("Could not load animal profile. Please try again."));
    }
  }

  Future<void> uploadAnimalPhoto(File imageFile) async {
    try {
      isUploading.value = true;
      String url = "https://api.cloudinary.com/v1_1/${constants.cloudName}/image/upload";

      dio_client.FormData formData = dio_client.FormData.fromMap({
        "file": await dio_client.MultipartFile.fromFile(imageFile.path),
        "upload_preset": constants.uploadPreset,
      });

      final response = await _dio.post(url, data: formData);
      String imageUrl = response.data['secure_url'];

      await _supabase
          .from('animals')
          .update({'image_url': imageUrl})
          .eq('id', animalId);

      fetchAnimalFullProfile(animalId);
      Get.snackbar("Success", "Photo updated successfully");
    } catch (e) {
      Get.snackbar("Upload Error", "Failed to upload photo to Cloudinary");
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
}

import 'dart:io';
import 'package:dio/dio.dart' as dio_client;
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../core/values/constants.dart';

class AnimalDetailController extends GetxController with StateMixin<Map<String, dynamic>> {
  final FarmRepository repository;
  AnimalDetailController({required this.repository});

  final _supabase = Supabase.instance.client;
  final dio_client.Dio _dio = dio_client.Dio();
  
  final RxBool isUploading = false.obs;
  late String animalId;

  @override
  void onInit() {
    super.onInit();
    animalId = Get.arguments;
    fetchAnimalFullProfile(animalId);
  }

  Future<void> fetchAnimalFullProfile(String id) async {
    change(null, status: RxStatus.loading());
    try {
      // Direct Supabase query with joins for full profile
      final data = await _supabase
          .from('animals')
          .select('''
            *,
            treatments:treatments(
              *,
              medicine:medicines(*)
            ),
            withdrawals:withdrawals(*)
          ''')
          .eq('id', id)
          .single();
      
      change(data, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
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

      // Update Supabase
      await _supabase
          .from('animals')
          .update({'image_url': imageUrl})
          .eq('id', animalId);

      // Refresh data
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

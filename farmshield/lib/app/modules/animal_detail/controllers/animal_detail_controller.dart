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

  Future<void> fetchAnimalFullProfile(String id) async {
    change(null, status: RxStatus.loading());
    try {
      // Split the fetch into separate calls to avoid complex RLS recursion issues (Error 42P17)
      // which often happens in Supabase when joining tables with interdependent policies.
      
      final animalFuture = _supabase
          .from('animals')
          .select()
          .eq('id', id)
          .single();

      final treatmentsFuture = _supabase
          .from('treatments')
          .select()
          .eq('animal_id', id);

      final withdrawalsFuture = _supabase
          .from('withdrawals')
          .select()
          .eq('animal_id', id);

      // Use Future.wait with explicit type casting to avoid "List<Object> to Iterable<Future>" error
      final results = await Future.wait<dynamic>([
        animalFuture, 
        treatmentsFuture, 
        withdrawalsFuture
      ]);
      
      final animalData = results[0] as Map<String, dynamic>;
      final treatmentsData = results[1] as List<dynamic>;
      final withdrawalsData = results[2] as List<dynamic>;

      // Fetch medicine details for treatments separately if any exist to avoid join recursion
      if (treatmentsData.isNotEmpty) {
        final List<String> medicineIds = treatmentsData
            .map((t) => t['medicine_id'] as String?)
            .where((mid) => mid != null)
            .toSet()
            .cast<String>()
            .toList();

        if (medicineIds.isNotEmpty) {
          final medicinesData = await _supabase
              .from('medicines')
              .select()
              .inFilter('id', medicineIds);

          for (var t in treatmentsData) {
            t['medicine'] = (medicinesData as List).firstWhereOrNull(
              (m) => m['id'] == t['medicine_id'],
            );
          }
        }
      }

      final Map<String, dynamic> fullData = Map<String, dynamic>.from(animalData);
      fullData['treatments'] = treatmentsData;
      fullData['withdrawals'] = withdrawalsData;
      
      change(fullData, status: RxStatus.success());
    } catch (e) {
      Get.log("Fetch Animal Profile Error: $e");
      String errorMessage = e.toString();
      if (errorMessage.contains('42P17')) {
        errorMessage = "Database policy error: Potential recursion detected in security rules. Please contact admin.";
      }
      change(null, status: RxStatus.error(errorMessage));
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

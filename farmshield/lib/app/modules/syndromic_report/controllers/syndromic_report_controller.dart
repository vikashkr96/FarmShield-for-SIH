import 'package:get/get.dart';
import '../../../core/services/offline_storage_service.dart';

class SyndromicReportController extends GetxController {
  final selectedSpecies = 'cow'.obs;
  final affectedCount = 1.obs;
  final mortalityCount = 0.obs;

  final symptoms = <String, bool>{
    'high_fever': false,
    'salivation': false,
    'mouth_blisters': false,
    'hoof_lesions': false,
    'skin_nodules': false,
    'sudden_death': false,
    'unclotted_blood': false,
    'respiratory_distress': false,
    'diarrhea': false,
    'abortion': false,
  }.obs;

  final latitude = 18.5793.obs;
  final longitude = 73.9824.obs;
  final isSubmitting = false.obs;
  final offlineAdvice = ''.obs;

  void toggleSymptom(String key) {
    symptoms[key] = !(symptoms[key] ?? false);
    _computeOfflineAdvice();
  }

  void _computeOfflineAdvice() {
    if ((symptoms['sudden_death'] ?? false) && (symptoms['unclotted_blood'] ?? false)) {
      offlineAdvice.value = '⚠️ CRITICAL: Suspected Anthrax! DO NOT open carcass. Strict biosecurity required.';
    } else if ((symptoms['mouth_blisters'] ?? false) || ((symptoms['salivation'] ?? false) && (symptoms['hoof_lesions'] ?? false))) {
      offlineAdvice.value = '⚠️ HIGH CONTAGION: Suspected Foot & Mouth Disease. Isolate herd & disinfect premises.';
    } else if ((symptoms['skin_nodules'] ?? false) && (symptoms['high_fever'] ?? false)) {
      offlineAdvice.value = 'ℹ️ MODERATE: Suspected Lumpy Skin Disease. Apply antiseptic wash and fly repellents.';
    } else {
      offlineAdvice.value = '';
    }
  }

  Future<void> submitReport() async {
    isSubmitting.value = true;
    try {
      final reportData = {
        'client_report_id': 'rep_mob_${DateTime.now().millisecondsSinceEpoch}',
        'reporter_role': 'farmer',
        'species': selectedSpecies.value,
        'affected_count': affectedCount.value,
        'mortality_count': mortalityCount.value,
        'latitude': latitude.value,
        'longitude': longitude.value,
        'symptoms': Map<String, bool>.from(symptoms),
      };

      await OfflineStorageService().saveDiseaseReportLocally(reportData);

      Get.back();
      Get.snackbar(
        'Report Registered',
        'Disease report saved locally. Background auto-sync is active.',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSubmitting.value = false;
    }
  }
}

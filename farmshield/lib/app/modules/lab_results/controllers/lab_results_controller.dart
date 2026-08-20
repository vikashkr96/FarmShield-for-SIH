import 'package:get/get.dart';
import '../../../data/repositories/farm_repository.dart';

class LabResultsController extends GetxController {
  final FarmRepository repository;
  LabResultsController({required this.repository});

  final isLoading = false.obs;

  Future<void> submitLabResults(Map<String, dynamic> data) async {
    isLoading.value = true;
    try {
      await repository.submitLabResults(data);
      Get.back();
      Get.snackbar('Success', 'Lab results recorded successfully');
    } catch (e) {
      Get.snackbar('Error', 'Failed to record lab results: $e');
    } finally {
      isLoading.value = false;
    }
  }
}

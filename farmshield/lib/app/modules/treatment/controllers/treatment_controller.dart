import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';

class TreatmentController extends GetxController {
  final FarmRepository repository;
  TreatmentController({required this.repository});

  final isLoading = false.obs;
  final medicines = <Medicine>[].obs;
  final animals = <Animal>[].obs;

  final selectedAnimalId = ''.obs;
  final selectedMedicineId = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadData();
  }

  Future<void> loadData() async {
    isLoading.value = true;
    try {
      final medsList = await repository.getMedicines();
      medicines.assignAll(medsList);
      
      final animalsList = await repository.getAnimals();
      animals.assignAll(animalsList);
    } catch (e) {
      Get.snackbar('Error', 'Failed to load initial data: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> submitTreatment(Treatment treatment) async {
    isLoading.value = true;
    try {
      final result = await repository.addTreatment(treatment);
      
      final mlRisk = result['ml_risk_assessment'];
      if (mlRisk != null) {
        _showRiskSummary(mlRisk);
      } else {
        Get.back();
        Get.snackbar('Success', 'Treatment recorded successfully');
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to record treatment: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void _showRiskSummary(Map<String, dynamic> mlRisk) {
    Get.defaultDialog(
      title: 'ML Risk Assessment',
      content: Column(
        children: [
          _buildRiskTile('Overuse Risk', mlRisk['overuse_risk_level'], mlRisk['overuse_score']),
          _buildRiskTile('Compliance Risk', mlRisk['compliance_risk_level'], mlRisk['compliance_score']),
        ],
      ),
      confirm: ElevatedButton(
        onPressed: () {
          Get.back(); // Close dialog
          Get.back(); // Back to dashboard
        },
        child: const Text('Confirm'),
      ),
    );
  }

  Widget _buildRiskTile(String title, String? level, dynamic score) {
    Color color = Colors.green;
    if (level == 'HIGH') color = Colors.red;
    if (level == 'MEDIUM') color = Colors.orange;

    return ListTile(
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text('Score: ${score?.toStringAsFixed(3) ?? "N/A"}'),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(12)),
        child: Text(level ?? 'N/A', style: const TextStyle(color: Colors.white, fontSize: 12)),
      ),
    );
  }
}

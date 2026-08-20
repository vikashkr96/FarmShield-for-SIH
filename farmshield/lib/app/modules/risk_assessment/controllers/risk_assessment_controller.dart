import 'package:get/get.dart';
import '../../../data/models/risk_models.dart';
import '../../../data/repositories/farm_repository.dart';

class RiskAssessmentController extends GetxController {
  final FarmRepository repository;
  RiskAssessmentController({required this.repository});

  final overuseRisk = Rxn<RiskResponse>();
  final complianceRisk = Rxn<RiskResponse>();
  final isLoading = false.obs;

  Future<void> checkOveruseRisk(OveruseRiskRequest request) async {
    isLoading.value = true;
    try {
      overuseRisk.value = await repository.getOveruseRisk(request);
    } catch (e) {
      Get.snackbar('Error', 'Failed to fetch overuse risk: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> checkComplianceRisk(ComplianceRiskRequest request) async {
    isLoading.value = true;
    try {
      complianceRisk.value = await repository.getComplianceRisk(request);
    } catch (e) {
      Get.snackbar('Error', 'Failed to fetch compliance risk: $e');
    } finally {
      isLoading.value = false;
    }
  }
}

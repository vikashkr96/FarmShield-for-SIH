import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';

class DashboardController extends GetxController with StateMixin<AmuSummary> {
  final FarmRepository repository;
  DashboardController({required this.repository});

  final alerts = <Alert>[].obs;
  final isSystemHealthy = false.obs;
  final apiVersion = 'v1.0.0'.obs;

  @override
  void onInit() {
    super.onInit();
    loadDashboardData();
  }

  Future<void> loadDashboardData() async {
    change(null, status: RxStatus.loading());
    try {
      // Check System Health
      final health = await repository.apiProvider.getHealth();
      isSystemHealthy.value = health.data['status'] == 'healthy';
      apiVersion.value = health.data['version'] ?? 'unknown';

      // Load AMU Summary
      final summary = await repository.getAmuSummary();
      
      // Load Alerts
      final alertsData = await repository.getAlerts();
      alerts.assignAll(alertsData);

      change(summary, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
    }
  }
}

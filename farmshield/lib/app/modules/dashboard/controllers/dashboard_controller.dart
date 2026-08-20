import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';

class DashboardController extends GetxController with StateMixin<AmuSummary> {
  final FarmRepository repository;
  DashboardController({required this.repository});

  final alerts = <Alert>[].obs;
  final animals = <Animal>[].obs;
  final activeWithdrawals = <Map<String, dynamic>>[].obs;
  final amuTrendData = <Map<String, dynamic>>[].obs;
  
  // Locale observer to fix Obx issue
  final Rx<Locale> currentLocale = Locale('en', 'US').obs;
  
  // Timer for real-time countdown
  Timer? _timer;
  final currentTime = DateTime.now().obs;

  @override
  void onInit() {
    super.onInit();
    if (Get.locale != null) {
      currentLocale.value = Get.locale!;
    }
    loadDashboardData();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      currentTime.value = DateTime.now();
    });
  }

  @override
  void onClose() {
    _timer?.cancel();
    super.onClose();
  }

  Future<void> loadDashboardData() async {
    change(null, status: RxStatus.loading());
    try {
      // 1. Load AMU Summary
      final summary = await repository.getAmuSummary();
      
      // 2. Load Herd for Heatmap
      final herd = await repository.getAnimals();
      animals.assignAll(herd);

      // 3. Load Alerts
      final alertsData = await repository.getAlerts();
      alerts.assignAll(alertsData);

      // 4. Load Active Withdrawals for Countdown
      activeWithdrawals.assignAll([
        {
          'animal_code': 'BF-202',
          'end_date': DateTime.now().add(const Duration(hours: 14, minutes: 22, seconds: 5)),
        }
      ]);

      // 5. Mock AMU Trend Data
      amuTrendData.assignAll([
        {'month': 'Jan', 'value': 45.0},
        {'month': 'Feb', 'value': 52.0},
        {'month': 'Mar', 'value': 48.0},
        {'month': 'Apr', 'value': 60.0},
        {'month': 'May', 'value': 55.0},
        {'month': 'Jun', 'value': 42.0},
      ]);

      change(summary, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
    }
  }

  void toggleLanguage() {
    if (currentLocale.value.languageCode == 'hi') {
      currentLocale.value = Locale('en', 'US');
    } else {
      currentLocale.value = Locale('hi', 'IN');
    }
    Get.updateLocale(currentLocale.value);
  }

  String getAnimalStatus(Animal animal) {
    if (animal.healthStatus == 'SICK') return 'RED';
    if (animal.healthStatus == 'TREATMENT') return 'YELLOW';
    return 'GREEN';
  }

  Duration getRemainingTime(DateTime endDate) {
    final diff = endDate.difference(currentTime.value);
    return diff.isNegative ? Duration.zero : diff;
  }
}

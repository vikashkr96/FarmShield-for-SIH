import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/core/services/clinical_triage_service.dart';
import 'package:farmshield/app/core/services/weather_service.dart';
import 'package:farmshield/app/data/models/health_models.dart';

void main() {
  group('Clinical Triage Service — Rule-Based Decision Support Tests', () {
    final triageService = ClinicalTriageService();

    test('Identifies Foot-and-Mouth Disease (FMD) with urgent biosecurity response', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'excessive_salivation', 'mouth_blisters', 'hoof_lesions'},
        bodyTemperatureC: 40.2,
        species: 'cow',
      );

      expect(assessment.urgency, TriageUrgency.urgent);
      expect(assessment.suspectedConditions.any((c) => c.contains('Foot-and-Mouth')), isTrue);
      expect(assessment.requiresImmediateIsolation, isTrue);
      expect(assessment.alertFieldVeterinarian, isTrue);
      expect(assessment.rationalePoints.isNotEmpty, isTrue);
      expect(assessment.recommendedActions.any((a) => a.contains('isolate')), isTrue);
    });

    test('Identifies Lumpy Skin Disease (LSD) with high priority and vector control advice', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'skin_nodules', 'high_fever'},
        bodyTemperatureC: 40.0,
        species: 'cow',
        vectorRiskMultiplier: 1.8,
      );

      expect(assessment.urgency, TriageUrgency.high);
      expect(assessment.suspectedConditions.any((c) => c.contains('Lumpy Skin')), isTrue);
      expect(assessment.requiresImmediateIsolation, isTrue);
      expect(assessment.alertFieldVeterinarian, isTrue);
      expect(assessment.rationalePoints.any((r) => r.contains('biting flies')), isTrue);
    });

    test('Identifies Hemorrhagic Septicemia (HS) with throat swelling & respiratory distress', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'throat_swelling', 'respiratory_distress', 'high_fever'},
        bodyTemperatureC: 41.0,
        species: 'buffalo',
      );

      expect(assessment.urgency, TriageUrgency.urgent);
      expect(assessment.suspectedConditions.any((c) => c.contains('Hemorrhagic Septicemia')), isTrue);
      expect(assessment.alertFieldVeterinarian, isTrue);
    });

    test('Identifies Anthrax emergency with immediate carcass handling precaution', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'bloody_discharge', 'sudden_death'},
        species: 'cow',
      );

      expect(assessment.urgency, TriageUrgency.urgent);
      expect(assessment.suspectedConditions.any((c) => c.contains('Anthrax')), isTrue);
      expect(assessment.recommendedActions.any((a) => a.contains('DO NOT open')), isTrue);
    });

    test('Identifies Clinical Mastitis with milk withholding advice', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'udder_swelling', 'abnormal_milk'},
        species: 'cow',
      );

      expect(assessment.urgency, TriageUrgency.moderate);
      expect(assessment.suspectedConditions.any((c) => c.contains('Mastitis')), isTrue);
      expect(assessment.recommendedActions.any((a) => a.contains('Withhold milk')), isTrue);
    });

    test('Identifies Bovine Babesiosis with red urine and high fever', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'red_urine', 'high_fever'},
        bodyTemperatureC: 40.8,
        species: 'cow',
      );

      expect(assessment.urgency, TriageUrgency.high);
      expect(assessment.suspectedConditions.any((c) => c.contains('Babesiosis')), isTrue);
    });

    test('Assigns Low Urgency under observation for non-specific mild lethargy', () {
      final assessment = triageService.evaluateTriage(
        selectedSymptoms: {'mild_lethargy'},
        bodyTemperatureC: 38.8,
        species: 'cow',
      );

      expect(assessment.urgency, TriageUrgency.low);
      expect(assessment.requiresImmediateIsolation, isFalse);
    });
  });

  group('Weather Intelligence & THI Tests', () {
    test('Calculates Temperature-Humidity Index (THI) accurately', () {
      // T = 30°C, RH = 80%
      // THI = (1.8 * 30 + 32) - (0.55 - 0.0055 * 80) * (1.8 * 30 - 26)
      // 86 - (0.11) * (28) = 86 - 3.08 = 82.92 -> ~82.9
      final thi = WeatherService.computeThi(30.0, 80.0);
      expect(thi, inInclusiveRange(82.0, 84.0));
      expect(WeatherService.classifyHeatStress(thi), 'Danger');
    });

    test('Classifies Heat Stress categories correctly', () {
      expect(WeatherService.classifyHeatStress(70.0), 'Normal');
      expect(WeatherService.classifyHeatStress(74.5), 'Alert');
      expect(WeatherService.classifyHeatStress(81.2), 'Danger');
      expect(WeatherService.classifyHeatStress(89.5), 'Emergency');
    });
  });

  group('Herd Health Summary & Models Tests', () {
    test('Computes herd percentages and risk metrics correctly', () {
      final summary = HerdHealthSummary(
        farmId: 'farm1',
        species: 'cow',
        totalAnimals: 50,
        healthyCount: 40,
        underObservationCount: 6,
        affectedCount: 3,
        criticalCount: 1,
        deceasedCount: 0,
        vaccinationCoveragePct: 88.0,
        herdRiskScore: 45,
        herdRiskLevel: 'Elevated Risk',
        riskRationale: 'Test rationale',
        activeClusterAlerts: ['Cluster Alert: 3 animals with signs of FMD'],
      );

      expect(summary.totalAnimals, 50);
      expect(summary.healthyPct, 80.0);
      expect(summary.observationPct, 12.0);
      expect(summary.affectedPct, 6.0);
      expect(summary.criticalPct, 2.0);
      expect(summary.deceasedPct, 0.0);
      expect(summary.activeClusterAlerts.length, 1);
    });

    test('HealthStatus parses various database string representations', () {
      expect(HealthStatus.fromString('healthy'), HealthStatus.healthy);
      expect(HealthStatus.fromString('sick'), HealthStatus.affected);
      expect(HealthStatus.fromString('under_treatment'), HealthStatus.affected);
      expect(HealthStatus.fromString('observation'), HealthStatus.underObservation);
      expect(HealthStatus.fromString('critical'), HealthStatus.critical);
      expect(HealthStatus.fromString('deceased'), HealthStatus.deceased);
      expect(HealthStatus.fromString(null), HealthStatus.healthy);
    });

    test('VaccinationRecord accurately tracks booster due dates and overdue status', () {
      final now = DateTime.now();
      final overdueVac = VaccinationRecord(
        id: 'v1',
        animalId: 'a1',
        vaccineName: 'FMD Core',
        diseaseTargeted: 'FMD',
        administeredDate: now.subtract(const Duration(days: 200)),
        boosterDueDate: now.subtract(const Duration(days: 20)),
      );

      final upToDateVac = VaccinationRecord(
        id: 'v2',
        animalId: 'a1',
        vaccineName: 'LSD Live',
        diseaseTargeted: 'LSD',
        administeredDate: now.subtract(const Duration(days: 30)),
        boosterDueDate: now.add(const Duration(days: 150)),
      );

      expect(overdueVac.isOverdue, isTrue);
      expect(upToDateVac.isOverdue, isFalse);
    });
  });
}

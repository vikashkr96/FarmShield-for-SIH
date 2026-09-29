import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/data/models/geo_risk_model.dart';
import 'package:farmshield/app/data/repositories/farm_repository.dart';

void main() {
  group('Geospatial Risk Model & Parsing Tests', () {
    test('Correctly parses AnimalRiskPoint from disease report data', () {
      final json = {
        'id': 'rep-001',
        'latitude': 18.5793,
        'longitude': 73.9824,
        'species': 'cow',
        'affected_count': 4,
        'mortality_count': 1,
        'triage_severity': 'CRITICAL',
        'status': 'confirmed',
        'suspected_disease': 'Foot-and-Mouth Disease (FMD)',
        'created_at': '2026-09-08T10:00:00Z',
        'symptoms': {'high_fever': true, 'salivation': true},
        'is_outbreak_cluster': true,
      };

      final point = AnimalRiskPoint.fromDiseaseReport(json);

      expect(point.id, 'rep-001');
      expect(point.latitude, 18.5793);
      expect(point.longitude, 73.9824);
      expect(point.species, 'cow');
      expect(point.affectedCount, 4);
      expect(point.mortalityCount, 1);
      expect(point.severity, RiskSeverity.critical);
      expect(point.isCluster, true);
      expect(point.symptoms['high_fever'], true);
      expect(point.riskWeight, greaterThan(10.0));
    });

    test('Correctly parses AnimalRiskPoint from animal registry record', () {
      final json = {
        'id': 'a0000000-0000-0000-0000-000000000102',
        'animal_code': 'COW-102',
        'species': 'cow',
        'health_status': 'under_treatment',
        'latitude': 18.5810,
        'longitude': 73.9850,
        'created_at': '2026-09-09T14:30:00Z',
      };

      final point = AnimalRiskPoint.fromAnimal(json, farmName: 'Pune Farm');

      expect(point.animalId, 'a0000000-0000-0000-0000-000000000102');
      expect(point.animalCode, 'COW-102');
      expect(point.status, 'under_treatment');
      expect(point.severity, RiskSeverity.high);
      expect(point.farmName, 'Pune Farm');
      expect(point.mortalityCount, 0);
    });

    test('Correctly validates geographic coordinates', () {
      expect(FarmRepository.isValidCoordinate(18.5793, 73.9824), true);
      expect(FarmRepository.isValidCoordinate(0.0, 0.0), false); // Null island rejected
      expect(FarmRepository.isValidCoordinate(95.0, 73.0), false); // Invalid latitude
      expect(FarmRepository.isValidCoordinate(18.0, 200.0), false); // Invalid longitude
      expect(FarmRepository.isValidCoordinate(double.nan, 73.0), false);
    });

    test('Computes severity and weight with recency correctly', () {
      final recentDate = DateTime.now().subtract(const Duration(days: 2));
      final oldDate = DateTime.now().subtract(const Duration(days: 60));

      final recentPoint = AnimalRiskPoint(
        id: 'p1',
        species: 'cow',
        latitude: 18.5,
        longitude: 73.5,
        status: 'reported',
        severity: RiskSeverity.critical,
        affectedCount: 3,
        mortalityCount: 1,
        eventDate: recentDate,
      );

      final oldPoint = AnimalRiskPoint(
        id: 'p2',
        species: 'cow',
        latitude: 18.5,
        longitude: 73.5,
        status: 'reported',
        severity: RiskSeverity.critical,
        affectedCount: 3,
        mortalityCount: 1,
        eventDate: oldDate,
      );

      // Recent point should have higher weight due to recency multiplier (1.3x vs 1.0x)
      expect(recentPoint.riskWeight, greaterThan(oldPoint.riskWeight));
    });

    test('RiskMetricsSummary aggregates counts accurately', () {
      final points = [
        AnimalRiskPoint(
          id: '1',
          species: 'cow',
          latitude: 18.5,
          longitude: 73.5,
          status: 'sick',
          severity: RiskSeverity.critical,
          affectedCount: 3,
          mortalityCount: 1,
          isCluster: true,
          eventDate: DateTime.now(),
        ),
        AnimalRiskPoint(
          id: '2',
          species: 'buffalo',
          latitude: 18.6,
          longitude: 73.6,
          status: 'healthy',
          severity: RiskSeverity.healthy,
          affectedCount: 2,
          mortalityCount: 0,
          eventDate: DateTime.now(),
        ),
        AnimalRiskPoint(
          id: '3',
          species: 'goat',
          latitude: 18.7,
          longitude: 73.7,
          status: 'under_treatment',
          severity: RiskSeverity.high,
          affectedCount: 1,
          mortalityCount: 0,
          eventDate: DateTime.now(),
        ),
      ];

      final summary = RiskMetricsSummary.fromPoints(points);

      expect(summary.totalAnimalsMapped, 6); // 3 + 2 + 1
      expect(summary.affectedCount, 4); // 3 critical + 1 high
      expect(summary.healthyCount, 2); // 2 healthy
      expect(summary.mortalityCount, 1); // 1 mortality
      expect(summary.activeHotspots, 1); // 1 cluster
    });

    test('Serialization and deserialization preserve risk fields', () {
      final original = AnimalRiskPoint(
        id: 'ser_01',
        animalId: 'an_01',
        animalCode: 'COW-77',
        species: 'cow',
        latitude: 19.1234,
        longitude: 74.5678,
        status: 'investigating',
        severity: RiskSeverity.moderate,
        suspectedDisease: 'Anthrax Alert',
        affectedCount: 5,
        mortalityCount: 2,
        eventDate: DateTime(2026, 9, 10, 12, 0),
        locationName: 'Sector 4',
        farmName: 'Agro Field',
        symptoms: {'sudden_death': true},
        isCluster: true,
      );

      final json = original.toJson();
      final revived = AnimalRiskPoint.fromJson(json);

      expect(revived.id, original.id);
      expect(revived.animalId, original.animalId);
      expect(revived.animalCode, original.animalCode);
      expect(revived.latitude, original.latitude);
      expect(revived.longitude, original.longitude);
      expect(revived.severity, original.severity);
      expect(revived.affectedCount, original.affectedCount);
      expect(revived.mortalityCount, original.mortalityCount);
      expect(revived.isCluster, original.isCluster);
      expect(revived.symptoms['sudden_death'], true);
    });
  });
}

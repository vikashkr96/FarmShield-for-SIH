import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'geo_risk_model.dart';

/// Comprehensive animal health status
enum HealthStatus {
  healthy('Healthy', AppColors.success, Icons.check_circle_outline_rounded),
  underObservation('Under Observation', AppColors.warning, Icons.remove_red_eye_outlined),
  affected('Affected', AppColors.warningDark, Icons.sick_outlined),
  critical('Critical', AppColors.danger, Icons.warning_amber_rounded),
  recovered('Recovered', AppColors.info, Icons.health_and_safety_outlined),
  deceased('Deceased', AppColors.slate500, Icons.cancel_outlined);

  final String label;
  final Color color;
  final IconData icon;
  const HealthStatus(this.label, this.color, this.icon);

  static HealthStatus fromString(String? val) {
    if (val == null) return HealthStatus.healthy;
    final clean = val.toLowerCase().trim().replaceAll(' ', '_');
    switch (clean) {
      case 'healthy':
        return HealthStatus.healthy;
      case 'under_observation':
      case 'observation':
      case 'quarantine':
        return HealthStatus.underObservation;
      case 'affected':
      case 'sick':
      case 'under_treatment':
        return HealthStatus.affected;
      case 'critical':
      case 'severe':
        return HealthStatus.critical;
      case 'recovered':
        return HealthStatus.recovered;
      case 'deceased':
      case 'dead':
      case 'died':
        return HealthStatus.deceased;
      default:
        return HealthStatus.healthy;
    }
  }

  String toDbValue() {
    switch (this) {
      case HealthStatus.healthy:
        return 'healthy';
      case HealthStatus.underObservation:
        return 'under_observation';
      case HealthStatus.affected:
        return 'affected';
      case HealthStatus.critical:
        return 'critical';
      case HealthStatus.recovered:
        return 'recovered';
      case HealthStatus.deceased:
        return 'deceased';
    }
  }
}

/// Category of event in animal's health journey
enum HealthEventType {
  symptomReport('Symptom Report', Icons.warning_amber_rounded, AppColors.warning),
  vaccination('Vaccination', Icons.vaccines_rounded, AppColors.success),
  treatment('Antimicrobial Treatment', Icons.medication_liquid_rounded, AppColors.primary),
  healthCheck('Routine Health Check', Icons.fact_check_outlined, AppColors.info),
  labResult('Lab Diagnostics', Icons.biotech_rounded, AppColors.secondary),
  quarantine('Quarantine / Isolation', Icons.shield_outlined, AppColors.danger);

  final String label;
  final IconData icon;
  final Color color;
  const HealthEventType(this.label, this.icon, this.color);
}

/// Chronological event on an animal's unified health timeline
class HealthEvent {
  final String id;
  final String animalId;
  final HealthEventType type;
  final String title;
  final String description;
  final DateTime timestamp;
  final RiskSeverity severity;
  final String? performedBy;
  final Map<String, dynamic> metadata;

  const HealthEvent({
    required this.id,
    required this.animalId,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
    this.severity = RiskSeverity.low,
    this.performedBy,
    this.metadata = const {},
  });

  factory HealthEvent.fromJson(Map<String, dynamic> json) {
    return HealthEvent(
      id: json['id']?.toString() ?? '',
      animalId: json['animal_id']?.toString() ?? '',
      type: HealthEventType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => HealthEventType.healthCheck,
      ),
      title: json['title']?.toString() ?? 'Health Event',
      description: json['description']?.toString() ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
      severity: RiskSeverity.values.firstWhere(
        (s) => s.name == json['severity'],
        orElse: () => RiskSeverity.low,
      ),
      performedBy: json['performed_by']?.toString(),
      metadata: json['metadata'] is Map ? Map<String, dynamic>.from(json['metadata']) : const {},
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'animal_id': animalId,
        'type': type.name,
        'title': title,
        'description': description,
        'timestamp': timestamp.toIso8601String(),
        'severity': severity.name,
        'performed_by': performedBy,
        'metadata': metadata,
      };
}

/// Vaccination entry with booster compliance
class VaccinationRecord {
  final String id;
  final String animalId;
  final String vaccineName;
  final String diseaseTargeted;
  final String? batchNumber;
  final DateTime administeredDate;
  final DateTime? boosterDueDate;
  final String? veterinarian;
  final bool isSynced;

  const VaccinationRecord({
    required this.id,
    required this.animalId,
    required this.vaccineName,
    required this.diseaseTargeted,
    this.batchNumber,
    required this.administeredDate,
    this.boosterDueDate,
    this.veterinarian,
    this.isSynced = true,
  });

  bool get isOverdue {
    if (boosterDueDate == null) return false;
    return DateTime.now().isAfter(boosterDueDate!);
  }

  bool get isDueSoon {
    if (boosterDueDate == null) return false;
    final now = DateTime.now();
    final diff = boosterDueDate!.difference(now).inDays;
    return diff >= 0 && diff <= 30;
  }

  factory VaccinationRecord.fromJson(Map<String, dynamic> json) => VaccinationRecord(
        id: json['id']?.toString() ?? '',
        animalId: json['animal_id']?.toString() ?? '',
        vaccineName: json['vaccine_name']?.toString() ?? json['name']?.toString() ?? 'Core Vaccine',
        diseaseTargeted: json['disease_targeted']?.toString() ?? json['disease']?.toString() ?? 'General Protection',
        batchNumber: json['batch_number']?.toString() ?? json['batch']?.toString(),
        administeredDate: json['administered_date'] != null
            ? DateTime.tryParse(json['administered_date'].toString()) ?? DateTime.now()
            : DateTime.now(),
        boosterDueDate: json['booster_due_date'] != null
            ? DateTime.tryParse(json['booster_due_date'].toString())
            : null,
        veterinarian: json['veterinarian']?.toString() ?? json['vet_name']?.toString(),
        isSynced: json['is_synced'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'animal_id': animalId,
        'vaccine_name': vaccineName,
        'disease_targeted': diseaseTargeted,
        'batch_number': batchNumber,
        'administered_date': administeredDate.toIso8601String(),
        'booster_due_date': boosterDueDate?.toIso8601String(),
        'veterinarian': veterinarian,
        'is_synced': isSynced,
      };
}

/// Clinical Triage Urgency Level
enum TriageUrgency {
  low('Low Urgency', AppColors.success, Icons.check_circle_outline),
  moderate('Moderate Attention', AppColors.warning, Icons.info_outline),
  high('High Priority', AppColors.warningDark, Icons.warning_amber_rounded),
  urgent('Urgent Biosecurity Alert', AppColors.danger, Icons.emergency_rounded);

  final String label;
  final Color color;
  final IconData icon;
  const TriageUrgency(this.label, this.color, this.icon);
}

/// Result of transparent rule-based clinical triage
class TriageAssessment {
  final TriageUrgency urgency;
  final List<String> suspectedConditions;
  final List<String> rationalePoints;
  final List<String> recommendedActions;
  final bool requiresImmediateIsolation;
  final bool alertFieldVeterinarian;
  final double vectorRiskMultiplier;

  const TriageAssessment({
    required this.urgency,
    required this.suspectedConditions,
    required this.rationalePoints,
    required this.recommendedActions,
    this.requiresImmediateIsolation = false,
    this.alertFieldVeterinarian = false,
    this.vectorRiskMultiplier = 1.0,
  });
}

/// Herd Health Breakdown & Summary
class HerdHealthSummary {
  final String farmId;
  final String species;
  final int totalAnimals;
  final int healthyCount;
  final int underObservationCount;
  final int affectedCount;
  final int criticalCount;
  final int deceasedCount;
  final double vaccinationCoveragePct;
  final int herdRiskScore; // 0 to 100
  final String herdRiskLevel; // Low, Moderate, High, Severe
  final String riskRationale;
  final List<String> activeClusterAlerts;

  const HerdHealthSummary({
    required this.farmId,
    required this.species,
    required this.totalAnimals,
    required this.healthyCount,
    required this.underObservationCount,
    required this.affectedCount,
    required this.criticalCount,
    required this.deceasedCount,
    required this.vaccinationCoveragePct,
    required this.herdRiskScore,
    required this.herdRiskLevel,
    required this.riskRationale,
    this.activeClusterAlerts = const [],
  });

  double get healthyPct => totalAnimals > 0 ? (healthyCount / totalAnimals) * 100 : 0.0;
  double get observationPct => totalAnimals > 0 ? (underObservationCount / totalAnimals) * 100 : 0.0;
  double get affectedPct => totalAnimals > 0 ? (affectedCount / totalAnimals) * 100 : 0.0;
  double get criticalPct => totalAnimals > 0 ? (criticalCount / totalAnimals) * 100 : 0.0;
  double get deceasedPct => totalAnimals > 0 ? (deceasedCount / totalAnimals) * 100 : 0.0;

  factory HerdHealthSummary.empty(String farmId, String species) => HerdHealthSummary(
        farmId: farmId,
        species: species,
        totalAnimals: 0,
        healthyCount: 0,
        underObservationCount: 0,
        affectedCount: 0,
        criticalCount: 0,
        deceasedCount: 0,
        vaccinationCoveragePct: 0,
        herdRiskScore: 0,
        herdRiskLevel: 'Low Risk',
        riskRationale: 'No registered animals in this category.',
      );
}

/// Meteorological indicators and epidemiological risk correlation
class WeatherRiskData {
  final double latitude;
  final double longitude;
  final double temperatureC;
  final double humidityPct;
  final double precipitationMm;
  final double windSpeedKmh;
  final double thi; // Temperature-Humidity Index
  final String heatStressCategory; // Normal, Alert, Danger, Emergency
  final String vectorRiskLevel; // LOW, MODERATE, HIGH, EXTREME
  final double epidemicMultiplier; // 1.0 to 2.5
  final List<String> vulnerableDiseases;
  final String climateAdvisory;
  final DateTime timestamp;
  final String source;

  const WeatherRiskData({
    required this.latitude,
    required this.longitude,
    required this.temperatureC,
    required this.humidityPct,
    required this.precipitationMm,
    required this.windSpeedKmh,
    required this.thi,
    required this.heatStressCategory,
    required this.vectorRiskLevel,
    required this.epidemicMultiplier,
    required this.vulnerableDiseases,
    required this.climateAdvisory,
    required this.timestamp,
    required this.source,
  });

  factory WeatherRiskData.fallback({double lat = 18.5793, double lng = 73.9824}) {
    return WeatherRiskData(
      latitude: lat,
      longitude: lng,
      temperatureC: 28.5,
      humidityPct: 78.0,
      precipitationMm: 12.0,
      windSpeedKmh: 14.0,
      thi: 79.2,
      heatStressCategory: 'Danger',
      vectorRiskLevel: 'HIGH',
      epidemicMultiplier: 1.8,
      vulnerableDiseases: const [
        'Lumpy Skin Disease (LSD) - Biting fly transmission vector',
        'Black Quarter (BQ) - Waterlogged pasture',
      ],
      climateAdvisory: 'High atmospheric moisture and temperature promote vector multiplication. Apply pyrethroid fly repellents and maintain shed drainage.',
      timestamp: DateTime.now(),
      source: 'climatological_baseline',
    );
  }

  factory WeatherRiskData.fromJson(Map<String, dynamic> json) {
    return WeatherRiskData(
      latitude: (json['latitude'] as num?)?.toDouble() ?? 18.5793,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 73.9824,
      temperatureC: (json['temperature_c'] as num?)?.toDouble() ?? 25.0,
      humidityPct: (json['humidity_pct'] as num?)?.toDouble() ?? 60.0,
      precipitationMm: (json['precipitation_mm'] as num?)?.toDouble() ?? 0.0,
      windSpeedKmh: (json['wind_speed_kmh'] as num?)?.toDouble() ?? 10.0,
      thi: (json['thi'] as num?)?.toDouble() ?? 72.0,
      heatStressCategory: json['heat_stress_category']?.toString() ?? 'Normal',
      vectorRiskLevel: json['vector_risk_level']?.toString() ?? 'LOW',
      epidemicMultiplier: (json['epidemic_multiplier'] as num?)?.toDouble() ?? 1.0,
      vulnerableDiseases: (json['vulnerable_diseases'] as List?)?.map((e) => e.toString()).toList() ?? [],
      climateAdvisory: json['climate_advisory']?.toString() ?? '',
      timestamp: json['timestamp'] != null ? DateTime.tryParse(json['timestamp']) ?? DateTime.now() : DateTime.now(),
      source: json['source']?.toString() ?? 'live_open_meteo',
    );
  }

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'temperature_c': temperatureC,
        'humidity_pct': humidityPct,
        'precipitation_mm': precipitationMm,
        'wind_speed_kmh': windSpeedKmh,
        'thi': thi,
        'heat_stress_category': heatStressCategory,
        'vector_risk_level': vectorRiskLevel,
        'epidemic_multiplier': epidemicMultiplier,
        'vulnerable_diseases': vulnerableDiseases,
        'climate_advisory': climateAdvisory,
        'timestamp': timestamp.toIso8601String(),
        'source': source,
      };
}

/// Time-bucketed point for historical disease analytics
class DiseaseTrendPoint {
  final DateTime date;
  final String diseaseName;
  final int caseCount;
  final int mortalityCount;
  final int recoveredCount;

  const DiseaseTrendPoint({
    required this.date,
    required this.diseaseName,
    required this.caseCount,
    this.mortalityCount = 0,
    this.recoveredCount = 0,
  });

  factory DiseaseTrendPoint.fromJson(Map<String, dynamic> json) => DiseaseTrendPoint(
        date: json['date'] != null ? DateTime.tryParse(json['date']) ?? DateTime.now() : DateTime.now(),
        diseaseName: json['disease_name']?.toString() ?? 'Unknown',
        caseCount: (json['case_count'] as num?)?.toInt() ?? 0,
        mortalityCount: (json['mortality_count'] as num?)?.toInt() ?? 0,
        recoveredCount: (json['recovered_count'] as num?)?.toInt() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'date': date.toIso8601String().split('T')[0],
        'disease_name': diseaseName,
        'case_count': caseCount,
        'mortality_count': mortalityCount,
        'recovered_count': recoveredCount,
      };
}

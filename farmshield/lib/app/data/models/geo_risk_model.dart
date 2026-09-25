enum RiskSeverity {
  critical,
  high,
  moderate,
  low,
  healthy,
}

enum RiskTimeRange {
  sevenDays('7 Days', 7),
  thirtyDays('30 Days', 30),
  threeMonths('3 Months', 90),
  oneYear('1 Year', 365),
  allTime('All Time', null);

  final String label;
  final int? days;
  const RiskTimeRange(this.label, this.days);
}

enum RiskLayerMode {
  hybrid('Hybrid'),
  heatmap('Heatmap'),
  markers('Markers');

  final String label;
  const RiskLayerMode(this.label);
}

class AnimalRiskPoint {
  final String id;
  final String? animalId;
  final String? animalCode;
  final String species;
  final double latitude;
  final double longitude;
  final String status;
  final RiskSeverity severity;
  final String? suspectedDisease;
  final int affectedCount;
  final int mortalityCount;
  final DateTime eventDate;
  final String? locationName;
  final String? farmId;
  final String? farmName;
  final Map<String, bool> symptoms;
  final bool isCluster;
  final double riskWeight;

  AnimalRiskPoint({
    required this.id,
    this.animalId,
    this.animalCode,
    required this.species,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.severity,
    this.suspectedDisease,
    this.affectedCount = 1,
    this.mortalityCount = 0,
    required this.eventDate,
    this.locationName,
    this.farmId,
    this.farmName,
    this.symptoms = const {},
    this.isCluster = false,
    double? customWeight,
  }) : riskWeight = customWeight ?? _computeWeight(affectedCount, mortalityCount, severity, eventDate);

  static double _computeWeight(
    int affected,
    int mortality,
    RiskSeverity severity,
    DateTime eventDate,
  ) {
    double sevMultiplier;
    switch (severity) {
      case RiskSeverity.critical:
        sevMultiplier = 3.5;
        break;
      case RiskSeverity.high:
        sevMultiplier = 2.5;
        break;
      case RiskSeverity.moderate:
        sevMultiplier = 1.8;
        break;
      case RiskSeverity.low:
        sevMultiplier = 1.0;
        break;
      case RiskSeverity.healthy:
        sevMultiplier = 0.3;
        break;
    }

    final daysOld = DateTime.now().difference(eventDate).inDays;
    final recencyMultiplier = daysOld <= 7 ? 1.3 : (daysOld <= 30 ? 1.1 : 1.0);

    final base = (affected * 1.5) + (mortality * 3.5) + (sevMultiplier * 2.0);
    return (base * recencyMultiplier).clamp(1.0, 50.0);
  }

  static RiskSeverity parseSeverity(String? raw, {int mortality = 0, String? healthStatus}) {
    if (mortality > 0 || raw?.toUpperCase() == 'CRITICAL' || healthStatus == 'died') {
      return RiskSeverity.critical;
    }
    if (raw?.toUpperCase() == 'HIGH' || healthStatus == 'under_treatment' || healthStatus == 'quarantine') {
      return RiskSeverity.high;
    }
    if (raw?.toUpperCase() == 'MODERATE' || healthStatus == 'sick' || raw?.toLowerCase() == 'investigating') {
      return RiskSeverity.moderate;
    }
    if (healthStatus == 'healthy' || raw?.toLowerCase() == 'contained') {
      return RiskSeverity.healthy;
    }
    return RiskSeverity.low;
  }

  factory AnimalRiskPoint.fromDiseaseReport(Map<String, dynamic> json) {
    final lat = (json['latitude'] as num?)?.toDouble() ?? 0.0;
    final lng = (json['longitude'] as num?)?.toDouble() ?? 0.0;
    final mort = (json['mortality_count'] as num?)?.toInt() ?? 0;
    final aff = (json['affected_count'] as num?)?.toInt() ?? 1;
    final sev = parseSeverity(json['triage_severity']?.toString(), mortality: mort);

    Map<String, bool> sympMap = {};
    if (json['symptoms'] is Map) {
      (json['symptoms'] as Map).forEach((k, v) {
        sympMap[k.toString()] = v == true;
      });
    }

    DateTime dt;
    try {
      dt = DateTime.parse(json['created_at']?.toString() ?? DateTime.now().toIso8601String());
    } catch (_) {
      dt = DateTime.now();
    }

    return AnimalRiskPoint(
      id: json['id']?.toString() ?? 'rep_${DateTime.now().millisecondsSinceEpoch}',
      animalId: json['animal_id']?.toString(),
      animalCode: json['animal_code']?.toString(),
      species: json['species']?.toString() ?? 'cow',
      latitude: lat,
      longitude: lng,
      status: json['status']?.toString() ?? 'reported',
      severity: sev,
      suspectedDisease: json['suspected_disease']?.toString(),
      affectedCount: aff,
      mortalityCount: mort,
      eventDate: dt,
      locationName: json['village_id'] != null ? 'Village ${json['village_id']}' : 'Surveillance District',
      farmId: json['farm_id']?.toString(),
      farmName: json['farm_name']?.toString(),
      symptoms: sympMap,
      isCluster: json['is_outbreak_cluster'] == true,
    );
  }

  factory AnimalRiskPoint.fromAnimal(Map<String, dynamic> json, {double? defaultLat, double? defaultLng, String? farmName}) {
    final lat = (json['latitude'] as num?)?.toDouble() ?? defaultLat ?? 18.5793;
    final lng = (json['longitude'] as num?)?.toDouble() ?? defaultLng ?? 73.9824;
    final hStatus = json['health_status']?.toString() ?? 'healthy';
    final sev = parseSeverity(null, healthStatus: hStatus);

    DateTime dt;
    try {
      dt = DateTime.parse(json['created_at']?.toString() ?? DateTime.now().toIso8601String());
    } catch (_) {
      dt = DateTime.now();
    }

    return AnimalRiskPoint(
      id: json['id']?.toString() ?? 'an_${json['animal_code']}',
      animalId: json['id']?.toString(),
      animalCode: json['animal_code']?.toString(),
      species: json['species']?.toString() ?? 'cow',
      latitude: lat,
      longitude: lng,
      status: hStatus,
      severity: sev,
      suspectedDisease: hStatus == 'under_treatment' ? 'Active Clinical Treatment' : (hStatus == 'quarantine' ? 'Isolated / Quarantine' : null),
      affectedCount: 1,
      mortalityCount: hStatus == 'died' ? 1 : 0,
      eventDate: dt,
      locationName: json['farm_location']?.toString() ?? 'Farm Location',
      farmId: json['farm_id']?.toString(),
      farmName: farmName ?? json['farm_name']?.toString() ?? 'Registered Farm',
      symptoms: const {},
      isCluster: false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'animal_id': animalId,
        'animal_code': animalCode,
        'species': species,
        'latitude': latitude,
        'longitude': longitude,
        'status': status,
        'severity': severity.name,
        'suspected_disease': suspectedDisease,
        'affected_count': affectedCount,
        'mortality_count': mortalityCount,
        'event_date': eventDate.toIso8601String(),
        'location_name': locationName,
        'farm_id': farmId,
        'farm_name': farmName,
        'symptoms': symptoms,
        'is_cluster': isCluster,
        'risk_weight': riskWeight,
      };

  factory AnimalRiskPoint.fromJson(Map<String, dynamic> json) {
    RiskSeverity sev;
    try {
      sev = RiskSeverity.values.firstWhere((e) => e.name == json['severity']);
    } catch (_) {
      sev = RiskSeverity.low;
    }

    Map<String, bool> symp = {};
    if (json['symptoms'] is Map) {
      (json['symptoms'] as Map).forEach((k, v) => symp[k.toString()] = v == true);
    }

    return AnimalRiskPoint(
      id: json['id']?.toString() ?? '',
      animalId: json['animal_id']?.toString(),
      animalCode: json['animal_code']?.toString(),
      species: json['species']?.toString() ?? 'cow',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      status: json['status']?.toString() ?? 'unknown',
      severity: sev,
      suspectedDisease: json['suspected_disease']?.toString(),
      affectedCount: (json['affected_count'] as num?)?.toInt() ?? 1,
      mortalityCount: (json['mortality_count'] as num?)?.toInt() ?? 0,
      eventDate: DateTime.tryParse(json['event_date']?.toString() ?? '') ?? DateTime.now(),
      locationName: json['location_name']?.toString(),
      farmId: json['farm_id']?.toString(),
      farmName: json['farm_name']?.toString(),
      symptoms: symp,
      isCluster: json['is_cluster'] == true,
      customWeight: (json['risk_weight'] as num?)?.toDouble(),
    );
  }
}

class RiskMetricsSummary {
  final int totalAnimalsMapped;
  final int affectedCount;
  final int mortalityCount;
  final int activeHotspots;
  final int healthyCount;
  final int criticalCount;

  const RiskMetricsSummary({
    this.totalAnimalsMapped = 0,
    this.affectedCount = 0,
    this.mortalityCount = 0,
    this.activeHotspots = 0,
    this.healthyCount = 0,
    this.criticalCount = 0,
  });

  factory RiskMetricsSummary.fromPoints(List<AnimalRiskPoint> points) {
    int total = 0;
    int affected = 0;
    int deaths = 0;
    int hotspots = 0;
    int healthy = 0;
    int critical = 0;

    for (final p in points) {
      total += p.affectedCount;
      if (p.severity == RiskSeverity.critical) {
        critical += p.affectedCount;
      }
      if (p.severity == RiskSeverity.healthy) {
        healthy += p.affectedCount;
      } else {
        affected += p.affectedCount;
      }
      deaths += p.mortalityCount;
      if (p.isCluster || p.severity == RiskSeverity.critical || p.affectedCount >= 3) {
        hotspots++;
      }
    }

    return RiskMetricsSummary(
      totalAnimalsMapped: total,
      affectedCount: affected,
      mortalityCount: deaths,
      activeHotspots: hotspots,
      healthyCount: healthy,
      criticalCount: critical,
    );
  }
}

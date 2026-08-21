class Animal {
  String? id;
  String? farmId;
  String? animalCode;
  String? species;
  String? breed;
  DateTime? dob;
  String? sex;
  double? weightKg;
  String? purpose;
  String? healthStatus;
  String? qrToken;
  String? imageUrl;
  Map<String, dynamic>? fisheryDetails;

  Animal({
    this.id,
    this.farmId,
    this.animalCode,
    this.species,
    this.breed,
    this.dob,
    this.sex,
    this.weightKg,
    this.purpose,
    this.healthStatus,
    this.qrToken,
    this.imageUrl,
    this.fisheryDetails,
  });

  factory Animal.fromJson(Map<String, dynamic> json) => Animal(
        id: json['id'],
        farmId: json['farm_id'],
        animalCode: json['animal_code'],
        species: json['species'],
        breed: json['breed'],
        dob: json['dob'] != null ? DateTime.parse(json['dob']) : null,
        sex: json['sex'],
        weightKg: (json['weight'] ?? json['weight_kg'])?.toDouble(),
        purpose: json['purpose'],
        healthStatus: json['health_status'],
        qrToken: json['qr_token'],
        imageUrl: json['image_url'],
        fisheryDetails: json['fishery_details'],
      );

  Map<String, dynamic> toJson() => {
        "animal_code": animalCode,
        "species": species,
        "breed": breed,
        "dob": dob?.toIso8601String().split('T')[0],
        "sex": sex,
        "weight": weightKg,
        "purpose": purpose,
        "image_url": imageUrl,
      };
}

class Withdrawal {
  final String id;
  final String treatmentId;
  final String animalId;
  final String product;
  final DateTime startDate;
  final DateTime endDate;
  final String status;
  final Animal? animal;
  final String? medicineName;
  final String? indication;
  final String? dosage;

  Withdrawal({
    required this.id,
    required this.treatmentId,
    required this.animalId,
    required this.product,
    required this.startDate,
    required this.endDate,
    required this.status,
    this.animal,
    this.medicineName,
    this.indication,
    this.dosage,
  });

  factory Withdrawal.fromJson(Map<String, dynamic> json) => Withdrawal(
        id: json['id']?.toString() ?? '',
        treatmentId: json['treatment_id']?.toString() ?? '',
        animalId: json['animal_id']?.toString() ?? '',
        product: json['product']?.toString() ?? 'milk',
        startDate: json['start_date'] != null ? DateTime.parse(json['start_date'].toString()) : DateTime.now(),
        endDate: json['end_date'] != null ? DateTime.parse(json['end_date'].toString()) : DateTime.now().add(const Duration(days: 3)),
        status: json['status']?.toString() ?? 'active',
        animal: json['animals'] != null
            ? Animal.fromJson(json['animals'])
            : (json['animal'] != null ? Animal.fromJson(json['animal']) : null),
        medicineName: json['medicine_name'] ?? json['medicine']?['name'],
        indication: json['indication'] ?? json['treatment']?['indication'],
        dosage: json['dosage'] ?? (json['treatment'] != null ? "${json['treatment']['dose']} ${json['treatment']['dose_unit']}" : null),
      );
}

class Medicine {
  String? id;
  String? name;
  String? activeIngredient;
  String? antimicrobialClass;
  String? strength;
  String? status;
  String? imageUrl;
  List<RegulatoryRule>? rules;

  Medicine({
    this.id,
    this.name,
    this.activeIngredient,
    this.antimicrobialClass,
    this.strength,
    this.status,
    this.imageUrl,
    this.rules,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
        id: json['id'],
        name: json['name'],
        activeIngredient: json['active_ingredient'],
        antimicrobialClass: json['antimicrobial_class'],
        strength: json['strength'],
        status: json['status'],
        imageUrl: json['image_url'],
        rules: json['regulatory_rules'] != null
            ? (json['regulatory_rules'] as List)
                .map((e) => RegulatoryRule.fromJson(e))
                .toList()
            : null,
      );

  Map<String, dynamic> toJson() => {
        "name": name,
        "active_ingredient": activeIngredient,
        "antimicrobial_class": antimicrobialClass,
        "strength": strength,
        "status": status,
        "image_url": imageUrl,
      };
}

class RegulatoryRule {
  String? id;
  String? medicineId;
  String? species;
  String? product;
  double? mrl;
  int? withdrawalDays;
  String? jurisdiction;
  String? source;
  String? version;
  DateTime? effectiveFrom;
  DateTime? effectiveTo;
  String? approvalStatus;

  RegulatoryRule({
    this.id,
    this.medicineId,
    this.species,
    this.product,
    this.mrl,
    this.withdrawalDays,
    this.jurisdiction,
    this.source,
    this.version,
    this.effectiveFrom,
    this.effectiveTo,
    this.approvalStatus,
  });

  factory RegulatoryRule.fromJson(Map<String, dynamic> json) => RegulatoryRule(
        id: json['id'],
        medicineId: json['medicine_id'],
        species: json['species'],
        product: json['product'],
        mrl: _parseMrl(json['mrl']),
        withdrawalDays: json['withdrawal_days'] != null
            ? int.tryParse(json['withdrawal_days'].toString())
            : null,
        jurisdiction: json['jurisdiction'],
        source: json['source'],
        version: json['version'],
        effectiveFrom: json['effective_from'] != null
            ? DateTime.tryParse(json['effective_from'])
            : null,
        effectiveTo: json['effective_to'] != null
            ? DateTime.tryParse(json['effective_to'])
            : null,
        approvalStatus: json['approval_status'],
      );

  static double? _parseMrl(dynamic val) {
    if (val == null) return null;
    if (val is num) return val.toDouble();
    if (val is String) {
      final match = RegExp(r'([0-9]+(?:\.[0-9]+)?)').firstMatch(val);
      if (match != null) {
        return double.tryParse(match.group(1)!);
      }
    }
    return null;
  }

  Map<String, dynamic> toJson() => {
        "medicine_id": medicineId,
        "species": species,
        "product": product,
        "mrl": mrl,
        "withdrawal_days": withdrawalDays,
        "jurisdiction": jurisdiction,
        "source": source,
        "version": version,
        "effective_from": effectiveFrom?.toIso8601String(),
        "approval_status": approvalStatus,
      };
}

class Treatment {
  String? id;
  String? animalId;
  String? medicineId;
  String? vetId;
  double? doseAmount;
  String? doseUnit;
  String? route;
  String? frequency;
  int? durationDays;
  DateTime? startDate;
  DateTime? endDate;
  String? indication;
  String? productAffected;
  String? notes;

  Treatment({
    this.id,
    this.animalId,
    this.medicineId,
    this.vetId,
    this.doseAmount,
    this.doseUnit,
    this.route,
    this.frequency = 'Once daily',
    this.durationDays,
    this.startDate,
    this.endDate,
    this.indication,
    this.productAffected,
    this.notes,
  });

  factory Treatment.fromJson(Map<String, dynamic> json) => Treatment(
        id: json['id']?.toString(),
        animalId: json['animal_id']?.toString(),
        medicineId: json['medicine_id']?.toString(),
        vetId: (json['veterinarian_id'] ?? json['vet_id'])?.toString(),
        doseAmount: (json['dose_amount'] ?? json['dose'])?.toDouble(),
        doseUnit: json['dose_unit'] ?? json['unit'],
        route: json['route'],
        frequency: json['frequency'] ?? 'Once daily',
        durationDays: json['duration_days'] ?? json['duration'],
        startDate: json['start_date'] != null ? DateTime.parse(json['start_date']) : null,
        endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
        indication: json['indication'],
        productAffected: json['product_affected'] ?? json['product'] ?? 'milk',
        notes: json['notes'],
      );

  Map<String, dynamic> toJson() {
    final start = startDate ?? DateTime.now();
    final dur = durationDays ?? 3;
    final end = endDate ?? start.add(Duration(days: dur));
    return {
      if (id != null) "id": id,
      "animal_id": animalId,
      "medicine_id": medicineId,
      if (vetId != null && vetId!.isNotEmpty) "veterinarian_id": vetId,
      "dose": doseAmount ?? 10.0,
      "dose_unit": doseUnit ?? 'mg/kg',
      "route": route ?? 'Injection',
      "frequency": frequency ?? 'Once daily',
      "duration": dur,
      "start_date": start.toIso8601String(),
      "end_date": end.toIso8601String(),
      "indication": indication ?? 'Clinical Treatment',
      "product_affected": productAffected ?? 'milk',
      if (notes != null) "notes": notes,
    };
  }
}

class PublicPassport {
  String? animalCode;
  String? species;
  String? breed;
  String? healthStatus;
  String? milkStatus;
  String? meatStatus;
  String? withdrawalStatus;
  bool? isMilkSafe;
  bool? isMeatSafe;
  DateTime? safeDate;
  int? remainingWithdrawalHours;
  String? imageUrl;
  String? farmId;
  String? farmName;
  String? farmLocation;
  bool? isSafeToConsume;
  bool? activeWithdrawal;
  String? product;
  DateTime? withdrawalEndDate;
  int? remainingHours;
  double? complianceScore;
  String? latestLabResult;
  DateTime? lastVerifiedAt;

  PublicPassport({
    this.animalCode,
    this.species,
    this.breed,
    this.healthStatus,
    this.milkStatus,
    this.meatStatus,
    this.withdrawalStatus,
    this.isMilkSafe,
    this.isMeatSafe,
    this.safeDate,
    this.remainingWithdrawalHours,
    this.imageUrl,
    this.farmId,
    this.farmName,
    this.farmLocation,
    this.isSafeToConsume,
    this.activeWithdrawal,
    this.product,
    this.withdrawalEndDate,
    this.remainingHours,
    this.complianceScore,
    this.latestLabResult,
    this.lastVerifiedAt,
  });

  factory PublicPassport.fromJson(Map<String, dynamic> json) => PublicPassport(
        animalCode: json['animalCode'] ?? json['animal_code'],
        species: json['species'],
        breed: json['breed'],
        healthStatus: json['healthStatus'] ?? json['health_status'],
        milkStatus: json['milkStatus'] ?? json['milk_status'],
        meatStatus: json['meatStatus'] ?? json['meat_status'],
        withdrawalStatus: json['withdrawalStatus'] ?? json['withdrawal_status'],
        isMilkSafe: json['isMilkSafe'] ?? json['is_milk_safe'] ?? json['isSafeToConsume'],
        isMeatSafe: json['isMeatSafe'] ?? json['is_meat_safe'],
        safeDate: json['safeDate'] != null ? DateTime.parse(json['safeDate']) : (json['withdrawal_end_date'] != null ? DateTime.parse(json['withdrawal_end_date']) : null),
        remainingWithdrawalHours: json['remainingWithdrawalHours'] ?? json['remaining_hours'],
        imageUrl: json['imageUrl'] ?? json['image_url'],
        farmId: json['farmId'] ?? json['farm_id'],
        farmName: json['farmName'] ?? json['farm_name'],
        farmLocation: json['farmLocation'] ?? json['farm_location'],
        isSafeToConsume: json['isSafeToConsume'] ?? json['is_safe_to_consume'] ?? json['isMilkSafe'],
        activeWithdrawal: json['activeWithdrawal'] ?? json['active_withdrawal'],
        product: json['product'],
        withdrawalEndDate: json['withdrawalEndDate'] != null ? DateTime.parse(json['withdrawalEndDate']) : null,
        remainingHours: json['remainingHours'] ?? json['remainingWithdrawalHours'],
        complianceScore: (json['complianceScore'] ?? json['compliance_score'])?.toDouble(),
        latestLabResult: json['latestLabResult'] ?? json['latest_lab_result'],
        lastVerifiedAt: json['lastVerifiedAt'] != null ? DateTime.parse(json['lastVerifiedAt']) : null,
      );
}

class AmuSummary {
  int? totalTreatments;
  int? activeWithdrawals;
  double? averageWithdrawalDays;
  int? totalBiomassTreatedKg;
  List<dynamic>? classBreakdown;
  List<dynamic>? usageBySpecies;

  AmuSummary({
    this.totalTreatments,
    this.activeWithdrawals,
    this.averageWithdrawalDays,
    this.totalBiomassTreatedKg,
    this.classBreakdown,
    this.usageBySpecies,
  });

  factory AmuSummary.fromJson(Map<String, dynamic> json) => AmuSummary(
        totalTreatments: json['totalTreatments'],
        activeWithdrawals: json['activeWithdrawals'],
        averageWithdrawalDays: json['averageWithdrawalDays']?.toDouble(),
        totalBiomassTreatedKg: json['totalBiomassTreatedKg'],
        classBreakdown: json['classBreakdown'],
        usageBySpecies: json['usageBySpecies'],
      );
}

class Alert {
  String? id;
  String? title;
  String? message;
  String? messageHi;
  String? type;
  String? severity;
  String? status;
  DateTime? timestamp;

  Alert({
    this.id,
    this.title,
    this.message,
    this.messageHi,
    this.type,
    this.severity,
    this.status,
    this.timestamp,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    final typeVal = json['type']?.toString().toUpperCase() ?? 'INFO';
    final rawMsg = json['message'] ?? json['message_hi'] ?? '';
    return Alert(
      id: json['id'],
      title: json['title'] ?? (typeVal == 'CRITICAL' ? 'Critical Alert' : (typeVal == 'WARNING' ? 'Warning Alert' : 'Advisory')),
      message: rawMsg,
      messageHi: json['message_hi'],
      type: typeVal,
      severity: json['severity']?.toString().toUpperCase() ?? 'MEDIUM',
      status: json['status'] ?? 'active',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'])
          : (json['created_at'] != null ? DateTime.tryParse(json['created_at']) : DateTime.now()),
    );
  }
}

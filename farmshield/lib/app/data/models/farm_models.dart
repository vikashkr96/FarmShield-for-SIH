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

  Withdrawal({
    required this.id,
    required this.treatmentId,
    required this.animalId,
    required this.product,
    required this.startDate,
    required this.endDate,
    required this.status,
    this.animal,
  });

  factory Withdrawal.fromJson(Map<String, dynamic> json) => Withdrawal(
        id: json['id'],
        treatmentId: json['treatment_id'],
        animalId: json['animal_id'],
        product: json['product'],
        startDate: DateTime.parse(json['start_date']),
        endDate: DateTime.parse(json['end_date']),
        status: json['status'],
        animal: json['animals'] != null ? Animal.fromJson(json['animals']) : null,
      );
}

class Medicine {
  String? id;
  String? brandName;
  String? activeIngredient;
  String? drugClass;
  String? whoClassification;
  double? standardDosePerKg;
  String? defaultRoute;
  int? milkWithdrawalDays;
  int? aquacultureWithdrawalDays;
  double? mrlMilkUgKg;
  double? mrlAquacultureUgKg;
  bool? isFssaiApproved;

  Medicine({
    this.id,
    this.brandName,
    this.activeIngredient,
    this.drugClass,
    this.whoClassification,
    this.standardDosePerKg,
    this.defaultRoute,
    this.milkWithdrawalDays,
    this.aquacultureWithdrawalDays,
    this.mrlMilkUgKg,
    this.mrlAquacultureUgKg,
    this.isFssaiApproved,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
        id: json['id'],
        brandName: json['brand_name'],
        activeIngredient: json['active_ingredient'],
        drugClass: json['drug_class'],
        whoClassification: json['who_classification'],
        standardDosePerKg: json['standard_dose_per_kg']?.toDouble(),
        defaultRoute: json['default_route'],
        milkWithdrawalDays: json['milk_withdrawal_days'],
        aquacultureWithdrawalDays: json['aquaculture_withdrawal_days'],
        mrlMilkUgKg: json['mrl_milk_ug_kg']?.toDouble(),
        mrlAquacultureUgKg: json['mrl_aquaculture_ug_kg']?.toDouble(),
        isFssaiApproved: json['is_fssai_approved'],
      );
}

class Treatment {
  String? id;
  String? animalId;
  String? medicineId;
  String? vetId;
  double? doseAmount;
  String? doseUnit;
  String? route;
  int? durationDays;
  DateTime? startDate;
  DateTime? endDate;
  String? indication;
  String? productAffected;

  Treatment({
    this.id,
    this.animalId,
    this.medicineId,
    this.vetId,
    this.doseAmount,
    this.doseUnit,
    this.route,
    this.durationDays,
    this.startDate,
    this.endDate,
    this.indication,
    this.productAffected,
  });

  factory Treatment.fromJson(Map<String, dynamic> json) => Treatment(
        id: json['id'],
        animalId: json['animal_id'],
        medicineId: json['medicine_id'],
        vetId: json['vet_id'],
        doseAmount: (json['dose_amount'] ?? json['dose'])?.toDouble(),
        doseUnit: json['dose_unit'] ?? json['unit'],
        route: json['route'],
        durationDays: json['duration_days'] ?? json['duration'],
        startDate: json['start_date'] != null ? DateTime.parse(json['start_date']) : null,
        endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
        indication: json['indication'],
        productAffected: json['product_affected'] ?? json['product'],
      );

  Map<String, dynamic> toJson() => {
        "animal_id": animalId,
        "medicine_id": medicineId,
        "dose": doseAmount,
        "dose_unit": doseUnit,
        "route": route,
        "duration": durationDays,
        "start_date": startDate?.toIso8601String().split('T')[0],
        "indication": indication,
        "product": productAffected,
      };
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
  });

  factory PublicPassport.fromJson(Map<String, dynamic> json) => PublicPassport(
        animalCode: json['animalCode'],
        species: json['species'],
        breed: json['breed'],
        healthStatus: json['healthStatus'],
        milkStatus: json['milkStatus'],
        meatStatus: json['meatStatus'],
        withdrawalStatus: json['withdrawalStatus'],
        isMilkSafe: json['isMilkSafe'],
        isMeatSafe: json['isMeatSafe'],
        safeDate: json['safeDate'] != null ? DateTime.parse(json['safeDate']) : null,
        remainingWithdrawalHours: json['remainingWithdrawalHours'],
        imageUrl: json['imageUrl'],
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
  String? type;
  DateTime? timestamp;

  Alert({
    this.id,
    this.title,
    this.message,
    this.type,
    this.timestamp,
  });

  factory Alert.fromJson(Map<String, dynamic> json) => Alert(
        id: json['id'],
        title: json['title'],
        message: json['message'],
        type: json['type'],
        timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : null,
      );
}

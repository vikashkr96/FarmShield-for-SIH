class OveruseRiskRequest {
  String? species;
  String? sex;
  int? ageMonths;
  double? weightKg;
  String? productionPurpose;
  int? treatmentsLast7d;
  int? treatmentsLast30d;
  int? treatmentsLast90d;
  int? treatmentsLast180d;
  double? totalAmuMgLast30d;
  double? totalAmuMgLast90d;
  int? antimicrobialClassesUsed90d;
  String? primaryAntimicrobialClass;
  int? repeatedSameActiveIngredient90d;
  int? treatmentDurationDays;
  int? treatmentFrequencyPerDay;
  String? diseaseIndicationCategory;
  String? season;
  int? month;
  String? farmLevelAmuTrend;
  int? animalsTreatedOnFarm30d;
  int? farmTotalAnimals;
  String? previousTreatmentOutcome;
  double? dataCompletenessScore;

  OveruseRiskRequest({
    this.species,
    this.sex,
    this.ageMonths,
    this.weightKg,
    this.productionPurpose,
    this.treatmentsLast7d,
    this.treatmentsLast30d,
    this.treatmentsLast90d,
    this.treatmentsLast180d,
    this.totalAmuMgLast30d,
    this.totalAmuMgLast90d,
    this.antimicrobialClassesUsed90d,
    this.primaryAntimicrobialClass,
    this.repeatedSameActiveIngredient90d,
    this.treatmentDurationDays,
    this.treatmentFrequencyPerDay,
    this.diseaseIndicationCategory,
    this.season,
    this.month,
    this.farmLevelAmuTrend,
    this.animalsTreatedOnFarm30d,
    this.farmTotalAnimals,
    this.previousTreatmentOutcome,
    this.dataCompletenessScore,
  });

  Map<String, dynamic> toJson() => {
    "species": species,
    "sex": sex,
    "age_months": ageMonths,
    "weight_kg": weightKg,
    "production_purpose": productionPurpose,
    "treatments_last_7d": treatmentsLast7d,
    "treatments_last_30d": treatmentsLast30d,
    "treatments_last_90d": treatmentsLast90d,
    "treatments_last_180d": treatmentsLast180d,
    "total_amu_mg_last_30d": totalAmuMgLast30d,
    "total_amu_mg_last_90d": totalAmuMgLast90d,
    "antimicrobial_classes_used_90d": antimicrobialClassesUsed90d,
    "primary_antimicrobial_class": primaryAntimicrobialClass,
    "repeated_same_active_ingredient_90d": repeatedSameActiveIngredient90d,
    "treatment_duration_days": treatmentDurationDays,
    "treatment_frequency_per_day": treatmentFrequencyPerDay,
    "disease_indication_category": diseaseIndicationCategory,
    "season": season,
    "month": month,
    "farm_level_amu_trend": farmLevelAmuTrend,
    "animals_treated_on_farm_30d": animalsTreatedOnFarm30d,
    "farm_total_animals": farmTotalAnimals,
    "previous_treatment_outcome": previousTreatmentOutcome,
    "data_completeness_score": dataCompletenessScore,
  };
}

class ComplianceRiskRequest {
  String? species;
  double? weightKg;
  String? drugName;
  String? antimicrobialClass;
  String? route;
  String? productType;
  double? prescribedDoseMgPerKg;
  double? actualDoseMgPerKg;
  String? doseCompliance;
  int? treatmentDurationDays;
  double? officialWithdrawalPeriodDays;
  double? daysElapsedSinceTreatment;
  String? withdrawalRuleKnown;
  String? permittedInLactatingAnimals;
  double? mrlThresholdPpb;
  String? labResidueTestDone;
  double? labResidueLevelPpb;
  double? recordCompletenessScore;

  ComplianceRiskRequest({
    this.species,
    this.weightKg,
    this.drugName,
    this.antimicrobialClass,
    this.route,
    this.productType,
    this.prescribedDoseMgPerKg,
    this.actualDoseMgPerKg,
    this.doseCompliance,
    this.treatmentDurationDays,
    this.officialWithdrawalPeriodDays,
    this.daysElapsedSinceTreatment,
    this.withdrawalRuleKnown,
    this.permittedInLactatingAnimals,
    this.mrlThresholdPpb,
    this.labResidueTestDone,
    this.labResidueLevelPpb,
    this.recordCompletenessScore,
  });

  Map<String, dynamic> toJson() => {
    "species": species,
    "weight_kg": weightKg,
    "drug_name": drugName,
    "antimicrobial_class": antimicrobialClass,
    "route": route,
    "product_type": productType,
    "prescribed_dose_mg_per_kg": prescribedDoseMgPerKg,
    "actual_dose_mg_per_kg": actualDoseMgPerKg,
    "dose_compliance": doseCompliance,
    "treatment_duration_days": treatmentDurationDays,
    "official_withdrawal_period_days": officialWithdrawalPeriodDays,
    "days_elapsed_since_treatment": daysElapsedSinceTreatment,
    "withdrawal_rule_known": withdrawalRuleKnown,
    "permitted_in_lactating_animals": permittedInLactatingAnimals,
    "mrl_threshold_ppb": mrlThresholdPpb,
    "lab_residue_test_done": labResidueTestDone,
    "lab_residue_level_ppb": labResidueLevelPpb,
    "record_completeness_score": recordCompletenessScore,
  };
}

class RiskResponse {
  String? status;
  String? model;
  String? riskLevel;
  Map<String, dynamic>? probabilityDistribution;
  double? riskScore;
  List<String>? reasonCodes;
  String? recommendedAction;
  String? clearanceBadge;

  RiskResponse.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    model = json['model'];
    riskLevel = json['risk_level'];
    probabilityDistribution = json['probability_distribution'];
    riskScore = json['risk_score']?.toDouble();
    reasonCodes = json['reason_codes']?.cast<String>();
    recommendedAction = json['recommended_action'];
    clearanceBadge = json['clearance_badge'];
  }
}

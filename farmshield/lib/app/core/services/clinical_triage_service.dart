import '../../data/models/health_models.dart';

class ClinicalTriageService {
  static final ClinicalTriageService _instance = ClinicalTriageService._internal();
  factory ClinicalTriageService() => _instance;
  ClinicalTriageService._internal();

  /// Standard symptom catalog with clinical categorizations
  static const Map<String, String> symptomCatalog = {
    'high_fever': 'High Fever (>39.5°C / 103°F)',
    'mouth_blisters': 'Mouth / Gum Blisters & Vesicles',
    'excessive_salivation': 'Excessive Drooling / Frothy Salivation',
    'hoof_lesions': 'Foot / Interdigital Blisters & Lameness',
    'skin_nodules': 'Firm Circumscribed Skin Nodules',
    'lymph_swelling': 'Enlarged Superficial Lymph Nodes',
    'throat_swelling': 'Submandibular / Throat Edema',
    'respiratory_distress': 'Labored Breathing / Grunting',
    'udder_swelling': 'Swollen, Hard, or Hot Udder',
    'abnormal_milk': 'Clots, Flakes, or Blood in Milk',
    'bloody_discharge': 'Dark Blood from Natural Orifices',
    'red_urine': 'Red / Dark Brown Urine (Hemoglobinuria)',
    'sudden_death': 'Peracute Death in Herd',
    'severe_diarrhea': 'Profuse Watery or Bloody Diarrhea',
    'anorexia': 'Complete Loss of Appetite',
    'mild_lethargy': 'Mild Sluggishness / Reduced Rumination',
    'nasal_discharge': 'Mucopurulent Nasal Discharge',
    'tick_infestation': 'Visible Heavy Tick Infestation',
  };

  /// Evaluates clinical syndromic signs using transparent, rule-based veterinary triage
  TriageAssessment evaluateTriage({
    required Set<String> selectedSymptoms,
    double? bodyTemperatureC,
    String? species,
    double vectorRiskMultiplier = 1.0,
  }) {
    final List<String> suspectedConditions = [];
    final List<String> rationale = [];
    final List<String> recommendations = [];
    bool immediateIsolation = false;
    bool alertVet = false;
    TriageUrgency urgency = TriageUrgency.low;

    final hasFever = selectedSymptoms.contains('high_fever') || (bodyTemperatureC != null && bodyTemperatureC >= 39.5);
    final hasSalivation = selectedSymptoms.contains('excessive_salivation');
    final hasMouthBlisters = selectedSymptoms.contains('mouth_blisters');
    final hasHoofLesions = selectedSymptoms.contains('hoof_lesions');
    final hasNodules = selectedSymptoms.contains('skin_nodules');
    final hasThroatSwelling = selectedSymptoms.contains('throat_swelling');
    final hasRespDistress = selectedSymptoms.contains('respiratory_distress');
    final hasUdderSigns = selectedSymptoms.contains('udder_swelling') || selectedSymptoms.contains('abnormal_milk');
    final hasAnthraxSigns = selectedSymptoms.contains('bloody_discharge') || selectedSymptoms.contains('sudden_death');
    final hasRedUrine = selectedSymptoms.contains('red_urine');

    // Rule 1: Anthrax / Sudden Death (Immediate Severe Hazard)
    if (hasAnthraxSigns) {
      urgency = TriageUrgency.urgent;
      suspectedConditions.add('Suspected Anthrax / Acute Septicemia');
      rationale.add('Severe emergency signal: Unclotted blood discharge or sudden mortality detected.');
      recommendations.addAll([
        'DO NOT open the carcass under any circumstances to prevent spore release.',
        'Immediately quarantine the immediate radius (100 meters).',
        'Urgent mandatory alert to District Veterinary Officer.',
      ]);
      immediateIsolation = true;
      alertVet = true;
      return TriageAssessment(
        urgency: urgency,
        suspectedConditions: suspectedConditions,
        rationalePoints: rationale,
        recommendedActions: recommendations,
        requiresImmediateIsolation: immediateIsolation,
        alertFieldVeterinarian: alertVet,
        vectorRiskMultiplier: vectorRiskMultiplier,
      );
    }

    // Rule 2: Foot-and-Mouth Disease (FMD) Syndrome
    if ((hasMouthBlisters || hasSalivation) && (hasHoofLesions || hasFever)) {
      urgency = TriageUrgency.urgent;
      suspectedConditions.add('Foot-and-Mouth Disease (FMD) Cluster');
      rationale.add('Vesicular syndrome: Frothy salivation, mouth blisters and/or interdigital foot lesions are highly indicative of FMD (high contagiousness).');
      recommendations.addAll([
        'Strictly isolate animal in quarantine stall immediately.',
        'Restrict all vehicle and human traffic between pens; install sodium carbonate/potassium permanganate footbaths.',
        'Notify local veterinarian for emergency ring vaccination of nearby herd.',
      ]);
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 3: Hemorrhagic Septicemia (HS) Syndrome
    if (hasThroatSwelling && (hasRespDistress || hasFever)) {
      urgency = TriageUrgency.urgent;
      suspectedConditions.add('Hemorrhagic Septicemia (HS) / Pasteurellosis');
      rationale.add('Submandibular throat swelling accompanied by fever and labored breathing indicates acute HS.');
      if (vectorRiskMultiplier > 1.5) {
        rationale.add('High environmental humidity and precipitation currently elevate pasteurella pathogen proliferation.');
      }
      recommendations.addAll([
        'Immediate injectable antimicrobial administration required under veterinary supervision.',
        'Isolate animal in dry, elevated, well-ventilated enclosure.',
        'Monitor in-contact animals for temperature spikes twice daily.',
      ]);
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 4: Lumpy Skin Disease (LSD) Syndrome
    if (hasNodules) {
      final currentUrgency = hasFever ? TriageUrgency.high : TriageUrgency.moderate;
      if (urgency.index < currentUrgency.index) {
        urgency = currentUrgency;
      }
      suspectedConditions.add('Lumpy Skin Disease (LSD)');
      rationale.add('Circumscribed cutaneous nodules on head, neck, or body are characteristic of capripoxvirus (LSD).');
      if (vectorRiskMultiplier >= 1.5) {
        rationale.add('Weather conditions favor biting flies/Culicoides vector transmission.');
      }
      recommendations.addAll([
        'Isolate affected animal in insect-proof screened stall or apply pyrethroid repellent spray.',
        'Disinfect skin nodules with topical antiseptic to prevent secondary bacterial infection.',
        'Examine rest of herd for subclinical skin nodules and swollen prescapular lymph nodes.',
      ]);
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 5: Clinical Mastitis Syndrome
    if (hasUdderSigns) {
      if (urgency.index < TriageUrgency.high.index) {
        urgency = hasFever ? TriageUrgency.high : TriageUrgency.moderate;
      }
      suspectedConditions.add('Clinical Mastitis');
      rationale.add('Udder swelling, localized heat, or abnormal milk secretions indicate acute intramammary inflammation.');
      recommendations.addAll([
        'Withhold milk from consumption or tank collection immediately (MRL safety).',
        'Perform California Mastitis Test (CMT) on all four quarters to identify affected quarters.',
        'Consult veterinarian for targeted intramammary antibiotic infusion and anti-inflammatory support.',
      ]);
      alertVet = true;
    }

    // Rule 6: Babesiosis / Redwater / Tick-borne
    if (hasRedUrine && hasFever) {
      if (urgency.index < TriageUrgency.high.index) {
        urgency = TriageUrgency.high;
      }
      suspectedConditions.add('Bovine Babesiosis (Redwater Fever)');
      rationale.add('Hemoglobinuria (red urine) with high fever points to erythrocyte destruction by tick-borne babesia.');
      recommendations.addAll([
        'Emergency veterinary assessment for antiprotozoal injection (e.g. Diminazene / Imidocarb).',
        'Examine and dip/spray herd for tick control.',
        'Ensure animal has continuous access to cool, shaded water and supportive electrolytes.',
      ]);
      alertVet = true;
    }

    // Rule 7: General / Non-specific / Mild signs
    if (suspectedConditions.isEmpty) {
      if (hasFever || hasRespDistress) {
        urgency = TriageUrgency.moderate;
        suspectedConditions.add('Non-specific Pyrexia / Early Respiratory Infection');
        rationale.add('Elevated body temperature or respiratory signs detected without localized vesicular lesions.');
        recommendations.addAll([
          'Place under close observation for 24-48 hours.',
          'Re-check rectally measured body temperature morning and evening.',
          'Provide clean palatable feed and electrolyte water.',
        ]);
      } else if (selectedSymptoms.isNotEmpty) {
        urgency = TriageUrgency.low;
        suspectedConditions.add('Mild Digestive / Behavioral Observation');
        rationale.add('Mild non-febrile signs. No signs of transboundary animal epidemic disease.');
        recommendations.addAll([
          'Maintain regular feeding and observe cud chewing (rumination).',
          'If appetite or activity does not normalize in 24 hours, request veterinary inspection.',
        ]);
      } else {
        urgency = TriageUrgency.low;
        suspectedConditions.add('Healthy Baseline');
        rationale.add('No clinical symptoms selected. Vitals appear within normal physiologic range.');
        recommendations.add('Continue standard biosecurity, balanced nutrition, and scheduled vaccination.');
      }
    }

    return TriageAssessment(
      urgency: urgency,
      suspectedConditions: suspectedConditions,
      rationalePoints: rationale,
      recommendedActions: recommendations,
      requiresImmediateIsolation: immediateIsolation,
      alertFieldVeterinarian: alertVet,
      vectorRiskMultiplier: vectorRiskMultiplier,
    );
  }
}

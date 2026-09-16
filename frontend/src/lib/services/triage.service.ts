/**
 * Clinical Triage Service
 * Ported directly from Flutter ClinicalTriageService
 * Rule-based veterinary syndromic triage engine adhering to WOAH disease definitions
 */

export type TriageUrgency = 'urgent' | 'high' | 'moderate' | 'low';

export interface TriageAssessment {
  urgency: TriageUrgency;
  suspectedConditions: string[];
  rationalePoints: string[];
  recommendedActions: string[];
  requiresImmediateIsolation: boolean;
  alertFieldVeterinarian: boolean;
  vectorRiskMultiplier: number;
}

export const SYMPTOM_CATALOG: Record<string, { label: string; category: string }> = {
  high_fever: { label: 'High Fever (>39.5°C / 103°F)', category: 'general' },
  anorexia: { label: 'Complete Loss of Appetite', category: 'general' },
  mild_lethargy: { label: 'Mild Sluggishness / Reduced Rumination', category: 'general' },
  sudden_death: { label: 'Peracute Death in Herd', category: 'general' },

  mouth_blisters: { label: 'Mouth / Gum Blisters & Vesicles', category: 'cutaneous_mucosal' },
  excessive_salivation: { label: 'Excessive Drooling / Frothy Salivation', category: 'cutaneous_mucosal' },
  hoof_lesions: { label: 'Foot / Interdigital Blisters & Lameness', category: 'cutaneous_mucosal' },
  skin_nodules: { label: 'Firm Circumscribed Skin Nodules (LSD)', category: 'cutaneous_mucosal' },

  respiratory_distress: { label: 'Labored Breathing / Grunting', category: 'respiratory' },
  throat_swelling: { label: 'Submandibular / Throat Edema', category: 'respiratory' },
  nasal_discharge: { label: 'Mucopurulent Nasal Discharge', category: 'respiratory' },

  severe_diarrhea: { label: 'Profuse Watery or Bloody Diarrhea', category: 'digestive' },

  udder_swelling: { label: 'Swollen, Hard, or Hot Udder', category: 'reproductive_mammary' },
  abnormal_milk: { label: 'Clots, Flakes, or Blood in Milk', category: 'reproductive_mammary' },

  bloody_discharge: { label: 'Dark Blood from Natural Orifices', category: 'hemorrhagic' },
  red_urine: { label: 'Red / Dark Brown Urine (Hemoglobinuria)', category: 'hemorrhagic' },
  lymph_swelling: { label: 'Enlarged Superficial Lymph Nodes', category: 'general' },
  tick_infestation: { label: 'Visible Heavy Tick Infestation', category: 'cutaneous_mucosal' },
};

export class ClinicalTriageService {
  public static evaluateTriage({
    selectedSymptoms,
    bodyTemperatureC,
    vectorRiskMultiplier = 1.0,
  }: {
    selectedSymptoms: Set<string> | string[];
    bodyTemperatureC?: number | null;
    species?: string;
    vectorRiskMultiplier?: number;
  }): TriageAssessment {
    const symptoms = new Set(selectedSymptoms);
    const suspectedConditions: string[] = [];
    const rationale: string[] = [];
    const recommendations: string[] = [];
    let immediateIsolation = false;
    let alertVet = false;
    let urgency: TriageUrgency = 'low';

    const hasFever = symptoms.has('high_fever') || (bodyTemperatureC != null && bodyTemperatureC >= 39.5);
    const hasSalivation = symptoms.has('excessive_salivation');
    const hasMouthBlisters = symptoms.has('mouth_blisters');
    const hasHoofLesions = symptoms.has('hoof_lesions');
    const hasNodules = symptoms.has('skin_nodules');
    const hasThroatSwelling = symptoms.has('throat_swelling');
    const hasRespDistress = symptoms.has('respiratory_distress');
    const hasUdderSigns = symptoms.has('udder_swelling') || symptoms.has('abnormal_milk');
    const hasAnthraxSigns = symptoms.has('bloody_discharge') || symptoms.has('sudden_death');
    const hasRedUrine = symptoms.has('red_urine');

    // Rule 1: Anthrax / Sudden Death (Immediate Severe Emergency)
    if (hasAnthraxSigns) {
      urgency = 'urgent';
      suspectedConditions.push('Suspected Anthrax / Acute Septicemia');
      rationale.push('Severe emergency signal: Unclotted dark blood discharge or sudden mortality detected.');
      recommendations.push(
        'DO NOT open the carcass under any circumstances to prevent spore release.',
        'Immediately quarantine the immediate radius (100 meters).',
        'Urgent mandatory alert to District Veterinary Officer.'
      );
      immediateIsolation = true;
      alertVet = true;
      return {
        urgency,
        suspectedConditions,
        rationalePoints: rationale,
        recommendedActions: recommendations,
        requiresImmediateIsolation: immediateIsolation,
        alertFieldVeterinarian: alertVet,
        vectorRiskMultiplier,
      };
    }

    // Rule 2: Foot-and-Mouth Disease (FMD) Syndrome
    if ((hasMouthBlisters || hasSalivation) && (hasHoofLesions || hasFever)) {
      urgency = 'urgent';
      suspectedConditions.push('Foot-and-Mouth Disease (FMD) Cluster');
      rationale.push(
        'Vesicular syndrome: Frothy salivation, mouth blisters and/or interdigital foot lesions are highly indicative of FMD (high contagiousness).'
      );
      recommendations.push(
        'Strictly isolate animal in quarantine stall immediately.',
        'Restrict all vehicle and human traffic between pens; install sodium carbonate footbaths.',
        'Notify local veterinarian for emergency ring vaccination of nearby herd.'
      );
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 3: Hemorrhagic Septicemia (HS) Syndrome
    if (hasThroatSwelling && (hasRespDistress || hasFever)) {
      urgency = 'urgent';
      suspectedConditions.push('Hemorrhagic Septicemia (HS) / Pasteurellosis');
      rationale.push('Submandibular throat swelling accompanied by fever and labored breathing indicates acute HS.');
      if (vectorRiskMultiplier > 1.5) {
        rationale.push('High environmental humidity and precipitation currently elevate pasteurella proliferation.');
      }
      recommendations.push(
        'Immediate injectable antimicrobial administration required under veterinary supervision.',
        'Isolate animal in dry, elevated, well-ventilated enclosure.',
        'Monitor in-contact animals for temperature spikes twice daily.'
      );
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 4: Lumpy Skin Disease (LSD) Syndrome
    if (hasNodules) {
      const currentUrgency: TriageUrgency = hasFever ? 'high' : 'moderate';
      if (urgency !== 'urgent') urgency = currentUrgency;
      suspectedConditions.push('Lumpy Skin Disease (LSD)');
      rationale.push('Circumscribed cutaneous nodules on head, neck, or body are characteristic of capripoxvirus (LSD).');
      if (vectorRiskMultiplier >= 1.5) {
        rationale.push('Weather conditions favor biting flies/Culicoides vector transmission.');
      }
      recommendations.push(
        'Isolate affected animal in insect-proof screened stall or apply pyrethroid repellent spray.',
        'Disinfect skin nodules with topical antiseptic to prevent secondary bacterial infection.',
        'Examine rest of herd for subclinical skin nodules and swollen prescapular lymph nodes.'
      );
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 5: Clinical Mastitis Syndrome
    if (hasUdderSigns) {
      if (urgency === 'low') {
        urgency = hasFever ? 'high' : 'moderate';
      }
      suspectedConditions.push('Clinical Mastitis');
      rationale.push('Udder swelling, localized heat, or abnormal milk secretions indicate acute intramammary inflammation.');
      recommendations.push(
        'Withhold milk from consumption or tank collection immediately (FSSAI MRL safety).',
        'Perform California Mastitis Test (CMT) on all four quarters to identify affected quarters.',
        'Consult veterinarian for targeted intramammary antibiotic infusion and anti-inflammatory support.'
      );
      alertVet = true;
    }

    // Rule 6: Babesiosis / Redwater / Tick-borne
    if (hasRedUrine && hasFever) {
      if (urgency !== 'urgent') {
        urgency = 'high';
      }
      suspectedConditions.push('Bovine Babesiosis (Redwater Fever)');
      rationale.push('Hemoglobinuria (red urine) with high fever points to erythrocyte destruction by tick-borne babesia.');
      recommendations.push(
        'Emergency veterinary assessment for antiprotozoal injection (e.g. Diminazene / Imidocarb).',
        'Examine and dip/spray herd for tick control.',
        'Ensure animal has continuous access to cool, shaded water and supportive electrolytes.'
      );
      alertVet = true;
    }

    // Rule 7: General / Non-specific / Mild signs
    if (suspectedConditions.length === 0) {
      if (hasFever || hasRespDistress) {
        urgency = 'moderate';
        suspectedConditions.push('Non-specific Pyrexia / Early Respiratory Infection');
        rationale.push('Elevated body temperature or respiratory signs detected without localized vesicular lesions.');
        recommendations.push(
          'Place under close observation for 24-48 hours.',
          'Re-check rectally measured body temperature morning and evening.',
          'Provide clean palatable feed and electrolyte water.'
        );
      } else if (symptoms.size > 0) {
        urgency = 'low';
        suspectedConditions.push('Mild Digestive / Behavioral Observation');
        rationale.push('Mild non-febrile signs. No transboundary epidemic pathogen detected.');
        recommendations.push(
          'Maintain regular feeding and observe cud chewing (rumination).',
          'If appetite does not normalize in 24 hours, request veterinary inspection.'
        );
      } else {
        urgency = 'low';
        suspectedConditions.push('Healthy Baseline');
        rationale.push('No clinical symptoms selected. Vitals appear within normal physiologic range.');
        recommendations.push('Continue standard biosecurity, balanced nutrition, and scheduled vaccination.');
      }
    }

    return {
      urgency,
      suspectedConditions,
      rationalePoints: rationale,
      recommendedActions: recommendations,
      requiresImmediateIsolation: immediateIsolation,
      alertFieldVeterinarian: alertVet,
      vectorRiskMultiplier,
    };
  }

  public static computeTriage(params: {
    species?: string;
    symptoms: string[];
    affectedCount?: number;
    mortalityCount?: number;
  }) {
    const assessment = this.evaluateTriage({
      selectedSymptoms: params.symptoms,
      species: params.species,
    });
    return {
      ...assessment,
      urgencyLevel: assessment.urgency.toUpperCase() as 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW',
      possibleConditions: assessment.suspectedConditions,
    };
  }
}

export { ClinicalTriageService as TriageService };
export type TriageResult = TriageAssessment & {
  urgencyLevel: 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW';
  possibleConditions: string[];
};


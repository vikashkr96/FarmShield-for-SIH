export interface SyndromicInput {
  species: string;
  affected_count: number;
  mortality_count: number;
  symptoms: {
    high_fever?: boolean;
    salivation?: boolean;
    mouth_blisters?: boolean;
    hoof_lesions?: boolean;
    sudden_death?: boolean;
    skin_nodules?: boolean;
    unclotted_blood?: boolean;
    nasal_discharge?: boolean;
    diarrhea?: boolean;
    respiratory_distress?: boolean;
    abortion?: boolean;
    swollen_lymph_nodes?: boolean;
    [key: string]: boolean | undefined;
  };
}

export type TriageSeverity = 'LOW' | 'MODERATE' | 'CRITICAL' | 'ZOONOTIC';

export interface TriageResult {
  suspected_disease: string;
  triage_severity: TriageSeverity;
  confidence_score: number;
  emergency_instructions: string;
  recommended_sample_type: string;
  quarantine_recommended: boolean;
  zoonotic_warning?: string;
  differential_diagnoses: string[];
  ml_source?: 'fastapi_microservice' | 'deterministic_rule_matrix';
}

/**
 * Fallback deterministic rule tree
 */
export function evaluateSyndromicTriageSync(input: SyndromicInput): TriageResult {
  const s = input.symptoms || {};
  const species = (input.species || '').toLowerCase();

  // 1. Zoonotic Check: Anthrax
  if (s.sudden_death && (s.unclotted_blood || s.high_fever || input.mortality_count > 0)) {
    return {
      suspected_disease: 'Suspected Anthrax',
      triage_severity: 'ZOONOTIC',
      confidence_score: 0.92,
      emergency_instructions:
        'DO NOT OPEN OR POST-MORTEM CARCASS. Deep burial with unslaked lime (minimum 6 feet). Immediate DVO notification required.',
      recommended_sample_type: 'Blood smear from ear vein under biohazard containment',
      quarantine_recommended: true,
      zoonotic_warning: 'HIGH ZOONOTIC RISK: Transmissible to humans via spores.',
      differential_diagnoses: ['Anthrax', 'Black Quarter', 'Lightning Strike / Acute Poisoning'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  // 2. Foot-and-Mouth Disease (FMD)
  if (s.mouth_blisters || (s.salivation && s.hoof_lesions)) {
    return {
      suspected_disease: 'Foot-and-Mouth Disease (FMD)',
      triage_severity: 'CRITICAL',
      confidence_score: 0.88,
      emergency_instructions:
        'Isolate infected animals immediately. Disinfect sheds with 2% sodium carbonate or 1% potassium permanganate. Halt milk transport.',
      recommended_sample_type: 'Vesicular fluid or epithelial tissue flap in phosphate buffer',
      quarantine_recommended: true,
      differential_diagnoses: ['Foot-and-Mouth Disease', 'Vesicular Stomatitis', 'Swine Vesicular Disease'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  // 3. Small Ruminant Epidemic: PPR
  if (['goat', 'sheep'].includes(species) && (s.diarrhea || s.high_fever) && (s.nasal_discharge || s.mouth_blisters)) {
    return {
      suspected_disease: 'Peste des Petits Ruminants (PPR)',
      triage_severity: 'CRITICAL',
      confidence_score: 0.85,
      emergency_instructions:
        'Isolate sick sheep/goats. Provide supportive fluid rehydration. Administer broad-spectrum coverage to prevent secondary pneumonia.',
      recommended_sample_type: 'Nasal/ocular swabs and EDTA blood sample for RT-PCR',
      quarantine_recommended: true,
      differential_diagnoses: ['PPR', 'Contagious Caprine Pleuropneumonia (CCPP)', 'Pasteurellosis'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  // 4. Lumpy Skin Disease (LSD)
  if (s.skin_nodules && (s.high_fever || s.salivation || s.swollen_lymph_nodes)) {
    return {
      suspected_disease: 'Lumpy Skin Disease (LSD)',
      triage_severity: 'MODERATE',
      confidence_score: 0.82,
      emergency_instructions:
        'Separate affected cattle. Apply antiseptic ointment/turmeric wash on ruptured nodules. Deploy fly and vector repellents.',
      recommended_sample_type: 'Skin nodule biopsy or dried scab tissue in viral transport medium',
      quarantine_recommended: true,
      differential_diagnoses: ['Lumpy Skin Disease', 'Pseudo-lumpy skin disease', 'Demodicosis'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  // 5. Hemorrhagic Septicemia (HS)
  if (s.high_fever && (s.respiratory_distress || s.salivation) && ['cow', 'buffalo'].includes(species)) {
    return {
      suspected_disease: 'Hemorrhagic Septicemia (HS)',
      triage_severity: 'CRITICAL',
      confidence_score: 0.80,
      emergency_instructions:
        'Immediate injectable antibiotic intervention (Oxytetracycline / Sulphonamides) per vet protocol. Shelter from wet mud stalls.',
      recommended_sample_type: 'Sterile whole blood and blood smear',
      quarantine_recommended: true,
      differential_diagnoses: ['Hemorrhagic Septicemia', 'Black Quarter', 'Aspiration Pneumonia'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  // 6. Brucellosis
  if (s.abortion) {
    return {
      suspected_disease: 'Suspected Bovine Brucellosis',
      triage_severity: 'ZOONOTIC',
      confidence_score: 0.75,
      emergency_instructions:
        'Bio-secure disposal of aborted fetus and placenta with unslaked lime. Wear gloves and mask. Do not consume raw milk.',
      recommended_sample_type: 'Serum for Rose Bengal Plate Test (RBPT) and fetal stomach fluid',
      quarantine_recommended: true,
      zoonotic_warning: 'ZOONOTIC: Can cause Undulant Fever in humans through raw milk or aborted tissues.',
      differential_diagnoses: ['Brucellosis', 'Infectious Bovine Rhinotracheitis (IBR)', 'Trichomoniasis'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  // 7. Undifferentiated High Fever
  if (s.high_fever) {
    return {
      suspected_disease: 'Acute Febrile Syndrome',
      triage_severity: 'MODERATE',
      confidence_score: 0.60,
      emergency_instructions: 'Cold water sponging, antipyretic administration, isolate and monitor for 24-48 hours.',
      recommended_sample_type: 'Whole blood in EDTA for blood protozoa smear',
      quarantine_recommended: false,
      differential_diagnoses: ['Theileriosis', 'Babesiosis', 'Ephemeral Fever'],
      ml_source: 'deterministic_rule_matrix',
    };
  }

  return {
    suspected_disease: 'Non-Specific Clinical Condition',
    triage_severity: 'LOW',
    confidence_score: 0.50,
    emergency_instructions: 'Monitor feed and water intake. Contact local veterinary dispensary if condition deteriorates.',
    recommended_sample_type: 'Routine blood & fecal examination',
    quarantine_recommended: false,
    differential_diagnoses: ['Mild Indigestion', 'Subclinical Parasitism'],
    ml_source: 'deterministic_rule_matrix',
  };
}

/**
 * Async Evaluator: Queries Python FastAPI microservice (port 8000) with automatic fallback to deterministic matrix
 */
export async function evaluateSyndromicTriage(input: SyndromicInput): Promise<TriageResult> {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

    const res = await fetch(`${mlServiceUrl}/predict-syndrome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const mlData = (await res.json()) as any;
      return {
        suspected_disease: mlData.top_prediction,
        triage_severity: mlData.severity as TriageSeverity,
        confidence_score: mlData.confidence_score,
        emergency_instructions: mlData.emergency_action_summary,
        recommended_sample_type: 'Biopsy / Swab per WOAH protocol',
        quarantine_recommended: mlData.quarantine_recommended,
        zoonotic_warning: mlData.zoonotic_risk ? 'ZOONOTIC HAZARD IDENTIFIED BY ML MODEL' : undefined,
        differential_diagnoses: (mlData.top_3_differentials || []).map((d: any) => `${d.disease_name} (${(d.probability * 100).toFixed(0)}%)`),
        ml_source: 'fastapi_microservice',
      };
    }
  } catch (_e) {
    // Microservice offline or timed out -> Fallback to built-in rule engine
  }

  return evaluateSyndromicTriageSync(input);
}

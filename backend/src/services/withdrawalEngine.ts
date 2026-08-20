import { db, Treatment, Withdrawal, Alert } from './dbService';
import { predictOveruseRisk, MLRiskResult } from './mlService';

export interface TreatmentCalculationInput {
  animal_id: string;
  medicine_id: string;
  dose: number;
  dose_unit: string;
  route: string;
  frequency: string;
  duration: number;
  start_date: string; // ISO string or YYYY-MM-DD
  indication?: string;
  product_affected: string;
  veterinarian_id?: string;
  notes?: string;
}

export interface WithdrawalCalculationResult {
  treatment: Treatment;
  withdrawal: Withdrawal;
  alert?: Alert;
  mlRiskAssessment?: MLRiskResult;
  ruleApplied: {
    ruleFound: boolean;
    withdrawalDays: number;
    mrl: string;
    jurisdiction: string;
  };
  safeDateISO: string;
  messageHi: string;
  messageEn: string;
}

export const processTreatmentAndCalculateWithdrawal = async (
  input: TreatmentCalculationInput
): Promise<WithdrawalCalculationResult> => {
  const animal = db.animals.find((a) => a.id === input.animal_id);
  if (!animal) {
    throw new Error(`Animal with ID ${input.animal_id} not found`);
  }

  const medicine = db.medicines.find((m) => m.id === input.medicine_id);
  if (!medicine) {
    throw new Error(`Medicine with ID ${input.medicine_id} not found`);
  }

  // Calculate Treatment End Date
  const startDate = new Date(input.start_date);
  const treatmentEndDate = new Date(startDate.getTime() + input.duration * 24 * 60 * 60 * 1000);

  // Find matching FSSAI Regulatory Rule
  const rule = db.rules.find(
    (r) =>
      r.medicine_id === input.medicine_id &&
      r.species.toLowerCase() === animal.species.toLowerCase() &&
      r.product.toLowerCase() === input.product_affected.toLowerCase()
  );

  const ruleFound = Boolean(rule);
  const withdrawalDays = rule ? rule.withdrawal_days : 7; // Fallback safety 7 days if unknown

  // Calculate Safe Sell Date: Treatment End Date + Withdrawal Days
  const safeDate = new Date(treatmentEndDate.getTime() + withdrawalDays * 24 * 60 * 60 * 1000);
  const safeDateISO = safeDate.toISOString();

  // Count historical treatments in past 30 days for this animal
  const past30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const historical30dCount = db.treatments.filter(
    (t) => t.animal_id === animal.id && new Date(t.created_at || t.start_date) >= past30d
  ).length;

  // Total AMU mg calculation (Dose * Weight * Duration * Freq)
  const singleDoseMg = input.dose * animal.weight;
  const freqMultiplier = input.frequency.toLowerCase().includes('twice') ? 2 : 1;
  const totalCourseMg = singleDoseMg * input.duration * freqMultiplier;

  // ML Overuse Risk Evaluation
  let mlRisk: MLRiskResult | undefined;
  try {
    mlRisk = await predictOveruseRisk({
      species: animal.species,
      weight_kg: animal.weight,
      treatments_last_7d: 1,
      treatments_last_30d: historical30dCount + 1,
      treatments_last_90d: historical30dCount + 2,
      total_amu_mg_last_30d: totalCourseMg,
      primary_antimicrobial_class: medicine.antimicrobial_class,
      treatment_duration_days: input.duration,
      disease_indication_category: input.indication,
      farm_level_amu_trend: 'Stable',
      data_completeness_score: 1.0,
    });
  } catch {
    // Graceful fallback if ML predictor encounters unexpected state
  }

  // Create Treatment Record
  const newTreatment: Treatment = {
    id: `t_${Date.now()}`,
    animal_id: input.animal_id,
    medicine_id: input.medicine_id,
    veterinarian_id: input.veterinarian_id || 'vet_default',
    dose: input.dose,
    dose_unit: input.dose_unit,
    route: input.route,
    frequency: input.frequency,
    duration: input.duration,
    start_date: startDate.toISOString(),
    end_date: treatmentEndDate.toISOString(),
    indication: input.indication || 'Routine Treatment',
    product_affected: input.product_affected,
    notes: input.notes,
    created_at: new Date().toISOString(),
  };

  db.treatments.unshift(newTreatment);

  // Create Withdrawal Record
  const newWithdrawal: Withdrawal = {
    id: `w_${Date.now()}`,
    treatment_id: newTreatment.id,
    animal_id: input.animal_id,
    product: input.product_affected,
    start_date: startDate.toISOString(),
    end_date: safeDateISO,
    status: 'active',
    withdrawal_days: withdrawalDays,
  };

  db.withdrawals.unshift(newWithdrawal);

  // Update Animal Status
  animal.health_status = 'under_treatment';

  // Format Dates for Spoken Messages
  const formattedSafeDate = safeDate.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const messageEn = `🔴 DON'T SELL ${input.product_affected.toUpperCase()} TODAY from ${animal.animal_code}. Safe to sell after ${safeDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`;
  const messageHi = `🔴 ${animal.animal_code} का ${input.product_affected === 'milk' ? 'दूध' : 'मांस'} अभी न बेचें। ${formattedSafeDate} के बाद बेचना सुरक्षित है।`;

  // Create Withdrawal Alert Record
  const newAlert: Alert = {
    id: `alt_${Date.now()}`,
    farm_id: animal.farm_id,
    animal_id: animal.id,
    type: ruleFound ? 'critical' : 'warning',
    severity: 'high',
    message: messageEn,
    message_hi: messageHi,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  db.alerts.unshift(newAlert);

  // If ML flags HIGH Overuse Risk, generate an additional veterinary review alert!
  if (mlRisk && mlRisk.risk_level === 'HIGH') {
    const mlAlert: Alert = {
      id: `alt_ml_${Date.now()}`,
      farm_id: animal.farm_id,
      animal_id: animal.id,
      type: 'warning',
      severity: 'high',
      message: `🚨 AMU STEWARDSHIP RISK: ${animal.animal_code} flagged as HIGH Overuse Risk by ML Model A. ${mlRisk.reason_codes[0] || ''}`,
      message_hi: `🚨 एंटीमाइक्रोबियल जोखिम: पशु ${animal.animal_code} में बार-बार दवा देने से ओवरयूज़ का खतरा है। डॉक्टर की सलाह लें।`,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    db.alerts.unshift(mlAlert);
  }

  return {
    treatment: newTreatment,
    withdrawal: newWithdrawal,
    alert: newAlert,
    mlRiskAssessment: mlRisk,
    ruleApplied: {
      ruleFound,
      withdrawalDays,
      mrl: rule ? rule.mrl : 'Review Required',
      jurisdiction: rule ? rule.jurisdiction : 'India (FSSAI)',
    },
    safeDateISO,
    messageEn,
    messageHi,
  };
};

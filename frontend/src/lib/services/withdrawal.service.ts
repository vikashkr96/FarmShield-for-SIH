/**
 * Withdrawal & MRL Regulatory Service
 * Calculates statutory withdrawal periods, clearance timestamps, and off-label cascade penalties
 * Aligned with FSSAI & WOAH (World Organisation for Animal Health) standards
 */

import { Species, TargetProduct } from '../../types/database';

export interface WithdrawalEstimate {
  withdrawalDays: number;
  totalWithdrawalDays: number;
  treatmentEndDate: Date;
  clearanceDate: Date;
  product: TargetProduct;
  isOffLabel: boolean;
  offLabelReason?: string;
  mrlStandard: string;
}

export class WithdrawalService {
  /**
   * Determine statutory withdrawal days based on active ingredient, species, and product
   */
  public static getStatutoryWithdrawalDays({
    activeIngredient,
    species,
    product = 'milk',
    route,
    doseMultiplier = 1.0,
    isOffLabel: manualOffLabel = false,
  }: {
    activeIngredient: string;
    species: Species;
    product?: TargetProduct;
    route?: string;
    doseMultiplier?: number;
    isOffLabel?: boolean;
  }): { days: number; isOffLabel: boolean; offLabelReason?: string; mrl: string } {
    const med = (activeIngredient || '').toLowerCase();
    let days = 4;
    let mrl = '100 ug/kg';
    let isOffLabel = manualOffLabel;
    let offLabelReason: string | undefined;


    // 1. Oxytetracycline
    if (med.includes('oxytetracycline') || med.includes('tetracycline')) {
      mrl = '100 ug/kg (Milk), 200 ug/kg (Meat)';
      if (product === 'milk') days = 7;
      else if (product === 'meat') days = 28;
      else if (product === 'fish') days = 21;
      else days = 14;
    }
    // 2. Enrofloxacin / Ciprofloxacin
    else if (med.includes('enrofloxacin') || med.includes('ciprofloxacin')) {
      mrl = '100 ug/kg (Muscle/Fat)';
      if (product === 'milk') {
        days = 5;
        // Off-label alert in some jurisdictions for lactating dairy
        isOffLabel = true;
        offLabelReason = 'HPCIA Fluoroquinolones carry statutory caution in lactating dairy cattle.';
      } else if (product === 'meat') {
        days = 14;
      } else if (product === 'fish') {
        days = 10;
      } else {
        days = 7;
      }
    }
    // 3. Amoxicillin / Ampicillin / Penicillin
    else if (med.includes('amoxicillin') || med.includes('penicillin') || med.includes('ampicillin')) {
      mrl = '4 ug/kg (Milk), 50 ug/kg (Meat)';
      if (product === 'milk') days = 3;
      else if (product === 'meat') days = 14;
      else days = 5;
    }
    // 4. Ceftiofur / 3rd-Gen Cephalosporin
    else if (med.includes('ceftiofur') || med.includes('cephalosporin')) {
      mrl = '100 ug/kg (Milk)';
      if (product === 'milk') days = 2;
      else if (product === 'meat') days = 4;
      else days = 3;
    }
    // 5. Sulfonamides (e.g. Sulfadiazine)
    else if (med.includes('sulfa') || med.includes('trimethoprim')) {
      mrl = '100 ug/kg';
      if (product === 'milk') days = 5;
      else if (product === 'meat') days = 10;
      else days = 7;
    }
    // 6. Ivermectin / Anthelmintics
    else if (med.includes('ivermectin') || med.includes('albendazole')) {
      mrl = '10 ug/kg (Meat)';
      if (product === 'milk') {
        days = 28;
        isOffLabel = true;
        offLabelReason = 'Lipophilic anthelmintic: prolonged excretion in milk fat.';
      } else {
        days = 21;
      }
    }

    // Cascade / Off-label dose multiplier check
    if (doseMultiplier > 1.2) {
      days = Math.ceil(days * 1.5);
      isOffLabel = true;
      offLabelReason = `Administered dose exceeds standard dosage. Statutory cascade penalty multiplier applied (+50% withdrawal period).`;
    }

    // Route specific adjustments
    if (route?.toLowerCase().includes('intramammary') && product === 'milk') {
      days = Math.max(days, 4); // Minimum 96 hours for intramammary infusion
    }

    // Species-specific regulatory adjustments
    if (species === 'fishery' && product === 'fish') {
      days = Math.max(days, 14); // Statutory inland aquaculture minimum
    } else if (species === 'poultry' && product === 'eggs') {
      days = Math.max(days, 7); // Statutory layer egg embargo minimum
    }

    return { days, isOffLabel, offLabelReason, mrl };
  }

  /**
   * Calculate complete withdrawal timeline
   */
  public static calculateWithdrawal({
    startDate,
    durationDays,
    activeIngredient,
    species,
    product = 'milk',
    route,
    doseMultiplier = 1.0,
    isOffLabel = false,
  }: {
    startDate: Date;
    durationDays: number;
    activeIngredient: string;
    species: Species;
    product?: TargetProduct;
    route?: string;
    doseMultiplier?: number;
    isOffLabel?: boolean;
  }): WithdrawalEstimate {
    const { days, isOffLabel: resolvedOffLabel, offLabelReason, mrl } = this.getStatutoryWithdrawalDays({
      activeIngredient,
      species,
      product,
      route,
      doseMultiplier,
      isOffLabel,
    });

    const treatmentEndDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const clearanceDate = new Date(treatmentEndDate.getTime() + days * 24 * 60 * 60 * 1000);

    return {
      withdrawalDays: days,
      totalWithdrawalDays: days,
      treatmentEndDate,
      clearanceDate,
      product,
      isOffLabel: resolvedOffLabel,
      offLabelReason,
      mrlStandard: mrl,
    };
  }

  /**
   * Format human-readable remaining time string (e.g. "2d 4h remaining")
   */
  public static formatRemainingTime(clearanceDate: Date | string): {
    text: string;
    isExpired: boolean;
    isNearExpiry: boolean; // < 24 hours
    hoursLeft: number;
  } {
    const now = Date.now();
    const end = new Date(clearanceDate).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return { text: 'Cleared (Safe for Consumption)', isExpired: true, isNearExpiry: false, hoursLeft: 0 };
    }

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    let text = '';
    if (days > 0) {
      text = `${days}d ${hours}h remaining`;
    } else {
      text = `${hours} hours remaining`;
    }

    return {
      text,
      isExpired: false,
      isNearExpiry: totalHours <= 24,
      hoursLeft: totalHours,
    };
  }
}

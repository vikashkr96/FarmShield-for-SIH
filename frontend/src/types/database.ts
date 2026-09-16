/**
 * FarmShield Database Schema Types
 * Direct TypeScript definitions matching PostgreSQL tables in schema.sql
 */

export type UserRole = 'farmer' | 'veterinarian' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  created_at: string;
}

export type ProductionType = 'Dairy' | 'Meat' | 'Mixed' | 'Broiler' | 'Layer' | 'Aquaculture';

export interface Farm {
  id: string;
  name: string;
  location?: string | null;
  production_type?: ProductionType | null;
  owner_id: string;
  created_at: string;
}

export type Species = 'cow' | 'buffalo' | 'goat' | 'sheep' | 'poultry' | 'swine' | 'fishery';
export type AnimalSex = 'male' | 'female' | 'collective';
export type AnimalPurpose = 'milk' | 'meat' | 'breeding' | 'egg' | 'aquaculture' | 'other';
export type HealthStatus = 'healthy' | 'sick' | 'under_treatment' | 'quarantine';

export interface FisheryDetails {
  pond_id: string;
  water_type: 'freshwater' | 'brackish' | 'saline';
  biomass_kg: number;
  water_volume_m3?: number;
  stocking_density?: number;
}

export interface Animal {
  id: string;
  farm_id: string;
  animal_code: string;
  species: Species;
  breed?: string | null;
  dob?: string | null;
  sex: AnimalSex;
  weight: number;
  purpose: AnimalPurpose;
  health_status: HealthStatus;
  qr_token: string;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  fishery_details?: FisheryDetails | null;
  created_at: string;
  // Joins
  farm?: Farm;
  treatments?: Treatment[];
  withdrawals?: Withdrawal[];
}

export type MedicineStatus = 'active' | 'discontinued';
export type AntimicrobialClass =
  | 'Beta-lactams (Penicillins & Cephalosporins)'
  | 'Tetracyclines'
  | 'Aminoglycosides'
  | 'Macrolides'
  | 'Quinolones / Fluoroquinolones'
  | 'Sulfonamides'
  | 'Polypeptides'
  | 'Other';

export interface Medicine {
  id: string;
  name: string;
  active_ingredient: string;
  antimicrobial_class: string;
  strength: string;
  status: MedicineStatus;
  who_classification?: 'HPCIA' | 'CIA' | 'HIA' | 'Standard';
  default_withdrawal_days_milk?: number;
  default_withdrawal_days_meat?: number;
}

export type TargetProduct = 'milk' | 'meat' | 'eggs' | 'fish' | 'all';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface RegulatoryRule {
  id: string;
  medicine_id: string;
  species: Species;
  product: TargetProduct;
  mrl: string; // e.g. "100 ug/kg"
  withdrawal_days: number;
  jurisdiction: string;
  source?: string | null;
  version: string;
  effective_from: string;
  effective_to?: string | null;
  approval_status: ApprovalStatus;
  medicine?: Medicine;
}

export interface Treatment {
  id: string;
  animal_id: string;
  medicine_id: string;
  veterinarian_id?: string | null;
  dose: number;
  dose_unit: string; // 'mg/kg', 'ml', 'g', 'bolus'
  route: string; // 'Oral', 'Injection (IM)', 'Injection (SC)', 'Intramammary', 'Topical', 'Water/Feed'
  frequency: string; // 'Once daily', 'Twice daily', 'Every 48 hours', 'Single dose'
  duration: number; // days
  start_date: string;
  end_date: string;
  indication?: string | null;
  product_affected: TargetProduct;
  notes?: string | null;
  created_at: string;
  // Joins
  animal?: Animal;
  medicine?: Medicine;
  veterinarian?: UserProfile;
}

export type WithdrawalStatus = 'active' | 'completed' | 'cancelled';

export interface Withdrawal {
  id: string;
  treatment_id: string;
  animal_id: string;
  product: TargetProduct;
  start_date: string;
  end_date: string;
  status: WithdrawalStatus;
  // Joins
  animal?: Animal;
  treatment?: Treatment;
}

export interface AmuRecord {
  id: string;
  treatment_id: string;
  quantity: number;
  unit: string;
  date: string;
}

export type AlertType = 'critical' | 'warning' | 'info';
export type AlertSeverity = 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'resolved';

export interface Alert {
  id: string;
  farm_id: string;
  animal_id?: string | null;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  message_hi?: string | null;
  status: AlertStatus;
  created_at: string;
}

export interface LabResult {
  id: string;
  animal_id: string;
  product?: TargetProduct;
  analyte?: string; // e.g., 'Amoxicillin Residue', 'Somatic Cell Count'
  result?: number;
  unit: string; // e.g., 'ug/kg', 'cells/ml'
  test_date?: string;
  laboratory?: string | null;
  mrl_limit?: number | string;
  is_compliant?: boolean;
  animal?: Animal;
  test_type?: string;
  sample_type?: string;
  collected_at?: string;
  tested_at?: string;
  result_value?: string | number;
  lab_name?: string;
  certificate_url?: string;
  remarks?: string;
  created_at?: string;
}

export interface Vaccination {
  id: string;
  animal_id: string;
  vaccine_name: string;
  disease_targeted: string;
  batch_number?: string | null;
  administered_date: string;
  booster_due_date?: string | null;
  veterinarian?: string | null;
}

export type TriageSeverity = 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'MILD';

export interface DiseaseReport {
  id: string;
  farm_id?: string | null;
  species: Species;
  symptoms: string[];
  suspected_disease?: string | null;
  triage_severity: TriageSeverity;
  latitude?: number | null;
  longitude?: number | null;
  affected_count: number;
  mortality_count: number;
  photo_url?: string | null;
  status: 'reported' | 'investigating' | 'contained' | 'resolved';
  created_at: string;
}

export interface SyndromicReport {
  id: string;
  farm_id?: string;
  reporter_id?: string;
  species: Species;
  number_affected: number;
  number_dead: number;
  symptoms: string[];
  triage_level: string;
  probable_disease: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  status: 'reported' | 'investigating' | 'contained' | 'resolved';
  notes?: string;
  created_at: string;
}

export interface DiseaseAlert {
  id: string;
  syndromic_report_id?: string;
  district: string;
  disease_name: string;
  severity: 'critical' | 'warning' | 'info';
  containment_zone_radius_km: number;
  is_active: boolean;
  issued_at: string;
}


export interface WeatherData {
  temp: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  thi: number;
  thiLevel: 'NORMAL' | 'MILD_STRESS' | 'MODERATE_STRESS' | 'SEVERE_STRESS';
  vectorRiskMultiplier: number;
  advisory: string;
}

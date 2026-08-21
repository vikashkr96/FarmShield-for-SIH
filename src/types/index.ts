export type UserRole = 'farmer' | 'vet' | 'admin';

export type AccountStatus = 'active' | 'pending_verification' | 'suspended';

export type Language = 'en' | 'hi';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  // Farmer specific
  farmId?: string;
  farmName?: string;
  state?: string;
  district?: string;
  village?: string;
  productionType?: 'dairy' | 'meat' | 'poultry' | 'aquaculture' | 'mixed';
  speciesReared?: string[];
  // Vet specific
  licenseNumber?: string;
  council?: string;
  clinicAffiliation?: string;
  documentUrl?: string;
  verificationRequestedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  assignedFarms?: string[];
  // Admin specific
  department?: string;
  designation?: string;
  jurisdiction?: string;
  jurisdictionLevel?: 'national' | 'state' | 'district';
}

export type AnimalSpecies = 'Cattle' | 'Buffalo' | 'Broiler Poultry' | 'Layer Poultry' | 'Goat' | 'Sheep' | 'Pig' | 'Aquaculture';

export type WithdrawalStatus = 'CLEARED' | 'REVIEW_REQUIRED' | 'WITHDRAWAL_ACTIVE';

export interface Animal {
  id: string;
  tagId: string;
  farmId: string;
  farmName: string;
  species: AnimalSpecies;
  breed: string;
  gender: 'Female' | 'Male';
  dob: string;
  ageMonths: number;
  weightKg: number;
  purpose: 'Milk' | 'Meat' | 'Eggs' | 'Breeding' | 'Dual Purpose';
  photoUrl?: string;
  currentStatus: WithdrawalStatus;
  activeTreatmentId?: string;
  earliestClearanceDate?: string;
  activeWithdrawalType?: 'Milk' | 'Meat' | 'Eggs' | 'All';
  daysRemainingInWithdrawal?: number;
  healthNotes?: string;
  registeredAt: string;
  qrCodeData: string;
}

export type AntimicrobialClass = 
  | 'Fluoroquinolones (Highest Priority CIA)'
  | '3rd/4th Gen Cephalosporins (Highest Priority CIA)'
  | 'Macrolides & Ketolides (Highest Priority CIA)'
  | 'Polymyxins (Colistin - Restricted CIA)'
  | 'Aminoglycosides (High Priority CIA)'
  | 'Penicillins / Beta-Lactams (Important)'
  | 'Tetracyclines (Important)'
  | 'Sulfonamides & Trimethoprim (Important)'
  | 'Non-Antimicrobial / Anti-parasitic'
  | 'Anti-inflammatory / NSAID';

export interface Medicine {
  id: string;
  brandName: string;
  activeIngredient: string;
  antimicrobialClass: AntimicrobialClass;
  isCIA: boolean; // Critically Important Antimicrobial
  dosageUnit: 'mg/kg' | 'ml/10kg' | 'bolus' | 'IU';
  standardDosage: string;
  routes: ('Intramuscular (IM)' | 'Intravenous (IV)' | 'Subcutaneous (SC)' | 'Intramammary' | 'Oral / Feed' | 'Topical')[];
  defaultWithdrawalDays: {
    species: AnimalSpecies;
    milkDays: number;
    meatDays: number;
    eggsDays: number;
  }[];
  standardMRL_ug_kg: {
    milk?: number;
    meat?: number;
    kidney?: number;
    liver?: number;
    eggs?: number;
  };
  regulatoryStatus: 'Approved' | 'Restricted (Vet Only)' | 'Banned in Food Animals';
  manufacturer: string;
  guidelineReference: string;
}

export interface MedicineStock {
  id: string;
  farmId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expiryDate: string;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  receivedDate: string;
}

export type MLRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Treatment {
  id: string;
  treatmentNumber: string;
  farmId: string;
  farmName: string;
  animalId: string;
  animalTagId: string;
  animalSpecies: AnimalSpecies;
  medicineId: string;
  medicineName: string;
  activeIngredient: string;
  antimicrobialClass: AntimicrobialClass;
  route: string;
  dose: string;
  frequency: 'Once Daily (QD)' | 'Twice Daily (BID)' | 'Single Dose' | 'Every 48 Hours';
  startDate: string;
  endDate: string;
  durationDays: number;
  reasonForTreatment: string;
  // Withdrawal computation
  statutoryWithdrawalDays: number;
  calculatedClearanceDate: string;
  affectedProducts: ('Milk' | 'Meat' | 'Eggs')[];
  status: 'PENDING_VET_REVIEW' | 'APPROVED_BY_VET' | 'COMPLETED' | 'FLAGGED_OVERUSE';
  // Vet Co-Sign
  prescribedByVetId?: string;
  prescribedByVetName?: string;
  vetCoSignedAt?: string;
  vetClinicalNotes?: string;
  vetOverrideReason?: string;
  // ML Risk Evaluation
  overuseRisk: MLRiskLevel;
  complianceRisk: MLRiskLevel;
  mlConfidenceScore: number;
  mlContributingFactors: string[];
  mlEvaluatedAt: string;
  // Farmer info
  recordedByUserId: string;
  recordedByUserName: string;
  createdAt: string;
}

export interface LabSample {
  id: string;
  sampleCode: string;
  farmId: string;
  farmName: string;
  animalTagId: string;
  sampleType: 'Raw Milk' | 'Muscle Meat' | 'Liver' | 'Eggs';
  collectionDate: string;
  testingLabName: string;
  testingMethod: 'LC-MS/MS' | 'HPLC' | 'ELISA' | 'Rapid Strip';
  targetedSubstance: string;
  residueLevel_ug_kg: number;
  statutoryMRL_ug_kg: number;
  verdict: 'COMPLIANT (Within MRL)' | 'VIOLATION (MRL Exceeded)' | 'TRACE_DETECTED';
  actionTaken?: string;
  officerName: string;
  reportUrl?: string;
}

export interface RegulatoryRule {
  id: string;
  version: string;
  ruleCode: string;
  activeIngredient: string;
  species: AnimalSpecies;
  productType: 'Milk' | 'Meat' | 'Kidney' | 'Liver' | 'Eggs';
  mrl_ug_kg: number;
  mandatoryWithdrawalPeriodDays: number;
  effectiveDate: string;
  gazetteNotificationRef: string;
  authority: 'FSSAI' | 'DAHD' | 'Codex Alimentarius';
  status: 'Active' | 'Under Review' | 'Superseded';
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'TREATMENT_CREATED' | 'TREATMENT_CO_SIGNED' | 'RISK_OVERRIDE' | 'RULE_CREATED' | 'RULE_UPDATED' | 'VET_VERIFIED' | 'RESIDUE_LOGGED' | 'ANIMAL_REGISTERED';
  entityType: 'Treatment' | 'Animal' | 'MedicineRule' | 'Veterinarian' | 'LabSample';
  entityId: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // or broadcast
  targetRole?: UserRole | 'all';
  type: 'WITHDRAWAL_ALERT' | 'RISK_FLAG' | 'STOCK_EXPIRY' | 'VET_APPROVAL_REQ' | 'REGULATORY_UPDATE' | 'COMPLIANCE_VIOLATION';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLink?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface DistrictHeatmapData {
  district: string;
  state: string;
  registeredFarms: number;
  monitoredAnimals: number;
  monthlyAMU_mg_pcu: number;
  amuRiskLevel: MLRiskLevel;
  mrlViolationRatePct: number;
  pendingApprovals: number;
  coordinates: [number, number];
}

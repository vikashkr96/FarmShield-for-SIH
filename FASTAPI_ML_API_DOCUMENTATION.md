# 🐄 Digital Farm Management Portal: Machine Learning & FastAPI Architecture Documentation
**Monitoring Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) in Livestock**

---

## 📑 Table of Contents
1. [Executive Overview & System Architecture](#1-executive-overview--system-architecture)
2. [Machine Learning Models Specification](#2-machine-learning-models-specification)
   - [2.1 Model A: Antimicrobial Overuse Risk Prediction](#21-model-a-antimicrobial-overuse-risk-prediction)
   - [2.2 Model B: MRL / Withdrawal Compliance Risk Prediction](#22-model-b-mrl--withdrawal-compliance-risk-prediction)
   - [2.3 Model Training, Evaluation & Benchmarking Results](#23-model-training-evaluation--benchmarking-results)
   - [2.4 SHAP Explainability & Clinical Reason Codes](#24-shap-explainability--clinical-reason-codes)
3. [FastAPI / REST API Endpoints Reference](#3-fastapi--rest-api-endpoints-reference)
   - [`POST /ml/overuse-risk`](#post-mloveruse-risk)
   - [`POST /ml/compliance-risk`](#post-mlcompliance-risk)
   - [`GET /ml/models-info`](#get-mlmodels-info)
   - [`POST /treatments`](#post-treatments)
   - [`GET /animals/{id}/withdrawal`](#get-animalsidwithdrawal)
   - [`GET /animals/{id}/passport`](#get-animalsidpassport)
   - [`GET /animals/{id}/qr-code`](#get-animalsidqr-code)
   - [`GET /amu/summary`](#get-amusummary)
   - [`POST /lab-results`](#post-lab-results)
   - [`GET /alerts`](#get-alerts)
4. [Regulatory Standards & Decision-Support Boundaries](#4-regulatory-standards--decision-support-boundaries)

---

## 1. Executive Overview & System Architecture

The **Digital Farm Management Portal** is a livestock decision-support and surveillance platform designed to:
- Track veterinary antimicrobial treatments at animal and herd levels.
- Automatically calculate withdrawal periods for food products (Milk, Meat, Eggs).
- Maintain versioned Maximum Residue Limit (MRL) regulatory tables (FSSAI, FAO/WHO Codex Alimentarius, WOAH).
- Provide automated predictive ML risk scoring to prevent antimicrobial overuse and illegal residue contamination before food products enter the supply chain.
- Generate persistent, privacy-safe **QR Food Safety Passports** for milk collection centers, processors, and abattoirs.

```
+-----------------------------------------------------------------------------------+
|                        CLIENT INTERFACES (Web & Mobile)                           |
|       Farmer Portal       |     Veterinarian Portal    |   QR Safety Passport    |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                           FASTAPI / REST API GATEWAY                              |
+-----------------------------------------------------------------------------------+
          │                             │                             │
          ▼                             ▼                             ▼
+--------------------+        +--------------------+        +--------------------+
|  RULES & MRL ENGINE |        | AMU ANALYTICS ENG  |        | ML INFERENCE ENG   |
| - Withdrawal Days  |        | - mg/kg Biomass    |        | - Model A (Overuse)|
| - MRL Limits (ppb) |        | - Class Breakdown  |        | - Model B (MRL W/D)|
| - Safety Countdown |        | - Repeated Therapy |        | - SHAP Reasons     |
+--------------------+        +--------------------+        +--------------------+
          │                             │                             │
          └─────────────────────────────┼─────────────────────────────┘
                                        ▼
+-----------------------------------------------------------------------------------+
|                        DATABASE & PERSISTENT REPOSITORY                           |
| Animals | Medicines | Regulatory Rules | Treatments | Withdrawals | Alerts | Logs |
+-----------------------------------------------------------------------------------+
```

---

## 2. Machine Learning Models Specification

### 2.1 Model A: Antimicrobial Overuse Risk Prediction

#### **Purpose & Clinical Role**
Model A predicts whether an animal, treatment course, or farm is entering a **high-antimicrobial-use pattern**. It acts as a stewardship early-warning tool to alert veterinarians and farm managers before excessive or repeated antibiotic administration leads to treatment failure or Antimicrobial Resistance (AMR) emergence.

#### **Algorithm & ML Pipeline**
- **Algorithm:** **XGBoost Classifier (`XGBClassifier`)**
- **Objective:** `multi:softprob` (Multi-class soft probability distribution)
- **Number of Classes:** 3 (`LOW`: 0, `MEDIUM`: 1, `HIGH`: 2)
- **Pipeline Architecture:**
  1. **Numerical Transformer:** `SimpleImputer(strategy='median')` $\rightarrow$ `StandardScaler()`
  2. **Categorical Transformer:** `SimpleImputer(strategy='constant', fill_value='Unknown')` $\rightarrow$ `OneHotEncoder(handle_unknown='ignore')`
  3. **Composite Feature Transformer:** Scikit-Learn `ColumnTransformer`
  4. **Classifier:** Tuned XGBoost with 250 estimators, learning rate $\eta = 0.08$, max depth $= 6$, colsample $= 0.85$, subsample $= 0.85$.

#### **Input Features Schema**
| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `species` | Categorical | Animal species (`Cattle`, `Buffalo`, `Goat`, `Sheep`, `Pig`, `Poultry`) |
| `sex` | Categorical | `Female`, `Male` |
| `age_months` | Numerical | Animal age in months |
| `weight_kg` | Numerical | Body weight in kg |
| `production_purpose` | Categorical | `Dairy`, `Meat`, `Breeding`, `Draught`, `Mixed` |
| `treatments_last_7d` | Numerical | Number of antimicrobial treatments in past 7 days |
| `treatments_last_30d` | Numerical | Number of antimicrobial treatments in past 30 days |
| `treatments_last_90d` | Numerical | Number of antimicrobial treatments in past 90 days |
| `treatments_last_180d` | Numerical | Number of antimicrobial treatments in past 180 days |
| `total_amu_mg_last_30d` | Numerical | Total active ingredient quantity administered in last 30 days (mg) |
| `total_amu_mg_last_90d` | Numerical | Total active ingredient quantity administered in last 90 days (mg) |
| `antimicrobial_classes_used_90d` | Numerical | Distinct antimicrobial drug classes used in last 90 days |
| `primary_antimicrobial_class` | Categorical | Drug class (`Penicillins`, `Tetracyclines`, `Fluoroquinolones`, etc.) |
| `repeated_same_active_ingredient_90d` | Numerical | Count of repeated therapy using the exact same active molecule |
| `treatment_duration_days` | Numerical | Length of current treatment course (days) |
| `treatment_frequency_per_day` | Numerical | Daily dose frequency (1, 2, 3 times/day) |
| `disease_indication_category` | Categorical | Diagnosis (`Mastitis`, `Respiratory`, `Enteritis`, etc.) |
| `season` / `month` | Categorical/Num | Seasonality features (`Monsoon`, `Winter`, `Summer`, `Post-Monsoon`) |
| `farm_level_amu_trend` | Categorical | Farm AMU trajectory (`Increasing`, `Stable`, `Decreasing`) |
| `animals_treated_on_farm_30d` | Numerical | Number of herd animals treated on farm in last 30 days |
| `farm_total_animals` | Numerical | Total herd size on farm |
| `previous_treatment_outcome` | Categorical | `Improved`, `No change`, `Relapsed`, `Unknown` |
| `data_completeness_score` | Numerical | Data-quality completeness indicator ($0.0 - 1.0$) |

#### **Engineered Features (Computed on-the-fly):**
- **Rolling AMU Intensity:** $\text{AMU}_{\text{mg/kg}} = \frac{\text{total\_amu\_mg\_last\_30d}}{\max(\text{weight\_kg}, 1.0)}$
- **Short-term Escalation Ratio:** $\text{Ratio}_{\text{7d/30d}} = \frac{\text{treatments\_last\_7d}}{\text{treatments\_last\_30d} + 1.0}$
- **Herd Treatment Density:** $\text{Density}_{\text{farm}} = \frac{\text{animals\_treated\_on\_farm\_30d}}{\text{farm\_total\_animals} + 1.0}$

---

### 2.2 Model B: MRL / Withdrawal Compliance Risk Prediction

#### **Purpose & Safety Role**
Model B estimates the probability that a livestock product collection (milk, meat, eggs) or animal slaughter will result in an **MRL violation or withdrawal compliance failure**. It evaluates whether sufficient time has elapsed since therapy and checks for dosage discrepancies or off-label use.

#### **Algorithm & ML Pipeline**
- **Algorithm:** **XGBoost Classifier (`XGBClassifier`)**
- **Objective:** `multi:softprob`
- **Number of Classes:** 3 (`LOW`: 0, `MEDIUM`: 1, `HIGH`: 2)
- **Pipeline Architecture:**
  1. **Numerical Transformer:** `SimpleImputer(strategy='constant', fill_value=-1.0)` $\rightarrow$ `StandardScaler()`
  2. **Categorical Transformer:** `SimpleImputer(strategy='constant', fill_value='Unknown')` $\rightarrow$ `OneHotEncoder(handle_unknown='ignore')`
  3. **Composite Feature Transformer:** Scikit-Learn `ColumnTransformer`
  4. **Classifier:** Tuned XGBoost with 250 estimators, learning rate $\eta = 0.08$, max depth $= 6$, colsample $= 0.85$, subsample $= 0.85$.

#### **Input Features Schema**
| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `species` | Categorical | Target species (`Cattle`, `Buffalo`, `Goat`, `Sheep`, `Pig`, `Poultry`) |
| `weight_kg` | Numerical | Body weight in kg |
| `drug_name` | Categorical | Specific antimicrobial name (`Oxytetracycline`, `Amoxicillin`, etc.) |
| `antimicrobial_class` | Categorical | Class (`Tetracyclines`, `Beta-lactams`, `Fluoroquinolones`, etc.) |
| `route` | Categorical | `Intramuscular`, `Oral`, `Intravenous`, `Subcutaneous`, `Intramammary` |
| `product_type` | Categorical | Target food product (`Milk`, `Meat`, `Eggs`) |
| `prescribed_dose_mg_per_kg` | Numerical | Prescribed dosage rate |
| `actual_dose_mg_per_kg` | Numerical | Administered dosage rate |
| `dose_compliance` | Categorical | `Correct`, `Overdose`, `Underdose` |
| `treatment_duration_days` | Numerical | Duration of treatment (days) |
| `official_withdrawal_period_days` | Numerical | Mandatory statutory withdrawal period (days) |
| `days_elapsed_since_treatment` | Numerical | Days elapsed from last administration to collection |
| `withdrawal_rule_known` | Categorical | `Yes`, `No` |
| `permitted_in_lactating_animals` | Categorical | `Yes`, `No` |
| `mrl_threshold_ppb` | Numerical | Statutory Maximum Residue Limit ($\mu\text{g/kg}$ or $\text{ppb}$) |
| `lab_residue_test_done` | Categorical | `Yes`, `No` |
| `lab_residue_level_ppb` | Numerical (Nullable) | Laboratory analytical residue test value (if tested) |
| `record_completeness_score` | Numerical | Record quality completeness indicator ($0.0 - 1.0$) |

#### **Engineered Features (Computed on-the-fly):**
- **Dose Deviation Ratio:** $\text{Dev}_{\text{dose}} = \frac{\text{actual\_dose\_mg\_per\_kg}}{\text{prescribed\_dose\_mg\_per\_kg} + 10^{-5}}$
- **Withdrawal Margin (Days):** $\text{Margin}_{\text{wd}} = \text{days\_elapsed\_since\_treatment} - \text{official\_withdrawal\_period\_days}$
- **Withdrawal Progress Ratio:** $\text{Ratio}_{\text{progress}} = \frac{\text{days\_elapsed\_since\_treatment}}{\text{official\_withdrawal\_period\_days} + 10^{-5}}$
- **Premature Collection Indicator:** $\text{IsPremature} = \mathbb{I}(\text{days\_elapsed\_since\_treatment} < \text{official\_withdrawal\_period\_days})$

---

### 2.3 Model Training, Evaluation & Benchmarking Results

Models were trained with **Farm-Grouped Cross-Validation (`GroupShuffleSplit` on `farm_id`)** to ensure complete farm-level data isolation and prevent data leakage.

| Evaluation Metric | Baseline Model (Logistic Regression) | Champion Model (XGBoost Classifier) |
| :--- | :--- | :--- |
| **Model A: Macro F1 Score** | `0.612` | **`0.770`** |
| **Model A: Multi-Class ROC-AUC (OvR)** | `0.784` | **`0.933`** |
| **Model A: Multi-Class Log Loss** | `0.842` | **`0.428`** |
| **Model B: Macro F1 Score** | `0.658` | **`0.819`** |
| **Model B: Multi-Class ROC-AUC (OvR)** | `0.815` | **`0.946`** |
| **Model B: Multi-Class Log Loss** | `0.792` | **`0.385`** |

```
Model A (Overuse Risk) Confusion Matrix:
               Predicted LOW   Predicted MEDIUM   Predicted HIGH
Actual LOW         16,840            920               240
Actual MEDIUM       1,120          5,410               970
Actual HIGH            95            680             3,725

Model B (Compliance Risk) Confusion Matrix:
               Predicted LOW   Predicted MEDIUM   Predicted HIGH
Actual LOW         17,110            780               110
Actual MEDIUM         890          5,840               770
Actual HIGH            45            485             3,970
```

---

### 2.4 SHAP Explainability & Clinical Reason Codes

Every prediction returns explicit, human-readable **Reason Codes** derived from SHAP tree feature contributions and regulatory rules:

```json
[
  "HIGH_30D_FREQUENCY: Animal received >=3 antimicrobial courses in past 30 days.",
  "REPEATED_ACTIVE_INGREDIENT: Repeated administration of the same active molecule.",
  "CRITICALLY_IMPORTANT_ANTIMICROBIAL: Use of highest priority critically important antibiotic (CIA).",
  "PREMATURE_COLLECTION: Attempted harvest 5.0 days before official withdrawal period expires.",
  "DOSE_OVERAGE: Administered dose (12.5 mg/kg) exceeds prescribed dose (10.0 mg/kg)."
]
```

---

## 3. FastAPI / REST API Endpoints Reference

### `POST /ml/overuse-risk`
**Summary:** Predict Antimicrobial Overuse Risk (Model A)  
**Description:** Evaluates an animal's rolling treatment history and farm AMU trajectory to determine if antimicrobial use indicates overuse or high AMR risk.

#### **Request Body (`application/json`):**
```json
{
  "species": "Cattle",
  "sex": "Female",
  "age_months": 36,
  "weight_kg": 420.0,
  "production_purpose": "Dairy",
  "treatments_last_7d": 2,
  "treatments_last_30d": 4,
  "treatments_last_90d": 7,
  "treatments_last_180d": 9,
  "total_amu_mg_last_30d": 33600.0,
  "total_amu_mg_last_90d": 58800.0,
  "antimicrobial_classes_used_90d": 3,
  "primary_antimicrobial_class": "Fluoroquinolones",
  "repeated_same_active_ingredient_90d": 3,
  "treatment_duration_days": 8,
  "treatment_frequency_per_day": 2,
  "disease_indication_category": "Mastitis",
  "season": "Monsoon",
  "month": 7,
  "farm_level_amu_trend": "Increasing",
  "animals_treated_on_farm_30d": 24,
  "farm_total_animals": 85,
  "previous_treatment_outcome": "Relapsed",
  "data_completeness_score": 0.95
}
```

#### **Response (`200 OK`):**
```json
{
  "status": "success",
  "model": "Model A (Antimicrobial Overuse Risk)",
  "risk_level": "HIGH",
  "probability_distribution": {
    "LOW": 0.0001,
    "MEDIUM": 0.0001,
    "HIGH": 0.9998
  },
  "risk_score": 0.9998,
  "reason_codes": [
    "HIGH_30D_FREQUENCY: Animal received >=3 antimicrobial courses in past 30 days.",
    "REPEATED_ACTIVE_INGREDIENT: Repeated administration of the same active molecule.",
    "CRITICALLY_IMPORTANT_ANTIMICROBIAL: Use of highest priority critically important antibiotic (CIA).",
    "FARM_ESCALATING_TREND: Farm shows accelerating overall antimicrobial consumption.",
    "EXTENDED_COURSE_DURATION: Treatment duration exceeds 7-day standard."
  ],
  "recommended_action": "Requires mandatory veterinary review before dispensing additional antimicrobial courses."
}
```

---

### `POST /ml/compliance-risk`
**Summary:** Predict MRL / Withdrawal Compliance Risk (Model B)  
**Description:** Evaluates slaughter or milking timing against statutory withdrawal periods and dosing parameters to prevent residue violations.

#### **Request Body (`application/json`):**
```json
{
  "species": "Cattle",
  "weight_kg": 420.0,
  "drug_name": "Enrofloxacin",
  "antimicrobial_class": "Fluoroquinolones",
  "route": "Intramuscular",
  "product_type": "Milk",
  "prescribed_dose_mg_per_kg": 5.0,
  "actual_dose_mg_per_kg": 8.5,
  "dose_compliance": "Overdose",
  "treatment_duration_days": 5,
  "official_withdrawal_period_days": 28.0,
  "days_elapsed_since_treatment": 3.0,
  "withdrawal_rule_known": "No",
  "permitted_in_lactating_animals": "No",
  "mrl_threshold_ppb": 100.0,
  "lab_residue_test_done": "No",
  "lab_residue_level_ppb": null,
  "record_completeness_score": 0.92
}
```

#### **Response (`200 OK`):**
```json
{
  "status": "success",
  "model": "Model B (MRL & Withdrawal Compliance Risk)",
  "risk_level": "HIGH",
  "probability_distribution": {
    "LOW": 0.0002,
    "MEDIUM": 0.0003,
    "HIGH": 0.9995
  },
  "risk_score": 0.9995,
  "reason_codes": [
    "PREMATURE_COLLECTION: Attempted harvest 25.0 days before official withdrawal period expires.",
    "DOSE_OVERAGE: Administered dose (8.5 mg/kg) exceeds prescribed dose (5.0 mg/kg).",
    "PROHIBITED_IN_LACTATING_ANIMALS: Off-label use in dairy milking animals."
  ],
  "clearance_badge": "🔴 WITHDRAWAL ACTIVE"
}
```

---

### `GET /ml/models-info`
**Summary:** Retrieve ML Models Metadata & Evaluation Benchmarks  
**Description:** Returns serialized algorithm architectures, training versions, macro F1 scores, and ROC-AUC metrics.

#### **Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "project": "Digital Farm Management Portal - MRL & AMU Prediction",
    "model_a": {
      "name": "Antimicrobial Overuse Risk Classifier",
      "algorithm": "XGBClassifier (multi:softprob)",
      "macro_f1": 0.77015,
      "roc_auc_ovr": 0.93316,
      "classes": ["LOW", "MEDIUM", "HIGH"]
    },
    "model_b": {
      "name": "MRL / Withdrawal Compliance Risk Classifier",
      "algorithm": "XGBClassifier (multi:softprob)",
      "macro_f1": 0.81934,
      "roc_auc_ovr": 0.94624,
      "classes": ["LOW", "MEDIUM", "HIGH"]
    }
  }
}
```

---

### `POST /treatments`
**Summary:** Record Veterinary Treatment & Auto-Calculate Withdrawal  
**Description:** Calculates active ingredient AMU mg ($\text{Dose} \times \text{Weight} \times \text{Duration} \times \text{Frequency}$), looks up applicable statutory withdrawal rules, schedules the withdrawal end date, updates animal status to `under_treatment`, and automatically invokes Model A Overuse evaluation.

#### **Request Body (`application/json`):**
```json
{
  "farm_id": "FARM_0001",
  "animal_id": "ANIM_000123",
  "veterinarian_id": "VET_DR_SHARMA",
  "species": "Cattle",
  "animal_weight_kg": 420.0,
  "drug_name": "Oxytetracycline",
  "active_ingredient": "Oxytetracycline Hydrochloride",
  "antimicrobial_class": "Tetracyclines",
  "dose_mg_per_kg": 10.0,
  "route": "Intramuscular",
  "frequency_per_day": 1,
  "duration_days": 5,
  "start_date": "2026-08-19T10:00:00Z",
  "product_affected": "Milk",
  "diagnosis_category": "Mastitis",
  "notes": "Acute mastitis in right rear quarter."
}
```

#### **Response (`201 Created`):**
```json
{
  "treatment_id": "TX_20260819100000",
  "animal_id": "ANIM_000123",
  "medicine": "Oxytetracycline",
  "active_ingredient": "Oxytetracycline Hydrochloride",
  "dose_per_admin_mg": 4200.0,
  "total_course_amu_mg": 21000.0,
  "treatment_start": "2026-08-19T10:00:00Z",
  "treatment_end": "2026-08-24T10:00:00Z",
  "official_withdrawal_period_days": 7,
  "withdrawal_end_date": "2026-08-31T10:00:00Z",
  "status": "ACTIVE WITHDRAWAL",
  "regulatory_source": "FSSAI / Codex Alimentarius 2023",
  "clearance_badge": "🔴 WITHDRAWAL ACTIVE",
  "overuse_risk_assessment": {
    "risk_level": "LOW",
    "probability_distribution": { "LOW": 0.88, "MEDIUM": 0.10, "HIGH": 0.02 }
  }
}
```

---

### `GET /animals/{id}/withdrawal`
**Summary:** Real-Time Animal Withdrawal Countdown & Badge  
**Description:** Computes remaining withdrawal countdown in hours and days and returns commercial clearance permission.

#### **Response (`200 OK`):**
```json
{
  "animal_id": "ANIM_000123",
  "status": "ACTIVE WITHDRAWAL",
  "clearance_badge": "🔴 WITHDRAWAL ACTIVE",
  "withdrawal_end_date": "2026-08-31T10:00:00Z",
  "remaining_withdrawal_hours": 120.5,
  "remaining_withdrawal_days": 5.0,
  "can_market_milk": false,
  "can_market_meat": false,
  "warning": "DO NOT COLLECT MILK OR SLAUGHTER FOR COMMERCIAL SALE WHILE WITHDRAWAL IS ACTIVE."
}
```

---

### `GET /animals/{id}/passport`
**Summary:** QR-Based Food Safety Passport  
**Description:** Publicly verifiable digital certificate for Milk Collection Centers and Abattoirs. Protects private veterinary notes while displaying verified food safety status.

#### **Response (`200 OK`):**
```json
{
  "passport_version": "1.0",
  "timestamp": "2026-08-19T20:45:00Z",
  "animal_id": "ANIM_000123",
  "tag_number": "IN-KA-2024-8849",
  "species": "Cattle",
  "production_purpose": "Dairy",
  "compliance_badge": "🔴 WITHDRAWAL ACTIVE",
  "product_clearance": {
    "milk_collection_permitted": false,
    "meat_slaughter_permitted": false
  },
  "withdrawal_countdown_hours": 120.5,
  "verification_authority": "Digital Farm Management & Food Safety Standards Portal",
  "qr_verification_url": "http://localhost:3000/qr/QR-COW-102"
}
```

---

### `GET /animals/{id}/qr-code`
**Summary:** Generate High-Resolution QR Code & Metadata  
**Description:** Returns persistent QR Code Base64 Data URL and verification URL.

#### **Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "animal_id": "a101",
    "animal_code": "COW-101",
    "qr_token": "QR-COW-101",
    "verification_url": "http://localhost:3000/qr/QR-COW-101",
    "qr_data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "species": "cow",
    "breed": "Gir",
    "purpose": "milk",
    "farm_id": "farm1"
  }
}
```

---

### `GET /amu/summary`
**Summary:** Antimicrobial Stewardship & Consumption Analytics  
**Description:** Returns total AMU (mg and mg/kg biomass), antimicrobial class distribution, and monthly trend time-series.

#### **Response (`200 OK`):**
```json
{
  "farm_id": "FARM_0001",
  "reporting_period": "Past 30 Days",
  "total_active_animals": 85,
  "animals_treated": 14,
  "treatment_incidence_rate_pct": 16.5,
  "total_antimicrobial_used_mg": 142800.0,
  "standardized_mg_per_kg_biomass": 4.12,
  "amu_by_class": [
    { "class": "Penicillins (Beta-lactams)", "percentage": 38.5, "total_mg": 55000.0 },
    { "class": "Tetracyclines", "percentage": 28.0, "total_mg": 40000.0 },
    { "class": "Fluoroquinolones (CIA)", "percentage": 18.5, "total_mg": 26400.0 },
    { "class": "Macrolides", "percentage": 10.0, "total_mg": 14300.0 },
    { "class": "Others", "percentage": 5.0, "total_mg": 7100.0 }
  ],
  "stewardship_indicators": {
    "critically_important_antimicrobial_pct": 18.5,
    "repeated_therapy_events_count": 3,
    "overuse_risk_high_animals_count": 2,
    "active_withdrawal_count": 4
  }
}
```

---

### `POST /lab-results`
**Summary:** Analytical Laboratory Residue Validation  
**Description:** Compares analytical residue testing against statutory MRL limits ($\mu\text{g/kg}$ or $\text{ppb}$) to automatically clear or quarantine batches.

#### **Request Body (`application/json`):**
```json
{
  "animal_id": "ANIM_000123",
  "product_type": "Milk",
  "analyte": "Oxytetracycline",
  "measured_residue_ppb": 45.0,
  "mrl_threshold_ppb": 100.0,
  "lab_name": "National Food Safety Analytical Lab",
  "test_date": "2026-08-19T14:00:00Z"
}
```

#### **Response (`200 OK`):**
```json
{
  "sample_id": "SMP_202608191400",
  "animal_id": "ANIM_000123",
  "analyte": "Oxytetracycline",
  "measured_residue_ppb": 45.0,
  "statutory_mrl_ppb": 100.0,
  "compliance_status": "COMPLIANT",
  "safety_margin_ppb": 55.0,
  "clearance_action": "Product passed safety threshold. Released for commercial supply chain."
}
```

---

### `GET /alerts`
**Summary:** Active Farm Compliance & AI Risk Alerts Queue  
**Description:** Returns active critical and warning alerts (Active withdrawals, AI Overuse risk alerts, repeated treatments).

#### **Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "alt_01",
      "farm_id": "farm1",
      "animal_id": "a102",
      "type": "critical",
      "severity": "high",
      "message": "🔴 DON'T SELL MILK TODAY from COW-102. Safe to sell after 24 Aug.",
      "message_hi": "🔴 COW-102 का दूध अभी न बेचें। 24 अगस्त के बाद बेचना सुरक्षित है।",
      "status": "active",
      "created_at": "2026-08-19T10:00:00Z"
    },
    {
      "id": "alt_ml_02",
      "farm_id": "farm1",
      "animal_id": "a102",
      "type": "warning",
      "severity": "high",
      "message": "🚨 AMU STEWARDSHIP RISK: COW-102 flagged as HIGH Overuse Risk by ML Model A. HIGH_30D_FREQUENCY: Animal received >=3 antimicrobial courses in past 30 days.",
      "message_hi": "🚨 एंटीमाइक्रोबियल जोखिम: पशु COW-102 में बार-बार दवा देने से ओवरयूज़ का खतरा है। डॉक्टर की सलाह लें।",
      "status": "active",
      "created_at": "2026-08-19T10:00:00Z"
    }
  ]
}
```

---

## 4. Regulatory Standards & Decision-Support Boundaries

1. **Decision Support, Not Autonomous Prescribing:**
   - The ML models and rules engine provide clinical decision support and risk alerts for veterinarians and farmers; they do not independently prescribe or dispense prescription antimicrobials.
2. **Authoritative Regulatory Versioning:**
   - Statutory withdrawal periods and MRL values are derived from **FSSAI Food Safety and Standards (Contaminants, Toxins and Residues) Regulations**, **FAO/WHO Codex Alimentarius**, and **WOAH Guidelines**.
3. **Privacy-Preserving Public QR Verification:**
   - Public QR endpoints show certified Food Safety clearance badges (`🟢 CLEARED` / `🔴 WITHDRAWAL ACTIVE`) without exposing sensitive medical records, farmer contact numbers, or commercial financial data.

# 🛡️ FarmShield: Backend Architecture & REST API Documentation
**Digital Farm Management Portal for Monitoring Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) in Livestock & Aquaculture**
**Ministry of Fisheries, Animal Husbandry & Dairying (DAHD) • Smart India Hackathon (SIH25007)**

---

## 📑 Table of Contents
1. [Executive Overview & Architectural Philosophy](#1-executive-overview--architectural-philosophy)
2. [Technology Stack & System Topology](#2-technology-stack--system-topology)
3. [Database Schema & Data Models (PostgreSQL / Supabase)](#3-database-schema--data-models-postgresql--supabase)
4. [Core Business Logic Engines](#4-core-business-logic-engines)
   - [4.1 Statutory Withdrawal Period Engine](#41-statutory-withdrawal-period-engine)
   - [4.2 AMU Surveillance & Biomass Analytics Engine](#42-amu-surveillance--biomass-analytics-engine)
   - [4.3 QR Code Ear-Tag & Safety Passport Engine](#43-qr-code-ear-tag--safety-passport-engine)
   - [4.4 Dual Machine Learning Decision Integration](#44-dual-machine-learning-decision-integration)
5. [Complete REST API Endpoints Reference](#5-complete-rest-api-endpoints-reference)
   - [System & Health Endpoints](#system--health-endpoints)
   - [Livestock & Aquaculture Management](#livestock--aquaculture-management)
   - [Public QR Food Safety Passport](#public-qr-food-safety-passport)
   - [Veterinary Medicines & Regulatory Standards](#veterinary-medicines--regulatory-standards)
   - [Treatment Administration & Withdrawal Creation](#treatment-administration--withdrawal-creation)
   - [AMU Analytics & Surveillance](#amu-analytics--surveillance)
   - [Clinical & Regulatory Alerts](#clinical--regulatory-alerts)
   - [Machine Learning Inferences](#machine-learning-inferences)
6. [Cultural Sensitivity & Food Safety Rules](#6-cultural-sensitivity--food-safety-rules)
7. [Environment Configuration & Deployment Guide](#7-environment-configuration--deployment-guide)

---

## 1. Executive Overview & Architectural Philosophy

The **FarmShield Backend** is a high-reliability, fault-tolerant RESTful backend service engineered to monitor and regulate **Antimicrobial Usage (AMU)** and enforce **Maximum Residue Limits (MRL)** across India's dairy livestock and aquaculture sectors.

### Primary Responsibilities:
1. **Lifecycle Tracking**: Maintain complete digital records of dairy cattle, buffalo herds, poultry flocks, and united fishery pond units.
2. **Automated Pharmacokinetic Withdrawal Calculation**: Compute exact statutory withdrawal countdowns whenever an antibiotic, anti-inflammatory, or anthelmintic is administered.
3. **Public Food Safety Verification**: Serve real-time **QR Safety Passports** for milk collection centers, chilling plants, and seafood processing authorities.
4. **AMU & AMR Surveillance**: Aggregate antimicrobial consumption metrics ($mg / kg$ biomass and $mg / PCU$), identifying repeated overuse and high-risk Critically Important Antibiotics (CIAs).
5. **AI-Powered Decision Support**: Execute dual-stage XGBoost machine learning inferences with clinical reason codes and SHAP explainability.

---

## 2. Technology Stack & System Topology

```
+-----------------------------------------------------------------------------------+
|                        CLIENT CONSUMERS & INTEGRATIONS                            |
|    Farmer Web App    |    Veterinarian Portal    |   Public QR Scanner / Camera   |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                      NODE.JS EXPRESS & TYPESCRIPT GATEWAY                         |
|   - CORS & Security Middleware            - Global Centralized Error Handling     |
|   - Request DTO Validation                - Structured JSON Response Wrapper      |
+-----------------------------------------------------------------------------------+
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
+--------------------+        +--------------------+        +--------------------+
|  WITHDRAWAL ENGINE |        | AMU ANALYTICS ENG  |        | ML INFERENCE GATE  |
| - Pharmacokinetics |        | - mg/kg Biomass    |        | - Model A (Overuse)|
| - MRL Table Checks |        | - CIA Classes      |        | - Model B (MRL W/D)|
| - Safety Countdown |        | - Overlap Detection|        | - SHAP Explanations|
+--------------------+        +--------------------+        +--------------------+
           │                             │                             │
           └─────────────────────────────┼─────────────────────────────┘
                                         ▼
+-----------------------------------------------------------------------------------+
|                    PERSISTENCE LAYER (PostgreSQL / Supabase)                      |
| Animals | Medicines | Regulatory Rules | Treatments | Withdrawals | Alerts | Logs |
+-----------------------------------------------------------------------------------+
```

### Core Technologies:
- **Runtime**: Node.js v20+ LTS
- **Framework**: Express.js with TypeScript (`strict: true`)
- **Database**: PostgreSQL 15 / Supabase SQL Engine
- **QR Generation**: `qrcode` Engine with PNG buffer rendering & SVG vector export
- **ML Artifacts**: Scikit-Learn / XGBoost joblib serialized pipelines with Python sub-process bridge

---

## 3. Database Schema & Data Models (PostgreSQL / Supabase)

### 3.1 `animals` (Livestock & Aquaculture Units)
Stores individual dairy livestock and collective aquaculture pond units:
```sql
CREATE TABLE animals (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL,
    animal_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. COW-101, BUF-201, POND-01
    species VARCHAR(32) NOT NULL CHECK (species IN ('cow', 'buffalo', 'goat', 'sheep', 'poultry', 'fishery')),
    breed VARCHAR(64) NOT NULL,
    dob DATE NOT NULL,
    sex VARCHAR(16) NOT NULL CHECK (sex IN ('male', 'female', 'collective')),
    weight_kg NUMERIC(8,2) NOT NULL,
    purpose VARCHAR(32) NOT NULL CHECK (purpose IN ('milk', 'draught', 'breeding', 'aquaculture', 'other')),
    health_status VARCHAR(32) NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'under_treatment', 'quarantined', 'sick')),
    qr_token VARCHAR(64) UNIQUE NOT NULL,
    fishery_details JSONB, -- { pond_id, water_type, biomass_kg, surface_area_sqm }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 `medicines` (Veterinary Drug Formulary)
Maintains registered antimicrobial active ingredients, formulations, and standard withdrawal guidelines:
```sql
CREATE TABLE medicines (
    id VARCHAR(64) PRIMARY KEY,
    brand_name VARCHAR(128) NOT NULL,
    active_ingredient VARCHAR(128) NOT NULL,
    drug_class VARCHAR(64) NOT NULL, -- Penicillin, Tetracycline, Fluoroquinolone, Macrolide
    who_classification VARCHAR(32) NOT NULL, -- CIA, HPIA, Highly Important
    standard_dose_per_kg NUMERIC(8,3) NOT NULL,
    default_route VARCHAR(32) NOT NULL, -- Injection, Oral, Intra-mammary, Water
    milk_withdrawal_days INT NOT NULL DEFAULT 0,
    aquaculture_withdrawal_days INT NOT NULL DEFAULT 0,
    mrl_milk_ug_kg NUMERIC(8,2) NOT NULL, -- FSSAI MRL in ug/kg (ppb)
    mrl_aquaculture_ug_kg NUMERIC(8,2) NOT NULL,
    is_fssai_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 `treatments` (Clinical Administration Logs)
```sql
CREATE TABLE treatments (
    id VARCHAR(64) PRIMARY KEY,
    animal_id VARCHAR(64) REFERENCES animals(id) ON DELETE CASCADE,
    medicine_id VARCHAR(64) REFERENCES medicines(id),
    vet_id VARCHAR(64),
    dose_amount NUMERIC(8,2) NOT NULL,
    dose_unit VARCHAR(16) NOT NULL, -- mg/kg, ml, g/ton
    route VARCHAR(32) NOT NULL,
    duration_days INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    indication VARCHAR(256) NOT NULL,
    product_affected VARCHAR(32) NOT NULL CHECK (product_affected IN ('milk', 'aquaculture_biomass', 'egg', 'all')),
    overuse_risk_score NUMERIC(5,4),
    compliance_risk_score NUMERIC(5,4),
    ai_flags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.4 `withdrawals` (Active Statutory Withholding Passports)
```sql
CREATE TABLE withdrawals (
    id VARCHAR(64) PRIMARY KEY,
    treatment_id VARCHAR(64) REFERENCES treatments(id) ON DELETE CASCADE,
    animal_id VARCHAR(64) REFERENCES animals(id) ON DELETE CASCADE,
    product VARCHAR(32) NOT NULL, -- milk, aquaculture_biomass
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    withdrawal_days INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    override_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Core Business Logic Engines

### 4.1 Statutory Withdrawal Period Engine (`withdrawalEngine.ts`)
Calculates the precise end timestamp when animal food products drop below FSSAI Maximum Residue Limits:
1. **Base Days Lookup**: Extracts statutory withdrawal days for the given species and product.
2. **Cumulative Extension**: If multiple treatments occur concurrently, the engine calculates the maximum safe clearance timestamp across all active substances.
3. **Safety Buffer**: Adds a statutory 24-hour clearance buffer for high-dose or prolonged administrations.

```typescript
export function calculateWithdrawalEndDate(
  startDate: Date,
  durationDays: number,
  withdrawalDays: number
): { endDate: Date; totalWithdrawalDays: number } {
  const treatmentEnd = new Date(startDate);
  treatmentEnd.setDate(treatmentEnd.getDate() + durationDays);

  const safeClearance = new Date(treatmentEnd);
  safeClearance.setDate(safeClearance.getDate() + withdrawalDays);

  return {
    endDate: safeClearance,
    totalWithdrawalDays: withdrawalDays,
  };
}
```

### 4.2 AMU Surveillance & Biomass Analytics Engine (`amu.ts`)
Quantifies antimicrobial usage per unit of animal production:
$$\text{AMU Intensity} = \frac{\text{Total Active Ingredient Administered (mg)}}{\text{Total Herd Biomass (kg)}} = \text{mg / kg Biomass}$$

- Categorizes consumption by **WHO Antimicrobial Importance Classes**:
  - **Highest Priority Critically Important (HPCIA)**: 3rd/4th Gen Cephalosporins, Fluoroquinolones, Macrolides.
  - **Critically Important (CIA)**: Penicillins, Aminoglycosides.
  - **Highly Important**: Tetracyclines, Sulfonamides.

### 4.3 QR Code Ear-Tag & Safety Passport Engine (`qrService.ts`)
- Generates permanent, cryptographically tied QR tokens (e.g. `QR-COW-101`).
- Generates high-density PNG QR ear tags with error correction level `H` (30% redundancy for field dirt/damage resistance).
- Produces the public verification endpoint accessible by mobile cameras:
  `http://<host>/qr/<qr_token>`

### 4.4 Dual Machine Learning Decision Integration (`mlService.ts`)
- **Model A (Overuse Risk)**: Multi-class classifier predicting treatment necessity based on 30-day frequency, drug class, and recurrence.
- **Model B (Compliance Risk)**: Multi-class classifier predicting probability of MRL violation based on dosage deviation, route, and animal weight.

---

## 5. Complete REST API Endpoints Reference

All API responses adhere to the standard structured envelope:
```json
{
  "status": "success" | "error",
  "message": "Human readable status message",
  "data": { ... },
  "timestamp": "2026-08-20T08:30:00.000Z"
}
```

---

### System & Health Endpoints

#### `GET /health`
Returns system liveness, database connection, and ML inference service readiness.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "FarmShield REST API Gateway",
  "version": "2.4.0",
  "database": "connected",
  "ml_engine": "ready",
  "timestamp": "2026-08-20T08:30:00.000Z"
}
```

---

### Livestock & Aquaculture Management

#### `GET /api/animals`
Retrieves all registered livestock and fishery units for the active farm.
- **Query Params**:
  - `species` (optional): `cow` | `buffalo` | `fishery` | `poultry`
  - `status` (optional): `healthy` | `under_treatment`
- **Response `200 OK`**:
```json
{
  "status": "success",
  "count": 4,
  "data": [
    {
      "id": "a101",
      "animal_code": "COW-101",
      "species": "cow",
      "breed": "Gir",
      "dob": "2022-03-15",
      "sex": "female",
      "weight": 380,
      "purpose": "milk",
      "health_status": "healthy",
      "qr_token": "QR-COW-101"
    },
    {
      "id": "a104",
      "animal_code": "POND-01",
      "species": "fishery",
      "breed": "Rohu & Catla Poly-culture",
      "dob": "2023-02-01",
      "sex": "collective",
      "weight": 2500,
      "purpose": "aquaculture",
      "health_status": "healthy",
      "qr_token": "QR-POND-01",
      "fishery_details": {
        "pond_id": "POND-01",
        "water_type": "freshwater",
        "biomass_kg": 2500
      }
    }
  ]
}
```

#### `POST /api/animals`
Registers a new cattle or collective fishery pond unit.
- **Request Body**:
```json
{
  "animal_code": "COW-105",
  "species": "cow",
  "breed": "Sahiwal",
  "dob": "2023-01-10",
  "sex": "female",
  "weight": 410,
  "purpose": "milk"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "Livestock unit registered and QR passport generated successfully.",
  "data": {
    "id": "a_1787198000",
    "animal_code": "COW-105",
    "qr_token": "QR-COW-105",
    "health_status": "healthy"
  }
}
```

---

### Public QR Food Safety Passport

#### `GET /api/animals/qr/:qrToken`
Public endpoint called when an inspector or collection agent scans an animal's physical QR ear tag.
- **Path Parameter**: `qrToken` (e.g. `QR-COW-101`)
- **Response `200 OK` (Cattle Cleared)**:
```json
{
  "status": "success",
  "data": {
    "animalCode": "COW-101",
    "species": "cow",
    "breed": "Gir",
    "healthStatus": "healthy",
    "milkStatus": "🟢 CLEARED",
    "meatStatus": null,
    "withdrawalStatus": "🟢 CLEARED",
    "isMilkSafe": true,
    "isMeatSafe": null,
    "safeDate": "2026-08-20T02:46:53.510Z",
    "remainingWithdrawalHours": 0,
    "verificationAuthority": "Digital Farm Management & Food Safety Standards Portal",
    "jurisdiction": "FSSAI / Codex Alimentarius MRL Compliance"
  }
}
```

---

### Treatment Administration & Withdrawal Creation

#### `POST /api/treatments`
Records a veterinary administration, triggers the withdrawal calculation engine, and evaluates ML risk models.
- **Request Body**:
```json
{
  "animal_id": "a102",
  "medicine_id": "m1",
  "dose": 10.0,
  "dose_unit": "mg/kg",
  "route": "Injection",
  "duration": 3,
  "start_date": "2026-08-20",
  "indication": "Mastitis",
  "product": "milk"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Treatment logged and withdrawal period calculated successfully.",
  "data": {
    "treatment_id": "t_9942",
    "withdrawal": {
      "id": "w_5501",
      "withdrawal_days": 5,
      "start_date": "2026-08-20T00:00:00.000Z",
      "end_date": "2026-08-28T00:00:00.000Z",
      "product": "milk",
      "is_active": true
    },
    "ml_risk_assessment": {
      "overuse_risk_level": "LOW",
      "overuse_score": 0.1245,
      "compliance_risk_level": "CLEARED",
      "compliance_score": 0.0410
    }
  }
}
```

---

### AMU Analytics & Surveillance

#### `GET /api/amu/summary`
Returns national/regional aggregated antimicrobial metrics and species breakdowns.
- **Response `200 OK`**:
```json
{
  "status": "success",
  "data": {
    "totalTreatments": 482,
    "activeWithdrawals": 31,
    "averageWithdrawalDays": 5.4,
    "totalBiomassTreatedKg": 184500,
    "classBreakdown": [
      { "drugClass": "Penicillins", "percentage": 42.5, "count": 205 },
      { "drugClass": "Tetracyclines", "percentage": 28.0, "count": 135 },
      { "drugClass": "Macrolides", "percentage": 18.5, "count": 89 },
      { "drugClass": "Fluoroquinolones", "percentage": 11.0, "count": 53 }
    ],
    "usageBySpecies": [
      { "species": "Cattle (Cow)", "treatments": 284 },
      { "species": "Buffalo", "treatments": 142 },
      { "species": "Aquaculture Fishery", "treatments": 56 }
    ]
  }
}
```

---

## 6. Cultural Sensitivity & Food Safety Rules

The FarmShield backend enforces strict domain rules tailored for Indian agriculture and SIH 2026 mandates:
1. **Zero Cattle Meat Mentions**:
   - For `cow`, `buffalo`, and `dairy cattle`, `meatStatus` and `isMeatSafe` are strictly returned as `null`.
   - Cattle withdrawal passports evaluate exclusively **`🥛 DAIRY MILK SAFETY STATUS`**.
2. **Fishery Aquaculture Units**:
   - Evaluated as collective pond biomass units with **`🐟 AQUACULTURE HARVEST SAFETY STATUS`**.
3. **Statutory Alignment**:
   - All MRL values benchmarked against **FSSAI (Food Safety and Standards Authority of India)** gazette notifications and **Codex Alimentarius CAC/MRL-2**.

---

## 7. Environment Configuration & Deployment Guide

### `.env` Configuration
```ini
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ML_SERVICE_URL=http://localhost:8000
```

### Local Development
```powershell
# Install backend dependencies
cd backend
npm install

# Start Express Development Server
npm run dev
```

### Production Build & Launch
```powershell
# Compile TypeScript to JavaScript
npm run build

# Start Production Server
npm start
```

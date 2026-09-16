# FarmShield: Flutter → Next.js Migration Map & Architectural Specification

> **Document Status**: Production Architecture Blueprint  
> **Source Platform**: Flutter (`farmshield/`)  
> **Target Platform**: Next.js 16+ (App Router) / TypeScript / Tailwind CSS / `@supabase/ssr`  
> **Author**: AI Architectural Engineering Team  

---

## 1. Existing Next.js Codebase Audit

Before mapping Flutter screens to Next.js, an exhaustive audit was performed on the existing `frontend/` directory to classify what already exists, what can be reused, what must be refactored, and what is missing.

### 1.1. What Already Exists
- **App Shell & Layout**: Next.js 16 App Router setup with `app/layout.tsx`, `app/globals.css`, and basic font loading.
- **Role Mode Prototype**: Interactive navbar in `components/ui/Navbar.tsx` switching between `farmer`, `vet`, and `admin` modes.
- **Existing Screens**:
  - Landing / Farmer Home (`app/page.tsx`, `components/farmer/FarmerHome.tsx`).
  - Public Animal QR Profile (`app/qr/[qr_token]/page.tsx`).
  - Surveillance GIS Prototype (`app/surveillance/map/page.tsx`, `triage-queue`, `vaccination-coverage`, `advisories`).
  - Treatment modal (`components/farmer/TreatmentModal.tsx`).
  - Milk safety checker (`components/farmer/MilkSafetyCheck.tsx`).
  - Warnings list (`components/farmer/WarningsList.tsx`).
  - Animal list with QR generator (`components/farmer/AnimalList.tsx`).
- **Localization**: 12 Indic languages support via `providers/LanguageProvider.tsx` and `translations/*.ts`.
- **Domain Services**:
  - `lib/services/triage.service.ts` (Clinical triage engine).
  - `lib/services/weather.service.ts` (Open-Meteo & THI calculator).
  - `lib/services/withdrawal.service.ts` (Statutory MRL withdrawal calculator).
  - `lib/services/cloudinary.service.ts` (Cloudinary multipart uploader).
  - `lib/breed_assets.ts` (Indian livestock breed imagery).
  - `types/database.ts` (PostgreSQL table interfaces matching `schema.sql`).

### 1.2. What Can Be Reused
1. **12 Indic Languages System** (`providers/LanguageProvider.tsx` & `translations/`): Already well-crafted with English, Hindi, Marathi, Punjabi, Gujarati, Bengali, etc.
2. **Domain Service Engines** (`triage.service.ts`, `weather.service.ts`, `withdrawal.service.ts`): Ported with 100% mathematical and clinical parity from Flutter.
3. **QR Generation & Decoding Helpers** (`lib/qrHelper.ts`): Client-side QR generation using `qrcode` and camera scanner integration via `html5-qrcode`.
4. **Breed Assets Helper** (`lib/breed_assets.ts`): Verified high-definition photography mappings for indigenous Indian cattle, buffalo, and aquaculture species.
5. **Database Interfaces** (`types/database.ts`): Complete schema interfaces for all 12 PostgreSQL tables.

### 1.3. What Must Be Refactored
1. **Authentication Architecture**:
   - *Current State*: Mock authentication stored in `localStorage` under key `vasudha_farmshield_user_session` via `providers/AuthProvider.tsx`.
   - *Refactoring Needed*: Upgrade to real `@supabase/ssr` cookie-based authentication with `createBrowserClient` and `createServerClient`, middleware session refresh, and support for Email/Password, Phone OTP (+91 Twilio/SMS), and Google OAuth. Retain demo fallback capability for evaluation.
2. **Hardcoded Localhost API Calls**:
   - *Current State*: Components make ad-hoc `fetch('http://localhost:5000/api/...')` requests.
   - *Refactoring Needed*: Centralize data access into typed Supabase operations (`@supabase/ssr`), Next.js Server Actions, or Next.js Route Handlers (`app/api/...`), so the app runs natively on Supabase without requiring a secondary Express server running on port 5000.
3. **Navigation & Desktop Layout**:
   - *Current State*: Single-page view switcher in `page.tsx` (`farmerView === 'animals'`, `'treatment'`, etc.).
   - *Refactoring Needed*: Transition to idiomatic Next.js App Router subroutes (`/livestock`, `/calendar`, `/medicines`, `/reports`, `/risk-assessment`, `/syndromic-report`) with persistent responsive layouts: desktop sidebar navigation on large viewports and mobile bottom bar on mobile screens.

### 1.4. What Is Missing
1. **Dedicated Auth Pages**: Standalone production pages for `/login`, `/register`, `/forgot-password`, `/reset-password`, `/profile`, and `/unauthorized`.
2. **Middleware & Route Guards**: Next.js `middleware.ts` to enforce server-side authentication, session refresh, and role-based redirects (`farmer` vs `veterinarian` vs `admin`).
3. **Comprehensive Web Design System**: Production-grade primitives: `Select`, `Checkbox`, `Radio`, `Avatar`, `Tooltip`, `Dropdown`, `Tabs`, `Toast`, `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`.
4. **Supabase Realtime Channel**: Active WebSocket subscription to `public:alerts` to show toast notifications when new emergency alerts arrive.

---

## 2. Complete Flutter → Next.js Migration Map

The following matrix maps every single Flutter screen, controller, and route from `farmshield/` to its exact Next.js App Router implementation:

| # | Flutter Screen & View | Flutter Route | Next.js Route | React Components | Primary Data Source | Supabase Operations | Auth & Role Required |
|---|---|---|---|---|---|---|---|
| 1 | `LoginView` | `/login` | `/login` | `LoginForm`, `SocialAuthButtons`, `PhoneOtpForm`, `Button`, `Input` | Supabase Auth | `supabase.auth.signInWithPassword`, `signInWithOtp`, `verifyOtp`, `signInWithOAuth` | Public (Redirect if authenticated) |
| 2 | `RegisterView` | `/register` | `/register` | `RegisterForm`, `RoleSelector`, `FarmProfileInputs`, `Button`, `Input` | Supabase Auth + `public.users` + `public.farms` | `supabase.auth.signUp`, `from('users').insert`, `from('farms').insert` | Public |
| 3 | `DashboardView` | `/dashboard` | `/` or `/dashboard` | `DashboardKpiGrid`, `WithdrawalCountdownCard`, `WeatherRiskCard`, `DiseaseTrendChart`, `QuickActionsGrid` | `animals`, `withdrawals`, `alerts`, Open-Meteo API | `from('animals').select`, `from('withdrawals').select`, `from('alerts').select` | Required (All roles: `farmer`, `vet`, `admin`) |
| 4 | `LivestockView` | `/livestock` | `/livestock` | `AnimalList`, `CategoryFilterPills`, `AnimalCard`, `AddAnimalDialog` | `public.animals` | `from('animals').select`, `from('animals').insert` | Required (`farmer`, `vet`) |
| 5 | `HerdHealthView` | `/herd-health` | `/herd-health` | `HerdHealthMetrics`, `VaccinationScheduleTable`, `QuarantinePanel` | `animals`, `vaccinations`, `treatments` | `from('vaccinations').select`, `from('animals').select(health_status=quarantine)` | Required (`farmer`, `vet`) |
| 6 | `AnimalDetailView` | `/animal-detail` | `/livestock/[id]` | `AnimalDetailView`, `MedicalTimeline`, `WithdrawalClocks`, `VaccinationList`, `LabResultsList` | `animals`, `treatments`, `withdrawals` | `from('animals').select(*, treatments(*), withdrawals(*)).eq('id', id).single()` | Required (All roles) |
| 7 | `AnimalPassportView` | `/animal-passport` | `/qr/[qr_token]` & `/livestock/[id]/passport` | `AnimalPassportCard`, `VerificationBadge`, `MrlStatusSeal`, `PrintPassportButton` | `public.animals`, `public.withdrawals`, `public.farms` | `from('animals').select(*, farm:farms(*), withdrawals(*)).eq('qr_token', token).single()` | Public (Read-only passport lookup) |
| 8 | `QRScannerPage` / `QRScannerView` | `/qr-scanner` | `/scan` | `CameraViewfinder`, `ScannerReticle`, `TorchToggle`, `ManualCodeInput` | Device Camera / `html5-qrcode` | Client camera stream; redirects to `/qr/[qr_token]` on hit | Required (All roles) |
| 9 | `AddTreatmentView` | `/add-treatment` | `/treatments/new` | `AddTreatmentModal`, `MedicineSelector`, `WithdrawalPreviewCard`, `CascadeWarning` | `medicines`, `regulatory_rules`, `treatments`, `withdrawals` | `from('treatments').insert`, `from('withdrawals').insert`, `from('animals').update` | Required (`veterinarian`, `farmer`) |
| 10 | `WithdrawalCalendarView` | `/withdrawal-calendar` | `/calendar` | `WithdrawalCalendar`, `MonthGrid`, `ProductBadgeDots`, `DayAgendaInspector` | `public.withdrawals`, `public.animals` | `from('withdrawals').select(*, animal:animals(*)).eq('status', 'active')` | Required (All roles) |
| 11 | `GeospatialRiskMapView` | `/geospatial-risk` | `/surveillance/map` | `SurveillanceMapCanvas`, `ContainmentRings`, `IncidentInspector`, `WeatherRiskCard` | `public.disease_reports`, Open-Meteo API | `from('disease_reports').select(*)` | Required (All roles, `admin` priority) |
| 12 | `SyndromicReportView` | `/syndromic-report` | `/syndromic-report` | `SyndromicReportModal`, `SymptomChecklist`, `TriageAdviceCard`, `CameraUpload`, `GpsCoordinates` | `public.disease_reports`, `public.alerts` | `from('disease_reports').insert`, `from('alerts').insert` | Required (All roles) |
| 13 | `MedicinesCatalogView` | `/medicines-catalog` | `/medicines` | `MedicinesCatalogModal`, `WhoCiaFilterPills`, `DrugDetailCard`, `MrlTable` | `public.medicines`, `public.regulatory_rules` | `from('medicines').select(*, regulatory_rules(*))` | Required (All roles) |
| 14 | `LabResultsView` | `/lab-results` | `/lab-results` | `LabResultsModal`, `AddLabResultForm`, `ResidueComplianceCard` | `public.lab_results`, `public.animals` | `from('lab_results').select(*, animal:animals(*)).order('test_date', desc)` | Required (All roles) |
| 15 | `ReportsView` | `/reports` | `/reports` | `ReportsModal`, `AmuLedgerTable`, `WithdrawalCertPreview`, `PrintCertificate` | `treatments`, `withdrawals`, `animals`, `farms` | Multi-table aggregation across `treatments`, `withdrawals`, `amu_records` | Required (All roles) |
| 16 | `RiskAssessmentView` | `/risk-assessment` | `/risk-assessment` | `RiskAssessmentModal`, `ModelASliders`, `ModelBSliders`, `RiskScoreGauge` | Client Inference Engine + `ml_predictions` | `from('ml_predictions').insert` | Required (All roles) |
| 17 | `ModelsInfoView` | `/models-info` | `/models-info` | `ModelsDocumentationCard`, `F1MetricsTable`, `ThiFormulaExplainer` | Static Documentation + ML Service | Static / `/api/ml/models-info` | Public / All |

---

## 3. Production Architecture Specification

### 3.1. Proposed Directory Structure

```text
frontend/
├── app/
│   ├── (auth)/                             # Authentication route group (minimal layout)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx                  # Email, Phone OTP, Google OAuth
│   │   ├── register/page.tsx               # Farmer vs Vet signup + Farm profile
│   │   ├── forgot-password/page.tsx        # Password reset request
│   │   └── reset-password/page.tsx         # New password submission
│   ├── (dashboard)/                        # Authenticated app shell layout
│   │   ├── layout.tsx                      # Header, Responsive Sidebar (Desktop) & BottomNav (Mobile)
│   │   ├── page.tsx                        # Main Dashboard Command Center
│   │   ├── livestock/
│   │   │   ├── page.tsx                    # Livestock directory & Category filters
│   │   │   └── [id]/page.tsx               # 360° Animal detail profile
│   │   ├── herd-health/page.tsx            # Herd-level vaccination & quarantine metrics
│   │   ├── calendar/page.tsx               # Statutory withdrawal embargo calendar
│   │   ├── treatments/
│   │   │   └── new/page.tsx                # Treatment prescription & withdrawal calculator
│   │   ├── medicines/page.tsx              # Pharmaceutical catalog & MRL standards
│   │   ├── lab-results/page.tsx            # NABL laboratory diagnostics & Somatic counts
│   │   ├── reports/page.tsx                # Official FSSAI audit ledgers & certificates
│   │   ├── risk-assessment/page.tsx        # AI Overuse & Compliance risk engine
│   │   ├── profile/page.tsx                # User & Farm profile management
│   │   ├── scan/page.tsx                   # Live webcam / camera QR scanner
│   │   └── unauthorized/page.tsx           # 403 Forbidden page with role switcher
│   ├── surveillance/                       # GIS Epidemiological Outbreak Grid
│   │   ├── layout.tsx
│   │   ├── map/page.tsx                    # Interactive containment map (WGS84)
│   │   ├── triage-queue/page.tsx           # District veterinary dispatch SLA queue
│   │   ├── vaccination-coverage/page.tsx   # District immunization heatmaps
│   │   └── advisories/page.tsx             # Emergency public broadcast notices
│   ├── qr/
│   │   └── [qr_token]/page.tsx             # Public food safety traceability card (No auth required)
│   ├── api/
│   │   ├── auth/callback/route.ts          # OAuth & OTP Supabase callback handler
│   │   └── ml/proxy/route.ts               # Proxy to Render ML endpoints
│   ├── globals.css
│   └── layout.tsx                          # Root layout with LanguageProvider & ToastProvider
│
├── components/
│   ├── ui/                                 # Modern Web Design System Primitives
│   │   ├── Button.tsx                      # Primary, secondary, outline, danger, ghost, loading
│   │   ├── Input.tsx                       # Text, password, number with prefix/suffix icons
│   │   ├── Select.tsx                      # Custom accessible select with options
│   │   ├── Checkbox.tsx                    # Custom styled checkbox
│   │   ├── Radio.tsx                       # Radio group
│   │   ├── Card.tsx                        # Card, CardHeader, CardTitle, CardContent
│   │   ├── Modal.tsx                       # Dialog & Modal wrapper with backdrop
│   │   ├── Badge.tsx                       # Status chips (success, warning, danger, info)
│   │   ├── Avatar.tsx                      # Profile picture with initials fallback
│   │   ├── Tooltip.tsx                     # Hover helper tooltip
│   │   ├── Dropdown.tsx                    # Actions dropdown menu
│   │   ├── Tabs.tsx                        # Underline / Pill tab switchers
│   │   ├── Toast.tsx                       # Live alert banner and notification system
│   │   ├── Skeleton.tsx                    # Shimmer loading skeleton
│   │   ├── Spinner.tsx                     # SVG circular loading spinner
│   │   ├── EmptyState.tsx                  # Zero-data state with illustration & action button
│   │   └── ErrorState.tsx                  # Error boundary card with retry trigger
│   ├── layout/
│   │   ├── Navbar.tsx                      # Top app bar, language switch, role badge
│   │   ├── Sidebar.tsx                     # Desktop collapsible navigation drawer
│   │   └── MobileNav.tsx                   # Bottom navigation bar for mobile viewports
│   ├── dashboard/                          # Dashboard feature components
│   │   ├── WithdrawalCountdownCard.tsx     # Digital countdown clock with progress bar
│   │   ├── WeatherRiskCard.tsx             # Open-Meteo live THI & vector risk
│   │   └── DiseaseTrendChart.tsx           # Recharts 30-day morbidity curves
│   ├── farmer/                             # Livestock & Farm components
│   │   ├── AnimalList.tsx                  # Filterable herd table / grid
│   │   └── AnimalDetailModal.tsx           # 360° animal inspector
│   ├── treatment/
│   │   └── AddTreatmentModal.tsx           # Prescription form with live MRL calculation
│   ├── calendar/
│   │   └── WithdrawalCalendar.tsx          # Month/week embargo schedule
│   ├── medicines/
│   │   └── MedicinesCatalogModal.tsx       # Drug catalog with WHO CIA filters
│   ├── lab/
│   │   └── LabResultsModal.tsx             # Lab certificate table & entry form
│   └── reports/
│       └── ReportsModal.tsx                # Printable compliance certificate
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser client (createBrowserClient)
│   │   ├── server.ts                       # Server client (createServerClient with cookies)
│   │   └── middleware.ts                   # Session refresher for Next.js middleware
│   ├── services/
│   │   ├── triage.service.ts               # Clinical triage decision tree (WOAH)
│   │   ├── weather.service.ts              # Open-Meteo & THI calculation
│   │   ├── withdrawal.service.ts           # Statutory MRL clearance days calculator
│   │   └── cloudinary.service.ts           # Cloudinary direct upload pipeline
│   ├── breed_assets.ts                     # Indian breed photographic assets
│   └── qrHelper.ts                         # QR code generation & camera scanner helpers
│
├── providers/
│   ├── AuthProvider.tsx                    # Supabase Auth state & role normalization
│   ├── LanguageProvider.tsx                # 12 Indic languages provider
│   └── ToastProvider.tsx                   # Toast notification context
│
├── middleware.ts                           # Root middleware for route protection
└── types/
    └── database.ts                         # Complete TypeScript schema definitions
```

---

### 3.2. Routing Strategy: Server vs. Client Components

1. **Server Components by Default**:
   - Page wrappers (`app/(dashboard)/**/page.tsx`), static metadata, initial database fetches, and letterheads run as **React Server Components (RSC)**.
   - Faster First Contentful Paint (FCP) and zero client-bundle overhead for static text, regulatory disclaimers, and initial database data.
2. **Client Components Only When Interactive**:
   - Components utilizing hooks (`useState`, `useEffect`, `useRouter`, `useLanguage`, `useAuth`), camera APIs (`html5-qrcode`), real-time timers (countdown clocks), or canvas charts (`recharts`) declare `'use client'`.
   - Modals, sliders, and form dialogs are isolated client boundaries so the parent page remains a server component.

---

### 3.3. State Management Strategy

1. **Server State (Database Data)**:
   - Fetched via Supabase Server Client during RSC render.
   - Mutated via Next.js Server Actions or client Supabase mutations, followed by `router.refresh()` to revalidate server cache.
2. **Global Client State (User Session & Role)**:
   - Managed via `AuthProvider.tsx` (subscribing to `supabase.auth.onAuthStateChange`).
   - Stores active `user`, `role` (`farmer`, `veterinarian`, `admin`), and session tokens.
3. **Localization State**:
   - Managed via `LanguageProvider.tsx` (persisted in `localStorage` key `farmshield_lang`). Supports 12 Indic languages.
4. **URL State**:
   - Filter and pagination parameters (e.g. `?species=cow&status=under_treatment`) are stored directly in URL search params using Next.js `useSearchParams` for shareable, bookmarkable deep links.

---

### 3.4. Supabase Architecture & SSR Pattern

1. **Browser Client** (`lib/supabase/client.ts`):
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';
   import { Database } from '@/types/database';

   export function createClient() {
     return createBrowserClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```
2. **Server Client** (`lib/supabase/server.ts`):
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';
   import { Database } from '@/types/database';

   export async function createClient() {
     const cookieStore = await cookies();
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return cookieStore.getAll();
           },
           setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               );
             } catch {
               // The `setAll` method was called from a Server Component.
             }
           },
         },
       }
     );
   }
   ```
3. **Middleware Session Refresher** (`middleware.ts`):
   - Intercepts requests, calls `supabase.auth.getUser()`, refreshes expired JWT tokens in HTTP-only cookies, and enforces route guards before rendering.

---

### 3.5. Authentication & Role-Based Authorization Matrix

#### Roles Identified from Flutter Codebase:
1. `farmer`: Can manage own livestock, register animals, view milk safety, log treatments for own herd, report syndromic issues.
2. `veterinarian`: Can issue certified antimicrobial prescriptions, review all farm cases in district, verify withdrawal compliance, access clinical triage SLA queue.
3. `admin` (Government / Regulatory Authority): National surveillance, district quarantine control, FSSAI compliance auditing, editing regulatory rules and MRL thresholds.

#### Route Permissions Matrix:

| Route Path | Description | `Public` | `farmer` | `veterinarian` | `admin` |
|---|---|---|---|---|---|
| `/login` | Authentication Portal | Yes | Yes (Redirect) | Yes (Redirect) | Yes (Redirect) |
| `/register` | User & Farm Onboarding | Yes | Yes (Redirect) | Yes (Redirect) | Yes (Redirect) |
| `/` or `/dashboard` | Command Center & Live Alerts | No | Allowed | Allowed | Allowed |
| `/livestock` | Herd & Flock Directory | No | Own Farm | All District | Full Access |
| `/livestock/[id]` | Animal 360° Profile | No | Own Farm | Allowed | Allowed |
| `/qr/[qr_token]` | Food Safety Passport Lookup | **Yes** | Allowed | Allowed | Allowed |
| `/calendar` | Withdrawal Embargo Calendar | No | Own Farm | All District | Full Access |
| `/treatments/new` | Prescription Form | No | Allowed | **Authorized** | **Authorized** |
| `/surveillance/map` | GIS Outbreak Map | No | Allowed | Allowed | **Full GIS** |
| `/surveillance/triage-queue` | Clinical SLA Dispatch | No | Denied (403) | **Allowed** | **Allowed** |
| `/medicines` | Pharmaceutical Directory | No | Allowed | Allowed | Allowed (Can Edit) |
| `/lab-results` | Residue & Somatic Testing | No | Allowed | Allowed | Allowed |
| `/reports` | Official Audit Certificates | No | Own Farm | Authorized Sign | Full Audit |
| `/risk-assessment` | AI AMR Risk Simulation | No | Allowed | Allowed | Allowed |

---

### 3.6. Security Architecture

1. **Row Level Security (RLS)**:
   - PostgreSQL RLS enabled on all 12 tables in `schema.sql`.
   - `farms`: `owner_id = auth.uid()` OR `role IN ('veterinarian', 'admin')`.
   - `animals`: Access verified via foreign key `farm_id` matching farm owner or elevated vet/admin roles.
   - `treatments` and `withdrawals`: Audited via `veterinarian_id` and `farm_id`.
2. **Zero Service Role Key Exposure**:
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side administrative route handlers and never exposed in `NEXT_PUBLIC_*` variables.
3. **Statutory Off-Label Validation**:
   - Treatments submitted with doses exceeding recommended dosage automatically apply statutory cascade multipliers (+50% withdrawal period) on both client and database levels.
4. **Content Security & Sanitization**:
   - Photo uploads are validated by mime-type and byte size (< 10MB) before transmission to Cloudinary.

---

## 4. Implementation Phasing Strategy

- **Module 2 (Current Step)**: Complete Visual Design System (`Button`, `Input`, `Select`, `Card`, `Modal`, `Badge`, `Tabs`, `Toast`, `Skeleton`, etc.) and Responsive App Shell (`Navbar`, `Sidebar`, `MobileNav`).
- **Module 3**: Supabase SSR Foundation (`client.ts`, `server.ts`, `middleware.ts`, `docs/supabase-setup.md`, `.env.example`).
- **Module 4**: Authentication & Authorization Pages (`/login`, `/register`, `/forgot-password`, `/profile`, `/unauthorized`).
- **Module 5**: Full Screen Feature Implementation & Supabase Endpoints.

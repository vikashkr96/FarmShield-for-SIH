# FarmShield: Production Deployment & Setup Checklist

This document details all deployment and verification steps for the FarmShield National Animal Health & MRL Surveillance platform, clearly separated by automation status.

---

## Part 1: Automated Components (Already Implemented in Repository)

The following components are fully implemented, automated, and tested within the Next.js codebase:

- [x] **AUTOMATED** | Next.js 16 App Router application scaffolded (rontend/)
- [x] **AUTOMATED** | Full TypeScript database schema types generated (src/types/database.ts)
- [x] **AUTOMATED** | Supabase SSR client, server, and middleware integration (src/lib/supabase/)
- [x] **AUTOMATED** | Client-side and server-side route protection with edge session handling (src/middleware.ts)
- [x] **AUTOMATED** | Complete UI design system matching Flutter identity (src/components/ui/)
- [x] **AUTOMATED** | 17 Core Flutter screens + 9 advanced surveillance modules migrated (src/app/)
- [x] **AUTOMATED** | Resilient repository layer with automatic in-memory fallback (src/lib/repositories/)
- [x] **AUTOMATED** | WOAH clinical syndromic triage scoring engine (src/lib/services/triage.service.ts)
- [x] **AUTOMATED** | Open-Meteo satellite weather API & THI heat-stress calculator (src/lib/services/weather.service.ts)
- [x] **AUTOMATED** | Statutory MRL withdrawal period calculator with cascade penalty (src/lib/services/withdrawal.service.ts)
- [x] **AUTOMATED** | Cloudinary direct image uploader with MIME & 5MB size validation (src/lib/services/cloudinary.service.ts)
- [x] **AUTOMATED** | Native SVG/Canvas QR verification engine (src/app/livestock/[id]/passport/page.tsx)
- [x] **AUTOMATED** | Real-time WebSocket notification listener drawer (src/components/notifications/)
- [x] **AUTOMATED** | Multi-lingual translations (English, Hindi, Punjabi, Marathi) (src/providers/LanguageProvider.tsx)
- [x] **AUTOMATED** | Turbopack build verification (
pm run build passes with 0 errors across all 26 routes)
- [x] **AUTOMATED** | ESLint static analysis (
px eslint --quiet passes with 0 errors)

---

## Part 2: Manual Cloud Setup Checklist (Operations Team)

Perform the following manual steps when provisioning a new cloud environment or deploying to production:

### Phase 1: Supabase Cloud Provisioning
- [ ] **MANUAL** | Log into [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
- [ ] **MANUAL** | Choose project name FarmShield-National-Portal and region p-south-1 (Mumbai).
- [ ] **MANUAL** | Save generated database password in team secrets manager.
- [ ] **MANUAL** | Copy Project URL and non public key from **Project Settings** -> **API**.

### Phase 2: Database Schema & Security
- [ ] **MANUAL** | Open Supabase **SQL Editor**.
- [ ] **MANUAL** | Paste and run the complete [schema.sql](../schema.sql) script.
- [ ] **MANUAL** | Verify that all 12 tables are created with Row Level Security enabled:
  - users, arms, nimals, medicines, 
egulatory_rules, 	reatments, withdrawals, mu_records, lerts, lab_results, udit_logs, ml_predictions.
- [ ] **MANUAL** | Verify production B-Tree indexes exist on foreign keys (nimal_id, arm_id, qr_token, status).

### Phase 3: Authentication & OAuth
- [ ] **MANUAL** | Enable **Email / Password** provider under **Authentication** -> **Providers**.
- [ ] **MANUAL** | (Optional) Enable **Phone / SMS** provider and configure Twilio / Msg91 credentials.
- [ ] **MANUAL** | (Optional) Configure **Google OAuth** with Client ID & Secret from Google Cloud Console.
- [ ] **MANUAL** | Configure **URL Configuration**:
  - Set Site URL to production domain (e.g. https://farmshield.gov.in).
  - Add redirect URLs: http://localhost:3000/**, https://farmshield.gov.in/**.

### Phase 4: Storage Buckets & Policies
- [ ] **MANUAL** | Create public bucket nimal-photos with 5MB limit and allowed types: image/jpeg, image/png, image/webp.
- [ ] **MANUAL** | Create private bucket lab-reports with 10MB limit and allowed types: pplication/pdf, image/jpeg, image/png.
- [ ] **MANUAL** | Run storage RLS policy in SQL Editor to grant authenticated inserts and public reads for nimal-photos.

### Phase 5: Realtime Configuration
- [ ] **MANUAL** | Enable realtime replication on public.alerts, public.withdrawals, and public.syndromic_reports:
  `sql
  alter publication supabase_realtime add table public.alerts;
  alter publication supabase_realtime add table public.withdrawals;
  alter publication supabase_realtime add table public.syndromic_reports;
  `

### Phase 6: Hosting & Deployment (Vercel / AWS / NIC Cloud)
- [ ] **MANUAL** | Connect Git repository to hosting provider (e.g. Vercel, AWS Amplify, or Docker container).
- [ ] **MANUAL** | Set root directory to rontend.
- [ ] **MANUAL** | Configure environment variables in deployment dashboard:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  - NEXT_PUBLIC_APP_URL
- [ ] **MANUAL** | Trigger production build and verify deployment status.
- [ ] **MANUAL** | Bind custom government/production domain (armshield.gov.in) and configure SSL certificate.

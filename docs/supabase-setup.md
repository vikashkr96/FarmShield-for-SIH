# FarmShield: Complete Supabase Foundation & Setup Guide

> **Document Status**: Production Guide  
> **Target Platform**: Next.js 16+ App Router (`frontend/`) & Supabase PostgreSQL  
> **Source Schema**: `schema.sql` (12 PostgreSQL tables with RLS policies)  

---

## 1. Overview & Architecture

FarmShield relies on Supabase as its primary cloud data and authentication engine:
- **Authentication**: Email/Password, Phone OTP (+91 Twilio/SMS), and Google OAuth.
- **Database**: 12 core tables enforcing Row Level Security (RLS) policies for three distinct user roles: `farmer`, `veterinarian`, and `admin`.
- **Realtime**: WebSocket change stream listening on `public:alerts` for high-severity disease outbreaks and withdrawal breaches.
- **Media Storage**: Direct multipart upload to Cloudinary (preset: `farmshield_preset`, cloud: `dly88888`), with optional Supabase Storage bucket fallback.

---

## 2. Automated Code Setup

The following files have been generated in `frontend/` to provide fully typed, SSR-compatible Supabase integration:

### 2.1. Client & Server Utilities
1. **Browser Client** (`frontend/src/lib/supabase/client.ts`):
   - Initializes `createBrowserClient` from `@supabase/ssr`.
   - Used in client components (`'use client'`) for interactive form submissions, realtime subscriptions, and auth state changes.
2. **Server Client** (`frontend/src/lib/supabase/server.ts`):
   - Initializes `createServerClient` from `@supabase/ssr` using `next/headers` `cookies()`.
   - Used in React Server Components (RSC), Server Actions, and Route Handlers with secure HTTP-only cookie access.
3. **Session Refresh Middleware** (`frontend/src/lib/supabase/middleware.ts` & `frontend/src/middleware.ts`):
   - Refreshes expired Auth JWT tokens automatically on every request.
   - Enforces route protection, redirecting unauthenticated users to `/login`.

### 2.2. TypeScript Database Types
- File: `frontend/src/types/database.ts`
- Provides strong typing matching all 12 PostgreSQL tables:
  - `UserProfile`, `Farm`, `Animal`, `Medicine`, `RegulatoryRule`, `Treatment`, `Withdrawal`, `Alert`, `DiseaseReport`, `LabResult`, `Vaccination`, `AmuRecord`.

---

## 3. Manual Supabase Dashboard Steps

Follow these exact steps in your [Supabase Project Dashboard](https://app.supabase.com):

### Step 1: Execute Database Schema DDL
1. Open your Supabase project dashboard.
2. In the left navigation, click on **SQL Editor**.
3. Create a **New Query**.
4. Open the `schema.sql` file located in the project root:
   [`schema.sql`](file:///c:/Users/amitk/OneDrive/Desktop/FarmShield-for-SIH-app/schema.sql)
5. Copy the entire contents of `schema.sql` into the SQL Editor.
6. Click **Run**.
7. Verify that all 12 tables are created under the `public` schema with RLS enabled:
   - `users`, `farms`, `animals`, `medicines`, `regulatory_rules`, `treatments`, `withdrawals`, `amu_records`, `alerts`, `lab_results`, `audit_logs`, `ml_predictions`.

### Step 2: Configure Authentication Providers

#### A. Email / Password
1. Navigate to **Authentication** -> **Providers** -> **Email**.
2. Toggle **Enable Email provider** to **ON**.
3. Configure whether you require email confirmation before login (recommended: ON for production, OFF for local rapid development).

#### B. Phone Number & SMS OTP
1. Navigate to **Authentication** -> **Providers** -> **Phone**.
2. Toggle **Enable Phone provider** to **ON**.
3. Select your SMS gateway provider (e.g., **Twilio**, **MessageBird**, or **Vonage**).
4. Enter your Twilio Account SID, Auth Token, and Twilio Message Service SID.
5. *Note*: In development, you can configure **Test Phone Numbers** under **Authentication -> Providers -> Phone** (e.g., `+919876543210` with fixed OTP `584291`) for deterministic testing.

#### C. Google OAuth
1. Navigate to **Authentication** -> **Providers** -> **Google**.
2. Toggle **Enable Google provider** to **ON**.
3. Obtain your OAuth Client ID and Secret from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
4. Add the Supabase Callback URL to Authorized redirect URIs in Google Cloud Console:
   `https://<your-project-id>.supabase.co/auth/v1/callback`

### Step 3: Configure URL Redirects
1. Go to **Authentication** -> **URL Configuration**.
2. Set **Site URL**:
   `http://localhost:3000` (or your production Vercel domain `https://your-domain.vercel.app`).
3. Add to **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/api/auth/callback`
   - `https://your-domain.vercel.app/**`

### Step 4: Enable Realtime for Alerts
1. Navigate to **Database** -> **Replication**.
2. Look for the `supabase_realtime` publication.
3. Click on **Source** and toggle the `public.alerts` table to **ON**.
4. This enables the WebSocket subscription `supabase.channel('public:alerts')` to broadcast emergency disease alerts to connected clients.

### Step 5: Optional Supabase Storage Bucket
If using Supabase Storage alongside Cloudinary:
1. Navigate to **Storage** -> **New Bucket**.
2. Create a public bucket named `animal-photos`.
3. Set file size limit to `10 MB` and allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.

---

## 4. Environment Variables Checklist

Ensure your `frontend/.env.local` file contains:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dly88888
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=farmshield_preset

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Items Requiring External Confirmation

- **Apple Sign-In**: `UNKNOWN — REQUIRES CONFIRMATION` (Present in Flutter SDK config references, but not active in `LoginView` UI. Currently disabled in web).
- **Twilio Indian DLT Registration**: `UNKNOWN — REQUIRES CONFIRMATION` (Indian TRAI regulations require Distributed Ledger Technology template registration for transactional SMS in production).

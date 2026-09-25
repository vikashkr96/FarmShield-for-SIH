-- FarmSheild Database Schema DDL & Demo Seed Data
-- Suitable for Supabase PostgreSQL (run this in Supabase SQL Editor)

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. CLEANUP (For development/re-run)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.ml_predictions;
drop table if exists public.audit_logs;
drop table if exists public.lab_results;
drop table if exists public.alerts;
drop table if exists public.amu_records;
drop table if exists public.withdrawals;
drop table if exists public.treatments;
drop table if exists public.regulatory_rules;
drop table if exists public.medicines;
drop table if exists public.animals;
drop table if exists public.farms;
drop table if exists public.users;

-- 2. CREATE TABLES

-- Users Table (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text unique not null,
  role text not null check (role in ('farmer', 'veterinarian', 'admin')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- Farms Table
create table public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  production_type text check (production_type in ('Dairy', 'Meat', 'Mixed')),
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Animals Table
create table public.animals (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  animal_code text not null,
  species text not null check (species in ('cow', 'buffalo', 'goat', 'sheep')),
  breed text,
  dob date,
  sex text not null check (sex in ('male', 'female')),
  weight numeric not null check (weight > 0),
  purpose text not null check (purpose in ('milk', 'meat', 'breeding', 'other')),
  health_status text not null default 'healthy' check (health_status in ('healthy', 'sick', 'under_treatment', 'quarantine')),
  qr_token text not null unique,
  created_at timestamptz not null default now(),
  constraint unique_animal_code_per_farm unique (farm_id, animal_code)
);

-- Medicines Table
create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active_ingredient text not null,
  antimicrobial_class text not null,
  strength text not null,
  status text not null default 'active' check (status in ('active', 'discontinued'))
);

-- Regulatory Rules Table
create table public.regulatory_rules (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  species text not null check (species in ('cow', 'buffalo', 'goat', 'sheep')),
  product text not null check (product in ('milk', 'meat', 'eggs', 'all')),
  mrl text not null, -- Maximum Residue Limit, e.g., '100 ug/kg'
  withdrawal_days integer not null check (withdrawal_days >= 0),
  jurisdiction text not null default 'India (FSSAI)',
  source text,
  version text not null default '1.0',
  effective_from date not null default current_date,
  effective_to date,
  approval_status text not null default 'approved' check (approval_status in ('pending', 'approved', 'rejected'))
);

-- Treatments Table
create table public.treatments (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  veterinarian_id uuid references public.users(id) on delete set null,
  dose numeric not null check (dose > 0),
  dose_unit text not null, -- e.g., 'mg/kg', 'ml', 'g'
  route text not null, -- e.g., 'Oral', 'Injection', 'Topical'
  frequency text not null, -- e.g., 'Once daily', 'Twice daily'
  duration integer not null check (duration > 0),
  start_date timestamptz not null,
  end_date timestamptz not null,
  indication text, -- e.g., 'Mastitis', 'Foot Rot'
  product_affected text not null check (product_affected in ('milk', 'meat', 'eggs', 'all')),
  notes text,
  created_at timestamptz not null default now(),
  constraint check_end_after_start check (end_date >= start_date)
);

-- Withdrawals Table
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  animal_id uuid not null references public.animals(id) on delete cascade,
  product text not null check (product in ('milk', 'meat', 'eggs', 'all')),
  start_date timestamptz not null,
  end_date timestamptz, -- can be null if rule is missing / manual check required
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled'))
);

-- Antimicrobial Usage (AMU) Records Table
create table public.amu_records (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  quantity numeric not null check (quantity >= 0),
  unit text not null, -- e.g., 'mg', 'g', 'ml'
  date date not null default current_date
);

-- Alerts Table
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  animal_id uuid references public.animals(id) on delete cascade,
  type text not null check (type in ('critical', 'warning', 'info')),
  severity text not null check (severity in ('high', 'medium', 'low')),
  message text not null,
  message_hi text, -- Hindi Translation
  status text not null default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz not null default now()
);

-- Laboratory Residue Results Table
create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  product text not null check (product in ('milk', 'meat', 'eggs')),
  analyte text not null, -- e.g., 'Amoxicillin Residue'
  result numeric not null check (result >= 0),
  unit text not null, -- e.g., 'ug/kg', 'mg/kg'
  test_date date not null,
  laboratory text
);

-- Audit Logs Table
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);

-- Machine Learning Future-Ready Predictions Table
create table public.ml_predictions (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  prediction_type text not null,
  prediction_score numeric not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)

alter table public.users enable row level security;
alter table public.farms enable row level security;
alter table public.animals enable row level security;
alter table public.medicines enable row level security;
alter table public.regulatory_rules enable row level security;
alter table public.treatments enable row level security;
alter table public.withdrawals enable row level security;
alter table public.amu_records enable row level security;
alter table public.alerts enable row level security;
alter table public.lab_results enable row level security;
alter table public.audit_logs enable row level security;
alter table public.ml_predictions enable row level security;

-- 4. CREATE RLS POLICIES

-- Users can read their own profiles, admins can read all
create policy "Users profile select" on public.users 
  for select using (auth.uid() = id or exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Farmers can manage their own farms. Vet/Admin can read all farms.
create policy "Farms access" on public.farms
  for all using (
    owner_id = auth.uid() or 
    exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
  );

-- Animals access: restricted to farm owners, vets, or admins
create policy "Animals access" on public.animals
  for all using (
    exists (select 1 from public.farms where id = farm_id and owner_id = auth.uid()) or
    exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
  );

-- Medicines: readable by all logged-in users, writable only by admins
create policy "Medicines select" on public.medicines for select using (auth.uid() is not null);
create policy "Medicines admin write" on public.medicines for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Regulatory rules: readable by all logged-in users, writable only by admins
create policy "Rules select" on public.regulatory_rules for select using (auth.uid() is not null);
create policy "Rules admin write" on public.regulatory_rules for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Treatments: farmers can read treatments for their animals. Vets can read/write. Admins have full access.
create policy "Treatments access" on public.treatments
  for all using (
    exists (select 1 from public.animals a join public.farms f on a.farm_id = f.id where a.id = animal_id and f.owner_id = auth.uid()) or
    exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
  );

-- Withdrawals: farmers can read, system/vet/admin can write
create policy "Withdrawals access" on public.withdrawals
  for all using (
    exists (select 1 from public.animals a join public.farms f on a.farm_id = f.id where a.id = animal_id and f.owner_id = auth.uid()) or
    exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
  );

-- AMU: readable by farm owners (filtered), vets/admins (all)
create policy "AMU access" on public.amu_records
  for all using (
    exists (
      select 1 from public.treatments t 
      join public.animals a on t.animal_id = a.id
      join public.farms f on a.farm_id = f.id
      where t.id = treatment_id and (f.owner_id = auth.uid() or exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin')))
    )
  );

-- Alerts: farmers can read/resolve for their farm, vets/admins read all
create policy "Alerts access" on public.alerts
  for all using (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid()) or
    exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
  );

-- Lab Results: farmers can read, vets/admins can manage
create policy "Lab results access" on public.lab_results
  for all using (
    exists (select 1 from public.animals a join public.farms f on a.farm_id = f.id where a.id = animal_id and f.owner_id = auth.uid()) or
    exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
  );

-- Audit logs & ML predictions: Admin only (ML predictions readable by vets too)
create policy "Audit logs admin access" on public.audit_logs for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "ML predictions access" on public.ml_predictions for all using (
  exists (select 1 from public.users where id = auth.uid() and role in ('veterinarian', 'admin'))
);

-- Public QR profile access: Allow unauthenticated reads for animals with specific qr_token
create policy "Public animal QR read" on public.animals 
  for select using (true); -- Publicly readable so scanner shows status

create policy "Public withdrawals QR read" on public.withdrawals
  for select using (true); -- Public safety lookup for withdrawal status

-- 5. AUTH TRIGGER FUNCTION
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, phone, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New Farmer'),
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'farmer'),
    'active'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. SEED DATA

-- Seed Medicines (Standard Veterinary Antimicrobials)
insert into public.medicines (id, name, active_ingredient, antimicrobial_class, strength, status) values
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Amoxicillin Inj', 'Amoxicillin', 'Penicillins', '150 mg/ml', 'active'),
  ('b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'Oxytetracycline LA', 'Oxytetracycline', 'Tetracyclines', '200 mg/ml', 'active'),
  ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Tylosin 200', 'Tylosin', 'Macrolides', '200 mg/ml', 'active'),
  ('d4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Enrofloxacin 10%', 'Enrofloxacin', 'Fluoroquinolones', '100 mg/ml', 'active');

-- Seed Regulatory Rules (MRL & Withdrawal Periods)
-- Jurisdiction: FSSAI India. MRL in ug/kg or ppm
insert into public.regulatory_rules (id, medicine_id, species, product, mrl, withdrawal_days, jurisdiction, source, version, approval_status) values
  -- Amoxicillin
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'cow', 'milk', '4 ug/kg', 5, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'cow', 'meat', '50 ug/kg', 14, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'buffalo', 'milk', '4 ug/kg', 5, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'goat', 'milk', '4 ug/kg', 5, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  
  -- Oxytetracycline
  (gen_random_uuid(), 'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'cow', 'milk', '100 ug/kg', 7, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'cow', 'meat', '200 ug/kg', 28, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'buffalo', 'milk', '100 ug/kg', 7, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'goat', 'milk', '100 ug/kg', 7, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  
  -- Tylosin
  (gen_random_uuid(), 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'cow', 'milk', '50 ug/kg', 4, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),
  (gen_random_uuid(), 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'cow', 'meat', '100 ug/kg', 21, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved'),

  -- Enrofloxacin (Restricted - Prohibited for Lactating Ruminants / Very high restrictions)
  (gen_random_uuid(), 'd4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'cow', 'milk', 'Prohibited', 0, 'India (FSSAI)', 'FSSAI Prohibited Substances List', '1.0', 'approved'),
  (gen_random_uuid(), 'd4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'cow', 'meat', '100 ug/kg', 28, 'India (FSSAI)', 'FSSAI Food Safety Standards 2021', '1.0', 'approved');

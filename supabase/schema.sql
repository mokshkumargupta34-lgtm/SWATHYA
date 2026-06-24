-- ============================================================================
-- SWASTHYA — Supabase schema
-- Run this once in your project: Supabase dashboard → SQL Editor → New query →
-- paste → Run. Safe to re-run (idempotent).
-- ============================================================================

-- One profile row per authenticated user.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  plan        text not null default 'JAN',   -- JAN | PARIVAR | SAMUDAY
  language    text not null default 'en',
  updated_at  timestamptz not null default now()
);

-- Add plan / language to any pre-existing profiles table (safe to re-run).
alter table public.profiles add column if not exists plan     text not null default 'JAN';
alter table public.profiles add column if not exists language text not null default 'en';

-- Row Level Security: a user may only see and edit their own profile.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Automatically create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already exist.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ============================================================================
-- Avatar storage: a public "avatars" bucket; each user may write only to a
-- folder named after their own user id (e.g. avatars/<uid>/avatar.png).
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Health profile: the care details collected during onboarding, one row per
-- user. Created/updated via upsert from the onboarding form.
-- ============================================================================
create table if not exists public.health_profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  date_of_birth            date,
  gender                   text,
  blood_group              text,
  height_cm                numeric,
  weight_kg                numeric,
  phone                    text,
  location                 text,
  preferred_language       text,
  chronic_conditions       text[] default '{}',
  allergies                text,
  current_medications      text,
  is_pregnant              boolean default false,
  stress_level             int,      -- 1..5 self-reported wellbeing
  emergency_contact_name   text,
  emergency_contact_phone  text,
  notes                    text,
  updated_at               timestamptz not null default now()
);

alter table public.health_profiles enable row level security;

drop policy if exists "Health profile viewable by owner" on public.health_profiles;
create policy "Health profile viewable by owner"
  on public.health_profiles for select
  using (auth.uid() = id);

drop policy if exists "Health profile insertable by owner" on public.health_profiles;
create policy "Health profile insertable by owner"
  on public.health_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Health profile updatable by owner" on public.health_profiles;
create policy "Health profile updatable by owner"
  on public.health_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- Care Console application data.
-- Every user-owned table is row-level-secured so a signed-in user can only
-- ever read or write their *own* rows (auth.uid() = user_id). The medicine
-- catalog (pharmacies / medicines / stock) is global reference data, readable
-- by anyone but only writable by the service role (the seed below).
-- ============================================================================

-- A small reusable helper: keep updated_at fresh on UPDATE.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---- Health records --------------------------------------------------------
create table if not exists public.health_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  type         text not null default 'GENERAL'
                 check (type in ('GENERAL','PRESCRIPTION','LAB','VACCINATION','GROWTH')),
  title        text not null,
  notes        text,
  file_url     text,
  recorded_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists health_records_user_idx on public.health_records (user_id, recorded_at desc);

alter table public.health_records enable row level security;

drop policy if exists "Records selectable by owner" on public.health_records;
create policy "Records selectable by owner"
  on public.health_records for select using (auth.uid() = user_id);
drop policy if exists "Records insertable by owner" on public.health_records;
create policy "Records insertable by owner"
  on public.health_records for insert with check (auth.uid() = user_id);
drop policy if exists "Records updatable by owner" on public.health_records;
create policy "Records updatable by owner"
  on public.health_records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Records deletable by owner" on public.health_records;
create policy "Records deletable by owner"
  on public.health_records for delete using (auth.uid() = user_id);

-- ---- Tele-consultations ----------------------------------------------------
create table if not exists public.consults (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  type         text not null default 'GENERAL'
                 check (type in ('GENERAL','SPECIALIST','MENTAL','MATERNAL')),
  status       text not null default 'SCHEDULED'
                 check (status in ('SCHEDULED','COMPLETED','CANCELLED')),
  scheduled_at timestamptz not null,
  language     text not null default 'en',
  notes        text,
  doctor_name  text,
  created_at   timestamptz not null default now()
);
create index if not exists consults_user_idx on public.consults (user_id, scheduled_at desc);

alter table public.consults enable row level security;

drop policy if exists "Consults selectable by owner" on public.consults;
create policy "Consults selectable by owner"
  on public.consults for select using (auth.uid() = user_id);
drop policy if exists "Consults insertable by owner" on public.consults;
create policy "Consults insertable by owner"
  on public.consults for insert with check (auth.uid() = user_id);
drop policy if exists "Consults updatable by owner" on public.consults;
create policy "Consults updatable by owner"
  on public.consults for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Consults deletable by owner" on public.consults;
create policy "Consults deletable by owner"
  on public.consults for delete using (auth.uid() = user_id);

-- ---- Family members --------------------------------------------------------
create table if not exists public.family_members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  relation    text not null,
  dob         date,
  created_at  timestamptz not null default now()
);
create index if not exists family_members_user_idx on public.family_members (user_id);

alter table public.family_members enable row level security;

drop policy if exists "Family selectable by owner" on public.family_members;
create policy "Family selectable by owner"
  on public.family_members for select using (auth.uid() = user_id);
drop policy if exists "Family insertable by owner" on public.family_members;
create policy "Family insertable by owner"
  on public.family_members for insert with check (auth.uid() = user_id);
drop policy if exists "Family deletable by owner" on public.family_members;
create policy "Family deletable by owner"
  on public.family_members for delete using (auth.uid() = user_id);

-- ---- Medicine catalog (global reference data) ------------------------------
create table if not exists public.pharmacies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  village     text not null,
  distance_km numeric not null default 0
);

create table if not exists public.medicines (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  generic_name text,
  is_generic   boolean not null default false,
  price        numeric not null default 0
);

create table if not exists public.medicine_stock (
  id          uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines (id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies (id) on delete cascade,
  quantity    int not null default 0,
  price       numeric not null default 0,
  unique (medicine_id, pharmacy_id)
);

alter table public.pharmacies     enable row level security;
alter table public.medicines      enable row level security;
alter table public.medicine_stock enable row level security;

-- Catalog is public read-only for everyone (anon + authenticated).
drop policy if exists "Pharmacies are public" on public.pharmacies;
create policy "Pharmacies are public" on public.pharmacies for select using (true);
drop policy if exists "Medicines are public" on public.medicines;
create policy "Medicines are public" on public.medicines for select using (true);
drop policy if exists "Stock is public" on public.medicine_stock;
create policy "Stock is public" on public.medicine_stock for select using (true);

-- ============================================================================
-- Seed: ~6 pharmacies, ~15 medicines (each branded med has a cheaper generic
-- counterpart) and stock rows. Idempotent — re-running updates in place.
-- ============================================================================
insert into public.pharmacies (name, village, distance_km) values
  ('Jan Aushadhi Kendra', 'Rampur',     0.8),
  ('City Pharmacy',       'Haldia',     1.4),
  ('PHC Dispensary',      'Sundarpur',  2.1),
  ('Care Pharmacy',       'Belgaon',    3.0),
  ('Aarogya Medicals',    'Mirzapur',   4.2),
  ('Gram Health Store',   'Kanhaipur',  5.5)
on conflict (name) do update
  set village = excluded.village, distance_km = excluded.distance_km;

insert into public.medicines (name, generic_name, is_generic, price) values
  ('Crocin 500mg',          'Paracetamol',        false, 25),
  ('Paracetamol 500mg',     'Paracetamol',        true,  10),
  ('Augmentin 625mg',       'Amoxicillin+Clav',   false, 145),
  ('Amoxicillin 250mg',     'Amoxicillin',        true,  38),
  ('Glycomet 500mg',        'Metformin',          false, 42),
  ('Metformin 500mg',       'Metformin',          true,  14),
  ('Lipitor 10mg',          'Atorvastatin',       false, 110),
  ('Atorvastatin 10mg',     'Atorvastatin',       true,  28),
  ('Telma 40mg',            'Telmisartan',        false, 96),
  ('Telmisartan 40mg',      'Telmisartan',        true,  31),
  ('Pan 40mg',              'Pantoprazole',       false, 88),
  ('Pantoprazole 40mg',     'Pantoprazole',       true,  24),
  ('Iron + Folic Acid',     'Ferrous+Folic',      true,  0),
  ('ORS Sachet',            'Oral Rehydration',   true,  6),
  ('Insulin (generic)',     'Human Insulin',      true,  140)
on conflict (name) do update
  set generic_name = excluded.generic_name,
      is_generic   = excluded.is_generic,
      price        = excluded.price;

-- Stock: spread medicines across pharmacies. Idempotent via unique key.
insert into public.medicine_stock (medicine_id, pharmacy_id, quantity, price)
select m.id, p.id, s.quantity, round(m.price * s.price_mult)::numeric
from (values
  ('Crocin 500mg',      'City Pharmacy',        120, 1.00),
  ('Paracetamol 500mg', 'Jan Aushadhi Kendra',  300, 0.80),
  ('Paracetamol 500mg', 'PHC Dispensary',       180, 0.70),
  ('Augmentin 625mg',   'City Pharmacy',         40, 1.00),
  ('Amoxicillin 250mg', 'Jan Aushadhi Kendra',  150, 0.90),
  ('Glycomet 500mg',    'Care Pharmacy',         90, 1.00),
  ('Metformin 500mg',   'Jan Aushadhi Kendra',  220, 0.85),
  ('Lipitor 10mg',      'Aarogya Medicals',      35, 1.00),
  ('Atorvastatin 10mg', 'Jan Aushadhi Kendra',  130, 0.90),
  ('Telma 40mg',        'Care Pharmacy',         50, 1.00),
  ('Telmisartan 40mg',  'PHC Dispensary',       110, 0.85),
  ('Pan 40mg',          'City Pharmacy',         70, 1.00),
  ('Pantoprazole 40mg', 'Jan Aushadhi Kendra',  160, 0.90),
  ('Iron + Folic Acid', 'PHC Dispensary',       500, 1.00),
  ('ORS Sachet',        'Gram Health Store',    400, 1.00),
  ('Insulin (generic)', 'Aarogya Medicals',      18, 1.00),
  ('Insulin (generic)', 'Care Pharmacy',          0, 1.00)
) as s(med_name, ph_name, quantity, price_mult)
join public.medicines  m on m.name = s.med_name
join public.pharmacies p on p.name = s.ph_name
on conflict (medicine_id, pharmacy_id) do update
  set quantity = excluded.quantity, price = excluded.price;

-- ============================================================================
-- Doctor portal: roles, specialties and consult assignment.
-- A patient books a consult (unassigned) → it enters the shared queue for
-- doctors whose specialty matches the consult type → a doctor accepts and
-- completes it, attaching notes + a prescription that flow back to the patient.
-- ============================================================================

-- Role + specialty on the profile. Patients stay 'patient'; doctors carry a
-- specialty matching a consult type (GENERAL | SPECIALIST | MENTAL | MATERNAL).
alter table public.profiles add column if not exists role      text not null default 'patient';
alter table public.profiles add column if not exists specialty text;

alter table public.consults add column if not exists doctor_id    uuid references auth.users (id) on delete set null;
alter table public.consults add column if not exists doctor_notes text;
alter table public.consults add column if not exists prescription text;
alter table public.consults add column if not exists patient_name text;
create index if not exists consults_doctor_idx on public.consults (doctor_id);
create index if not exists consults_type_status_idx on public.consults (type, status);

-- New signups may declare themselves a doctor (+ specialty) via signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, specialty)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'role', 'patient'),
    new.raw_user_meta_data ->> 'specialty'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Doctors can SELECT consults in their specialty (the shared queue) plus any
-- already assigned to them. The patient-owner policies from earlier still apply
-- (RLS policies are OR-combined), so patients keep seeing only their own rows.
drop policy if exists "Doctors see specialty consults" on public.consults;
create policy "Doctors see specialty consults"
  on public.consults for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'doctor'
        and (p.specialty = consults.type or consults.doctor_id = auth.uid())
    )
  );

drop policy if exists "Doctors update specialty consults" on public.consults;
create policy "Doctors update specialty consults"
  on public.consults for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'doctor'
        and (p.specialty = consults.type or consults.doctor_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'doctor'
        and (p.specialty = consults.type or consults.doctor_id = auth.uid())
    )
  );

-- A doctor may read the health profile of a patient who has a consult in the
-- doctor's specialty (so they can prepare). Patients still only see their own.
drop policy if exists "Doctors view patient health for their consults" on public.health_profiles;
create policy "Doctors view patient health for their consults"
  on public.health_profiles for select
  using (
    exists (
      select 1
      from public.consults c
      join public.profiles p on p.id = auth.uid()
      where c.user_id = health_profiles.id
        and p.role = 'doctor'
        and (p.specialty = c.type or c.doctor_id = auth.uid())
    )
  );

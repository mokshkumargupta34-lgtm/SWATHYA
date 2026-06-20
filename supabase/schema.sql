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
  updated_at  timestamptz not null default now()
);

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

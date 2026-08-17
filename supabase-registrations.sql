create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  child_birth_date date not null,
  child_age integer,
  school_level text not null,
  city_country text not null,
  experience_level text not null,
  selected_programs text[] not null default '{}',
  parent_name text not null,
  parent_phone text not null,
  parent_email text not null,
  preferred_contact text not null,
  preferred_days text[] not null default '{}',
  preferred_period text not null,
  course_type text not null,
  marketing_consent boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

create policy "Allow public registration inserts"
on public.registrations
for insert
to anon
with check (status = 'new');

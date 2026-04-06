create extension if not exists pgcrypto;

create table if not exists public.profiles (
  clerk_user_id text primary key,
  email text,
  first_name text,
  last_name text,
  username text,
  image_url text,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_submissions (
  clerk_user_id text primary key references public.profiles(clerk_user_id) on delete cascade,
  stage text not null check (stage in ('early', 'accelerating', 'advanced')),
  goal text not null check (goal in ('stabilize', 'regrow', 'appearance')),
  budget text not null check (budget in ('lean', 'balanced', 'all-in')),
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  lane_title text not null,
  lane_summary text not null,
  lane_badge text not null,
  lane_checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists assessment_submissions_set_updated_at on public.assessment_submissions;
create trigger assessment_submissions_set_updated_at
before update on public.assessment_submissions
for each row
execute function public.set_updated_at();

create index if not exists assessment_submissions_updated_at_idx
on public.assessment_submissions (updated_at desc);

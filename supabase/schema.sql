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

create table if not exists public.barbers (
  id text primary key,
  rank integer not null default 999,
  barber_name text not null,
  city text not null,
  neighborhood text,
  state text not null,
  shop_name text,
  shop_address text,
  primary_booking_url text,
  profile_urls jsonb not null default '[]'::jsonb,
  social_urls jsonb not null default '[]'::jsonb,
  evidence_summary text not null default '',
  review_signal_summary text not null default '',
  likely_price_tier text,
  confidence_score_1_to_5 integer not null default 3 check (confidence_score_1_to_5 between 1 and 5),
  source_count integer not null default 1 check (source_count >= 0),
  recommended_tags jsonb not null default '[]'::jsonb,
  ranking_notes text not null default '',
  status text not null default 'pending_review' check (status in ('approved', 'pending_review', 'rejected')),
  is_ugly_manling_verified boolean not null default false,
  source_urls jsonb not null default '[]'::jsonb,
  discovered_by text,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.barber_submissions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references public.profiles(clerk_user_id) on delete cascade,
  author_label text not null,
  barber_name text not null,
  barbershop text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.barber_votes (
  barber_id text not null references public.barbers(id) on delete cascade,
  clerk_user_id text not null references public.profiles(clerk_user_id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (barber_id, clerk_user_id)
);

create table if not exists public.barber_comments (
  id uuid primary key default gen_random_uuid(),
  barber_id text not null references public.barbers(id) on delete cascade,
  clerk_user_id text not null references public.profiles(clerk_user_id) on delete cascade,
  author_label text not null,
  body text not null check (char_length(body) between 10 and 400),
  source_tag text,
  status text not null default 'approved' check (status in ('pending', 'approved', 'flagged', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

alter table public.barber_votes enable row level security;
alter table public.barber_comments enable row level security;

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

drop trigger if exists barbers_set_updated_at on public.barbers;
create trigger barbers_set_updated_at
before update on public.barbers
for each row
execute function public.set_updated_at();

drop trigger if exists barber_submissions_set_updated_at on public.barber_submissions;
create trigger barber_submissions_set_updated_at
before update on public.barber_submissions
for each row
execute function public.set_updated_at();

drop trigger if exists barber_votes_set_updated_at on public.barber_votes;
create trigger barber_votes_set_updated_at
before update on public.barber_votes
for each row
execute function public.set_updated_at();

drop trigger if exists barber_comments_set_updated_at on public.barber_comments;
create trigger barber_comments_set_updated_at
before update on public.barber_comments
for each row
execute function public.set_updated_at();

create index if not exists assessment_submissions_updated_at_idx
on public.assessment_submissions (updated_at desc);

create index if not exists barbers_status_rank_idx
on public.barbers (status, city, rank);

create index if not exists barber_submissions_status_created_at_idx
on public.barber_submissions (status, created_at desc);

create index if not exists barber_votes_barber_id_updated_at_idx
on public.barber_votes (barber_id, updated_at desc);

create index if not exists barber_comments_barber_id_status_created_at_idx
on public.barber_comments (barber_id, status, created_at desc)
where deleted_at is null;

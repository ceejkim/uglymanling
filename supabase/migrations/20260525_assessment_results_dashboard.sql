create table if not exists public.assessment_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_population_stats (
  age_bucket text primary key,
  sample_size integer not null default 0 check (sample_size >= 0),
  avg_visible_loss_score numeric(5, 2) not null default 0,
  avg_concern_level numeric(5, 2) not null default 0,
  avg_pace_score numeric(5, 2) not null default 0,
  avg_lifestyle_risk_score numeric(5, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.assessment_sessions
add column if not exists age_bucket text,
add column if not exists self_reported_stage text,
add column if not exists concern_level integer,
add column if not exists visible_loss_score integer,
add column if not exists pace_score integer,
add column if not exists medical_flags jsonb not null default '[]'::jsonb,
add column if not exists lifestyle_flags jsonb not null default '[]'::jsonb,
add column if not exists style_flags jsonb not null default '[]'::jsonb,
add column if not exists raw_response_json jsonb not null default '{}'::jsonb,
add column if not exists derived_metrics_json jsonb not null default '{}'::jsonb;

alter table public.assessment_results
add column if not exists derived_metrics_json jsonb not null default '{}'::jsonb,
add column if not exists result_cards_json jsonb not null default '[]'::jsonb;

create index if not exists assessment_events_session_created_at_idx
on public.assessment_events (session_id, created_at desc);

create index if not exists assessment_events_type_created_at_idx
on public.assessment_events (event_type, created_at desc);

create index if not exists assessment_sessions_age_completed_at_idx
on public.assessment_sessions (age_bucket, completed_at desc)
where completed_at is not null;

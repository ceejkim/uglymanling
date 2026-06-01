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

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text references public.profiles(clerk_user_id) on delete cascade,
  anonymous_id text not null,
  posthog_distinct_id text not null,
  resume_token text not null unique,
  assessment_version text not null,
  entry_source text,
  entry_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  abandoned_at timestamptz,
  last_question_id text,
  last_section_id text,
  completion_status text not null default 'started' check (completion_status in ('started', 'completed', 'abandoned')),
  total_elapsed_ms integer not null default 0,
  age_bucket text,
  self_reported_stage text,
  concern_level integer,
  visible_loss_score integer,
  pace_score integer,
  medical_flags jsonb not null default '[]'::jsonb,
  lifestyle_flags jsonb not null default '[]'::jsonb,
  style_flags jsonb not null default '[]'::jsonb,
  raw_response_json jsonb not null default '{}'::jsonb,
  derived_metrics_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_answers (
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  question_id text not null,
  section_id text not null,
  step_index smallint not null,
  answer_value text,
  answer_values jsonb not null default '[]'::jsonb,
  answer_label text,
  elapsed_ms integer not null default 0,
  changed_from text,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (session_id, question_id)
);

create table if not exists public.assessment_results (
  session_id uuid primary key references public.assessment_sessions(id) on delete cascade,
  result_version text not null,
  profile_band text not null,
  summary_title text not null,
  summary_body text not null,
  summary_badge text not null,
  summary_bullets jsonb not null default '[]'::jsonb,
  benchmark_payload jsonb not null default '{}'::jsonb,
  recommendation_payload jsonb not null default '[]'::jsonb,
  derived_metrics_json jsonb not null default '{}'::jsonb,
  result_cards_json jsonb not null default '[]'::jsonb,
  membership_offer_variant text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  feedback_scope text not null check (feedback_scope in ('question', 'result')),
  question_id text,
  sentiment smallint check (sentiment in (-1, 1)),
  rating integer check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_recommendation_clicks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  recommendation_key text not null,
  destination_type text not null,
  destination_path text,
  position smallint not null,
  clicked_at timestamptz not null default now()
);

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

create table if not exists public.assessment_question_insights (
  question_id text not null,
  answer_value text not null,
  insight_kind text not null default 'community_share' check (insight_kind in ('community_share', 'clinical_context', 'product_hint')),
  insight_title text not null,
  insight_template text not null,
  fallback_copy text not null,
  min_sample_size integer not null default 8 check (min_sample_size >= 0),
  source_label text not null default 'anonymous opted-in survey responses',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (question_id, answer_value, insight_kind)
);

insert into public.assessment_question_insights (
  question_id,
  answer_value,
  insight_kind,
  insight_title,
  insight_template,
  fallback_copy,
  min_sample_size,
  source_label
)
values (
  'progression_pace',
  'rapid_6mo',
  'clinical_context',
  'Fast change deserves a rule-out',
  '{percent} of opted-in respondents also described rapid change over 6 months.',
  'Rapid 6-month change is a useful signal to document. If it continues, a clinician can help rule out shedding triggers, medication effects, thyroid or iron issues, and inflammatory scalp conditions.',
  8,
  'anonymous opted-in survey responses'
)
on conflict (question_id, answer_value, insight_kind) do update
set
  insight_title = excluded.insight_title,
  insight_template = excluded.insight_template,
  fallback_copy = excluded.fallback_copy,
  min_sample_size = excluded.min_sample_size,
  source_label = excluded.source_label,
  is_active = true,
  updated_at = now();

create or replace function public.get_assessment_answer_insight(
  p_question_id text,
  p_answer_values text[],
  p_min_sample_size integer default 8
)
returns table (
  question_id text,
  answer_value text,
  answer_count integer,
  sample_size integer,
  response_rate numeric(5, 1),
  has_sufficient_sample boolean
)
language sql
stable
as $$
  with selected_answers as (
    select distinct selected.value as answer_value
    from unnest(coalesce(p_answer_values, array[]::text[])) as selected(value)
    where selected.value <> ''
  ),
  eligible_sessions as (
    select consent.session_id
    from public.assessment_answers as consent
    where consent.question_id = 'anonymous_research_consent'
      and consent.answer_value = 'yes'
  ),
  question_rows as (
    select answer.session_id, answer.answer_value, answer.answer_values
    from public.assessment_answers as answer
    join eligible_sessions as eligible on eligible.session_id = answer.session_id
    where answer.question_id = p_question_id
  ),
  sample as (
    select count(distinct session_id)::integer as sample_size
    from question_rows
  ),
  answer_counts as (
    select
      selected_answers.answer_value,
      count(distinct question_rows.session_id)::integer as answer_count
    from selected_answers
    left join question_rows
      on question_rows.answer_value = selected_answers.answer_value
      or question_rows.answer_values ? selected_answers.answer_value
    group by selected_answers.answer_value
  )
  select
    p_question_id as question_id,
    answer_counts.answer_value,
    answer_counts.answer_count,
    sample.sample_size,
    case
      when sample.sample_size = 0 then null
      else round((answer_counts.answer_count::numeric / sample.sample_size::numeric) * 100, 1)
    end as response_rate,
    sample.sample_size >= p_min_sample_size as has_sufficient_sample
  from answer_counts
  cross join sample;
$$;

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    execute $storage_bucket$
      insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values (
        'assessment-images',
        'assessment-images',
        false,
        8388608,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      )
      on conflict (id) do update
      set
        public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types
    $storage_bucket$;
  end if;
end $$;

create table if not exists public.assessment_image_uploads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  question_id text not null,
  image_slot text not null,
  storage_bucket text not null default 'assessment-images',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  stripe_customer_id text primary key,
  clerk_user_id text not null references public.profiles(clerk_user_id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_checkout_session_id text,
  assessment_session_id uuid references public.assessment_sessions(id) on delete set null,
  price_lookup_key text not null,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
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

alter table public.assessment_submissions
add column if not exists latest_session_id uuid references public.assessment_sessions(id) on delete set null;

alter table public.assessment_submissions
add column if not exists assessment_version text;

alter table public.assessment_submissions
add column if not exists answers_snapshot jsonb not null default '{}'::jsonb;

alter table public.assessment_submissions
add column if not exists completed_at timestamptz;

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

drop trigger if exists assessment_sessions_set_updated_at on public.assessment_sessions;
create trigger assessment_sessions_set_updated_at
before update on public.assessment_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists assessment_answers_set_updated_at on public.assessment_answers;
create trigger assessment_answers_set_updated_at
before update on public.assessment_answers
for each row
execute function public.set_updated_at();

drop trigger if exists assessment_results_set_updated_at on public.assessment_results;
create trigger assessment_results_set_updated_at
before update on public.assessment_results
for each row
execute function public.set_updated_at();

drop trigger if exists assessment_question_insights_set_updated_at on public.assessment_question_insights;
create trigger assessment_question_insights_set_updated_at
before update on public.assessment_question_insights
for each row
execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
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

create index if not exists assessment_sessions_clerk_user_started_at_idx
on public.assessment_sessions (clerk_user_id, started_at desc);

create index if not exists assessment_sessions_anonymous_started_at_idx
on public.assessment_sessions (anonymous_id, started_at desc);

create index if not exists assessment_sessions_version_started_at_idx
on public.assessment_sessions (assessment_version, started_at desc);

create index if not exists assessment_sessions_completed_at_idx
on public.assessment_sessions (completed_at desc)
where completed_at is not null;

create index if not exists assessment_sessions_age_completed_at_idx
on public.assessment_sessions (age_bucket, completed_at desc)
where completed_at is not null;

create index if not exists assessment_answers_question_answered_at_idx
on public.assessment_answers (question_id, answered_at desc);

create index if not exists assessment_answers_question_value_idx
on public.assessment_answers (question_id, answer_value)
where answer_value is not null;

create index if not exists assessment_answers_answer_values_gin_idx
on public.assessment_answers using gin (answer_values);

create index if not exists assessment_answers_section_answered_at_idx
on public.assessment_answers (section_id, answered_at desc);

create index if not exists assessment_feedback_scope_created_at_idx
on public.assessment_feedback (feedback_scope, created_at desc);

create index if not exists assessment_feedback_question_created_at_idx
on public.assessment_feedback (question_id, created_at desc)
where question_id is not null;

create index if not exists assessment_recommendation_clicks_recommendation_clicked_at_idx
on public.assessment_recommendation_clicks (recommendation_key, clicked_at desc);

create index if not exists assessment_events_session_created_at_idx
on public.assessment_events (session_id, created_at desc);

create index if not exists assessment_events_type_created_at_idx
on public.assessment_events (event_type, created_at desc);

create index if not exists assessment_question_insights_active_question_idx
on public.assessment_question_insights (question_id, answer_value)
where is_active;

create index if not exists assessment_image_uploads_session_created_at_idx
on public.assessment_image_uploads (session_id, created_at desc);

create index if not exists assessment_image_uploads_question_slot_idx
on public.assessment_image_uploads (question_id, image_slot);

create index if not exists subscriptions_clerk_user_updated_at_idx
on public.subscriptions (clerk_user_id, updated_at desc);

create index if not exists barbers_status_rank_idx
on public.barbers (status, city, rank);

create index if not exists barber_submissions_status_created_at_idx
on public.barber_submissions (status, created_at desc);

create index if not exists barber_votes_barber_id_updated_at_idx
on public.barber_votes (barber_id, updated_at desc);

create index if not exists barber_comments_barber_id_status_created_at_idx
on public.barber_comments (barber_id, status, created_at desc)
where deleted_at is null;

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

drop trigger if exists assessment_question_insights_set_updated_at on public.assessment_question_insights;
create trigger assessment_question_insights_set_updated_at
before update on public.assessment_question_insights
for each row
execute function public.set_updated_at();

create index if not exists assessment_question_insights_active_question_idx
on public.assessment_question_insights (question_id, answer_value)
where is_active;

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

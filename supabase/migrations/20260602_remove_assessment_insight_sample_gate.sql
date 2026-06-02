alter table public.assessment_question_insights
alter column min_sample_size set default 1;

update public.assessment_question_insights
set min_sample_size = 1,
    updated_at = now()
where min_sample_size > 1;

create or replace function public.get_assessment_answer_insight(
  p_question_id text,
  p_answer_values text[],
  p_min_sample_size integer default 1
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

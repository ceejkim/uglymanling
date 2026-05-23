# Assessment Redesign V2

## Purpose

This document defines the next version of the Ugly Manling assessment funnel.

The goal is not to create a bigger quiz.

The goal is to create a premium diagnostic flow that:

1. feels fast,
2. feels trustworthy,
3. captures structured data,
4. improves completion,
5. produces useful recommendations,
6. and naturally monetizes into membership, consults, barber discovery, and community participation.

This spec is written against the current repo state:

- the app already has a dedicated `/assessment` route
- PostHog client and server capture are already wired
- Stripe checkout and webhook scaffolding exist
- Supabase already stores a simple `assessment_submissions` row per signed-in user

The redesign should preserve those foundations while replacing the current 4-toggle workbench with a proper multi-step assessment system.

## Product Decision

Use `/assessment` as the canonical route.

Reasons:

1. it already exists in the app and on the homepage,
2. it is clearer and more trustworthy than `/diagnostic`,
3. it gives the team continuity for SEO, instrumentation, and internal references.

Optional later experiment:

- test `/hair-assessment` as a campaign alias that redirects to `/assessment`

## Experience Principles

The assessment should feel like:

1. a fast premium intake,
2. a calm scientific interface,
3. a decision engine,
4. not a personality quiz,
5. not a telehealth intake,
6. not a meme funnel.

Visual direction:

- warm off-white background
- soft blue data accents
- deep navy type
- restrained yellow duck accents
- thin dividers, small benchmark markers, subtle motion
- one small duck presence per major screen, not cartoon wallpaper

Copy direction:

- calm, short, credible
- slightly human, not sterile
- no “journey”, “transformation”, or hype language
- scientific language should support trust, not cosplay expertise

## Page Flow

### Entry

`/` homepage CTA -> `/assessment?src=homepage_hero`

Other entry sources should append structured params:

- `src=footer_cta`
- `src=community_page`
- `src=barber_directory`
- `utm_*`

### Assessment Flow

1. `GET /assessment`
2. immediate first question: Norwood stage selector
3. section 1 through section 4
4. transitional “processing your profile” interstitial for 400 to 900 ms
5. results view on `/assessment/results/[sessionId]`
6. recommendation actions
7. membership offer
8. end-of-flow feedback

### Results Routing

Use a dedicated results route:

- `/assessment/results/[sessionId]`

Reasons:

1. shareable and resumable state
2. easier analytics
3. easier premium export and future logged-in dashboard
4. cleaner server rendering for recommendations and benchmark cards

## Information Architecture

Keep the assessment to 4 sections and 15 questions total.

### Section 1: Hair Loss Profile

Purpose: classify current stage and progression.

Intro line:

`A quick baseline so we can calibrate the rest accurately.`

Questions:

1. `norwood_stage`
2. `loss_pattern_primary`
3. `progression_timeline`
4. `family_history`
5. `shedding_concern`

### Section 2: Grooming and Styling

Purpose: understand visible presentation and appearance friction.

Intro line:

`How you wear it matters as much as what you lose.`

Questions:

1. `current_hairstyle_confidence`
2. `haircut_frequency`
3. `facial_hair_usage`
4. `styling_priority`

### Section 3: Confidence and Goals

Purpose: capture emotional motivation and desired outcome.

Intro line:

`This helps us optimize for the outcome you actually care about.`

Questions:

1. `primary_goal`
2. `urgency_level`
3. `confidence_impact`
4. `change_openness`

### Section 4: Current Solutions and Habits

Purpose: determine current action state, budget, and recommendation readiness.

Intro line:

`A few practical signals so the next steps fit real life.`

Questions:

1. `current_treatment_status`
2. `scalp_care_habit`
3. `budget_band`
4. `next_step_preference`

## Question Design Rules

Every question should:

1. fit on one mobile screen without scrolling when possible,
2. use tap targets at least 44 px high,
3. allow `not_sure` where uncertainty is common,
4. prefer chips, segmented controls, cards, or visual selectors over text inputs,
5. save immediately after answer,
6. show optional feedback below the answer area,
7. avoid freeform response unless there is a clear downstream use.

## First Interaction: Norwood Stage

The first screen should not be a generic hero.

It should immediately present:

- progress bar at top
- small label: `2 minute assessment`
- question: `Where are you currently on the Norwood Scale?`
- small helper copy: `Pick the closest match. Precision helps the recommendations.`

### Recommended UI

Use a horizontally scrollable visual card rail with 7 stages plus `Not sure`.

Each card should include:

- clean simplified silhouette/illustration
- stage label: `I`, `II`, `III`, `III Vertex`, `IV`, `V+`
- one-line descriptor
- selected state with thin blue outline and soft benchmark glow

Behavior:

1. tap selects immediately
2. after selection, auto-advance after 250 to 400 ms
3. preserve a back action
4. do not require a next button on this first question

This creates momentum quickly and frames the assessment as structured, not fluffy.

## UX Structure

### Shell

The dedicated assessment page should remove most homepage distractions.

Keep only:

- compact brand mark
- subtle privacy/trust note
- optional exit link: `Back to home`

Remove:

- full nav
- footer clutter
- unrelated CTAs

### Top Region

Persistent top rail:

- progress bar
- section label
- questions remaining count
- lightweight save state

Example:

`Section 2 of 4`
`9 questions remaining`

### Question Region

Each question view should contain:

1. section title
2. one-sentence rationale
3. single question prompt
4. answer UI
5. optional help or benchmark note
6. optional mini-feedback control

### Bottom Region

Sticky mobile footer:

- back button
- continue button only when manual advance is needed
- progress confidence note when useful

### Transitions

Use subtle transitions only:

- crossfade between questions
- horizontal slide between sections
- quick “analyzing profile” progress pulse before results

Do not use gamified or loud motion.

## Results Information Hierarchy

Results should feel valuable before monetization appears.

### Order

1. `Your current profile`
2. `What this likely means`
3. `Where you stand relative to peers`
4. `Recommended next steps`
5. `Most relevant Ugly Manling paths`
6. `Membership offer`
7. `Quick feedback`

### Results Modules

#### 1. Profile Summary Card

Show:

- Norwood stage estimate
- progression summary
- styling friction summary
- primary goal
- confidence impact

Tone:

`You look closer to an early-to-mid stabilization profile than a high-loss emergency case.`

#### 2. Interpretation Card

Show 2 to 3 insights:

- likely decision tension
- whether appearance, stabilization, or education should lead
- what the user should not waste time on

#### 3. Peer Benchmark Card

Show only 2 to 3 data points.

Examples:

- `Earlier than 68% of users in your age band`
- `Most users with your profile prioritize style optimization first`
- `Men with similar urgency usually click barber or consult before products`

#### 4. Recommendations Stack

Recommended CTA cards should be ranked, not shown as a random grid.

Allowed destinations:

- barber discovery
- hairstyle exploration
- scalp care education
- medication education
- 1:1 consult
- community stories
- transplant education
- grooming and confidence improvements
- product bundle suggestions

#### 5. Premium Membership Module

Show after free recommendations, not before.

Free value builds trust first.

#### 6. End Feedback

Single low-friction question with optional text.

## Recommended Component Hierarchy

### Routes

- `app/assessment/page.tsx`
- `app/assessment/results/[sessionId]/page.tsx`
- `app/api/assessment/sessions/route.ts`
- `app/api/assessment/results/[sessionId]/route.ts`
- `app/api/assessment/feedback/route.ts`

### UI Components

- `components/assessment/assessment-shell.tsx`
- `components/assessment/assessment-header.tsx`
- `components/assessment/assessment-progress.tsx`
- `components/assessment/assessment-question-frame.tsx`
- `components/assessment/norwood-stage-picker.tsx`
- `components/assessment/question-card-group.tsx`
- `components/assessment/question-chip-group.tsx`
- `components/assessment/question-segmented-control.tsx`
- `components/assessment/section-transition.tsx`
- `components/assessment/inline-question-feedback.tsx`
- `components/assessment/mobile-action-bar.tsx`
- `components/assessment/results/profile-summary-card.tsx`
- `components/assessment/results/peer-benchmark-card.tsx`
- `components/assessment/results/recommendation-stack.tsx`
- `components/assessment/results/recommendation-card.tsx`
- `components/assessment/results/membership-offer-card.tsx`
- `components/assessment/results/end-feedback-card.tsx`

### Client Libraries

- `lib/assessment/questions.ts`
- `lib/assessment/scoring.ts`
- `lib/assessment/recommendations.ts`
- `lib/assessment/benchmarks.ts`
- `lib/analytics/assessment-events.ts`

## Architecture Decision

Replace the current single-row save model with a session-based model plus a latest snapshot.

### Why

The current `assessment_submissions` table is good for “latest saved state” but weak for:

1. dropoff analysis
2. section timing
3. partial completion
4. peer cohort generation
5. recommendation versioning
6. anonymous-to-authenticated continuity

### Recommended Model

Use both:

1. append-only session tables for analytics and product intelligence
2. denormalized latest profile snapshot for speed and simplicity

## Recommended Database Additions

Keep `profiles` and the current `assessment_submissions` table for compatibility, but add the following.

### 1. `assessment_sessions`

Purpose:

- one row per started assessment
- works for anonymous or authenticated users

Suggested fields:

- `id uuid primary key`
- `clerk_user_id text null references profiles(clerk_user_id)`
- `anonymous_id text not null`
- `posthog_distinct_id text not null`
- `assessment_version text not null`
- `entry_source text`
- `entry_path text`
- `utm_source text`
- `utm_medium text`
- `utm_campaign text`
- `utm_term text`
- `utm_content text`
- `started_at timestamptz not null default now()`
- `completed_at timestamptz`
- `abandoned_at timestamptz`
- `last_question_id text`
- `last_section_id text`
- `completion_status text not null check (completion_status in ('started','completed','abandoned'))`
- `total_elapsed_ms integer not null default 0`

Indexes:

- `(clerk_user_id, started_at desc)`
- `(anonymous_id, started_at desc)`
- `(assessment_version, started_at desc)`
- partial index on `completed_at is not null`

### 2. `assessment_answers`

Purpose:

- one row per answered question

Suggested fields:

- `session_id uuid not null references assessment_sessions(id) on delete cascade`
- `question_id text not null`
- `section_id text not null`
- `step_index smallint not null`
- `answer_value text`
- `answer_values jsonb not null default '[]'::jsonb`
- `answer_label text`
- `answered_at timestamptz not null default now()`
- `elapsed_ms integer not null default 0`
- `changed_from text`
- primary key `(session_id, question_id)`

Indexes:

- `(question_id, answered_at desc)`
- `(section_id, answered_at desc)`

### 3. `assessment_question_feedback`

Purpose:

- capture “Was this question accurate/helpful?” and freeform feedback

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `session_id uuid not null references assessment_sessions(id) on delete cascade`
- `question_id text not null`
- `feedback_type text not null check (feedback_type in ('thumbs_up','thumbs_down','text'))`
- `sentiment smallint check (sentiment in (-1, 1))`
- `body text`
- `created_at timestamptz not null default now()`

Indexes:

- `(question_id, created_at desc)`

### 4. `assessment_results`

Purpose:

- freeze what the user saw at completion time

Suggested fields:

- `session_id uuid primary key references assessment_sessions(id) on delete cascade`
- `result_version text not null`
- `summary_title text not null`
- `summary_body text not null`
- `profile_band text not null`
- `confidence_score numeric(5,2) not null`
- `benchmark_payload jsonb not null`
- `recommendation_payload jsonb not null`
- `membership_offer_variant text`
- `created_at timestamptz not null default now()`

### 5. `assessment_recommendation_clicks`

Purpose:

- connect result cards to downstream conversion

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `session_id uuid not null references assessment_sessions(id) on delete cascade`
- `recommendation_key text not null`
- `destination_type text not null`
- `destination_path text`
- `position smallint not null`
- `clicked_at timestamptz not null default now()`

Indexes:

- `(recommendation_key, clicked_at desc)`

### 6. `subscriptions`

Persist Stripe state instead of relying only on webhooks + PostHog.

Suggested fields:

- `stripe_customer_id text primary key`
- `clerk_user_id text not null references profiles(clerk_user_id) on delete cascade`
- `stripe_subscription_id text unique not null`
- `price_lookup_key text not null`
- `status text not null`
- `current_period_end timestamptz`
- `cancel_at_period_end boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 7. Extend `assessment_submissions`

Keep this as the latest snapshot table, but expand it.

Add fields such as:

- `latest_session_id uuid`
- `norwood_stage text`
- `loss_pattern_primary text`
- `progression_timeline text`
- `current_hairstyle_confidence text`
- `primary_goal text`
- `confidence_impact text`
- `current_treatment_status text`
- `next_step_preference text`
- `recommendation_profile_band text`
- `result_version text`

## Data Design Notes

Important rules:

1. do not store sensitive medical detail you do not use
2. use age bands, not birthdate
3. use normalized enums or constrained text values for core answer fields
4. store result payloads as snapshots so recommendation changes do not rewrite history
5. use append-only completion records for benchmarking and product learning

This follows the repo’s existing preference for explicit relational tables and keeps Supabase queryable for analytics backfills.

## Recommendation Engine: MVP Logic

Use a deterministic rules engine first.

Do not use AI for first-pass recommendations.

### Inputs

- `norwood_stage`
- `progression_timeline`
- `primary_goal`
- `confidence_impact`
- `current_treatment_status`
- `budget_band`
- `styling_priority`
- `next_step_preference`
- `urgency_level`
- `change_openness`

### Intermediate Scores

Calculate four scores from 0 to 100:

1. `stabilization_intent_score`
2. `appearance_optimization_score`
3. `expert_support_score`
4. `community_readiness_score`

### Example Rules

- if `primary_goal = appearance` then add +35 to `appearance_optimization_score`
- if `norwood_stage in ('IV','V+')` and `confidence_impact in ('high','very_high')` then add +25 to `expert_support_score`
- if `current_treatment_status = none` and `progression_timeline = accelerating` then add +30 to `stabilization_intent_score`
- if `next_step_preference = barber` then add +30 to `appearance_optimization_score`
- if `next_step_preference = consult` then add +30 to `expert_support_score`
- if `urgency_level = high` then prioritize actions with lower time-to-value

### Recommendation Output

Return:

- top 3 recommendations
- 1 supporting recommendation
- 1 “not now” deprioritized path

Each recommendation should include:

- `key`
- `title`
- `why_it_matches`
- `expected_value`
- `time_to_value`
- `confidence_score`
- `destination_type`
- `destination_path`

### Recommendation Ranking Rule

Sort by:

1. relevance score
2. confidence score
3. time-to-value for high urgency users
4. monetization potential only as a tie-breaker

Do not let monetization outrank user fit.

## Future AI Extensibility

After enough structured sessions exist, add an AI explanation layer on top of the rules engine.

Safe future pattern:

1. rules engine chooses recommendation set
2. AI rewrites explanation copy within strict templates
3. AI does not invent medical claims
4. AI does not decide entitlement or ranking without guardrails

## Peer Comparison Methodology

Peer comparison should be conservative and statistically humble.

### Cohort Strategy

Primary cohort:

- age band
- Norwood stage band
- primary goal

Fallback cohort order:

1. age band + Norwood stage band
2. Norwood stage band only
3. all completed users

### Minimum Thresholds

Only show a benchmark if:

- cohort size `n >= 50` for directional statements
- cohort size `n >= 100` for percentile language

If thresholds are not met:

- fall back to broader cohort
- or show `We need more data before we compare this reliably.`

### What to Show

Show only:

1. relative stage percentile
2. most common next action for similar users
3. common confidence goal or styling move

### What Not to Show

Do not show:

- harsh labels
- “worse than” framing
- exact hair-loss predictions
- false medical certainty

### Confidence Scoring

Each benchmark insight should have an internal confidence grade:

- `high` when `n >= 250`
- `medium` when `100 <= n < 250`
- `low` when `50 <= n < 100`

Only surface `high` and `medium` externally. Use `low` internally for QA.

### Chart Ideas

Recommended chart types:

1. percentile bar with cohort marker
2. stacked preference bar for “what similar users did next”
3. ranked recommendation popularity list

Avoid dashboards or multi-axis complexity.

## PostHog Event Architecture

Use standardized snake_case events and a shared property contract.

### Core Event Rules

Every assessment event should include these base properties when available:

- `assessment_version`
- `session_id`
- `result_version`
- `entry_source`
- `section_id`
- `question_id`
- `step_index`
- `questions_remaining`
- `is_authenticated`
- `clerk_user_id`
- `posthog_distinct_id`
- `anonymous_id`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `experiment_key`
- `experiment_variant`

### Entry Events

- `assessment_landing_viewed`
- `assessment_started`
- `assessment_resumed`

### In-Flow Events

- `assessment_question_viewed`
- `assessment_question_answered`
- `assessment_question_changed`
- `assessment_question_skipped`
- `assessment_feedback_submitted`
- `assessment_section_completed`
- `assessment_progress_saved`
- `assessment_abandoned`

### Results Events

- `assessment_completed`
- `assessment_results_viewed`
- `assessment_peer_comparison_viewed`
- `assessment_recommendation_impression`
- `assessment_recommendation_clicked`
- `assessment_membership_offer_viewed`
- `assessment_membership_cta_clicked`
- `assessment_feedback_completed`

### Revenue Events

Prefer product-context names over generic Stripe-only names.

- `membership_checkout_started`
- `membership_checkout_completed`
- `membership_subscription_activated`
- `membership_subscription_cancelled`

Keep existing Stripe events if needed for compatibility, but the assessment funnel should use product-level names.

### Key Event Properties

For `assessment_question_answered`:

- `answer_value`
- `answer_label`
- `elapsed_ms`
- `was_auto_advanced`

For `assessment_section_completed`:

- `section_index`
- `section_elapsed_ms`
- `answers_in_section`

For `assessment_abandoned`:

- `last_question_id`
- `last_section_id`
- `answers_completed`
- `total_elapsed_ms`
- `abandon_reason`

For `assessment_recommendation_clicked`:

- `recommendation_key`
- `recommendation_rank`
- `destination_type`
- `destination_path`

For `assessment_membership_cta_clicked`:

- `offer_variant`
- `price_usd_monthly`
- `has_seen_free_results`
- `benchmark_visible`

## PostHog Implementation Notes

### Identity

The system must support anonymous-first assessment completion.

Required pattern:

1. generate a durable `assessment_session_id` on first assessment load
2. capture anonymous events immediately
3. when the user signs in or signs up, call `posthog.identify(user.id, {...})`
4. send the same `session_id` and original `anonymous_id` to the server
5. persist `clerk_user_id` onto the existing session record after auth

### Bounce Rate

Use two definitions:

1. landing bounce: viewed `/assessment` but never fired `assessment_started`
2. soft abandonment: started but never completed

### Rage Clicks and Recordings

Enable:

- PostHog autocapture
- rageclick analysis
- session replay

Mask:

- open text feedback
- any future photo upload metadata
- any medical or consult notes

### Funnel Definitions

Primary funnel:

1. `assessment_landing_viewed`
2. `assessment_started`
3. `assessment_section_completed` for section 1
4. `assessment_completed`
5. `assessment_recommendation_clicked`
6. `membership_checkout_started`
7. `membership_subscription_activated`

Secondary funnels:

- `assessment_started` -> `barber_directory_viewed`
- `assessment_started` -> `consult page viewed`
- `assessment_completed` -> `community page viewed`

## Stripe and Monetization Flow

### Offer Strategy

Do not hard paywall the main result.

Free tier should include:

1. profile summary
2. 3 tailored next steps
3. 1 peer benchmark snippet

Premium membership at `$4.99/month` should unlock:

1. quarterly hair-loss trend reports
2. anonymized community insights
3. deeper benchmark comparisons
4. evolving recommendations over time
5. premium result export
6. member-only research and resource updates

### Soft Paywall Placement

Recommended order:

1. free recommendations first
2. membership module second
3. if user clicks a premium-only benchmark or export, open checkout

This keeps the offer feeling like an upgrade, not a hostage situation.

### Offer Copy

Headline:

`Go deeper for $4.99/month`

Body:

`See how men at your stage are actually responding, track trend shifts over time, and get richer benchmark reports without digging through noise.`

CTA options:

- `Unlock deeper data`
- `Get member insights`

Avoid:

- “limited time”
- fake urgency
- exaggerated savings framing

### Checkout Architecture

Use the existing Stripe route as the base, but expand it.

Required metadata on checkout session:

- `clerk_user_id`
- `assessment_session_id`
- `assessment_version`
- `result_version`
- `offer_variant`
- `entry_source = assessment_results`

Recommended success path:

- `/assessment/results/[sessionId]?membership=success`

Recommended cancel path:

- `/assessment/results/[sessionId]?membership=cancelled`

### Persistence

The current webhook only sends PostHog events.

Add database persistence for:

- Stripe customer id
- subscription id
- status
- current period end
- associated assessment session id

This is necessary for lifecycle messaging and monetization analytics.

## End-of-Flow Feedback

Ask only one scored question plus optional text.

Recommended prompt:

`Did this assessment help you make a clearer next decision?`

Response UI:

- 5-point scale from `Not really` to `Very much`
- optional text area under `Tell us what felt missing`

Rules:

1. make text optional
2. ask after the core result and membership block
3. avoid a long NPS pattern here
4. submit in one tap when no text is entered

## Mobile UX Patterns

Use mobile as the default design target.

### Required Patterns

1. sticky progress at the top
2. answer controls reachable by thumb
3. no dense two-column answer grids on small screens
4. horizontal card rail only for Norwood stage, with snap scrolling
5. sticky bottom action bar
6. minimal vertical dead space
7. safe-area aware bottom padding
8. section transitions that preserve scroll position correctly

### Performance Rules

1. prefetch next question assets
2. keep illustrations lightweight
3. persist answers optimistically
4. hydrate only the interactive assessment shell
5. server-render results page where possible

## Suggested Microcopy

### Entry Label

`2 minute assessment`

### Trust Note

`Built to give you a clearer next move, not false hope.`

### Section Labels

- `Hair loss profile`
- `Grooming and styling`
- `Confidence and goals`
- `Current solutions`

### Progress Copy

- `12 questions remaining`
- `Almost there`

### Result Headline Examples

- `Your profile points to a style-first plan`
- `You look early enough to optimize calmly`
- `This looks more like a decision problem than a product problem`

### Recommendation Copy Examples

- `Find a barber who knows how to work with thinning density`
- `See the treatment paths people like you usually start with`
- `Book a 1:1 consult if you want the shortest path to clarity`

### Feedback Prompt

`Did this feel accurate?`

### Question-Level Feedback Prompt

`Was this question useful?`

## A/B Testing Opportunities

Use PostHog feature flags and experiment keys from day one.

### High-Value Tests

1. Norwood first screen with auto-advance vs manual continue
2. progress language: `% complete` vs `questions remaining`
3. section intro shown vs omitted
4. benchmark card above recommendations vs below recommendations
5. membership block immediately after recommendations vs after peer comparison
6. results CTA ordering: barber first vs consult first for high-urgency users
7. trust strip copy: clinical framing vs calm practical framing
8. save-and-resume prompt shown at question 5 vs not shown

### Guardrail Metrics

For every experiment watch:

- section 1 completion rate
- full assessment completion rate
- time to completion
- recommendation click-through rate
- membership checkout start rate
- qualitative feedback sentiment

## Critical Improvements Missing From the Current App

The current repo has strong foundations but the assessment flow is missing a few critical capabilities.

### 1. Anonymous Completion

Current assessment saving requires sign-in.

That will suppress completion and data volume.

Anonymous-first capture is mandatory.

### 2. Resume State

Users should be able to resume an unfinished assessment across refreshes and auth state changes.

### 3. Question Versioning

Every question set needs an `assessment_version`.

Without versioning, benchmarks and A/B tests will become muddy quickly.

### 4. Snapshot Results

Recommendation and benchmark outputs should be frozen per session.

### 5. Privacy Language

Because this touches appearance and health-adjacent behavior, add brief privacy reassurance near the start and before feedback submission.

### 6. Data Quality Governance

Add dashboards for:

- invalid answer distribution
- high-dropoff questions
- benchmark cohort health
- recommendation CTR by profile band

## Suggested Implementation Order

### Phase 1: Foundation

1. create question config and assessment versioning
2. add `assessment_sessions` and `assessment_answers`
3. refactor `/assessment` into a multi-step session-based flow
4. support anonymous sessions and resume
5. implement standardized PostHog event wrapper

### Phase 2: Results

1. create rules-based scoring engine
2. create results route and snapshot persistence
3. add free recommendations and peer benchmark card
4. instrument recommendation impressions and clicks

### Phase 3: Monetization

1. add membership offer card on results
2. extend Stripe checkout metadata
3. persist webhook subscription state to Supabase
4. instrument checkout and activation funnel

### Phase 4: Optimization

1. add question-level feedback capture
2. add end-of-flow feedback
3. run first 2 to 3 A/B tests
4. build benchmark materialization job or view

## Success Metrics

Primary:

1. assessment start rate from homepage CTA
2. section 1 completion rate
3. full assessment completion rate
4. recommendation click-through rate
5. membership checkout start rate
6. membership activation rate

Secondary:

1. median time to completion
2. dropoff by question
3. benchmark card interaction rate
4. consult click-through rate
5. barber discovery click-through rate
6. feedback usefulness rate

## Final Product Standard

If this redesign is working, the user should feel:

1. `This was quick.`
2. `This felt smarter than a normal quiz.`
3. `These recommendations match what I actually need.`
4. `I trust this site more now than when I landed.`
5. `Paying for deeper data feels optional but reasonable.`

If it feels gimmicky, overexplained, or salesy, the redesign failed.

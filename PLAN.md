# Ugly Manling Plan

## Purpose

This document defines the near-term execution plan for Ugly Manling.

It translates the product vision into a practical build sequence focused on one outcome:

**Build the most trusted barber recommendation platform for balding men.**

This is the active plan for product, design, engineering, data, and ops decisions.

## Planning Principle

We are not building a broad hair-loss platform right now.

We are building a trust-first system that helps a balding man:

1. find the right barber
2. understand why that barber is recommended
3. book with confidence
4. return and contribute proof that improves the platform

Every roadmap item should strengthen that loop.

## Product Goal

In the near term, Ugly Manling should reliably do the following:

- help users discover barbers who are likely to work well for balding men
- show proof through structured profile data, reviews, comments, and haircut outcomes
- convert interest into bookings
- create a community layer that deepens trust instead of becoming a distracting social feed
- build a partner layer that turns great barbers into durable supply

## Current Starting Point

Based on the current repo state, the foundation is partially in place:

- sign-in infrastructure exists via Clerk
- Supabase is connected and already stores profile and assessment data
- an early barber directory exists
- an early community interaction layer exists for barber comments and votes
- seeded barber data and booking links already exist

This means the plan should prioritize completing the end-to-end product loop, not rebuilding base infrastructure from scratch.

## Near-Term Product Scope

The active product is:

**A barber recommendation platform for balding men**

Near-term scope includes:

- identity and user profile continuity
- barber directory and barber profile experience
- recommendation logic and ranking
- booking flow and booking attribution
- community proof and discussion
- barber partner workflows
- moderation, quality control, and analytics

Near-term scope does not include:

- treatment decision tools
- telehealth
- commerce
- generalized hair-loss education hub
- AI-heavy personalization

## What Must Exist For V1

Version 1 is complete when a user can:

1. sign in
2. browse or search a relevant barber set
3. understand why a barber is recommended
4. view proof from the community and real outcomes
5. click through to book
6. come back and leave a useful review, comment, or haircut result

Version 1 is strong when the team can also:

1. track which barbers drive booking intent
2. identify which recommendations are working
3. recruit and support partner barbers
4. moderate low-quality or suspicious content

## Core Workstreams

### 1. Identity and User Foundation

Goal: keep user context persistent enough to support contributions, trust, and future personalization.

Deliverables:

- stable profile sync between Clerk and Supabase
- user profile model for contribution identity
- onboarding state for new versus returning users
- permission model for normal users, admins, and barber partners
- saved activity history for comments, reviews, uploads, and bookings

Notes:

- this is mostly foundational and should stay lightweight
- do not overbuild account settings before core loops work

### 2. Barber Data and Recommendation Layer

Goal: turn the seeded barber list into a structured recommendation system.

Deliverables:

- canonical barber record model
- city, neighborhood, and tag-based discovery
- recommendation fields that clearly explain why a barber is a fit
- ranking model that combines editorial confidence, evidence quality, booking readiness, and community proof
- recommendation badges such as best reset cut, best shave transition, strong beard support, or high-confidence starter pick
- admin workflow for adding, editing, reviewing, and suppressing barber listings

Data that should exist per barber:

- name, shop, location, service area
- booking link and booking platform type
- tags and strengths
- evidence summary
- review signal summary
- ranking notes
- proof assets
- partner status
- moderation status

### 3. Barber Profile Experience

Goal: make every barber page feel like a decision page, not a listing stub.

Deliverables:

- structured profile pages
- trust summary at the top
- clear fit explanation for balding men
- service and style relevance
- booking CTA placement
- community discussion section
- user result gallery over time
- quality indicators such as review count, proof depth, and last verification date

Every profile should answer:

1. Why is this barber on Ugly Manling?
2. What kind of balding customer is this barber good for?
3. What proof exists?
4. What should the user do next?

### 4. Community Proof Layer

Goal: add trust-building interaction without turning the product into a noisy social network.

Deliverables:

- comments on barber profiles
- structured reviews beyond freeform comments
- haircut result submissions with optional photos
- useful tags on outcomes such as hairline cleanup, head shave transition, beard balance, and confidence boost
- upvote and helpfulness signals for reviews and comments
- lightweight user identity markers on contributions
- reporting and moderation tools

Community rules:

- proof beats opinion
- firsthand experience beats generic advice
- short useful comments beat empty hype
- community should support decision-making, not compete with it

### 5. Booking Flow and Conversion Layer

Goal: make recommendations actionable and measurable.

Deliverables:

- clear outbound booking flow from directory and profile pages
- booking click attribution by barber, city, surface, and user
- "booked" and "visited" follow-up states
- post-booking prompts that ask for review or result upload
- admin visibility into high-intent barbers and drop-off points
- support for barbers with missing booking links through lead capture or contact-request workflows

Important principle:

If a barber is recommended but hard to book, the product is incomplete.

### 6. Barber Partner Layer

Goal: build a repeatable system for turning great barbers into reliable supply partners.

Deliverables:

- barber partner status model
- barber claim or verification workflow
- partner profile editing workflow
- partner onboarding checklist
- booking link verification workflow
- request-to-be-listed flow
- simple partner insights such as profile views, booking clicks, and review volume

Partner principles:

- partners do not control ranking directly
- partner status can improve freshness and data quality, not fake trust
- recommendation integrity is non-negotiable

### 7. Moderation and Trust Operations

Goal: protect the recommendation layer from low-quality data, spam, and inflated claims.

Deliverables:

- moderation queue for comments, reviews, and uploads
- flagged-content states
- internal quality checklist for barber entries
- verification workflow for proof assets
- admin notes on why a barber is included, excluded, or under review
- suspicious-pattern detection for review spam or self-promotion

This work is essential, not optional. Trust is the product.

### 8. Analytics and Decision Support

Goal: measure whether the platform is actually helping users choose and book.

Deliverables:

- funnel tracking from discovery to booking click
- profile engagement metrics
- contribution metrics
- city-level supply and demand visibility
- recommendation performance reporting
- partner performance reporting

Core events to track:

- directory search
- filter use
- barber profile open
- booking click
- comment submitted
- review submitted
- result uploaded
- barber claimed
- barber approved or suppressed

## Suggested Data Model Expansion

The current schema covers profiles and assessment submissions. Near-term product scope likely needs additional tables or equivalents for:

- `barbers`
- `barber_tags`
- `barber_profiles` or profile metadata fields
- `barber_proof_assets`
- `barber_reviews`
- `barber_comments`
- `barber_votes`
- `booking_clicks`
- `booking_followups`
- `barber_partners`
- `barber_claim_requests`
- `content_reports`
- `moderation_actions`

Design rule:

Prefer a simple, explicit relational model over a flexible but messy catch-all content schema.

## Build Sequence

### Phase 0: Stabilize the Foundation

Objective: make sure the current auth, profile sync, and seeded barber experience are stable enough to build on.

Ship:

- confirm Clerk to Supabase profile sync
- clean up current directory data flow
- move community interactions from file-backed storage toward durable database-backed storage
- define admin-safe seed and update workflows
- establish event tracking for core recommendation and booking actions

Exit condition:

The app has a stable base for users, barber records, and measurable interactions.

### Phase 1: Launch the Recommendation Core

Objective: deliver a credible barber recommendation product in a few cities.

Ship:

- searchable barber directory
- high-quality barber profile pages
- recommendation logic and reasoning display
- reliable booking CTAs
- basic comments and structured reviews
- core moderation workflows

Exit condition:

A user can discover a barber, understand the recommendation, and book with confidence.

### Phase 2: Build the Proof Loop

Objective: turn the product from a static directory into a compounding trust engine.

Ship:

- haircut result submissions
- post-appointment follow-up prompts
- contribution incentives or prompts
- helpfulness ranking for reviews and comments
- richer proof galleries on barber pages

Exit condition:

New user trust increasingly comes from prior user outcomes, not just editorial curation.

### Phase 3: Build the Partner Layer

Objective: improve barber quality, freshness, and conversion without corrupting recommendation integrity.

Ship:

- request-to-be-listed flow
- barber claim flow
- partner verification and editing workflows
- booking link health checks
- basic partner analytics

Exit condition:

The platform can onboard and maintain barber relationships at scale while preserving trust.

### Phase 4: Deepen the Community Layer

Objective: create higher-retention interaction around barber decisions and haircut outcomes.

Ship:

- richer discussion threads where useful
- user profiles tied to contributions
- saved barber lists or follow states
- localized community prompts by city or barber category
- contributor reputation or helpfulness signals

Exit condition:

Community meaningfully improves trust, retention, and recommendation quality.

## Immediate Priorities

If the team is deciding what to build next, prioritize in this order:

1. durable barber data model
2. durable comments, reviews, and votes in the database
3. stronger barber profile pages with clear trust summaries
4. booking click tracking and follow-up states
5. moderation and admin workflows
6. partner claim and request-to-be-listed flows
7. haircut result submission system

## Product Requirements By Surface

### Directory

Must do:

- filter by city
- filter by relevant need or style tag
- explain why a barber is recommended
- show proof density
- surface clear booking options

Should do:

- show editorial confidence level
- show community activity level
- show partner or verified status where appropriate

### Barber Profile

Must do:

- explain recommendation clearly
- show proof and trust signals
- allow booking
- allow contribution
- show recent activity and relevant tags

Should do:

- show best-fit customer type
- show strengths by scenario
- show last verification or update status

### Community Contribution

Must do:

- support comments
- support structured reviews
- support haircut outcome submissions
- support moderation and reporting

Should do:

- encourage useful, scenario-specific feedback
- ask what changed after the appointment
- capture confidence impact where possible

### Partner Tools

Must do:

- let barbers request listing or claim a profile
- let admins approve and manage changes
- preserve editorial control

Should do:

- give partners clear onboarding expectations
- show simple insights without turning the app into SaaS bloat

## Success Metrics

The plan is working if we see:

- users reaching a barber decision faster
- higher booking click-through from recommendation surfaces
- repeat visits after booking
- increasing review and haircut-result submission rates
- stronger city-by-city recommendation coverage
- increasing trust density on top barber profiles

## Non-Goals

Do not prioritize:

- building a generic forum first
- broad lifestyle content not tied to barber decisions
- treatment marketplace features
- monetization layers that weaken trust
- overly complex personalization before enough real proof exists

## Decision Filter

Before adding any feature, ask:

1. Does this help a balding man choose a barber more confidently?
2. Does this add proof, trust, or booking momentum?
3. Does this improve the contribution loop after the appointment?
4. Does this support recommendation quality or partner quality?
5. Is this needed now for the barber platform, or is it future-platform drift?

If the answer is unclear, do not prioritize it yet.

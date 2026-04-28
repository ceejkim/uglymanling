# Ugly Manling Barber Community System Plan

## Purpose
This document captures the later implementation plan for a best-in-class barber voting and commenting system using the current stack:

1. `Clerk` for identity
2. `Supabase/Postgres` for mutable community data
3. repo files for seeded editorial data, backups, and configuration

This is a saved next-step plan, not a commitment to implement immediately.

## Current State
Today the stack is split like this:

1. user identity comes from `Clerk`
2. synced user profile metadata lives in Supabase `profiles`
3. barber directory records are loaded from `app/community/space/barber-database.json`
4. barber votes and comments are stored in `data/barber-community.json`

This is good enough for a prototype, but not durable enough for production community features.

## Target Architecture
The intended long-term split should be:

1. `Clerk`
   Source of truth for authentication and current session identity.
2. `Supabase profiles`
   Mirror of core user profile metadata keyed by `clerk_user_id`.
3. `Supabase barber_votes`
   One row per user per barber vote.
4. `Supabase barber_comments`
   One row per comment with moderation state.
5. `Supabase barber_comment_reports`
   Abuse and quality reports on comments.
6. `Supabase barber_stats`
   Rollup counts for fast directory rendering.
7. repo files
   Seed barber data, import snapshots, editorial notes, moderation config, and recovery exports.

## Key Product Decision
Mutable community data should not live in tracked JSON files.

Votes, comments, reports, and moderation state should move into Supabase.
Seed and editorial barber data can remain file-backed until the barber record model is ready to migrate.

## Phase Order
### Phase 1: Move Community Interactions First
Keep barber listings in `barber-database.json`.
Move only votes and comments into Supabase.

Why this comes first:

1. it solves the highest-risk persistence issue first
2. it keeps the current barber directory stable
3. it reduces deployment risk before a bigger barber-data migration

### Phase 2: Add Moderation and Reporting
Once comments are durable, add moderation workflows and abuse reporting.

### Phase 3: Add Aggregated Stats
Add a fast rollup layer for score, upvotes, downvotes, and comment count so the directory can scale without expensive live aggregation.

### Phase 4: Migrate Barber Records
Import the seed JSON into a real `barbers` table and switch directory reads to Supabase.
Keep the JSON file as an editorial source, seed input, or backup snapshot.

## Recommended Data Model
### `barber_votes`
Use this table for user votes on barber profiles.

Recommended fields:

1. `barber_id`
2. `clerk_user_id`
3. `value`
4. `created_at`
5. `updated_at`

Recommended constraints:

1. `value` must be `-1` or `1`
2. unique key on `barber_id, clerk_user_id`

### `barber_comments`
Use this table for user comments on barber profiles.

Recommended fields:

1. `id`
2. `barber_id`
3. `clerk_user_id`
4. `body`
5. `status`
6. `created_at`
7. `updated_at`
8. `edited_at`
9. `deleted_at`

Recommended `status` values:

1. `pending`
2. `approved`
3. `flagged`
4. `rejected`

### `barber_comment_reports`
Use this table to support trust and safety workflows.

Recommended fields:

1. `id`
2. `comment_id`
3. `reporter_clerk_user_id`
4. `reason`
5. `created_at`

### `barber_stats`
Use this table or a materialized view for cached profile-level counts.

Recommended fields:

1. `barber_id`
2. `upvotes`
3. `downvotes`
4. `score`
5. `comment_count`
6. `last_comment_at`
7. `updated_at`

## API Strategy
All writes should flow through Next.js server routes, not directly from the client to Supabase.

Recommended pattern:

1. client sends vote or comment request to app route
2. route verifies the `Clerk` session
3. route reads `userId` from Clerk
4. route writes to Supabase using server credentials
5. route returns the updated summary payload

Why this is the right shape:

1. keeps auth logic centralized
2. avoids client-side privilege leakage
3. makes rate limiting and moderation checks easier
4. lets the app evolve without exposing raw table access

## Read Strategy
Recommended read path for the barber directory:

1. load barber profile data from the current seed source
2. join or map in `barber_stats`
3. fetch approved comments lazily when a barber card expands or a detail page loads

This keeps the list fast while still supporting useful community proof.

## Moderation Principles
The community system should optimize for trust, not noise.

Rules:

1. firsthand experience should outrank generic opinion
2. proof should outrank hype
3. comments should be soft-deletable and reviewable
4. suspicious activity should be reportable
5. low-trust users may require approval before comments go fully live

## File Responsibilities That Should Remain
Repo files should still be used for:

1. `app/community/space/barber-database.json` seed barber data
2. import snapshots and rollback exports
3. moderation keyword lists
4. manual review notes and editorial ranking references

Repo files should not remain the live store for:

1. votes
2. comments
3. moderation reports
4. any frequently changing user-generated interaction data

## Later Implementation Checklist
When implementation begins, do this in order:

1. create Supabase tables for `barber_votes`, `barber_comments`, `barber_comment_reports`, and `barber_stats`
2. add indexes and uniqueness constraints before wiring the routes
3. replace `data/barber-community.json` reads and writes with Supabase-backed server utilities
4. keep the current barber seed JSON in place during the migration
5. update the barber interactions API to read and write through Supabase
6. preserve the current client UI contract where possible to reduce frontend churn
7. add moderation states and reporting routes
8. add a safe backfill or migration path for any existing JSON comments and votes worth preserving
9. add admin and moderation surfaces after the core persistence layer is stable
10. only after this is stable, plan the separate migration from seed JSON to a `barbers` table

## Success Criteria
This plan is successful when:

1. user votes and comments persist reliably across deployments
2. the system supports one vote per user per barber
3. comments can be moderated without destructive data loss
4. barber directory rendering remains fast
5. the current barber seed workflow remains usable until the full barber-table migration is ready

## Out Of Scope For The First Pass
Do not include these in the first migration:

1. a full social feed
2. complex reputation scoring
3. direct client-side Supabase writes
4. photo uploads for result galleries
5. barber record migration to Supabase in the same step as votes/comments

## Pickup Notes
If this work is resumed later, start by reviewing:

1. `lib/barber-community.ts`
2. `app/api/barbers/interactions/route.ts`
3. `lib/clerk-supabase.ts`
4. `supabase/schema.sql`
5. `app/community/space/barber-database.json`

The first implementation target should be durable interaction storage, not barber record restructuring.

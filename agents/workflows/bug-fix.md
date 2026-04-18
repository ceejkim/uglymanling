# Bug Fix Workflow

## Purpose

Use this workflow for regressions, production issues, and broken user flows.

## Steps

1. Identify the affected surface, route, API, or integration.
2. Confirm whether the issue touches auth, payments, database writes, booking flow, or moderation.
3. Reproduce the bug with the smallest reliable case.
4. Fix the issue with the minimum safe code change.
5. Re-check nearby critical paths so the fix does not create a second regression.
6. Document any persistent decision or safety rule in `docs/decisions.md` when needed.

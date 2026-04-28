# Ugly Manling Decision Log

Use this file to record decisions that should persist across tasks and prevent drift.

## Entry Template
### Decision
1. Date:
2. Owner:
3. Topic:
4. Decision:
5. Why:
6. Impacted agents:
7. Follow-up:

## Current Standing Decisions
### Decision 1
1. Date: 2026-04-04
2. Owner: Orchestrator
3. Topic: Agent governance
4. Decision: The `Orchestrator` is the final authority for scope, sequencing, tone arbitration, and cross-agent conflict resolution.
5. Why: Central control is required to keep the system coherent and aligned to the Ugly Manling vision.
6. Impacted agents: all
7. Follow-up: keep this log updated when governance changes

### Decision 2
1. Date: 2026-04-05
2. Owner: Orchestrator
3. Topic: Secret and environment hygiene
4. Decision: Local secrets must live in project env files or approved secret managers, never in tracked files or shell startup files; env documentation must stay in committed example files with placeholders only.
5. Why: Secret sprawl weakens trust, increases accidental exposure risk, and creates inconsistent local runtime behavior across agents and sessions.
6. Impacted agents: Orchestrator, BackendPlatformEngineer, QARelease, all
7. Follow-up: enforce env hygiene during integration work and release review

### Decision 3
1. Date: 2026-04-28
2. Owner: Codex
3. Topic: Barber community persistence
4. Decision: Mutable barber community data such as votes, comments, reports, and moderation state should live in Supabase, while seeded and editorial barber source data may remain file-backed until the barber record migration is ready.
5. Why: File-backed interaction storage is acceptable for prototyping but is not durable enough for production community features, moderation workflows, or deployment-safe persistence.
6. Impacted agents: Orchestrator, BackendPlatformEngineer, CommunityTrustAgent, DataAgent
7. Follow-up: implement the phased plan in `docs/plan/barber-community-system-plan.md` when the team is ready to migrate community interactions

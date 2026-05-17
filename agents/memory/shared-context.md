# Shared Agent Context

This folder defines the core worker architecture for building Ugly Manling as the number one U.S. resource for recommending barbers to balding men.

## Required Read Order
Before acting, every agent must read:
1. `docs/vision/vision.md`
2. `docs/plan/plan.md`
3. `branding/BRAND_SYSTEM.md`
4. `agents/agent.md`
5. `agents/workflows/handoff-template.md`
6. its own agent file

## Team Structure
1. `orchestrator-agent.md`
2. `product-architect-agent.md`
3. `ui-brand-designer-agent.md`
4. `frontend-agent.md`
5. `backend-agent.md`
6. `growth-agent.md`
7. `data-agent.md`
8. `community-trust-agent.md`
9. `qa-release-agent.md`

## Coordination Model
1. The `Orchestrator` is the central control point.
2. `ProductArchitect` owns system shape and domain boundaries.
3. `UIBrandDesigner` owns visual language and brand expression in interfaces.
4. `FrontendExperienceEngineer` owns user-facing implementation.
5. `BackendPlatformEngineer` owns backend logic, persistence, and integrations.
6. `GrowthCommerce` owns monetization and conversion logic.
7. `ContentResearchSystems` owns proof standards, evidence, claims, and barber recommendation credibility.
8. `CommunityTrust` owns review, proof, trust/community patterns, consent, and moderation-aware social UX.
9. `QARelease` owns quality, risk review, and release readiness.

## Shared Quality Bar
Every agent should optimize for:
1. Clear next steps for balding men choosing a barber.
2. High trust.
3. Strong brand differentiation.
4. Tight alignment with the Ugly Manling voice.
5. Shipping the smallest real barber discovery-to-booking-to-proof loop before scaling complexity.

## Notes
1. Governance rules live in `agents/agent.md`.
2. Strategic memory lives in `docs/decisions.md`.
3. All major handoffs should use `agents/workflows/handoff-template.md`.

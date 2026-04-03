# Product Architecture and Specs Planning

## Purpose
This document is the primary planning surface for product specifications, architecture decisions, and implementation sequencing.

Use this document to define:
1. what we are building
2. why it exists
3. how it should behave
4. how it will be implemented
5. how success will be measured

## 1. Product Scope Map
1. Identity and access:
   - auth
   - user roles (explorer, guide)
2. Discovery:
   - matching
   - profile browsing
3. Conversation:
   - inbox
   - thread view
   - composer
4. Conversion:
   - offers
   - bookings
   - payments
5. Trust:
   - reviews
   - moderation
   - safety controls

## 2. Domain Model (Working)
1. User
2. ExplorerProfile
3. GuideProfile
4. ChatThread
5. ChatMessage
6. Offer
7. Booking
8. Payment
9. Review
10. ModerationItem

## 3. Specs Template (Use Per Feature)
For each feature, create a section with:
1. Feature name
2. User problem
3. User stories
4. Functional requirements
5. Non-functional requirements
6. Data model changes
7. API and route contracts
8. UI states and edge cases
9. Analytics events
10. QA acceptance criteria
11. Rollout and risk notes

## 4. Current Architecture Baseline
1. Frontend:
   - Next.js App Router
   - route-based feature surfaces
2. Backend:
   - server actions + route handlers
3. Persistence:
   - Prisma + SQLite (dev baseline)
4. Auth:
   - NextAuth credentials provider (initial)
5. Observability:
   - build/lint validation + product event hooks

## 5. Specs Backlog (Planning Queue)
1. S2-04 real message persistence and send actions
2. S2-05 presence and typing states
3. S2-06 thread trust context panel
4. S3 offer lifecycle state transitions
5. S4 booking-payment integration contract
6. S5 review and moderation workflow

## 6. Architecture Decision Record (ADR) Template
Use this for all major technical decisions.

### ADR-N: Title
1. Status: proposed/accepted/superseded
2. Context
3. Decision
4. Alternatives considered
5. Trade-offs
6. Rollout plan
7. Follow-up tasks

## 7. Release Readiness Checklist
1. Spec approved by Orchestrator + Systems Architecture
2. UI accepted by Frontend agent
3. Backend contract accepted by Backend Developer agent
4. QA acceptance criteria passed
5. Analytics events verified
6. Documentation updated

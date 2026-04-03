# Rekkoe App Build Plan (Vision-Anchored)

## Purpose
This plan translates `VISION.md` into an execution roadmap for building the full Rekkoe product.  
North star: **Conversation is the product**. Every milestone must strengthen real-time human connection, trust, and conversion from chat to experience.

Execution backlog: see `APP_SPRINT_BACKLOG.md` for sprint ticketing, ownership, and acceptance criteria.

## Orchestrator Activated
This project will run under the `Orchestrator` model in `agents/Orchestrator.agent.md`.

### Orchestrator Operating Rules
1. Start each sprint by validating scope against the vision statement.
2. Route architecture decisions to `Architecture Agent`.
3. Route feature implementation to `Implementation Agent`.
4. Route validation and reliability work to `TestingQA Agent`.
5. Route docs, playbooks, and onboarding artifacts to `Documentation Agent`.
6. Block releases that do not improve one of the success metrics in `VISION.md` section 9.

### Stage Gates (Required for Progress)
1. Vision Gate: feature explicitly supports sections 6.1-6.5.
2. UX Gate: chat-first flow is clear and friction is low.
3. Trust Gate: identity, safety, and transparency requirements defined.
4. Quality Gate: tests and telemetry are in place.
5. Launch Gate: rollback plan and monitoring are ready.

---

## 1) User Flow (Explorer Flow)
Primary user: explorer seeking trusted local knowledge and experiences.

### End-to-End Flow
1. Landing/Home discovery and clear value proposition.
2. Sign up / log in.
3. Onboarding:
   - intent (food, activity, learning, coaching)
   - location/context
   - timing and budget
4. Match and select a local/guide profile.
5. Start real-time chat.
6. Receive recommendations and personalized plan.
7. Convert chat into an experience:
   - guided session
   - self-guided plan
8. Book and pay.
9. Receive confirmations/reminders.
10. Complete experience and leave feedback/review.
11. Re-engage through follow-up recommendations.

### MVP Acceptance Criteria
1. User can complete onboarding in under 2 minutes.
2. User can start first chat in under 3 taps/clicks after onboarding.
3. User can book and pay from the same conversation thread.
4. User can review guide and experience after completion.

---

## 2) Guide Flow (Local / Expert Flow)
Primary user: local, enthusiast, or professional guide monetizing knowledge.

### End-to-End Flow
1. Sign up / log in as guide.
2. Identity verification + trust setup.
3. Profile setup:
   - expertise categories
   - service types (chat, guided, self-guided)
   - availability + pricing
4. Receive and respond to chat requests.
5. Build plan or offer guided session from chat.
6. Confirm booking and schedule.
7. Deliver experience.
8. Receive payout and track earnings dashboard.
9. Collect reviews and improve profile quality.

### MVP Acceptance Criteria
1. Guide can publish profile in one session.
2. Guide can accept/decline requests with response SLA tracking.
3. Guide can create an offer from chat in < 60 seconds.
4. Guide can view payout status and completed jobs.

---

## 3) Home Page Design
Goal: communicate the product in seconds and drive user-to-chat conversion.

### Design Objectives
1. Make chat-first value instantly clear.
2. Build trust (verification, social proof, transparent feedback).
3. Reduce decision friction with clear actions.
4. Highlight both sides of marketplace (explorer + guide).

### Proposed Sections
1. Hero:
   - headline: people over platforms
   - primary CTA: Start Chat
   - secondary CTA: Become a Guide
2. Social proof:
   - testimonials, review snippets, trust indicators
3. How it works (3 steps):
   - ask
   - chat
   - experience
4. Experience examples:
   - food, sports, routines, coaching
5. Guide spotlight cards:
   - expertise, response time, ratings
6. Conversion block:
   - create account and start chat

### Home Page MVP Metrics
1. Visitor-to-signup conversion rate.
2. Signup-to-first-chat conversion rate.
3. Time to first meaningful action.

---

## 4) Rest of App Design

## Product Surface Map
1. Auth and account system.
2. Explorer onboarding and preference profile.
3. Guide onboarding and verification.
4. Search/match/discovery.
5. Real-time messaging (core interface).
6. Offer/proposal composer from chat.
7. Booking and scheduling.
8. Payments and payouts.
9. Reviews, ratings, and trust signals.
10. Notifications (in-app, email, push).
11. Admin moderation and safety tooling.
12. Analytics and experimentation framework.

## Information Architecture (App)
1. `/` Home
2. `/auth/*`
3. `/onboarding/explorer`
4. `/onboarding/guide`
5. `/discover`
6. `/chat`
7. `/chat/[threadId]`
8. `/offers/[offerId]`
9. `/bookings`
10. `/payments`
11. `/profile`
12. `/guide/dashboard`
13. `/settings`
14. `/admin` (internal)

---

## Delivery Plan (Phased)

## Phase 0: Foundation
1. Product analytics baseline and event taxonomy.
2. Authentication and role model (explorer vs guide).
3. Core data schema and API contracts.
4. CI/CD and environment standards.

## Phase 1: Conversation MVP
1. Home page + onboarding flows.
2. Profile creation (explorer + guide).
3. Match list and profile detail.
4. 1:1 chat threads with message persistence.
5. Basic trust badges and reporting.

## Phase 2: Experience Conversion
1. Offer creation from chat.
2. Booking flow and schedule confirmation.
3. Payments for booking.
4. Review and rating submission.

## Phase 3: Marketplace Maturity
1. Guide dashboard (earnings, performance, SLAs).
2. Notification and reminder system.
3. Reputation model upgrades.
4. Admin tooling for trust/safety moderation.

## Phase 4: Scale + Intelligence
1. AI-assisted matching.
2. AI conversation copilots (with human-first control).
3. Globalization and translation.
4. Deeper monetization and retention loops.

---

## Technical Architecture (Initial)
1. Frontend: Next.js App Router.
2. Backend: API routes + service layer (modular domain boundaries).
3. Realtime: websocket or managed realtime messaging.
4. Data: relational DB for users, chats, offers, bookings, payments, reviews.
5. Storage: media/profile assets.
6. Auth: role-based access control.
7. Payments: secure checkout + payout rails.
8. Observability: logs, tracing, product analytics.

---

## Trust, Safety, and Quality Requirements
1. Identity verification paths for guides.
2. In-chat reporting and blocking.
3. Fraud and abuse monitoring.
4. Secure payment handling and dispute flows.
5. Privacy-by-default profile controls.
6. Audit logs for critical actions.

---

## KPI Tree (From Vision Section 9)
1. Conversation health:
   - chats started per active user
   - response time
   - conversation quality score
2. Conversion:
   - chat -> offer conversion
   - offer -> booking conversion
   - booking completion rate
3. Retention:
   - explorer repeat usage
   - guide retention and earnings growth
4. Trust:
   - review quality
   - report/incident rates

---

## Sprint Execution Cadence (Orchestrator-Led)
1. Weekly planning:
   - Orchestrator reviews backlog against vision
   - dependencies mapped
   - owners assigned by agent role
2. Mid-week checkpoint:
   - blockers, risks, metric movement
3. End-of-week review:
   - demo against acceptance criteria
   - KPI deltas
   - plan adjustments

---

## Immediate Next 2 Weeks
1. Finalize canonical user and guide journey maps.
2. Produce high-fidelity home page and chat UX wireframes.
3. Implement auth + role model + onboarding shell.
4. Implement chat thread primitives (UI + persistence).
5. Define event tracking for activation funnel.

---

## Decision Filter (Must Pass)
Before shipping any feature, answer:
1. Does this strengthen chat as the primary product?
2. Does this improve access to real human local knowledge?
3. Does this increase trust and authenticity?
4. Does this improve conversion from conversation to experience?
5. Does this measurably move a core KPI?

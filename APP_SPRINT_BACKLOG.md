# Rekkoe Sprint Backlog (Orchestrator-Led)

## How to Use This Backlog
1. Orchestrator owns planning, sequencing, dependencies, and risk calls.
2. Each ticket has a primary owner agent and a clear done definition.
3. Do not move a ticket to Done unless acceptance criteria are verified.
4. Every sprint review must report KPI impact from `APP_BUILD_PLAN.md`.

## Agent Ownership Key
1. `ORCH` = Orchestrator Agent
2. `ARCH` = Architecture Agent
3. `UI` = UI Designer Agent
4. `IMPL` = Implementation Agent
5. `QA` = TestingQA Agent
6. `DOC` = Documentation Agent

---

## Sprint 1 (Week 1): Product Skeleton + Core Flows
Sprint goal: establish app shell, role model, onboarding skeleton, and first measurable activation funnel.

| ID | Title | Owner | Priority | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| S1-01 | Vision-to-sprint kickoff and scope lock | ORCH | P0 | None | Sprint board created; top risks listed; stage gates defined for sprint |
| S1-02 | IA and route map validation (`/`, `/auth`, `/onboarding/*`, `/chat`) | ARCH | P0 | S1-01 | Route map documented and approved against vision |
| S1-03 | Design token baseline + UI primitives (buttons, cards, inputs, layout) | UI | P0 | S1-02 | Shared components implemented and used by at least 2 pages |
| S1-04 | Home page v1 aligned to value proposition | UI | P0 | S1-03 | Home communicates "conversation is the product" with dual CTAs |
| S1-05 | Auth shell (signup/login/logout placeholders + session state) | IMPL | P0 | S1-02 | User can create local session and route to onboarding |
| S1-06 | Role model setup (Explorer vs Guide at onboarding entry) | ARCH | P0 | S1-05 | Domain model documented and represented in code contracts |
| S1-07 | Explorer onboarding form v1 (intent, location, budget, timing) | UI | P0 | S1-05, S1-06 | Data captured and persisted in app state/database |
| S1-08 | Guide onboarding form v1 (expertise, service types, price, availability) | UI | P0 | S1-05, S1-06 | Data captured and persisted in app state/database |
| S1-09 | Event tracking baseline (`signup_started`, `onboarding_completed`, `chat_started`) | ARCH | P1 | S1-04, S1-05 | Event schema documented and firing in app |
| S1-10 | QA test plan for onboarding and auth shell | QA | P0 | S1-05, S1-07, S1-08 | Test cases written; smoke tests run clean |
| S1-11 | Sprint docs: setup guide + flow diagrams | DOC | P1 | S1-02, S1-07, S1-08 | Updated docs for local dev and product flow |
| S1-12 | Sprint review and KPI readout | ORCH | P0 | All sprint items | Demo complete; blockers and next sprint handoff documented |

### Sprint 1 Exit Criteria
1. Explorer and Guide can complete onboarding paths.
2. Home page and onboarding route flow are functional.
3. Baseline activation events are captured.

---

## Sprint 2 (Week 2): Chat MVP
Sprint goal: make chat the central experience with persistent 1:1 threads.

| ID | Title | Owner | Priority | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| S2-01 | Chat domain design (threads, participants, messages, status) | ARCH | P0 | S1 complete | Data model and API contract approved |
| S2-02 | `/chat` inbox UI and thread list | UI | P0 | S2-01 | User sees all active threads and can open a thread |
| S2-03 | `/chat/[threadId]` thread UI with message composer | UI | P0 | S2-01 | Send/receive message loop works in development |
| S2-04 | Message persistence layer + retrieval API | IMPL | P0 | S2-01 | Reload keeps thread history intact |
| S2-05 | Presence/typing indicators (basic version) | IMPL | P1 | S2-03 | Typing state visible and non-blocking |
| S2-06 | Guide profile preview in chat context | UI | P1 | S2-03 | Explorer can view trust context without leaving thread |
| S2-07 | Safety controls v1 (report, block, basic moderation flag) | ARCH | P0 | S2-01 | Controls are available and events logged |
| S2-08 | End-to-end chat QA suite | QA | P0 | S2-02, S2-03, S2-04 | Happy path and key failure paths covered |
| S2-09 | Chat UX copy and behavior docs | DOC | P1 | S2-02, S2-03 | Message states and UX rules documented |
| S2-10 | Sprint review and KPI readout | ORCH | P0 | All sprint items | `chat_started` and response-time metrics reported |

### Sprint 2 Exit Criteria
1. Explorer and Guide can maintain persistent chat threads.
2. Chat is first-class and faster to access than browsing.
3. Safety controls are available in chat context.

---

## Sprint 3 (Week 3): Chat-to-Offer Conversion
Sprint goal: convert conversations into structured offers.

| ID | Title | Owner | Priority | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| S3-01 | Offer domain design (guided vs self-guided) | ARCH | P0 | S2 complete | Offer schema and transitions documented |
| S3-02 | Offer composer panel inside thread | UI | P0 | S3-01, S2-03 | Guide can draft and send structured offer from chat |
| S3-03 | Offer detail page (`/offers/[offerId]`) | UI | P0 | S3-01 | Explorer can review scope, price, schedule |
| S3-04 | Offer acceptance/decline actions | IMPL | P0 | S3-02, S3-03 | Offer status updates reflected in thread and backend |
| S3-05 | Notification events for offer lifecycle | IMPL | P1 | S3-04 | Users notified for sent/accepted/declined |
| S3-06 | Conversion analytics (`offer_created`, `offer_accepted`) | ARCH | P1 | S3-04 | Dashboards/queries available for conversion funnel |
| S3-07 | QA suite for offer lifecycle and edge cases | QA | P0 | S3-02 to S3-05 | All state transitions tested and verified |
| S3-08 | Product docs for offer behavior and policies | DOC | P1 | S3-01 to S3-04 | Internal docs published |
| S3-09 | Sprint review and KPI readout | ORCH | P0 | All sprint items | Chat-to-offer conversion baseline established |

### Sprint 3 Exit Criteria
1. Guide can send offers from chat.
2. Explorer can accept/decline with clear state transitions.
3. Conversion funnel is measurable.

---

## Sprint 4 (Week 4): Booking + Payments
Sprint goal: turn accepted offers into confirmed, paid bookings.

| ID | Title | Owner | Priority | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| S4-01 | Booking domain and payment integration architecture | ARCH | P0 | S3 complete | Booking and payment state machine approved |
| S4-02 | Booking confirmation flow (`/bookings`) | UI | P0 | S4-01 | Explorer can confirm selected schedule and terms |
| S4-03 | Payment checkout integration (MVP) | IMPL | P0 | S4-01, S4-02 | Successful payment marks booking as paid |
| S4-04 | Guide payout status model and dashboard stub | IMPL | P1 | S4-03 | Guide can see earnings status at high level |
| S4-05 | Booking reminders/notifications | IMPL | P1 | S4-02 | Confirmation and reminder notifications sent |
| S4-06 | Failure handling (payment fail, cancellation path) | ARCH | P0 | S4-03 | Failure states and recovery actions implemented |
| S4-07 | QA suite for booking and payments | QA | P0 | S4-02 to S4-06 | Payment success/failure and cancellation paths verified |
| S4-08 | Policy docs (refunds, cancellations, disputes v1) | DOC | P1 | S4-06 | Operator-facing policy documentation complete |
| S4-09 | Sprint review and KPI readout | ORCH | P0 | All sprint items | Offer-to-booking conversion and payment success tracked |

### Sprint 4 Exit Criteria
1. Accepted offers can become paid bookings.
2. Core payment error paths are handled gracefully.
3. Booking conversion KPI is visible.

---

## Sprint 5 (Week 5): Trust, Reviews, and Retention
Sprint goal: strengthen authenticity loop and repeat usage.

| ID | Title | Owner | Priority | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| S5-01 | Trust model v1 (verification badge logic, reputation signals) | ARCH | P0 | S4 complete | Trust criteria documented and represented in UI/data |
| S5-02 | Post-experience review flow | UI | P0 | S4-02 | Explorer and Guide can submit and view reviews |
| S5-03 | Profile trust surfaces (ratings, response time, completion rate) | UI | P1 | S5-01, S5-02 | Trust metrics visible in discovery and chat |
| S5-04 | Re-engagement prompts and recommendations v1 | IMPL | P1 | S5-02 | Completed users receive contextual follow-up prompts |
| S5-05 | Abuse triage workflow for admin | ARCH | P1 | S2-07, S5-01 | Basic moderation queue and escalation process exists |
| S5-06 | QA regression sweep for end-to-end marketplace flow | QA | P0 | S1-S5 | Full flow from signup to review passes |
| S5-07 | User and guide help center docs | DOC | P1 | S5-02, S5-03 | User-facing help content published |
| S5-08 | Sprint review and release recommendation | ORCH | P0 | All sprint items | Launch readiness call with clear go/no-go rationale |

### Sprint 5 Exit Criteria
1. Completed experiences produce trustworthy reviews.
2. Trust signals are visible across key touchpoints.
3. Retention loop begins after first experience.

---

## Cross-Sprint Backlog (Always-On)
| ID | Title | Owner | Priority | Notes |
|---|---|---|---|---|
| X-01 | Weekly risk register update | ORCH | P0 | Product, technical, and operational risks |
| X-02 | Architecture decision records (ADR log) | ARCH | P1 | Keep decision history lightweight and current |
| X-03 | Implementation standards and linting hygiene | IMPL | P1 | Maintain consistency and velocity |
| X-04 | Regression and smoke test automation growth | QA | P0 | Prevent quality decay |
| X-05 | Living documentation and onboarding notes | DOC | P1 | Keep docs synced with shipped behavior |

---

## Definition of Ready (DoR)
1. Ticket has a clear user outcome tied to the vision.
2. Dependencies and owner are explicit.
3. Acceptance criteria are testable.
4. KPI impact is identified.

## Definition of Done (DoD)
1. Implementation complete and reviewed.
2. QA acceptance criteria passed.
3. Telemetry/events emitted where applicable.
4. Documentation updated.
5. Orchestrator signs off stage gate compliance.

---

## Initial Ticket Queue for Next Execution Session
1. S1-01 Vision-to-sprint kickoff and scope lock
2. S1-02 IA and route map validation
3. S1-03 Design token baseline + UI primitives
4. S1-05 Auth shell
5. S1-07 Explorer onboarding form v1
6. S1-08 Guide onboarding form v1
7. S1-09 Event tracking baseline

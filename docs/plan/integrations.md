# Ugly Manling Integration Planner

## Purpose
This document identifies the external integrations Ugly Manling should use to build an industry-leading platform across:
1. Shop
2. Payments
3. Payouts
4. Chat
5. User login
6. Multiple persona types
7. Scheduling
8. Analytics
9. Notifications
10. Search and discovery

This list is organized around what the platform actually needs, not around random tools.

## Recommended Core Stack
If we want a strong, modern, scalable foundation, the best primary stack is:
1. `Clerk` for authentication, user management, organizations, and roles.
2. `Supabase` for Postgres database, storage, and realtime infrastructure.
3. `Stripe` for payments, payouts, subscriptions, tax, and marketplace money movement.
4. `Shopify` for headless commerce operations and storefront/catalog infrastructure.
5. `Sendbird` for in-app chat and messaging.
6. `Calendly` first, with potential migration to deeper embedded scheduling later.
7. `PostHog` for analytics, session replay, feature flags, and experiments.
8. `Resend` for transactional email.
9. `Algolia` for high-quality search and recommendations.
10. `Sentry` for production error monitoring.

## Why This Stack
Ugly Manling is not just a content site.
It is a multi-offering platform with:
1. user accounts,
2. multiple personas,
3. guided journeys,
4. referrals,
5. consultations,
6. chat,
7. product commerce,
8. future marketplace-style money flows.

That means the platform needs:
1. strong identity and role control,
2. relational data,
3. payments and payouts,
4. real messaging,
5. measurable conversion flows,
6. strong commerce primitives.

## Integration List By Capability
### 1. Authentication, User Accounts, and Persona Types
### Recommended: `Clerk`
Use Clerk as the primary authentication and user-management layer.

Why:
1. Ugly Manling needs multiple persona types, not just simple login.
2. We will likely have users such as:
   - members,
   - admins,
   - experts,
   - providers,
   - barbers,
   - partner operators.
3. Clerk Organizations support grouped users with roles and permissions.
4. Clerk provides prebuilt sign-in, sign-up, profile, organization, and switcher components that speed up delivery.

Use Clerk for:
1. Email/password login
2. Social login
3. Session management
4. Role-based access
5. Organization and team context where needed
6. Admin and partner access control

Recommendation:
1. Keep persona modeling in our own application database.
2. Use Clerk for identity and access, not for storing all product logic.

### Secondary Option: `Firebase Authentication`
Firebase Auth is a valid option, but not my first recommendation here.

Why not primary:
1. Ugly Manling needs strong relational modeling across users, plans, providers, referrals, products, and conversations.
2. This product looks more like a structured platform with commerce and service orchestration than a lightweight realtime app.
3. Postgres plus a dedicated auth layer is a better long-term fit.

Firebase is better suited if:
1. realtime collaboration is the dominant product pattern,
2. the team wants to stay deeply in the Firebase ecosystem,
3. we intentionally optimize for a Firebase-native stack.

### 2. Database, Storage, and Realtime
### Recommended: `Supabase`
Use Supabase as the primary backend platform for:
1. Postgres
2. File storage
3. Realtime updates where useful
4. Edge functions if needed

Why:
1. Postgres is a better fit than a document-first model for this platform.
2. We need structured relationships between users, assessments, plans, recommendations, bookings, providers, referrals, products, and orders.
3. Supabase can also work with third-party auth providers like Clerk.

Use Supabase for:
1. Core application data
2. Profile and assessment records
3. Journey plans and recommendations
4. Referral attribution
5. Uploaded assets if we do not need advanced media workflows yet
6. Realtime presence or lightweight live state where helpful

### 3. Payments, Payouts, Subscriptions, and Marketplace Flows
### Recommended: `Stripe`
Stripe should be the financial backbone.

Use Stripe products:
1. `Stripe Payments` for checkout and payments
2. `Stripe Connect` for platform and marketplace-style payouts
3. `Stripe Billing` if subscriptions or memberships are added
4. `Stripe Tax` if tax handling becomes material
5. `Stripe Radar` for fraud controls

Why:
1. Ugly Manling may need to collect payments from users and route money to experts or service providers.
2. We may want to monetize consultations, products, referrals, and future partner flows.
3. Stripe Connect is built specifically for platforms and marketplaces.

Use Stripe for:
1. Product checkout
2. Consultation payments
3. Provider payouts
4. Affiliate or service revenue collection
5. Subscription or membership experiments later

Detailed backend activation plan:
1. See [stripe-backend-plan.md](/Users/charleskimbell/Rekkoe/docs/plan/stripe-backend-plan.md) for the phased backend architecture, route structure, environment variables, and rollout order.

### 4. Shop and Catalog Infrastructure
### Recommended: `Shopify`
Use Shopify as the commerce operating system for physical products.

Why:
1. Ugly Manling wants to sell branded products and hair-loss-related tools.
2. Shopify is the strongest fit for running the shop side while still allowing a custom frontend.
3. Shopify Storefront API supports headless commerce experiences.

Use Shopify for:
1. Product catalog
2. Inventory
3. Variants
4. Cart and checkout support
5. Merchandising operations
6. Order operations

Recommended model:
1. Keep the main product experience custom.
2. Run merch and product operations through Shopify.
3. Integrate Shopify data into the main app experience instead of spinning up a disconnected store.

### 5. Chat and In-App Messaging
### Recommended: `Sendbird`
Use Sendbird for chat between:
1. members and experts,
2. members and support,
3. future small-group or community conversations.

Why:
1. Ugly Manling needs more than a bare websocket layer.
2. We need production chat features such as moderation, delivery state, search, reactions, file sharing, and channel management.
3. Trust and support are important, so moderation tooling matters.

Use Sendbird for:
1. 1:1 chat
2. Group chat if introduced later
3. Moderation
4. Message history
5. Push integration support
6. Support-like conversations

Alternative:
1. `Stream` is also strong and worth comparing during implementation.
2. If we want the shortest path to a robust messaging product, either `Sendbird` or `Stream` beats building chat ourselves.

### 6. Scheduling and Booking
### Recommended For MVP: `Calendly`
Use Calendly first if speed matters more than deep scheduling customization.

Why:
1. It is fast to launch.
2. It provides APIs and embedding options.
3. It is enough for early consultations, expert calls, and advisor sessions.

Use Calendly for:
1. Expert consultation booking
2. Telehealth intake scheduling
3. Barber or advisor booking links
4. Event-driven workflows after booking

### Recommended Later If Scheduling Becomes Core: Deeper Embedded Scheduling
If scheduling becomes a core product surface rather than an embedded utility, move toward a more customizable solution.

Important note:
1. Cal.com has strong docs and customization options.
2. However, Cal.com’s older Platform plan docs currently note deprecation and maintenance-only status for that specific platform offering.
3. That means we should not choose it casually without re-verifying the exact product path we intend to use.

Recommendation:
1. Start with Calendly for speed.
2. Revisit a more native booking stack later only if booking becomes central to the product moat.

### 7. Analytics, Session Replay, Feature Flags, and Experiments
### Recommended: `PostHog`
Use PostHog as the product analytics and experimentation layer.

Why:
1. Ugly Manling needs strong funnel visibility across assessment, plan, recommendations, booking, and purchase.
2. PostHog combines product analytics, session replay, feature flags, and experiments in one system.

Use PostHog for:
1. Funnel analysis
2. Session replay
3. Feature flags
4. A/B tests
5. User behavior debugging
6. Product usage analytics tied to revenue events

### 8. Transactional Email
### Recommended: `Resend`
Use Resend for transactional email.

Why:
1. We will need onboarding emails, booking confirmations, receipts, referral notifications, and lifecycle messaging.
2. Resend works well with React Email and modern app stacks.

Use Resend for:
1. Auth-related app emails if needed
2. Booking confirmations
3. Order confirmations
4. Referral and provider notifications
5. Lifecycle and re-engagement messages

### 9. Search and Discovery
### Recommended: `Algolia`
Use Algolia when search quality becomes materially important.

Why:
1. Ugly Manling will likely have products, research content, provider entries, and educational resources.
2. Search relevance and filtering will matter if the platform grows beyond a small static catalog.

Use Algolia for:
1. Product search
2. Research search
3. Provider and barber discovery
4. Autocomplete
5. Recommendations and related content later

### 10. Notifications
### Recommended: `Resend` plus provider-specific notifications first
Start simple:
1. email through Resend,
2. in-app notifications built in our own product,
3. chat notifications through the chat provider.

### Recommended Later: `Twilio`
Add Twilio if SMS becomes operationally important.

Use Twilio for:
1. Booking reminders
2. Urgent provider communications
3. High-intent reminder workflows

### 11. File and Media Handling
### Recommended First: `Supabase Storage`
Use Supabase Storage initially for:
1. avatars,
2. profile photos,
3. before-and-after images,
4. research assets,
5. lightweight uploads.

### Recommended Later If Media Becomes Core: advanced media tooling
If media transformations, video, or heavy image workflows become central, add a dedicated media platform later.

### 12. Video Consultations
### Recommended Later If Live Video Becomes Core: `Daily` or `Zoom`
If Ugly Manling moves from scheduling external consultations to hosting live consultations inside the product, add a dedicated video layer.

Use cases:
1. Expert sessions
2. Provider consultations
3. Guided support calls
4. Paid virtual appointments

Recommendation:
1. Keep MVP scheduling external-first.
2. Only add embedded video when live consultation UX becomes a core product differentiator.

### 13. Error Monitoring and Observability
### Recommended: `Sentry`
Use Sentry for production error monitoring and issue triage.

Why:
1. Ugly Manling will have high-value flows around auth, plans, booking, checkout, and chat.
2. We need visibility into frontend and backend failures quickly.

Use Sentry for:
1. Runtime errors
2. Performance monitoring
3. Release tracking
4. Session-linked debugging for broken critical flows

### 14. CRM and Lifecycle Operations
### Recommended Later: `HubSpot` or `Intercom`
Once provider relationships, support workflows, or lifecycle marketing become operationally important, add a CRM/support layer.

Use cases:
1. Lead handoff to partners
2. Provider and barber relationship management
3. Support workflows
4. Lifecycle campaigns beyond product-triggered emails

Recommendation:
1. Do not start here.
2. Add this once the product is generating real operational volume.

### 15. Compliance and Health Workflow Note
If Ugly Manling starts facilitating actual telehealth or handling protected health information, we will need to revisit the stack through a compliance lens.

That may affect:
1. scheduling,
2. video,
3. messaging,
4. storage,
5. logging,
6. vendor agreements.

Important implication:
1. Not every great developer tool is automatically suitable for regulated health workflows.
2. Before launching true telehealth or PHI-heavy workflows, we should confirm BAA availability, data handling posture, and compliance boundaries for every relevant vendor.

## MVP Integration Plan
The MVP does not need every integration at once.

### Phase 1: Required To Start Building
1. `Clerk`
2. `Supabase`
3. `Stripe`
4. `PostHog`
5. `Resend`
6. `Sentry`

### Phase 2: Needed For Core User Experience
1. `Calendly`
2. `Sendbird`
3. `Shopify`

### Phase 3: Needed When Discovery and Scale Increase
1. `Algolia`
2. `Twilio`
3. advanced media tooling if needed
4. embedded video if consultation delivery moves in-product
5. CRM/support tooling if operations become complex

## Recommended Persona Model
Even with Clerk handling identity, persona types should be represented in our app database.

Suggested core persona types:
1. `member`
2. `admin`
3. `expert`
4. `provider`
5. `barber`
6. `partner`

Important rule:
1. Authentication provider roles should control access.
2. Product personas in our database should control business logic and workflow behavior.

## Suggested First Implementation Order
1. Set up `Clerk` for auth and role-aware sessions.
2. Set up `Supabase` for Postgres and storage.
3. Set up `Stripe` for payments and future Connect support.
4. Set up `PostHog` for analytics from day one.
5. Set up `Resend` for transactional email.
6. Set up `Sentry` for production visibility.
7. Add `Calendly` for consultation booking.
8. Add `Shopify` for shop operations.
9. Add `Sendbird` for chat.
10. Add `Algolia` only when search quality becomes a real product need.

## Final Recommendation
If we want the strongest practical foundation right now, build Ugly Manling around:
1. `Clerk + Supabase + Stripe + Shopify + Sendbird + Calendly + PostHog + Resend`
2. Add `Sentry` from day one for production safety.

That stack gives us:
1. modern auth,
2. structured backend infrastructure,
3. industry-standard payments and payouts,
4. real commerce capabilities,
5. robust chat,
6. fast booking launch,
7. serious product analytics,
8. scalable communication tooling,
9. production-grade error visibility.

## Source Links
1. Clerk Organizations: https://clerk.com/docs/organizations/overview
2. Clerk Roles and Permissions: https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions
3. Supabase Docs: https://supabase.com/docs
4. Supabase Auth: https://supabase.com/docs/guides/auth
5. Supabase third-party auth: https://supabase.com/docs/guides/auth/third-party/overview
6. Stripe Connect: https://docs.stripe.com/connect
7. Stripe marketplace guide: https://docs.stripe.com/connect/marketplace
8. Shopify Storefront API: https://shopify.dev/api/storefront
9. Shopify headless storefront guide: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/index
10. Sendbird Chat docs: https://sendbird.com/docs/chat
11. Sendbird Chat Platform API: https://sendbird.com/docs/chat/platform-api/v3/overview
12. Calendly Developer docs: https://developer.calendly.com/
13. Cal.com Platform intro: https://cal.com/docs/platform/introduction
14. Cal.com Platform FAQ: https://cal.com/docs/platform/faq
15. Firebase Authentication: https://firebase.google.com/docs/auth/
16. PostHog: https://posthog.com/
17. Resend docs: https://resend.com/docs
18. React Email with Resend: https://react.email/docs/integrations/resend
19. Algolia ecommerce search: https://www.algolia.com/doc/guides/solutions/ecommerce/search
20. Algolia Recommend overview: https://www.algolia.com/doc/guides/algolia-recommend/overview
21. Sentry for Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/

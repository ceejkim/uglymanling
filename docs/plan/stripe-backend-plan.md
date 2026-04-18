# Ugly Manling Stripe Backend Plan

## Purpose
This document defines how Ugly Manling should add Stripe to the current app so payments can be activated later without reworking the backend.

The goal is not to turn on every Stripe feature now.
The goal is to install the right financial backbone now so the platform can later support:
1. one-time payments,
2. subscriptions,
3. consultation payments,
4. merch and product checkout,
5. future provider payouts.

## Orchestrator Decision
Ugly Manling should adopt Stripe in phases.

We should not start with a fully custom payments architecture.
We should start with a backend foundation that supports:
1. `Stripe Checkout Sessions` for one-time payments,
2. `Stripe Billing` plus Checkout for subscriptions,
3. `Stripe Customer Portal` for self-service subscription management,
4. `Stripe webhooks` as the source of truth for payment state,
5. `Stripe Connect Accounts v2` later if provider payouts become real.

This matches the current product stage and keeps the platform aligned with Stripe's current recommended path.

## Why This Is The Right Shape
The current app is:
1. a single Next.js App Router application,
2. already using Clerk for authentication,
3. not yet connected to a full application database,
4. still early enough that speed matters more than payment UI customization.

That means:
1. backend payment logic should live inside the existing Next.js app,
2. the first payment surface should use hosted Stripe Checkout,
3. subscriptions should use Stripe Billing instead of hand-rolled renewal logic,
4. all fulfillment and account-state updates should be driven by webhooks,
5. marketplace payouts should wait until the product actually has payable providers.

## Recommended Stripe Product Map
### Phase 1: Foundation
Use:
1. `Stripe SDK`
2. `Checkout Sessions`
3. `Webhook endpoint`
4. `Customer records`

This phase gives us:
1. a stable server-side Stripe client,
2. a standard payment entry point,
3. a clean event-processing model,
4. test mode support for future flows.

### Phase 2: Subscriptions and Membership
Use:
1. `Stripe Billing`
2. Checkout Sessions with `mode: 'subscription'`
3. `Customer Portal`

This phase supports:
1. premium membership,
2. subscription-based access,
3. recurring support plans,
4. self-service billing management.

### Phase 3: Marketplace and Provider Payouts
Use:
1. `Stripe Connect Accounts v2`
2. destination-charge style platform flows when Ugly Manling is the financial coordinator

This phase supports:
1. paid consultations,
2. expert payouts,
3. provider revenue sharing,
4. platform fee collection.

We should not enable this until the provider and compliance model is real.

## What Should Live In The Current Backend
Stripe should live in the existing Next.js backend under server-only modules and route handlers.

Recommended structure:

```text
app/
  api/
    stripe/
      checkout/
        route.ts
      portal/
        route.ts
      webhook/
        route.ts
lib/
  stripe.ts
  stripe-types.ts
```

Recommended responsibilities:
1. `lib/stripe.ts`
   Creates and exports the server-side Stripe client.
2. `app/api/stripe/checkout/route.ts`
   Creates Checkout Sessions for one-time or subscription purchases.
3. `app/api/stripe/portal/route.ts`
   Creates Customer Portal sessions for members with subscriptions.
4. `app/api/stripe/webhook/route.ts`
   Verifies Stripe signatures and processes payment lifecycle events.

## Future Data Model We Should Prepare For
Even before Supabase is added, the backend should be designed around these future entities:
1. `User`
2. `StripeCustomer`
3. `PaymentIntentRecord`
4. `CheckoutSessionRecord`
5. `SubscriptionRecord`
6. `InvoiceRecord`
7. `Order`
8. `ConsultationPurchase`
9. `PayoutAccount`
10. `WebhookEventLog`

Suggested field direction:
1. Store `clerk_user_id` on every user-owned commerce record.
2. Store `stripe_customer_id` once per Ugly Manling member.
3. Keep Stripe object IDs in our database instead of duplicating Stripe state blindly.
4. Treat webhooks as the canonical confirmation layer for paid status.

## Recommended Payment Activation Order
### 1. One-Time Checkout First
Use this for:
1. consultation deposits,
2. digital programs,
3. merch or curated kits,
4. limited paid experiments.

Why first:
1. fastest to launch,
2. lowest implementation risk,
3. uses hosted Checkout,
4. creates the cleanest first backend pattern.

### 2. Subscriptions Second
Use this for:
1. premium membership,
2. paid community tier,
3. ongoing coaching or accountability features,
4. subscription bundles.

Why second:
1. it depends on customer identity and lifecycle messaging,
2. it should follow after the one-time payment path works,
3. it introduces billing-state concepts that deserve care.

### 3. Connect Third
Use this for:
1. paying experts,
2. paying providers,
3. sharing revenue on booked services,
4. running marketplace-like money movement.

Why third:
1. highest compliance and operational complexity,
2. not needed for the first monetization loop,
3. should only be added once Ugly Manling truly coordinates third-party earnings.

## Recommended App Flows
### A. One-Time Purchase Flow
1. User signs in with Clerk.
2. Frontend calls `/api/stripe/checkout`.
3. Backend creates or retrieves the Stripe customer.
4. Backend creates a Checkout Session.
5. User completes payment on Stripe Checkout.
6. Stripe sends webhook events.
7. Backend marks the purchase as paid and unlocks the corresponding Ugly Manling capability.

### B. Subscription Flow
1. User signs in with Clerk.
2. Frontend calls `/api/stripe/checkout` with subscription mode.
3. Backend creates a subscription Checkout Session tied to the member's Stripe customer.
4. User completes checkout.
5. Stripe sends subscription lifecycle webhook events.
6. Backend updates membership state and entitlement state.
7. Frontend reads entitlement state from Ugly Manling's backend, not directly from Stripe.

### C. Future Provider-Payout Flow
1. Provider or expert completes onboarding.
2. Ugly Manling creates a connected account using Accounts v2.
3. Platform stores the connected account ID.
4. User purchases a consult or service.
5. Backend creates a platform-managed charge and routes funds appropriately.
6. Stripe handles payout movement according to the configured Connect flow.

## Required Environment Variables
When implementation starts, prepare:

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_COMMUNITY=
STRIPE_PRICE_ID_CONSULT=
STRIPE_PRICE_ID_MEMBERSHIP=
```

Later, if Connect is enabled, also prepare IDs for connected-account workflows and platform configuration.

## Backend Guardrails
1. Never trust the frontend to confirm payment success.
2. Always verify webhook signatures server-side.
3. Always treat Stripe webhooks as the source of truth for fulfillment or entitlement changes.
4. Do not build manual recurring billing logic with raw PaymentIntents.
5. Do not start with PaymentIntents unless Ugly Manling truly needs a custom in-app payment form.
6. Do not mix multiple Connect charge models inside one integration without a deliberate migration plan.
7. Keep all Stripe calls in server-only code.

## What We Should Build Now Versus Later
### Build Now
1. Add the Stripe SDK dependency.
2. Add a server-only Stripe client module.
3. Add placeholder route handlers for checkout, portal, and webhooks.
4. Add `.env.example` Stripe entries.
5. Add internal planner docs for product-to-price mapping.

### Build Next
1. Wire one test Checkout Session.
2. Add local webhook testing with the Stripe CLI.
3. Add one post-payment success path.
4. Add one subscription product only after the one-time path is stable.

### Build Later
1. Customer Portal.
2. subscription entitlements,
3. Connect onboarding,
4. payout orchestration,
5. deeper invoice and finance reporting.

## Product Mapping For Ugly Manling
### Strong Early Stripe Candidates
1. Community membership
2. Premium guidance plan
3. Expert consultation deposit
4. Curated product kit

### Do Not Stripe-Enable First
1. everything in the shop,
2. multi-provider revenue sharing,
3. advanced in-app billing controls,
4. complex package bundles with custom payout logic.

## Recommended Implementation Sequence
1. Install `stripe`.
2. Add `lib/stripe.ts`.
3. Add `app/api/stripe/checkout/route.ts`.
4. Add `app/api/stripe/webhook/route.ts`.
5. Add internal helper to create or fetch a Stripe customer by Clerk user ID.
6. Add a test-mode purchase button on a non-critical route.
7. Add webhook-driven fulfillment logging.
8. Add subscription mode and Customer Portal only after the first path is solid.

## Source Notes
This plan follows Stripe's current recommended patterns:
1. Use Checkout Sessions for most on-session one-time payments.
2. Use Billing APIs plus Checkout for subscriptions.
3. Use Customer Portal for self-service subscription management.
4. Use webhooks for asynchronous payment lifecycle handling.
5. Use Connect Accounts v2 for new platform payout integrations.

Official references:
1. https://docs.stripe.com/api/checkout/sessions
2. https://docs.stripe.com/billing/subscriptions/designing-integration
3. https://docs.stripe.com/customer-management/integrate-customer-portal
4. https://docs.stripe.com/webhooks
5. https://docs.stripe.com/connect/accounts-v2

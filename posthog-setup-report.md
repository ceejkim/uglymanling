<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Ugly Manling. Here is a summary of every change made:

- **`instrumentation-client.ts`** (new) — Initializes `posthog-js` on the client side using Next.js 15.3+ instrumentation. Enables autocapture, session replay, and error tracking via `capture_exceptions: true`. Routes events through `/ingest` reverse proxy for improved ad-blocker resilience.
- **`lib/posthog-server.ts`** (new) — Singleton `posthog-node` client used by all API routes for server-side event capture with `flushAt: 1` / `flushInterval: 0` to ensure events flush immediately in short-lived serverless functions.
- **`next.config.ts`** (updated) — Added PostHog reverse proxy rewrites for `/ingest/*`, `/ingest/static/*`, and `/ingest/array/*`, plus `skipTrailingSlashRedirect: true`.
- **`components/homepage/hero-cta-button.tsx`** (updated) — Added `posthog.capture("hero_cta_clicked", ...)` alongside the existing Vercel analytics call, including A/B variant, headline, and visitor type as properties.
- **`components/assessment/assessment-workbench.tsx`** (updated) — Added `posthog.capture("assessment_option_selected", ...)` on each option group button click (with group name, value, and label), and `posthog.capture("assessment_saved", ...)` on successful save with full lane context. Also added `posthog.captureException(...)` on save failure for error tracking.
- **`components/barbers/barber-directory-interactive.tsx`** (updated) — Added `posthog.capture("barber_card_expanded", ...)` when a barber card is expanded, and `posthog.capture("barber_book_now_clicked", ...)` when the booking link is clicked.
- **`app/api/barbers/interactions/route.ts`** (updated) — Added server-side `barber_voted` and `barber_comment_posted` captures using `posthog-node`, keyed to `userId` as the distinct ID.
- **`app/api/barbers/submissions/route.ts`** (updated) — Added server-side `barber_suggested` capture after a successful barber submission.
- **`app/api/stripe/checkout/route.ts`** (updated) — Added server-side `checkout_session_created` capture including price lookup key, mode, and session ID.
- **`app/api/stripe/webhook/route.ts`** (updated) — Added server-side captures for `payment_completed` (checkout.session.completed), `subscription_created`, and `subscription_cancelled` from Stripe webhook events.
- **`app/style/barbers/page.tsx`** (updated) — Added server-side `barber_directory_viewed` capture on page render, including city, access level, and barber counts.
- **`.env.local`** (updated) — Added `NEXT_PUBLIC_POSTHOG_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `hero_cta_clicked` | User clicks the primary 'Find a barber' CTA on the homepage hero. Includes A/B variant and visitor type. | `components/homepage/hero-cta-button.tsx` |
| `assessment_option_selected` | User selects an option within the hair loss assessment (stage, goal, budget, or urgency). | `components/assessment/assessment-workbench.tsx` |
| `assessment_saved` | User successfully saves their hair loss assessment to their profile. | `components/assessment/assessment-workbench.tsx` |
| `barber_card_expanded` | User expands a barber card to read comments and see full details. | `components/barbers/barber-directory-interactive.tsx` |
| `barber_book_now_clicked` | User clicks the 'Book now' link on a barber card. | `components/barbers/barber-directory-interactive.tsx` |
| `barber_voted` | Authenticated user submits an upvote or downvote on a barber. | `app/api/barbers/interactions/route.ts` |
| `barber_comment_posted` | Authenticated user posts a community comment on a barber. | `app/api/barbers/interactions/route.ts` |
| `barber_suggested` | Authenticated user submits a new barber suggestion for directory review. | `app/api/barbers/submissions/route.ts` |
| `checkout_session_created` | A Stripe checkout session is successfully created for a user. | `app/api/stripe/checkout/route.ts` |
| `payment_completed` | Stripe webhook confirms a checkout session completed. | `app/api/stripe/webhook/route.ts` |
| `subscription_created` | Stripe webhook confirms a new subscription was created. | `app/api/stripe/webhook/route.ts` |
| `subscription_cancelled` | Stripe webhook confirms a subscription was deleted/cancelled. | `app/api/stripe/webhook/route.ts` |
| `barber_directory_viewed` | User lands on the barber directory page. Top-of-funnel with city and access level context. | `app/style/barbers/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/434207/dashboard/1612741)
- [Hero CTA clicks over time](https://us.posthog.com/project/434207/insights/dX9xsr4h) — homepage A/B variant performance
- [Barber directory → checkout conversion funnel](https://us.posthog.com/project/434207/insights/hBeKuCNK) — end-to-end purchase conversion
- [Assessment completions](https://us.posthog.com/project/434207/insights/V2CTcjWz) — user activation signal
- [Community engagement (votes, comments, submissions)](https://us.posthog.com/project/434207/insights/yNgZZywE) — community health
- [Subscription health (created vs cancelled)](https://us.posthog.com/project/434207/insights/cVJqLOJ3) — churn signal

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

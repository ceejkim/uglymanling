# PostHog Setup Report

## Router and package check

- Router: App Router only. The repo has an [`app/`](/Users/charleskimbell/Rekkoe/app/layout.tsx:1) directory and no `pages/` directory.
- Installed packages:
  - `posthog-js`
  - `posthog-node`

## Files changed

- [`app/layout.tsx`](/Users/charleskimbell/Rekkoe/app/layout.tsx:1)  
  Mounted a root `PostHogProvider` in the App Router layout without changing the existing Vercel Flags or Clerk setup.
- [`components/analytics/posthog-provider.tsx`](/Users/charleskimbell/Rekkoe/components/analytics/posthog-provider.tsx:1)  
  Added a client-only provider that exposes `window.posthog`, keeps user identification in one place, and captures pageviews on client-side navigation via `Suspense`.
- [`lib/posthog-config.ts`](/Users/charleskimbell/Rekkoe/lib/posthog-config.ts:1)  
  Added env fallback support for `NEXT_PUBLIC_POSTHOG_KEY`, then `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, then legacy `NEXT_PUBLIC_POSTHOG_TOKEN`.
- [`app/api/stripe/checkout/route.ts`](/Users/charleskimbell/Rekkoe/app/api/stripe/checkout/route.ts:1)  
  Updated the server-side checkout event to `stripe_checkout_started`.
- [`.env.local`](/Users/charleskimbell/Rekkoe/.env.local:14)  
  Normalized the local PostHog host to the ingest host recommended by PostHog docs.

## Events in the funnel

- `barber_directory_viewed`  
  Captured server-side in [`app/style/barbers/page.tsx`](/Users/charleskimbell/Rekkoe/app/style/barbers/page.tsx:48).
- `footer_cta_clicked`  
  Captured client-side in [`components/homepage/footer-cta.tsx`](/Users/charleskimbell/Rekkoe/components/homepage/footer-cta.tsx:19).
- `intent_card_clicked`  
  Captured client-side in [`components/homepage/intent-router.tsx`](/Users/charleskimbell/Rekkoe/components/homepage/intent-router.tsx:17).
- `subscription_created`  
  Captured server-side from the Stripe webhook in [`app/api/stripe/webhook/route.ts`](/Users/charleskimbell/Rekkoe/app/api/stripe/webhook/route.ts:51).
- `subscription_cancelled`  
  Captured server-side from the Stripe webhook in [`app/api/stripe/webhook/route.ts`](/Users/charleskimbell/Rekkoe/app/api/stripe/webhook/route.ts:67).
- `stripe_checkout_started`  
  Captured server-side when checkout session creation succeeds in [`app/api/stripe/checkout/route.ts`](/Users/charleskimbell/Rekkoe/app/api/stripe/checkout/route.ts:58).

## Env vars required in Vercel

Use one of these token vars:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`

Also required:

- `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

Notes:

- The code supports the legacy `NEXT_PUBLIC_POSTHOG_TOKEN` env var as a fallback.
- Local [`.env.local`](/Users/charleskimbell/Rekkoe/.env.local:14) currently includes `NEXT_PUBLIC_POSTHOG_HOST` and `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.

## Verification

In the browser console after loading the app:

```js
window.posthog
window.posthog.capture("test_event")
```

You should also be able to navigate between routes and see `$pageview` events captured because pageviews are tracked from a client component mounted in the root layout.

In PostHog:

1. Open your project in PostHog.
2. Go to `Activity` or `Events`.
3. Trigger a local test event from the console or click through the homepage and barber funnel.
4. Confirm you see events like `test_event`, `$pageview`, `footer_cta_clicked`, and `stripe_checkout_started`.

## Common issues checked

- App uses App Router, not Pages Router.
- `posthog-js` is only imported in client components.
- `posthog-node` is used for server-side capture.
- `useSearchParams` is wrapped in `Suspense`.
- Client init happens via `instrumentation-client.ts`, so the provider does not call `posthog.init` again.
- Env mismatch is handled for `NEXT_PUBLIC_POSTHOG_KEY` vs `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.

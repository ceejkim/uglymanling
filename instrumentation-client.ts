import posthog from "posthog-js";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
const posthogUiHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.includes("eu.i.posthog.com")
    ? "https://eu.posthog.com"
    : "https://us.posthog.com";

if (posthogToken) {
  posthog.init(posthogToken, {
    api_host: "/ingest",
    ui_host: posthogUiHost,
    capture_exceptions: true,
    capture_pageview: false,
    defaults: "2026-01-30",
    debug: process.env.NODE_ENV === "development",
    person_profiles: "identified_only"
  });
}

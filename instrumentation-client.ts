import posthog from "posthog-js";
import { posthogProjectToken, posthogUiHost } from "@/lib/posthog-config";

if (posthogProjectToken) {
  posthog.init(posthogProjectToken, {
    api_host: "/ingest",
    ui_host: posthogUiHost,
    capture_exceptions: true,
    capture_pageview: false,
    defaults: "2026-01-30",
    debug: process.env.NODE_ENV === "development",
    person_profiles: "identified_only"
  });
}

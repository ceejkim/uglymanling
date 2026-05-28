"use client";

import { track } from "@vercel/analytics";
import posthog from "posthog-js";
import { hasPostHogToken } from "@/lib/posthog-config";

type Primitive = string | number | boolean | null;
type EventProps = Record<string, Primitive | undefined>;

const EVENT_VARIANTS: Record<string, readonly [string, string, string]> = {
  assessment_started: ["control", "momentum", "assurance"],
  assessment_completed: ["control", "momentum", "assurance"],
  assessment_results_viewed: ["control", "momentum", "assurance"],
  hero_cta_clicked: ["control", "social_proof", "urgency"],
  footer_cta_clicked: ["control", "social_proof", "urgency"],
  intent_card_clicked: ["control", "social_proof", "urgency"],
  barber_city_filtered: ["control", "efficiency", "exploration"],
  barber_card_expanded: ["control", "efficiency", "exploration"],
  barber_book_now_clicked: ["control", "efficiency", "exploration"],
};

function simpleHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function chooseVariant(event: string, distinctId: string) {
  const variants = EVENT_VARIANTS[event] ?? ["control", "variant_a", "variant_b"];
  return variants[simpleHash(`${event}:${distinctId}`) % variants.length];
}

function compact(properties: EventProps): Record<string, Primitive> {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined)) as Record<string, Primitive>;
}

export function captureProductEvent(event: string, properties: EventProps = {}) {
  const distinctId = posthog.get_distinct_id?.() ?? "anonymous";
  const experimentVariant = chooseVariant(event, distinctId);
  const payload = compact({
    ...properties,
    experiment_key: `${event}_mvp`,
    experiment_variant: experimentVariant,
    traffic_tier: "mvp_low_traffic",
  });

  if (hasPostHogToken) {
    posthog.capture(event, payload);
  }

  window.gtag?.("event", event, payload);
  track(event, payload);

  return { experimentKey: `${event}_mvp`, experimentVariant };
}

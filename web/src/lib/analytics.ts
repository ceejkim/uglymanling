export type ProductEvent =
  | "signup_started"
  | "signup_completed"
  | "onboarding_completed"
  | "chat_started";

type EventRecord = {
  name: ProductEvent;
  payload?: Record<string, string>;
  at: string;
};

const EVENT_STORE_KEY = "rekkoe_events_v1";

export function trackEvent(name: ProductEvent, payload?: Record<string, string>) {
  const event: EventRecord = {
    name,
    payload,
    at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const existingRaw = window.localStorage.getItem(EVENT_STORE_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as EventRecord[]) : [];
    existing.push(event);
    window.localStorage.setItem(EVENT_STORE_KEY, JSON.stringify(existing));
  }

  console.info("[rekkoe:event]", event);
}

import { PostHog } from "posthog-node";
import { posthogHost, posthogProjectToken } from "@/lib/posthog-config";

type PostHogPropertyValue = boolean | number | string | null | undefined;

type CaptureServerEventInput = {
  distinctId: string;
  event: string;
  properties?: Record<string, PostHogPropertyValue>;
};

function compactProperties(properties: Record<string, PostHogPropertyValue>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export async function captureServerEvent({
  distinctId,
  event,
  properties = {}
}: CaptureServerEventInput) {
  if (!posthogProjectToken) {
    return;
  }

  const posthog = new PostHog(posthogProjectToken, {
    host: posthogHost,
    flushAt: 1,
    flushInterval: 0
  });

  try {
    posthog.capture({
      distinctId,
      event,
      properties: compactProperties(properties)
    });
    await posthog.shutdown();
  } catch {
    // Analytics failures should never block the main request.
  }
}

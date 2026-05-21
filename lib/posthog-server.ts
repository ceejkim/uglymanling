import { PostHog } from "posthog-node";

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
  const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

  if (!token) {
    return;
  }

  const posthog = new PostHog(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
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

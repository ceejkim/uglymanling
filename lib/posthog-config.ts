const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

function normalizePostHogHost(host?: string) {
  if (!host) {
    return DEFAULT_POSTHOG_HOST;
  }

  if (host === "https://us.posthog.com") {
    return "https://us.i.posthog.com";
  }

  if (host === "https://eu.posthog.com") {
    return "https://eu.i.posthog.com";
  }

  return host;
}

export const posthogProjectToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

export const posthogHost = normalizePostHogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST);

export const posthogUiHost = posthogHost.includes("eu.i.posthog.com")
  ? "https://eu.posthog.com"
  : "https://us.posthog.com";

export const hasPostHogToken = Boolean(posthogProjectToken);

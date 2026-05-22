"use client";

import { Suspense, type ReactNode, useEffect } from "react";
import posthog from "posthog-js";
import { hasPostHogToken } from "@/lib/posthog-config";
import { PostHogPageviews } from "@/components/analytics/posthog-pageviews";
import { PostHogUserIdentification } from "@/components/analytics/posthog-user-identification";

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}

type PostHogProviderProps = Readonly<{
  children: ReactNode;
}>;

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    if (!hasPostHogToken) {
      return;
    }

    window.posthog = posthog;
  }, []);

  return (
    <>
      <PostHogUserIdentification />
      <Suspense fallback={null}>
        <PostHogPageviews />
      </Suspense>
      {children}
    </>
  );
}

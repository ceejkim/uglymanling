"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { hasPostHogToken } from "@/lib/posthog-config";

export function PostHogUserIdentification() {
  const { isLoaded, isSignedIn, user } = useUser();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (!isLoaded || !hasPostHogToken) {
      return;
    }

    if (isSignedIn && user) {
      wasSignedIn.current = true;
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        username: user.username
      });
      return;
    }

    if (wasSignedIn.current) {
      posthog.reset();
      wasSignedIn.current = false;
    }
  }, [
    isLoaded,
    isSignedIn,
    user?.firstName,
    user?.id,
    user?.lastName,
    user?.primaryEmailAddress?.emailAddress,
    user?.username
  ]);

  return null;
}

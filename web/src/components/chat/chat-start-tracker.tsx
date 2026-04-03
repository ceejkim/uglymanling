"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ChatStartTracker({ role }: { role: string }) {
  useEffect(() => {
    trackEvent("chat_started", { role });
  }, [role]);

  return null;
}

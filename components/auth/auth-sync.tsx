"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function AuthSync() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    void fetch("/api/clerk/sync", {
      method: "POST",
      credentials: "include"
    });
  }, [isSignedIn]);

  return null;
}

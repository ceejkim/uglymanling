"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import { getSession } from "@/lib/session";

export default function ChatPage() {
  const session = useMemo(() => getSession(), []);

  useEffect(() => {
    if (session) {
      trackEvent("chat_started", { role: session.role });
    }
  }, [session]);

  if (!session) {
    return (
      <Card className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Your chat inbox is empty</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Log in or create an account to start your first Rekkoe conversation.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Card className="h-fit p-4">
        <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          Session
        </p>
        <h2 className="mt-2 text-lg font-semibold">{session.name}</h2>
        <p className="text-sm text-[var(--color-muted)]">{session.email}</p>
        <p className="mt-2 inline-flex rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-semibold capitalize">
          {session.role}
        </p>
      </Card>

      <Card className="min-h-[400px] p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          Chat MVP
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Conversation workspace</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
          Sprint 1 includes the shell for onboarding and activation. Sprint 2 will implement
          persistent thread inbox, realtime messaging, and guide matching.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] p-5">
          <p className="text-sm font-medium">Suggested opening prompt</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            &quot;I want the best local morning routine in my neighborhood this weekend.&quot;
          </p>
        </div>
      </Card>
    </div>
  );
}

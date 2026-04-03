"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import { listChatThreads } from "@/lib/chat";
import { getSession } from "@/lib/session";

export default function ChatPage() {
  const session = useMemo(() => getSession(), []);
  const threads = listChatThreads();

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
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <Card className="p-4">
        <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          Inbox
        </p>
        <div className="mt-3 space-y-2">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/chat/${thread.id}`}
              className="block rounded-xl border border-[var(--color-line)] bg-white p-3 transition hover:bg-[var(--color-surface-soft)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold tracking-tight">{thread.title}</p>
                <span className="text-xs text-[var(--color-muted)]">{thread.lastMessageAt}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-muted)] line-clamp-2">
                {thread.lastMessagePreview}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                {thread.status.replace("_", " ")}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="min-h-[420px] p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          Thread Preview
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Select a conversation</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
          Sprint 2 turns chat into a true inbox and thread model. Choose a thread from the left
          to open `/chat/[threadId]`.
        </p>
      </Card>
    </div>
  );
}

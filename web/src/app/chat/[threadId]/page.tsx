import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getThreadById } from "@/lib/chat";

type ThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;
  const thread = getThreadById(threadId);

  if (!thread) {
    notFound();
  }

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Card className="h-fit p-4">
        <Link href="/chat" className="text-sm font-semibold text-[var(--color-accent)]">
          ← Back to inbox
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">{thread.summary.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Explorer: {thread.summary.explorer.name}
        </p>
        <p className="text-sm text-[var(--color-muted)]">Guide: {thread.summary.guide.name}</p>
        <p className="mt-2 inline-flex rounded-full bg-[var(--color-surface-soft)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
          {thread.summary.status.replace("_", " ")}
        </p>
      </Card>

      <Card className="min-h-[460px] p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          Conversation
        </p>

        <div className="mt-4 space-y-3">
          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={[
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6",
                message.senderRole === "guide"
                  ? "bg-[var(--color-surface-soft)]"
                  : "ml-auto bg-[var(--color-accent)] text-white",
              ].join(" ")}
            >
              <p>{message.body}</p>
              <p
                className={[
                  "mt-1 text-xs",
                  message.senderRole === "guide" ? "text-[var(--color-muted)]" : "text-white/80",
                ].join(" ")}
              >
                {message.sentAt}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-line)] p-4">
          <p className="text-sm font-medium">Composer shell (Sprint 2)</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Realtime send and persistence wiring will land next in S2-04.
          </p>
        </div>
      </Card>
    </div>
  );
}

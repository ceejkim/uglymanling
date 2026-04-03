import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listModerationItems } from "@/lib/admin";

export default function AdminPage() {
  const items = listModerationItems();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Moderation queue</h1>
      </section>

      <section className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.1em]">{item.category}</p>
              <span className="rounded-full bg-[var(--color-surface-soft)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
                {item.priority}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.summary}</p>
            <Link href={`/chat/${item.threadId}`} className="mt-3 inline-flex text-sm font-semibold text-[var(--color-accent)]">
              Open thread context
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
}

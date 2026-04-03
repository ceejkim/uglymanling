import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listGuides } from "@/lib/discovery";

export default function DiscoverPage() {
  const guides = listGuides();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Discover
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Find locals worth talking to</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Explore verified guides and experts by specialty, response time, and session style.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {guides.map((guide) => (
          <Card key={guide.id} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
              {guide.city}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{guide.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{guide.specialty}</p>
            <div className="mt-4 text-xs text-[var(--color-muted)]">
              <p>Rating: {guide.rating.toFixed(1)}</p>
              <p>Replies: {guide.responseTime}</p>
              <p>Format: {guide.sessionType}</p>
            </div>
            <Link
              href={`/chat/${guide.threadId}`}
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-[var(--color-accent)] px-3 text-sm font-semibold text-white"
            >
              Open Conversation
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
}

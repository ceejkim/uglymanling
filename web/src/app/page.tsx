import Link from "next/link";
import { Card } from "@/components/ui/card";

const pillars = [
  {
    title: "Conversation-first",
    detail: "Talk to real locals and experts in real time instead of searching static listings.",
  },
  {
    title: "Trust by design",
    detail: "Verification, transparent feedback, and profile context guide every decision.",
  },
  {
    title: "Chat to experience",
    detail: "Convert recommendations into guided or self-guided experiences without leaving the thread.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 md:p-12">
        <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          Rekkoe • Sprint 1 shell
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Discovery through people, not platforms.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)] md:text-lg">
          Rekkoe helps explorers connect with locals and experts through real-time chat,
          then turn those conversations into meaningful experiences.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white"
          >
            Start As Explorer
          </Link>
          <Link
            href="/auth/signup?role=guide"
            className="inline-flex h-11 items-center rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm font-semibold"
          >
            Become a Guide
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="p-5">
            <h2 className="text-lg font-semibold tracking-tight">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{pillar.detail}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

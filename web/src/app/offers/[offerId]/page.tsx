import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getOffer } from "@/lib/offers";

type OfferPageProps = {
  params: Promise<{ offerId: string }>;
};

export default async function OfferPage({ params }: OfferPageProps) {
  const { offerId } = await params;
  const offer = getOffer(offerId);

  if (!offer) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/offers" className="text-sm font-semibold text-[var(--color-accent)]">
        ← Back to offers
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{offer.title}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Guide: {offer.guideName}</p>
          </div>
          <span className="rounded-full bg-[var(--color-surface-soft)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
            {offer.status}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{offer.summary}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-muted)]">Format</p>
            <p className="mt-1 text-sm font-semibold">{offer.format}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-muted)]">Duration</p>
            <p className="mt-1 text-sm font-semibold">{offer.duration}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-muted)]">Price</p>
            <p className="mt-1 text-sm font-semibold">{offer.price}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Included</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            {offer.included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/bookings"
            className="inline-flex h-11 items-center rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white"
          >
            Continue to Booking
          </Link>
          <Link
            href={`/chat/${offer.threadId}`}
            className="inline-flex h-11 items-center rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm font-semibold"
          >
            Back to Conversation
          </Link>
        </div>
      </Card>
    </div>
  );
}

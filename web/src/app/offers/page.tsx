import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listOffers } from "@/lib/offers";

export default function OffersPage() {
  const offers = listOffers();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Offers
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Experience proposals from chat</h1>
      </section>

      <section className="space-y-3">
        {offers.map((offer) => (
          <Card key={offer.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{offer.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Guide: {offer.guideName}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {offer.duration} • {offer.format} • {offer.price}
                </p>
              </div>
              <span className="rounded-full bg-[var(--color-surface-soft)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
                {offer.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{offer.summary}</p>
            <Link
              href={`/offers/${offer.id}`}
              className="mt-4 inline-flex h-10 items-center rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm font-semibold"
            >
              View Offer
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
}

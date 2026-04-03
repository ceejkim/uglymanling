import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listBookings } from "@/lib/bookings";

export default function BookingsPage() {
  const bookings = listBookings();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Bookings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your experience schedule</h1>
      </section>

      <section className="space-y-3">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{booking.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Guide: {booking.guideName}</p>
              </div>
              <span className="rounded-full bg-[var(--color-surface-soft)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
                {booking.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{booking.date}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{booking.location}</p>
            <p className="mt-2 text-sm font-semibold">{booking.amount}</p>
          </Card>
        ))}
      </section>

      <Link
        href="/payments"
        className="inline-flex h-11 items-center rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white"
      >
        Open Payments
      </Link>
    </div>
  );
}

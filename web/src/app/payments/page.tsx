import { Card } from "@/components/ui/card";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Checkout and payout center</h1>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold tracking-tight">Explorer checkout</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Upcoming integration: secure checkout intent, saved receipts, and cancellation policies.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold tracking-tight">Guide payouts</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Upcoming integration: payout onboarding, pending balance, and payout schedule history.
          </p>
        </Card>
      </div>
    </div>
  );
}

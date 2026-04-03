import { Card } from "@/components/ui/card";

export default function GuideDashboardPage() {
  const metrics = [
    { label: "Active conversations", value: "8" },
    { label: "Offer acceptance rate", value: "62%" },
    { label: "This month earnings", value: "$1,940" },
    { label: "Avg response time", value: "6 min" },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Guide Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Performance and earnings</h1>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-muted)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5">
        <h2 className="text-lg font-semibold tracking-tight">Action queue</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          <li>2 explorers awaiting offer proposals</li>
          <li>1 upcoming booking to confirm logistics</li>
          <li>3 completed sessions eligible for review follow-up</li>
        </ul>
      </Card>
    </div>
  );
}

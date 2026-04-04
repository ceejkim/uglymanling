import { Card } from "@/components/ui/card";
import { howItWorks } from "@/lib/homepage-content";

export function HowItWorks() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Simple on purpose.</h2>
        <p className="section-copy">Three steps. No spiral.</p>
        <div className="grid steps-grid">
          {howItWorks.map((step, index) => (
            <Card key={step} style={{ minHeight: "9rem", display: "grid", gap: "0.7rem" }}>
              <span className="eyebrow">Step {index + 1}</span>
              <h3 style={{ margin: 0, fontSize: "1.35rem", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
                {step}
              </h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                {stepCopy(index)}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function stepCopy(index: number) {
  const steps = [
    "See where you stand.",
    "Choose what fits your budget and nerve.",
    "Do one useful thing next."
  ];

  return steps[index] ?? "";
}

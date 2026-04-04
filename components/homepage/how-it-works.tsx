import { Card } from "@/components/ui/card";
import { howItWorks } from "@/lib/homepage-content";

export function HowItWorks() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">How it works</div>
        <h2 className="section-title">A system, not a panic spiral.</h2>
        <p className="section-copy">
          The point is not to throw thirty tabs at you. The point is to help you make one better
          decision after another.
        </p>
        <div className="grid steps-grid">
          {howItWorks.map((step, index) => (
            <Card key={step} style={{ minHeight: "12rem", display: "grid", gap: "0.8rem" }}>
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
    "Figure out what stage you are in and what you actually care about.",
    "Get a practical plan instead of vague internet soup.",
    "Pick the path that matches your budget, urgency, and confidence.",
    "Take action through treatment, style, products, or expert help.",
    "Come back with better information and better hair-loss emotional hygiene."
  ];

  return steps[index] ?? "";
}

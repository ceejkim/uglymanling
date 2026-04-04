import Link from "next/link";
import { Card } from "@/components/ui/card";
import { offerings } from "@/lib/homepage-content";

export function OfferingsGrid() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">What we do</div>
        <h2 className="section-title">Three ways we help.</h2>
        <p className="section-copy">Plans, experts, and style help. No fluff.</p>
        <div className="grid offerings-grid">
          {offerings.map((offering) => (
            <Card key={offering.title} style={{ display: "grid", gap: "0.75rem", minHeight: "12rem" }}>
              <span className="eyebrow">{offering.title}</span>
              <h3 style={{ margin: 0, fontSize: "1.35rem", lineHeight: 1.06, letterSpacing: "-0.04em" }}>
                {offering.body}
              </h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.45, fontSize: "0.92rem" }}>
                {offering.proof}
              </p>
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <Link href={offering.href} style={{ fontWeight: 800, color: "var(--blue)" }}>
                  {offering.cta}
                </Link>
                <span className="muted" style={{ fontSize: "0.88rem" }}>
                  Open
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

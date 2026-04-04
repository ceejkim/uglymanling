import { Card } from "@/components/ui/card";
import { testimonials } from "@/lib/homepage-content";

export function TrustStrip() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card style={{ display: "grid", gap: "1rem" }}>
          <div className="section-label">Trust and proof</div>
          <div className="grid split-grid" style={{ alignItems: "start" }}>
            <div>
              <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 4vw, 3.1rem)" }}>
                Less fake hope. More useful honesty.
              </h2>
              <p className="section-copy" style={{ marginTop: "0.75rem" }}>
                Evidence-backed where it matters. Human where it helps. Honest enough to actually be useful.
              </p>
            </div>
            {testimonials.map((item) => (
              <div key={item.quote} style={{ paddingTop: "0.35rem" }}>
                <p style={{ margin: 0, lineHeight: 1.65 }}>&ldquo;{item.quote}&rdquo;</p>
                <p className="muted" style={{ margin: "0.55rem 0 0", fontSize: "0.9rem" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

import { Card } from "@/components/ui/card";
import { testimonials } from "@/lib/homepage-content";

export function TrustStrip() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card style={{ display: "grid", gap: "1rem" }}>
          <div className="section-label">Proof</div>
          <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 4vw, 3.1rem)", maxWidth: "14ch" }}>
            Less fake hope. More useful honesty.
          </h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.8rem" }}>
            {testimonials.map((item) => (
              <div
                key={item.quote}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--line)",
                  background: "rgba(255, 248, 218, 0.52)"
                }}
              >
                <p style={{ margin: 0, lineHeight: 1.55 }}>&ldquo;{item.quote}&rdquo;</p>
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

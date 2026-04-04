import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityBullets, testimonials } from "@/lib/homepage-content";

export function CommunityBand() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card
          style={{
            display: "grid",
            gap: "1.2rem",
            background: "linear-gradient(180deg, rgba(255, 216, 77, 0.22), rgba(255,255,255,0.98) 42%)"
          }}
        >
          <div style={{ display: "grid", gap: "0.7rem", maxWidth: "44rem" }}>
            <div className="section-label">Community</div>
            <h2 className="section-title">Join our community.</h2>
            <p className="section-copy" style={{ marginTop: 0 }}>
              For men comparing notes, getting real feedback, sharing wins, and not doing this
              alone. No shame. No hype. No weird miracle-hair cult energy.
            </p>
          </div>

          <div className="grid split-grid" style={{ alignItems: "start" }}>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {communityBullets.map((bullet) => (
                <div
                  key={bullet}
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--line)",
                    background: "rgba(255,255,255,0.85)",
                    fontWeight: 700,
                    lineHeight: 1.45
                  }}
                >
                  {bullet}
                </div>
              ))}
            </div>

            <div className="grid" style={{ gap: "0.8rem" }}>
              {testimonials.slice(0, 2).map((item) => (
                <div
                  key={item.quote}
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--line)",
                    background: "var(--surface-soft)"
                  }}
                >
                  <p style={{ margin: 0, lineHeight: 1.6 }}>&ldquo;{item.quote}&rdquo;</p>
                  <p className="muted" style={{ margin: "0.55rem 0 0", fontSize: "0.88rem" }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="community-actions">
            <Button href="/community" variant="secondary">
              Join our community
            </Button>
            <Button href="/contact" variant="ghost">
              Ask a question first
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

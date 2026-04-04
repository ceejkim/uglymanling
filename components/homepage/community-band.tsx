import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityBullets } from "@/lib/homepage-content";

export function CommunityBand() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card
          className="community-card"
          style={{
            display: "grid",
            gap: "1.2rem"
          }}
        >
          <div className="community-layout">
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <div style={{ display: "grid", gap: "0.7rem", maxWidth: "44rem" }}>
                <div className="section-label">Community</div>
                <h2 className="section-title">Do not do this alone.</h2>
                <p className="section-copy" style={{ marginTop: 0 }}>
                  Ask questions. Compare notes. Join the uglymanlings before another terrible forum thread finds you.
                </p>
              </div>

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

              <div className="community-actions">
                <Button href="/community" variant="secondary">
                  Join the uglymanlings
                </Button>
                <Button href="/contact" variant="ghost">
                  Ask a question first
                </Button>
              </div>
            </div>

            <div className="community-illustration">
              <div className="community-illustration-chip">Mirror checks. Shower rage. Brotherhood.</div>
              <Image
                src="/brand/mascots/uglymanlings-duck-scenes.png"
                alt="Ugly Manlings duck mascot scenes showing mirror, shower, and community moments"
                width={420}
                height={420}
                className="community-illustration-image"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

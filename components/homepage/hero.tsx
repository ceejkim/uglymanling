import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="section" style={{ paddingTop: "1.25rem" }}>
      <div className="page-shell">
        <div className="hero-shell">
          <div className="grain-card hero-main">
            <Badge tone="accent">Hair-loss support ecosystem</Badge>
            <h1 className="hero-title">Balding? Let&apos;s make a plan.</h1>
            <p className="hero-copy">
              Ugly Manling helps you figure out what stage you&apos;re in, what actually helps, and
              which next move is worth your time. Less panic. Less nonsense. More clarity.
            </p>
            <div className="hero-actions">
              <Button href="/assessment">Start your assessment</Button>
              <Button href="/community" variant="secondary">
                Join our community
              </Button>
              <Button href="/contact" variant="ghost">
                Contact us
              </Button>
            </div>
          </div>

          <div className="hero-side">
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <span className="eyebrow" style={{ color: "var(--primary)" }}>
                Core value
              </span>
              <p style={{ margin: 0, fontSize: "1.06rem", lineHeight: 1.7 }}>
                Figure out what matters, cut through the fake certainty, and choose the next move
                that actually fits your life.
              </p>
            </div>

            <div className="hero-side-grid">
              <HeroStat title="Clear next steps" body="No vague content soup. Just better decisions." />
              <HeroStat title="Human tone" body="Useful, direct, and not weirdly inspirational." />
              <HeroStat title="Real options" body="Treatments, style, products, experts, and community." />
              <HeroStat title="Trust first" body="Evidence where it matters. Honesty everywhere else." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ title, body }: { title: string; body: string }) {
  return (
    <div className="hero-side-card">
      <p style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</p>
      <p style={{ marginTop: "0.35rem", color: "rgba(255,255,255,0.76)", fontSize: "0.9rem", lineHeight: 1.55 }}>
        {body}
      </p>
    </div>
  );
}

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="section" style={{ paddingTop: "1.25rem" }}>
      <div className="page-shell">
        <div className="hero-shell">
          <div className="grain-card hero-main">
            <Badge tone="accent">For uglymanlings</Badge>
            <h1 className="hero-title">Balding? Make one smart move.</h1>
            <p className="hero-copy">Hair loss help with duck-grade attitude. Clear next steps. No miracle nonsense.</p>
            <div className="hero-actions">
              <Button href="/assessment">Take the assessment</Button>
              <Button href="/community" variant="secondary">
                Join the uglymanlings
              </Button>
              <Button href="/contact" variant="ghost">
                Ask a question
              </Button>
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-duck-frame">
              <div className="hero-duck-chip">Cute. Angry. Helpful.</div>
              <Image
                src="/brand/mascots/uglymanlings-duck-primary.png"
                alt="Angry but cute Ugly Manlings duck mascot"
                width={320}
                height={320}
                className="hero-duck-image"
                priority
              />
            </div>
            <div className="hero-side-intro">
              <span className="eyebrow">Why this works</span>
              <p className="hero-side-copy">Less guessing. More "okay, I can work with this."</p>
            </div>

            <div className="hero-side-grid">
              <HeroStat title="Direct" body="Fewer words. Better ones." />
              <HeroStat title="Useful" body="Treatment, style, experts." />
              <HeroStat title="Honest" body="No fake hope tax." />
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
      <p className="hero-side-card-copy">{body}</p>
    </div>
  );
}

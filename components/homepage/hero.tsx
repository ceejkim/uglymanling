import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="section" style={{ paddingTop: "1.25rem" }}>
      <div className="page-shell">
        <div className="hero-shell">
          <div className="grain-card hero-main">
            <Badge tone="accent">For uglymanlings</Badge>
            <h1 className="hero-title">If you're going bald, do it hot.</h1>
            <p className="hero-copy">Join the flock for style, support, and smarter next steps.</p>
            <div className="hero-actions">
              <Button href="/style/barbers" variant="secondary">
                Find a barber
              </Button>
              <Button href="/community" variant="ghost">
                Join our flock
              </Button>
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-duck-frame">
              <div className="hero-duck-chip">Sass is not just for men with hair.</div>
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
              <span className="eyebrow">Join our flock</span>
              <p className="hero-side-copy">What you get when you stop freestyling it.</p>
            </div>

            <div className="hero-side-grid">
              <HeroStat
                title="Find your barber"
                body="Find barbers who know thinning hair, maintenance cuts, and confidence-first style."
                href="/style/barbers"
              />
              <HeroStat
                title="Vetted style bank"
                body="Looks mapped to Norwood stage, head shape, density, and vibe."
                badge="Coming soon"
              />
              <HeroStat
                title="Direct expert access"
                body="Get blunt guidance from vetted uglymanling experts when you need it."
                badge="Coming soon"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  title,
  body,
  badge,
  href
}: {
  title: string;
  body: string;
  badge?: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="hero-side-card-top">
        <p style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</p>
        {badge ? <span className="hero-side-card-badge">{badge}</span> : null}
      </div>
      <p className="hero-side-card-copy">{body}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="hero-side-card hero-side-card-link">
        {content}
      </Link>
    );
  }

  return <div className="hero-side-card">{content}</div>;
}

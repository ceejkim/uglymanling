import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeroCtaVariantValue } from "@/flags";
import { HeroCtaButton } from "@/components/homepage/hero-cta-button";

type HeroProps = {
  ctaVariant: HeroCtaVariantValue;
  ctaText: string;
};

export function Hero({ ctaVariant, ctaText }: HeroProps) {
  return (
    <section className="section" style={{ paddingTop: "1.25rem" }}>
      <div className="page-shell">
        <div className="hero-shell">
          <div className="grain-card hero-main">
            <Badge tone="accent">For uglymanlings</Badge>
            <h1 className="hero-title">The #1 place to find barbers for balding men</h1>
            <p className="hero-copy">Join our community to find battle-tested barbers for balding near you.</p>
            <div className="hero-actions" data-hero-cta-variant={ctaVariant}>
              <HeroCtaButton text={ctaText} variant={ctaVariant} />
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-duck-frame">
              <div className="hero-duck-chip">Balding is a choice.</div>
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
              <p className="hero-side-copy">Stop freestyling it.</p>
            </div>

            <div className="hero-side-grid">
              <HeroStat
                title="Find your barber"
                body="Find battle-tested barbers who get balding."
                href="/community"
                cta="Join here"
              />
              <HeroStat
                title="Vetted style bank"
                body="Norwood-aligned looks."
                badge="Coming soon"
              />
              <HeroStat
                title="Direct expert access"
                body="Expert insights to help you look your best."
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
  href,
  cta
}: {
  title: string;
  body: string;
  badge?: string;
  href?: string;
  cta?: string;
}) {
  const content = (
    <div style={{ display: "grid", gap: "0.8rem" }}>
      <div className="hero-side-card-top">
        <p style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</p>
        {badge ? <span className="hero-side-card-badge">{badge}</span> : null}
      </div>
      <p className="hero-side-card-copy">{body}</p>
      {href && cta ? (
        <div>
          <Button href={href}>{cta}</Button>
        </div>
      ) : null}
    </div>
  );

  if (href && !cta) {
    return (
      <Link href={href} className="hero-side-card hero-side-card-link">
        {content}
      </Link>
    );
  }

  return <div className="hero-side-card">{content}</div>;
}

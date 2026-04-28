import Image from "next/image";
import type { HeroCtaVariantValue, HeroVisitorType } from "@/flags";
import { HeroCtaButton } from "@/components/homepage/hero-cta-button";

type HeroProps = {
  ctaVariant: HeroCtaVariantValue;
  heroHeadline: string;
  visitorType: HeroVisitorType;
};

export function Hero({ ctaVariant, heroHeadline, visitorType }: HeroProps) {
  return (
    <section className="section hero-section">
      <div className="page-shell">
        <div className="hero-shell">
          <div className="grain-card hero-main">
            <span className="home-hero-badge">For uglymanlings</span>
            <h1 className="hero-title">{heroHeadline}</h1>
            <p className="hero-copy">Join our community to find battle-tested barbers for balding near you.</p>
            <div className="hero-actions" data-hero-cta-variant={ctaVariant}>
              <HeroCtaButton heroHeadline={heroHeadline} variant={ctaVariant} visitorType={visitorType} />
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-duck-frame">
              <div className="hero-duck-chip">Balding is a choice</div>
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
              <p className="hero-side-copy">
                Stop freestyling it. Find the right barber first, then build a smarter next step with the flock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

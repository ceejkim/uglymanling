import { Show, UserButton } from "@clerk/nextjs";
import { CommunityBand } from "@/components/homepage/community-band";
import { ContactPanel } from "@/components/homepage/contact-panel";
import { FooterCta } from "@/components/homepage/footer-cta";
import { Hero } from "@/components/homepage/hero";
import { HowItWorks } from "@/components/homepage/how-it-works";
import { IntentRouter } from "@/components/homepage/intent-router";
import { OfferingsGrid } from "@/components/homepage/offerings-grid";
import { TrustStrip } from "@/components/homepage/trust-strip";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      <div className="page-shell">
        <header className="site-header">
          <div>
            <p style={{ margin: 0, fontWeight: 900, letterSpacing: "-0.05em", fontSize: "1.22rem" }}>
              Ugly Manling
            </p>
            <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
              Confidence, clarity, and honest next steps for balding men
            </p>
          </div>
          <nav>
            <a href="#offerings">Offerings</a>
            <a href="#community">Community</a>
            <a href="#connect">Connect</a>
          </nav>
          <div className="site-header-actions">
            <Show when="signed-out">
              <Button href="/sign-in" variant="ghost">
                Sign in
              </Button>
              <Button href="/sign-up" variant="secondary">
                Sign up
              </Button>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </header>
      </div>

      <Hero />
      <IntentRouter />
      <div id="offerings">
        <OfferingsGrid />
      </div>
      <div id="community">
        <CommunityBand />
      </div>
      <HowItWorks />
      <div id="connect">
        <ContactPanel />
      </div>
      <TrustStrip />
      <FooterCta />
    </main>
  );
}

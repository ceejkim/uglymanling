import { Show, UserButton } from "@clerk/nextjs";
import { CommunityBand } from "@/components/homepage/community-band";
import { ContactPanel } from "@/components/homepage/contact-panel";
import { FooterCta } from "@/components/homepage/footer-cta";
import { BrandMark } from "@/components/homepage/brand-mark";
import { Hero } from "@/components/homepage/hero";
import { HowItWorks } from "@/components/homepage/how-it-works";
import { IntentRouter } from "@/components/homepage/intent-router";
import { OfferingsGrid } from "@/components/homepage/offerings-grid";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      <div className="page-shell">
        <header className="site-header">
          <BrandMark compact />
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
      <FooterCta />
    </main>
  );
}

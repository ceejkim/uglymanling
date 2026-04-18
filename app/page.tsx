import { Show, UserButton } from "@clerk/nextjs";
import { ComingSoon } from "@/components/homepage/coming-soon";
import { CommunityBand } from "@/components/homepage/community-band";
import { BrandMark } from "@/components/homepage/brand-mark";
import { Hero } from "@/components/homepage/hero";
import { ProductVision } from "@/components/homepage/product-vision";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      <div className="page-shell">
        <header className="site-header">
          <BrandMark compact />
          <nav>
            <a href="#vision">Offerings</a>
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
      <div id="vision">
        <ProductVision />
      </div>
      <div id="community">
        <CommunityBand />
      </div>
      <div id="connect">
        <ComingSoon />
      </div>
    </main>
  );
}

import { Show, UserButton } from "@clerk/nextjs";
import { ComingSoon } from "@/components/homepage/coming-soon";
import { CommunityBand } from "@/components/homepage/community-band";
import { BrandMark } from "@/components/homepage/brand-mark";
import { Hero } from "@/components/homepage/hero";
import { ProductVision } from "@/components/homepage/product-vision";
import { Button } from "@/components/ui/button";
import { heroCtaVariant } from "@/flags";

export default async function HomePage() {
  const variant = await heroCtaVariant();
  const ctaText =
    variant === "B"
      ? "Find balding-friendly barbers near you"
      : variant === "C"
        ? "The #1 place to find barbers for balding men"
        : "Find a barber for thinning hair";

  return (
    <main>
      <div className="page-shell">
        <header className="site-header">
          <BrandMark compact />
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

      <Hero ctaVariant={variant} ctaText={ctaText} />
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

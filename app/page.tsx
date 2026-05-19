import { Show, UserButton } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { CommunityBand } from "@/components/homepage/community-band";
import { BrandMark } from "@/components/homepage/brand-mark";
import { Hero } from "@/components/homepage/hero";
import { Button } from "@/components/ui/button";
import { HERO_CTA_VARIANT_COOKIE, getHeroVisitorType, heroCtaVariant, isHeroCtaVariantValue } from "@/flags";

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieVariant = cookieStore.get(HERO_CTA_VARIANT_COOKIE)?.value;
  const variant = isHeroCtaVariantValue(cookieVariant) ? cookieVariant : await heroCtaVariant();
  const visitorType = await getHeroVisitorType();
  const heroHeadline =
    variant === "B"
      ? "Find balding-friendly barbers near you"
      : variant === "C"
        ? "The #1 place to find barbers for balding men"
        : "Find a barber for thinning hair";

  return (
    <main className="home-page">
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

      <Hero ctaVariant={variant} heroHeadline={heroHeadline} visitorType={visitorType} />
      <div id="community">
        <CommunityBand />
      </div>
    </main>
  );
}

"use client";

import { track } from "@vercel/analytics";
import type { HeroCtaVariantValue, HeroVisitorType } from "@/flags";
import { Button } from "@/components/ui/button";

type HeroCtaButtonProps = {
  variant: HeroCtaVariantValue;
  heroHeadline: string;
  visitorType: HeroVisitorType;
};

export function HeroCtaButton({ variant, heroHeadline, visitorType }: HeroCtaButtonProps) {
  return (
    <Button
      href="/style/barbers"
      variant="secondary"
      onClick={() => {
        track("Find Barber Clicked", {
          location: "homepage_hero",
          variant,
          heroHeadline,
          visitorType
        });

        window.gtag?.("event", "hero_cta_click", {
          location: "homepage_hero",
          variant,
          heroHeadline,
          visitorType
        } as Record<string, unknown>);
      }}
    >
      Find a barber
    </Button>
  );
}

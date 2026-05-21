"use client";

import { track } from "@vercel/analytics";
import posthog from "posthog-js";
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
        const eventPayload = {
          location: "homepage_hero",
          hero_cta_variant: variant,
          hero_cta_headline: heroHeadline,
          hero_visitor_type: visitorType
        };

        track("Find Barber Clicked", {
          ...eventPayload,
          variant,
          heroHeadline,
          visitorType
        });

        window.gtag?.("event", "hero_cta_click", eventPayload);

        posthog.capture("hero_cta_clicked", {
          location: "homepage_hero",
          hero_cta_variant: variant,
          hero_cta_headline: heroHeadline,
          hero_visitor_type: visitorType,
        });
      }}
    >
      Find a barber
    </Button>
  );
}

"use client";

import { track } from "@vercel/analytics";
import { captureProductEvent } from "@/lib/analytics/event-tracking";
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

        captureProductEvent("hero_cta_clicked", eventPayload);
      }}
    >
      Find a barber
    </Button>
  );
}

"use client";

import { track } from "@vercel/analytics";
import type { HeroCtaVariantValue } from "@/flags";
import { Button } from "@/components/ui/button";

type HeroCtaButtonProps = {
  variant: HeroCtaVariantValue;
  heroHeadline: string;
};

export function HeroCtaButton({ variant, heroHeadline }: HeroCtaButtonProps) {
  return (
    <Button
      href="/style/barbers"
      variant="secondary"
      onClick={() => {
        track("Find Barber Clicked", {
          location: "homepage_hero",
          variant,
          heroHeadline
        });
      }}
    >
      Find a barber
    </Button>
  );
}

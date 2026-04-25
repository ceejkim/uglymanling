"use client";

import { track } from "@vercel/analytics";
import type { HeroCtaVariantValue } from "@/flags";
import { Button } from "@/components/ui/button";

type HeroCtaButtonProps = {
  text: string;
  variant: HeroCtaVariantValue;
};

export function HeroCtaButton({ text, variant }: HeroCtaButtonProps) {
  return (
    <Button
      href="/style/barbers"
      variant="secondary"
      onClick={() => {
        track("Find Barber Clicked", {
          location: "homepage_hero",
          variant,
          ctaText: text
        });
      }}
    >
      {text}
    </Button>
  );
}

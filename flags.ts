import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

export type HeroCtaVariantValue = "A" | "B" | "C";

const heroCtaVariantBase = {
  key: "hero_cta_variant",
  description: "Homepage hero primary CTA copy variant for the first A/B/C test.",
  defaultValue: "A" as const,
  options: ["A", "B", "C"] as HeroCtaVariantValue[]
};

export const heroCtaVariant = process.env.FLAGS
  ? flag<HeroCtaVariantValue>({
      ...heroCtaVariantBase,
      adapter: vercelAdapter()
    })
  : flag<HeroCtaVariantValue>({
      ...heroCtaVariantBase,
      decide: () => "A"
    });

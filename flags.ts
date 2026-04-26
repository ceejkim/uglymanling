import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

export type HeroCtaVariantValue = "A" | "B" | "C";

export const HERO_CTA_VARIANT_COOKIE = "hero_cta_variant";
export const HERO_CTA_VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const HERO_CTA_VARIANT_VALUES: HeroCtaVariantValue[] = ["A", "B", "C"];

export function isHeroCtaVariantValue(value: unknown): value is HeroCtaVariantValue {
  return typeof value === "string" && HERO_CTA_VARIANT_VALUES.includes(value as HeroCtaVariantValue);
}

const heroCtaVariantBase = {
  key: "hero_cta_variant",
  description: "Homepage hero primary CTA copy variant for the first A/B/C test.",
  defaultValue: "A" as const,
  options: HERO_CTA_VARIANT_VALUES
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

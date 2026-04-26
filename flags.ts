import { auth } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { dedupe, flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

export type HeroCtaVariantValue = "A" | "B" | "C";
export type HeroVisitorType = "signed_in" | "anonymous";

type HeroFlagEntities = {
  user?: {
    id: string;
    visitorType: HeroVisitorType;
  };
};

export const HERO_CTA_ANONYMOUS_ID_COOKIE = "hero_anonymous_id";
export const HERO_CTA_VARIANT_COOKIE = "hero_cta_variant";
export const HERO_CTA_VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const HERO_CTA_IDENTITY_ID_HEADER = "x-hero-cta-identity-id";
export const HERO_CTA_IDENTITY_TYPE_HEADER = "x-hero-cta-identity-type";
export const HERO_CTA_VARIANT_VALUES: HeroCtaVariantValue[] = ["A", "B", "C"];

export function isHeroCtaVariantValue(value: unknown): value is HeroCtaVariantValue {
  return typeof value === "string" && HERO_CTA_VARIANT_VALUES.includes(value as HeroCtaVariantValue);
}

export async function getHeroVisitorType(): Promise<HeroVisitorType> {
  const { userId } = await auth();

  return userId ? "signed_in" : "anonymous";
}

const identifyHeroVisitor = dedupe(async (): Promise<HeroFlagEntities> => {
  const headerStore = await headers();
  const headerId = headerStore.get(HERO_CTA_IDENTITY_ID_HEADER);
  const headerVisitorType = headerStore.get(HERO_CTA_IDENTITY_TYPE_HEADER);

  if (headerId && (headerVisitorType === "signed_in" || headerVisitorType === "anonymous")) {
    return {
      user: {
        id: headerId,
        visitorType: headerVisitorType
      }
    };
  }

  const { userId } = await auth();
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(HERO_CTA_ANONYMOUS_ID_COOKIE)?.value;

  if (userId) {
    return {
      user: {
        id: userId,
        visitorType: "signed_in"
      }
    };
  }

  if (anonymousId) {
    return {
      user: {
        id: anonymousId,
        visitorType: "anonymous"
      }
    };
  }

  return {};
});

const heroCtaVariantBase = {
  key: "hero_cta_variant",
  description: "Homepage hero primary CTA copy variant for the first A/B/C test.",
  defaultValue: "A" as const,
  options: HERO_CTA_VARIANT_VALUES
};

export const heroCtaVariant = process.env.FLAGS
  ? flag<HeroCtaVariantValue, HeroFlagEntities>({
      ...heroCtaVariantBase,
      adapter: vercelAdapter(),
      identify: identifyHeroVisitor
    })
  : flag<HeroCtaVariantValue, HeroFlagEntities>({
      ...heroCtaVariantBase,
      identify: identifyHeroVisitor,
      decide: () => "A"
    });

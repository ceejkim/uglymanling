import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  HERO_CTA_ANONYMOUS_ID_COOKIE,
  HERO_CTA_IDENTITY_ID_HEADER,
  HERO_CTA_IDENTITY_TYPE_HEADER,
  HERO_CTA_VARIANT_COOKIE,
  HERO_CTA_VARIANT_COOKIE_MAX_AGE,
  type HeroVisitorType,
  heroCtaVariant,
  isHeroCtaVariantValue
} from "@/flags";

type CookieToSet = {
  name: string;
  value: string;
};

function setRequestCookieHeader(cookieHeader: string | null, name: string, value: string) {
  const nextCookie = `${name}=${value}`;

  if (!cookieHeader) {
    return nextCookie;
  }

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .filter((cookie) => !cookie.startsWith(`${name}=`));

  return [...cookies, nextCookie].join("; ");
}

function setCookieOnRequestHeaders(headers: Headers, cookie: CookieToSet) {
  headers.set(
    "cookie",
    setRequestCookieHeader(headers.get("cookie"), cookie.name, cookie.value)
  );
}

function setExperimentCookie(response: NextResponse, cookie: CookieToSet) {
  response.cookies.set(cookie.name, cookie.value, {
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: HERO_CTA_VARIANT_COOKIE_MAX_AGE,
    path: "/"
  });
}

async function setHeroCtaVariantCookie(request: NextRequest, clerkUserId: string | null) {
  const cookieVariant = request.cookies.get(HERO_CTA_VARIANT_COOKIE)?.value;
  const anonymousId = request.cookies.get(HERO_CTA_ANONYMOUS_ID_COOKIE)?.value;
  const cookiesToSet: CookieToSet[] = [];
  let visitorId = anonymousId;

  if (!clerkUserId && !visitorId) {
    visitorId = crypto.randomUUID();

    request.cookies.set(HERO_CTA_ANONYMOUS_ID_COOKIE, visitorId);
    cookiesToSet.push({
      name: HERO_CTA_ANONYMOUS_ID_COOKIE,
      value: visitorId
    });
  }

  if (isHeroCtaVariantValue(cookieVariant) && cookiesToSet.length === 0) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  const visitorType: HeroVisitorType = clerkUserId ? "signed_in" : "anonymous";
  const identityId = clerkUserId ?? visitorId;

  if (identityId) {
    request.headers.set(HERO_CTA_IDENTITY_ID_HEADER, identityId);
    request.headers.set(HERO_CTA_IDENTITY_TYPE_HEADER, visitorType);
    requestHeaders.set(HERO_CTA_IDENTITY_ID_HEADER, identityId);
    requestHeaders.set(HERO_CTA_IDENTITY_TYPE_HEADER, visitorType);
  }

  cookiesToSet.forEach((cookie) => {
    setCookieOnRequestHeaders(requestHeaders, cookie);
  });

  if (!isHeroCtaVariantValue(cookieVariant)) {
    const variant = await heroCtaVariant();

    request.cookies.set(HERO_CTA_VARIANT_COOKIE, variant);
    cookiesToSet.push({
      name: HERO_CTA_VARIANT_COOKIE,
      value: variant
    });
    setCookieOnRequestHeaders(requestHeaders, {
      name: HERO_CTA_VARIANT_COOKIE,
      value: variant
    });
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  cookiesToSet.forEach((cookie) => {
    setExperimentCookie(response, cookie);
  });

  return response;
}

export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname === "/") {
    const { userId } = await auth();

    return setHeroCtaVariantCookie(request, userId);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};

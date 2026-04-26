import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  HERO_CTA_VARIANT_COOKIE,
  HERO_CTA_VARIANT_COOKIE_MAX_AGE,
  heroCtaVariant,
  isHeroCtaVariantValue
} from "@/flags";

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

async function setHeroCtaVariantCookie(request: NextRequest) {
  const cookieVariant = request.cookies.get(HERO_CTA_VARIANT_COOKIE)?.value;

  if (isHeroCtaVariantValue(cookieVariant)) {
    return NextResponse.next();
  }

  const variant = await heroCtaVariant();
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(
    "cookie",
    setRequestCookieHeader(requestHeaders.get("cookie"), HERO_CTA_VARIANT_COOKIE, variant)
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.cookies.set(HERO_CTA_VARIANT_COOKIE, variant, {
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: HERO_CTA_VARIANT_COOKIE_MAX_AGE,
    path: "/"
  });

  return response;
}

export default clerkMiddleware(async (_auth, request) => {
  if (request.nextUrl.pathname === "/") {
    return setHeroCtaVariantCookie(request);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};

import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagPageviews } from "@/components/analytics/google-tag-pageviews";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { AuthSync } from "@/components/auth/auth-sync";
import { SiteFooter } from "@/components/homepage/site-footer";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-S77HK4K887";

export const metadata: Metadata = {
  title: "Ugly Manling",
  description:
    "Ugly Manling helps men dealing with hair loss figure out what actually helps, what is hype, and what to do next."
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </head>
      <body>
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
          <AuthSync />
          <Suspense fallback={null}>
            <GoogleTagPageviews />
          </Suspense>
          <PostHogProvider>
            {children}
            <SiteFooter />
          </PostHogProvider>
          <Analytics />
          <SpeedInsights />
        </ClerkProvider>
      </body>
    </html>
  );
}

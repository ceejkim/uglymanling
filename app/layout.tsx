import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthSync } from "@/components/auth/auth-sync";
import "./globals.css";

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
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-S77HK4K887" />
        <Script id="google-tag-manager">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-S77HK4K887');`}
        </Script>
      </head>
      <body>
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
          <AuthSync />
          {children}
          <SpeedInsights />
        </ClerkProvider>
      </body>
    </html>
  );
}

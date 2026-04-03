import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rekkoe",
  description: "Chat-first local knowledge platform",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/auth/signup", label: "Sign Up" },
  { href: "/auth/login", label: "Log In" },
  { href: "/chat", label: "Chat" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[color:color-mix(in_oklab,var(--color-surface)_80%,white)]/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Rekkoe
            </Link>
            <nav className="flex items-center gap-5 text-sm text-[var(--color-muted)]">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-[var(--color-ink)]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      </body>
    </html>
  );
}

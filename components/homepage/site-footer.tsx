"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerGroups = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  },
  {
    title: "Product",
    links: [
      { label: "Assessment", href: "/assessment" },
      { label: "Barber directory", href: "/style/barbers" },
      { label: "Shop", href: "/shop" }
    ]
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: null },
      { label: "TikTok", href: null },
      { label: "YouTube", href: null },
      { label: "Reddit", href: null }
    ]
  }
] as const;

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/assessment")) {
    return null;
  }

  return (
    <footer className="section site-footer-section">
      <div className="page-shell">
        <div className="grain-card site-footer-card">
          <div className="site-footer-top">
            <div className="site-footer-intro">
              <div className="section-label">Footer</div>
              <h2 className="site-footer-title">Stay close to the flock without living online.</h2>
              <p className="site-footer-copy">
                Get practical updates, product notes, and the next community drops when they are worth your time.
              </p>
            </div>

            <form className="site-footer-signup" action="#">
              <label className="site-footer-label" htmlFor="homepage-email">
                Join the community
              </label>
              <div className="site-footer-form-row">
                <input
                  id="homepage-email"
                  type="email"
                  placeholder="Email address"
                  className="site-footer-input"
                />
                <button type="submit" className="site-footer-button">
                  Get updates
                </button>
              </div>
            </form>
          </div>

          <div className="site-footer-grid">
            {footerGroups.map((group) => (
              <div key={group.title} className="site-footer-group">
                <h3 className="site-footer-group-title">{group.title}</h3>
                <div className="site-footer-links">
                  {group.links.map((link) => (
                    link.href ? (
                      <Link key={link.label} href={link.href} className="site-footer-link">
                        {link.label}
                      </Link>
                    ) : (
                      <span key={link.label} className="site-footer-link" aria-disabled="true" title="Link coming soon">
                        {link.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

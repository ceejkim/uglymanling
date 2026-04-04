import Link from "next/link";
import { quickPaths } from "@/lib/homepage-content";

export function IntentRouter() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">Intent router</div>
        <h2 className="section-title">What are you here for?</h2>
        <p className="section-copy">
          Pick the thing you actually care about. We&apos;ll skip the fake grandeur and get you to a
          useful next step.
        </p>
        <div className="grid intent-grid">
          {quickPaths.map((path) => (
            <Link
              key={path.label}
              href={path.href}
              className="grain-card"
              style={{
                padding: "1.15rem",
                borderRadius: "var(--radius-xl)",
                display: "grid",
                gap: "0.55rem",
                minHeight: "11rem"
              }}
            >
              <span className="eyebrow">{path.label}</span>
              <strong style={{ fontSize: "1.15rem", lineHeight: 1.12, letterSpacing: "-0.03em" }}>
                {path.note}
              </strong>
              <span className="muted" style={{ fontSize: "0.92rem" }}>
                Go there
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

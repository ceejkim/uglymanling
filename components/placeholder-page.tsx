import Link from "next/link";
import { Button } from "@/components/ui/button";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: PlaceholderPageProps) {
  const isMailTo = primaryHref.startsWith("mailto:");

  return (
    <main className="placeholder-shell">
      <div className="grain-card placeholder-card">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{body}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1rem" }}>
          {isMailTo ? (
            <Link
              href={primaryHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "3.25rem",
                padding: "0.8rem 1.2rem",
                border: "1px solid var(--ink)",
                borderRadius: "999px",
                background: "var(--ink)",
                color: "var(--bg)",
                fontWeight: 800
              }}
            >
              {primaryLabel}
            </Link>
          ) : (
            <Button href={primaryHref}>{primaryLabel}</Button>
          )}
          <Button href={secondaryHref ?? "/"} variant="ghost">
            {secondaryLabel ?? "Back to homepage"}
          </Button>
        </div>
      </div>
    </main>
  );
}

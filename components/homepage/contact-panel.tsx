import Link from "next/link";
import { Card } from "@/components/ui/card";
import { connectOptions } from "@/lib/homepage-content";

export function ContactPanel() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">Connect</div>
        <h2 className="section-title">Need a human?</h2>
        <p className="section-copy">Reasonable. We have those.</p>
        <div className="grid connect-grid">
          {connectOptions.map((option) => (
            <Card key={option.title} style={{ minHeight: "10.5rem", display: "grid", gap: "0.75rem" }}>
              <span className="eyebrow">{option.title}</span>
              <h3 style={{ margin: 0, fontSize: "1.3rem", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
                {option.body}
              </h3>
              <div style={{ marginTop: "auto" }}>
                <Link href={option.href} style={{ fontWeight: 800, color: "var(--blue)" }}>
                  Open
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

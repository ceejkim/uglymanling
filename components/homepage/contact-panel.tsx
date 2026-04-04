import Link from "next/link";
import { Card } from "@/components/ui/card";
import { connectOptions } from "@/lib/homepage-content";

export function ContactPanel() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">Connect</div>
        <h2 className="section-title">Need a human before Calendly exists?</h2>
        <p className="section-copy">
          Fair. We can still talk. Think of this as the useful version of “reach out anytime.”
        </p>
        <div className="grid connect-grid">
          {connectOptions.map((option) => (
            <Card key={option.title} style={{ minHeight: "14rem", display: "grid", gap: "0.8rem" }}>
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
          <Card
            style={{
              minHeight: "14rem",
              display: "grid",
              gap: "0.8rem",
              background: "linear-gradient(180deg, var(--blue), var(--ink-strong))",
              color: "#fff"
            }}
          >
            <span className="eyebrow" style={{ color: "var(--primary)" }}>
              Scheduling
            </span>
            <h3 style={{ margin: 0, fontSize: "1.3rem", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Calendly is coming later.
            </h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
              For now, request a consult and we&apos;ll route you the useful old-fashioned way.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";

export function FooterCta() {
  return (
    <section className="section" style={{ paddingBottom: "4rem" }}>
      <div className="page-shell">
        <div className="grain-card footer-panel" style={{ borderRadius: "var(--radius-xl)", padding: "1.6rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow" style={{ color: "var(--primary)" }}>
            Next move
          </span>
          <h2 className="footer-title">
            Start the assessment.
            <br />
            Stop free-styling this.
          </h2>
          <div className="footer-actions">
            <Button href="/assessment">Start your assessment</Button>
            <Button href="/community" variant="secondary">
              Join our community
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

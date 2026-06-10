"use client";

import { captureProductEvent } from "@/lib/analytics/event-tracking";
import { Button } from "@/components/ui/button";

export function FooterCta() {
  return (
    <section className="section" style={{ paddingBottom: "4rem" }}>
      <div className="page-shell">
        <div className="grain-card footer-panel" style={{ borderRadius: "var(--radius-xl)", padding: "1.6rem", display: "grid", gap: "1rem" }}>
          <div className="footer-cta-layout">
            <div style={{ display: "grid", gap: "1rem" }}>
              <span className="eyebrow">Community assessment</span>
              <h2 className="footer-title">Am I cooked? Find out here</h2>
              <p className="section-copy" style={{ marginTop: 0 }}>
                Compare your rate of balding and underlying causes to the Ugly Manling community.
              </p>
              <div className="footer-actions">
                <Button
                  href="/assessment"
                  onClick={() => captureProductEvent("footer_cta_clicked", { label: "Am I cooked? Find out here", destination: "/assessment" })}
                >
                  Am I cooked? Find out here
                </Button>
                <Button
                  href="/community"
                  variant="secondary"
                  onClick={() => captureProductEvent("footer_cta_clicked", { label: "Join the uglymanlings", destination: "/community" })}
                >
                  Join the uglymanlings
                </Button>
              </div>
            </div>

            <div className="footer-diagnostic-seal" aria-label="Assessment benchmark preview">
              <div className="footer-diagnostic-header">
                <span>UM-01</span>
                <span>Community baseline</span>
              </div>
              <div className="footer-diagnostic-grid" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="footer-diagnostic-readout">
                <strong>Pattern scan</strong>
                <span>Rate • Causes • Next move</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

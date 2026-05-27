"use client";

import Image from "next/image";
import { captureProductEvent } from "@/lib/analytics/event-tracking";
import { Button } from "@/components/ui/button";

export function FooterCta() {
  return (
    <section className="section" style={{ paddingBottom: "4rem" }}>
      <div className="page-shell">
        <div className="grain-card footer-panel" style={{ borderRadius: "var(--radius-xl)", padding: "1.6rem", display: "grid", gap: "1rem" }}>
          <div className="footer-cta-layout">
            <div style={{ display: "grid", gap: "1rem" }}>
              <span className="eyebrow">Start here</span>
              <h2 className="footer-title">Take the assessment. Stop guessing.</h2>
              <p className="section-copy" style={{ marginTop: 0 }}>
                For uglymanlings who would rather make a plan than freestyle another bad week.
              </p>
              <div className="footer-actions">
                <Button
                  href="/assessment"
                  onClick={() => captureProductEvent("footer_cta_clicked", { label: "Take the assessment", destination: "/assessment" })}
                >
                  Take the assessment
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

            <div className="footer-duck-seal">
              <Image
                src="/brand/mascots/uglymanlings-duck-primary.png"
                alt="Ugly Manlings duck mascot seal"
                width={180}
                height={180}
                className="footer-duck-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

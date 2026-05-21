"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { quickPaths } from "@/lib/homepage-content";

export function IntentRouter() {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">Start here</div>
        <h2 className="section-title">Pick a lane.</h2>
        <p className="section-copy">Choose the thing you need. We’ll keep it moving.</p>
        <div className="grid intent-grid">
          {quickPaths.map((path) => (
            <Link
              key={path.label}
              href={path.href}
              className="grain-card intent-card"
              style={{
                display: "grid",
                gap: "0.55rem"
              }}
              onClick={() => posthog.capture("intent_card_clicked", { label: path.label, destination: path.href })}
            >
              <div className="intent-card-top">
                <span className="eyebrow">{path.label}</span>
                <Image
                  src="/brand/mascots/uglymanlings-duck-primary.png"
                  alt=""
                  width={34}
                  height={34}
                  className="intent-card-icon"
                />
              </div>
              <strong style={{ fontSize: "1.15rem", lineHeight: 1.12, letterSpacing: "-0.03em" }}>
                {path.note}
              </strong>
              <span className="muted" style={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Open
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

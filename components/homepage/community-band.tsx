import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityBullets } from "@/lib/homepage-content";

export function CommunityBand() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card className="community-card">
          <div className="community-layout">
            <div className="community-copy-column">
              <div className="community-copy-intro">
                <div className="section-label">Community</div>
                <h2 className="section-title">Our vision: Cure balding.</h2>
                <p className="section-copy community-copy">
                  Our mission: Harness the power of community to empower everyone to look their best.
                </p>
              </div>

              <div className="community-checklist">
                {communityBullets.map((bullet) => (
                  <div key={bullet} className="community-check">
                    <span aria-hidden="true" />
                    <p>{bullet}</p>
                  </div>
                ))}
              </div>

              <div className="community-actions">
                <Button href="/community" variant="secondary">
                  Join the flock
                </Button>
              </div>
            </div>

            <div className="community-illustration">
              <div className="community-illustration-chip">Mirror checks. Shower rage. Brotherhood.</div>
              <Image
                src="/brand/mascots/uglymanlings-duck-scenes.png"
                alt="Ugly Manlings duck mascot scenes showing mirror, shower, and community moments"
                width={420}
                height={420}
                className="community-illustration-image"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

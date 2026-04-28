import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityBullets } from "@/lib/homepage-content";

const communityImageOptions = {
  barber: {
    src: "/images/homepage/barber-cutting-thinning-hair.png",
    alt: "Barber cutting the hair of a man with visible thinning in a modern barbershop",
    chip: "Find the right barber. Learn what works. Move with confidence."
  },
  products: {
    src: "/images/homepage/community-approved-products.png",
    alt: "Community-approved hair care and styling products arranged in a clean clinical setting",
    chip: "Products the community actually uses, not just talks about."
  }
} as const;

const activeCommunityImage = communityImageOptions.barber;

export function CommunityBand() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card className="community-card">
          <div className="community-layout">
            <div className="community-copy-column">
              <div className="community-copy-intro">
                <div className="section-label">Community</div>
                <h2 className="section-title">Join our community.</h2>
                <p className="section-copy community-copy">
                  Trade notes, compare routines, and see what is actually working for other men before you spend more money.
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
                  Join our community
                </Button>
              </div>
            </div>

            <div className="community-illustration">
              <div className="community-illustration-chip">{activeCommunityImage.chip}</div>
              <Image
                src={activeCommunityImage.src}
                alt={activeCommunityImage.alt}
                width={960}
                height={720}
                className="community-illustration-image"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

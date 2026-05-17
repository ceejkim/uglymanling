import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityBullets } from "@/lib/homepage-content";

const communityImageOptions = {
  barber: {
    src: "/images/homepage/barber-cutting-thinning-hair.png",
    alt: "Barber cutting the hair of a man with visible thinning in a modern barbershop"
  },
  products: {
    src: "/images/homepage/community-approved-products.png",
    alt: "Community-approved hair care and styling products arranged in a clean clinical setting"
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
                <h2 className="section-title">Find your barber with ugly manling</h2>
              </div>

              <div className="community-checklist">
                {communityBullets.map((bullet) => (
                  <div key={bullet} className="community-check">
                    <span aria-hidden="true" />
                    <p>{bullet}</p>
                  </div>
                ))}
              </div>

            </div>

            <div className="community-illustration">
              <Image
                src={activeCommunityImage.src}
                alt={activeCommunityImage.alt}
                width={960}
                height={720}
                sizes="(max-width: 720px) calc(100vw - 3rem), (max-width: 920px) calc(100vw - 4rem), 50vw"
                className="community-illustration-image"
              />
              <div className="community-actions community-illustration-actions">
                <Button href="/style/barbers" variant="secondary">
                  Find your barber
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

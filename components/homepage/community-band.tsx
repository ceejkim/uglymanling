import { Card } from "@/components/ui/card";
import { BarberCarousel } from "@/components/homepage/barber-carousel";

export function CommunityBand() {
  return (
    <section className="section">
      <div className="page-shell">
        <Card className="community-card barber-carousel-shell">
          <BarberCarousel />
        </Card>
      </div>
    </section>
  );
}

import { Card } from "@/components/ui/card";

const upcomingOfferings = [
  {
    title: "Get 1:1 advice + a personalized plan",
    body: "Assess your stage, compare options, think through transplant considerations, and leave with an actionable plan."
  },
  {
    title: "Community-approved products",
    body: "Shop the products members actually talk about, from minoxidil soap to styling support and scalp care."
  }
] as const;

export function ComingSoon() {
  return (
    <section className="section coming-soon-section">
      <div className="page-shell">
        <div className="section-label">Coming soon</div>
        <h2 className="section-title">What we are rolling out next.</h2>
        <p className="section-copy">
          The next drops are personalized guidance and products the community already trusts.
        </p>

        <div className="grid coming-soon-grid">
          {upcomingOfferings.map((offering) => (
            <Card key={offering.title} className="coming-soon-card">
              <span className="coming-soon-kicker">Next offering</span>
              <h3 className="coming-soon-title">{offering.title}</h3>
              <p className="coming-soon-copy">{offering.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

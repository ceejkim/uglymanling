import { Card } from "@/components/ui/card";

const upcomingOfferings = [
  {
    title: "End-to-end assessment and planning",
    body: "Understand your stage, map your options, and leave with a real next-step plan."
  },
  {
    title: "Talk to a human with our membership",
    body: "Get direct access to guidance, support, and smarter decisions when you want a real person involved."
  }
] as const;

export function ComingSoon() {
  return (
    <section className="section" style={{ paddingBottom: "4rem" }}>
      <div className="page-shell">
        <div className="section-label">Coming soon</div>
        <h2 className="section-title">What we are rolling out next.</h2>
        <p className="section-copy">
          Community and style are live. Planning and human support are next.
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

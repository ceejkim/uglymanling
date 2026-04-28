import { homepageFeatureCards } from "@/lib/homepage-content";

export function ProductVision() {
  return (
    <section className="section product-vision-section">
      <div className="page-shell">
        <div className="section-label">Features</div>
        <h2 className="section-title product-vision-title">What you can do here.</h2>
        <p className="section-copy">
          One clear first step now, with style guidance and expert support ready when you need them.
        </p>

        <div className="vision-grid">
          {homepageFeatureCards.map((card) => (
            <article
              key={card.title}
              className={`grain-card vision-card${
                card.status === "Live now" ? " is-live" : " is-soon"
              }`}
            >
              <div className="vision-card-heading">
                <span
                  className={`vision-status-badge${
                    card.status === "Live now" ? " is-live" : " is-soon"
                  }`}
                >
                  {card.status}
                </span>
                <h3 className="vision-card-title">{card.title}</h3>
              </div>
              <div className="vision-card-body">
                <p className="vision-card-description">{card.description}</p>
                <p className="vision-card-note">{card.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

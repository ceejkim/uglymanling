import { homepageFeatureCards } from "@/lib/homepage-content";

export function ProductVision() {
  return (
    <section className="section product-vision-section">
      <div className="page-shell">
        <div className="section-label">Community value</div>
        <h2 className="section-title product-vision-title">What the community helps you do.</h2>
        <p className="section-copy">
          Start with the haircut, then layer in better advice, real proof, and products people actually rate.
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
                {"note" in card && card.note ? <p className="vision-card-note">{card.note}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { barberData, formatBarberTag } from "@/lib/barber-data";

const quickFilters = [
  "Receding hairline",
  "Buzz cut",
  "Clean shave",
  "Beard shaping",
  "First-timer friendly",
  "Confidence boosting"
];

const rankingSignals = [
  {
    label: "Seeded profiles",
    value: String(barberData.totalCandidates),
    detail: "Initial evidence-backed individual barber records across the first three launch cities."
  },
  {
    label: "Launch cities",
    value: String(barberData.cityCount),
    detail: "New York City, Los Angeles, and Chicago are seeded first before broader expansion."
  },
  {
    label: "Cross-city shortlist",
    value: String(barberData.strongestCount),
    detail: "Highest-conviction seed candidates promoted from the city lists into the opening shortlist."
  }
];

export default function BarberDirectoryPage() {
  return (
    <main className="barber-wireframe-page">
      <div className="page-shell barber-wireframe-shell">
        <section className="barber-hero">
          <div className="barber-hero-copy">
            <span className="section-label">Style support</span>
            <h1>Find the barber, not just the barbershop.</h1>
            <p>
              The first Ugly Manling barber directory is now seeded with real city-level candidates. The barber is
              the primary object, while the shop stays secondary and community proof is what should sharpen ranking
              over time.
            </p>
            <div className="barber-hero-actions">
              <Button href="/sign-up">Join to review barbers</Button>
              <Button href="/community" variant="ghost">
                See community layer
              </Button>
            </div>
          </div>

          <Card className="barber-search-card">
            <div className="barber-search-grid">
              <div className="barber-input-block">
                <span className="eyebrow">Launch cities</span>
                <div className="barber-fake-input">{barberData.cities.map((city) => city.city).join(" · ")}</div>
              </div>
              <div className="barber-input-block">
                <span className="eyebrow">What this seed emphasizes</span>
                <div className="barber-fake-input">Buzz cuts, beard work, clean shaves, fades, practical reset cuts</div>
              </div>
              <div className="barber-input-block">
                <span className="eyebrow">Dataset note</span>
                <div className="barber-fake-input">{barberData.sourceNote}</div>
              </div>
            </div>

            <div className="barber-filter-row">
              {quickFilters.map((filter) => (
                <Badge key={filter}>{filter}</Badge>
              ))}
            </div>
          </Card>
        </section>

        <section className="barber-wireframe-grid">
          <aside className="barber-sidebar">
            <Card className="barber-panel">
              <div className="barber-panel-heading">
                <span className="eyebrow">Ranking model</span>
                <h2>How top barbers rise</h2>
              </div>
              <div className="barber-stats">
                {rankingSignals.map((signal) => (
                  <div key={signal.label} className="barber-stat">
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <p>{signal.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="barber-panel">
              <div className="barber-panel-heading">
                <span className="eyebrow">Manual review</span>
                <h2>What still needs verification</h2>
              </div>
              <div className="barber-notes-list">
                {barberData.needsManualVerification.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </Card>

            <Card className="barber-panel">
              <div className="barber-panel-heading">
                <span className="eyebrow">Data gaps</span>
                <h2>What improves next</h2>
              </div>
              <div className="barber-notes-list">
                {barberData.remainingDataGaps.map((gap) => (
                  <p key={gap}>{gap}</p>
                ))}
              </div>
            </Card>
          </aside>

          <section className="barber-results">
            <Card className="barber-results-header">
              <div>
                <span className="eyebrow">Cross-city shortlist</span>
                <h2>Top seed barbers</h2>
              </div>
              <p>
                These are the strongest initial candidates across the seeded cities, selected from the dataset’s
                cross-city shortlist.
              </p>
            </Card>

            <div className="barber-cards">
              {barberData.topSeedCandidates.map((barber) => (
                <Card key={`${barber.city}-${barber.barberName}`} className="barber-card">
                  <div className="barber-card-top">
                    <div>
                      <span className="eyebrow">
                        #{barber.rank} overall · {barber.city}
                      </span>
                      <h3>{barber.barberName}</h3>
                      <p>
                        {barber.shopName} · {barber.neighborhood}
                      </p>
                    </div>
                    <div className="barber-score-pill">
                      <strong>{barber.confidenceScore}/5</strong>
                      <span>confidence</span>
                    </div>
                  </div>

                  <div className="barber-meta-row">
                    <span>{barber.priceTier}</span>
                    <span>{barber.sourceCount} sources</span>
                    <span>{barber.shopAddress}</span>
                  </div>

                  <div className="barber-filter-row">
                    {barber.recommendedTags.slice(0, 6).map((tag) => (
                      <Badge key={tag} tone="accent">
                        {formatBarberTag(tag)}
                      </Badge>
                    ))}
                  </div>

                  <p className="barber-card-note">{barber.rankingNotes}</p>

                  <div className="barber-card-copy">
                    <p>{barber.evidenceSummary}</p>
                    <p>{barber.reviewSignalSummary}</p>
                  </div>

                  <div className="barber-card-actions">
                    {barber.primaryBookingUrl ? (
                      <a className="barber-link-button barber-link-button-primary" href={barber.primaryBookingUrl} target="_blank" rel="noreferrer">
                        View booking profile
                      </a>
                    ) : (
                      <span className="barber-link-button barber-link-button-muted">Booking link pending</span>
                    )}
                    <Button href="/sign-in" variant="ghost">
                      Upvote
                    </Button>
                    <Button href="/sign-in" variant="secondary">
                      Leave comment
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </section>

        <section className="barber-city-sections">
          {barberData.cities.map((city) => (
            <Card key={city.city} className="barber-city-card">
              <div className="barber-city-header">
                <div>
                  <span className="eyebrow">{city.city}</span>
                  <h2>
                    {city.actualCount} seeded barbers out of {city.targetCount} target
                  </h2>
                </div>
                <div className="barber-city-meta">
                  <span>{city.state}</span>
                  <span>{city.manualReviewFlags.length} flagged for review</span>
                </div>
              </div>

              <p className="barber-city-summary">{city.marketSummary}</p>

              <div className="barber-filter-row">
                {city.topCandidateNames.map((candidateName) => (
                  <Badge key={candidateName}>{candidateName}</Badge>
                ))}
              </div>

              <div className="barber-city-list">
                {city.candidates.map((barber) => (
                  <div key={`${city.city}-${barber.barberName}`} className="barber-city-row">
                    <div className="barber-city-row-main">
                      <strong>
                        #{barber.rank} {barber.barberName}
                      </strong>
                      <p>
                        {barber.shopName} · {barber.neighborhood}
                      </p>
                    </div>
                    <div className="barber-city-row-aside">
                      <span>{barber.confidenceScore}/5 confidence</span>
                      <span>{barber.sourceCount} sources</span>
                    </div>
                    <div className="barber-city-row-tags">
                      {barber.recommendedTags.slice(0, 4).map((tag) => (
                        <Badge key={tag} tone="accent">
                          {formatBarberTag(tag)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { BarberDirectoryInteractive } from "@/components/barbers/barber-directory-interactive";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  barberData,
  barberDirectoryCities,
  barberDirectoryTags,
  filterBarberDirectory,
  formatBarberTag
} from "@/lib/barber-data";

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

type BarberDirectoryPageProps = {
  searchParams?: Promise<{
    city?: string;
    tag?: string;
  }>;
};

function getFilterHref({
  city,
  tag
}: {
  city?: string | null;
  tag?: string | null;
}) {
  const params = new URLSearchParams();

  if (city) {
    params.set("city", city);
  }

  if (tag) {
    params.set("tag", tag);
  }

  const query = params.toString();

  return query ? `/style/barbers?${query}` : "/style/barbers";
}

export default async function BarberDirectoryPage({ searchParams }: BarberDirectoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filteredDirectory = filterBarberDirectory({
    city: resolvedSearchParams.city,
    tag: resolvedSearchParams.tag
  });

  return (
    <main className="barber-wireframe-page">
      <div className="page-shell barber-wireframe-shell">
        <section className="barber-hero">
          <div className="barber-hero-copy">
            <span className="section-label">Style support</span>
            <h1>Find the barber, not just the barbershop.</h1>
            <p>
              The first Ugly Manling barber directory is seeded with real city-level candidates and now filterable
              by launch city and practical grooming tags. The barber stays primary. The shop stays secondary.
            </p>
            <div className="barber-hero-actions">
              <Button href="/sign-up">Join to review barbers</Button>
              <Button href="/" variant="ghost">
                Back to homepage
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
                <span className="eyebrow">Current results</span>
                <div className="barber-fake-input">
                  {filteredDirectory.resultCount} barbers matched
                  {filteredDirectory.selectedCity ? " · city filter active" : ""}
                  {filteredDirectory.selectedTag ? " · tag filter active" : ""}
                </div>
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
                <span className="eyebrow">Filter by city</span>
                <h2>Launch markets</h2>
              </div>
              <div className="barber-filter-pills">
                <Link
                  href={getFilterHref({ city: null, tag: filteredDirectory.selectedTag })}
                  className={`barber-filter-pill ${filteredDirectory.selectedCity ? "" : "is-active"}`.trim()}
                >
                  All cities
                </Link>
                {barberDirectoryCities.map((city) => (
                  <Link
                    key={city.value}
                    href={getFilterHref({ city: city.value, tag: filteredDirectory.selectedTag })}
                    className={`barber-filter-pill ${filteredDirectory.selectedCity === city.value ? "is-active" : ""}`.trim()}
                  >
                    {city.label}
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="barber-panel">
              <div className="barber-panel-heading">
                <span className="eyebrow">Filter by tag</span>
                <h2>Useful specialties</h2>
              </div>
              <div className="barber-filter-pills">
                <Link
                  href={getFilterHref({ city: filteredDirectory.selectedCity, tag: null })}
                  className={`barber-filter-pill ${filteredDirectory.selectedTag ? "" : "is-active"}`.trim()}
                >
                  All tags
                </Link>
                {barberDirectoryTags.map((tag) => (
                  <Link
                    key={tag.value}
                    href={getFilterHref({ city: filteredDirectory.selectedCity, tag: tag.value })}
                    className={`barber-filter-pill ${filteredDirectory.selectedTag === tag.value ? "is-active" : ""}`.trim()}
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </Card>

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
                {filteredDirectory.selectedCity || filteredDirectory.selectedTag
                  ? "These shortlist cards reflect the active filters so the directory stays useful by city and use case."
                  : "These are the strongest initial candidates across the seeded cities, selected from the dataset’s cross-city shortlist."}
              </p>
            </Card>
          </section>
        </section>

        <BarberDirectoryInteractive
          topSeedCandidates={filteredDirectory.topSeedCandidates}
          citySections={filteredDirectory.citySections}
          selectedCity={filteredDirectory.selectedCity}
          selectedTag={filteredDirectory.selectedTag}
        />
      </div>
    </main>
  );
}

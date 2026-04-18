import { BarberDirectoryInteractive } from "@/components/barbers/barber-directory-interactive";
import { Button } from "@/components/ui/button";
import { barberDirectoryCities, filterBarberDirectory } from "@/lib/barber-data";

type BarberDirectoryPageProps = {
  searchParams?: Promise<{
    city?: string;
  }>;
};

export default async function BarberDirectoryPage({ searchParams }: BarberDirectoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filteredDirectory = filterBarberDirectory({
    city: resolvedSearchParams.city
  });

  const barbers = filteredDirectory.citySections.flatMap((citySection) => citySection.candidates);
  const activeCityLabel =
    barberDirectoryCities.find((city) => city.value === filteredDirectory.selectedCity)?.label ?? "All listed cities";

  return (
    <main className="barber-directory-page">
      <div className="page-shell page-shell-wide barber-directory-shell">
        <section className="barber-directory-hero grain-card">
          <div className="barber-directory-hero-copy">
            <span className="section-label">Barber directory</span>
            <h1>Find a community-vetted barber for balding hair.</h1>
            <p>
              Pick your city, compare community notes, and find a barber the flock already trusts for thinning hair.
            </p>
          </div>

          <form action="/style/barbers" className="barber-directory-filterbar">
            <label className="barber-directory-filterlabel" htmlFor="city">
              City
            </label>
            <select
              id="city"
              name="city"
              defaultValue={filteredDirectory.selectedCity ?? ""}
              className="barber-directory-select"
            >
              <option value="">All listed cities</option>
              {barberDirectoryCities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            <button type="submit" className="barber-directory-submit">
              Find a barber vetted by our flock
            </button>
          </form>

          <div className="barber-directory-hero-footer">
            <p>
              Showing <strong>{barbers.length}</strong> barber{barbers.length === 1 ? "" : "s"} for{" "}
              <strong>{activeCityLabel}</strong>.
            </p>
            <div className="barber-directory-hero-actions">
              <Button href="/sign-up">Join to leave a review</Button>
              <Button href="/" variant="ghost">
                Back to homepage
              </Button>
            </div>
          </div>
        </section>

        <section className="barber-directory-results-head">
          <div>
            <span className="eyebrow">{activeCityLabel}</span>
            <h2>{filteredDirectory.selectedCity ? `Best barbers in ${activeCityLabel}` : "Barbers worth checking"}</h2>
          </div>
          <p>Individual barbers first. Shop second. Votes and notes from the community help sharpen the list.</p>
        </section>

        <BarberDirectoryInteractive barbers={barbers} selectedCityLabel={activeCityLabel} />
      </div>
    </main>
  );
}

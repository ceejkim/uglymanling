import { auth } from "@clerk/nextjs/server";
import { BarberDirectoryInteractive } from "@/components/barbers/barber-directory-interactive";
import { BarberCityFilter } from "@/components/barbers/barber-city-filter";
import { Button } from "@/components/ui/button";
import { filterBarberDirectory, getBarberDirectoryCities } from "@/lib/barber-data";

type BarberDirectoryPageProps = {
  searchParams?: Promise<{
    city?: string;
  }>;
};

export default async function BarberDirectoryPage({ searchParams }: BarberDirectoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { userId } = await auth();
  const viewerHasFullAccess = Boolean(userId);
  const [filteredDirectory, barberDirectoryCities] = await Promise.all([
    filterBarberDirectory({
      city: resolvedSearchParams.city,
      access: viewerHasFullAccess ? "members" : "public"
    }),
    getBarberDirectoryCities()
  ]);

  const visibleBarbers = filteredDirectory.visibleBarbers;
  const lockedPreviewBarbers = filteredDirectory.lockedPreviewBarbers;
  const activeCityLabel =
    barberDirectoryCities.find((city) => city.value === filteredDirectory.selectedCity)?.label ?? "All listed cities";
  const heroCopy = viewerHasFullAccess
    ? (
        <>
          Showing <strong>{visibleBarbers.length}</strong> barber{visibleBarbers.length === 1 ? "" : "s"} for{" "}
          <strong>{activeCityLabel}</strong>.
        </>
      )
    : (
        <>
          Showing <strong>{visibleBarbers.length}</strong> verified barber{visibleBarbers.length === 1 ? "" : "s"} for{" "}
          <strong>{activeCityLabel}</strong>. Create a free account to unlock{" "}
          <strong>{lockedPreviewBarbers.length}</strong> more.
        </>
      );

  return (
    <main className="barber-directory-page">
      <div className="page-shell page-shell-wide barber-directory-shell">
        <section className="barber-directory-hero grain-card">
          <div className="barber-directory-hero-copy">
            <span className="section-label">Barber directory</span>
            <h1>Find a community-vetted barber for balding hair.</h1>
            <p>Compare review signals and find a barber who understands thinning hair without the guesswork.</p>
          </div>

          <div className="barber-directory-hero-footer">
            <p>{heroCopy}</p>
            <div className="barber-directory-hero-actions">
              <Button href={viewerHasFullAccess ? "/community/space" : "/sign-up"}>
                {viewerHasFullAccess ? "Members area" : "Join to unlock more"}
              </Button>
              <Button href="/" variant="ghost">
                Back to homepage
              </Button>
            </div>
          </div>
        </section>

        <section className="barber-directory-results-head">
          <div>
            <span className="eyebrow">{activeCityLabel}</span>
            <h2>
              {viewerHasFullAccess
                ? filteredDirectory.selectedCity
                  ? `Best barbers in ${activeCityLabel}`
                  : "Barbers worth checking"
                : filteredDirectory.selectedCity
                  ? `Verified barbers in ${activeCityLabel}`
                  : "Verified barbers worth checking"}
            </h2>
          </div>
          <BarberCityFilter
            cities={barberDirectoryCities}
            selectedCity={filteredDirectory.selectedCity}
          />
        </section>

        <BarberDirectoryInteractive
          barbers={visibleBarbers}
          lockedPreviewBarbers={lockedPreviewBarbers}
          selectedCityLabel={activeCityLabel}
          viewerHasFullAccess={viewerHasFullAccess}
        />

        <section className="barber-page-footer">
          <div className="grain-card barber-footer-card">
            <div>
              <span className="section-label">For barbers</span>
              <h2>Want to become a verified barber?</h2>
              <p>Please get in touch and tell us where you cut, who you help, and why thinning-hair clients trust you.</p>
            </div>
            <div className="barber-footer-actions">
              <Button href="mailto:cj@uglymanling.com?subject=Verified%20barber%20inquiry&body=Hi%20CJ%2C%0A%0AI%20want%20to%20become%20a%20verified%20Ugly%20Manling%20barber.%0A%0ABarber%20name%3A%0ABarbershop%3A%0ACity%3A%0AWhy%20I%20am%20a%20fit%3A%0A">
                Get in touch
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import { auth } from "@clerk/nextjs/server";
import { BarberCityFilter } from "@/components/barbers/barber-city-filter";
import { BarberDirectoryInteractive } from "@/components/barbers/barber-directory-interactive";
import { Button } from "@/components/ui/button";
import { filterBarberDirectory, getBarberDirectoryCities } from "@/lib/barber-data";
import { captureServerEvent } from "@/lib/posthog-server";

const NEW_YORK_CITY_SLUG = "new-york";
const NEW_YORK_CITY_ALT_SLUG = "new-york-city";
const NEW_YORK_CITY_LABEL = "New York";
const BARBER_SIGN_IN_HREF = "/sign-in?redirect_url=%2Fstyle%2Fbarbers";
const BARBER_SIGN_UP_HREF = "/sign-up?redirect_url=%2Fstyle%2Fbarbers";

type BarberDirectoryPageProps = {
  searchParams?: Promise<{
    city?: string;
  }>;
};

export default async function BarberDirectoryPage({ searchParams }: BarberDirectoryPageProps) {
  const { userId } = await auth();
  const viewerHasFullAccess = Boolean(userId);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedCity = resolvedSearchParams?.city;

  try {
    const barberDirectoryCities = await getBarberDirectoryCities();
    const cityOptions = barberDirectoryCities.length > 0 ? barberDirectoryCities : [{ label: NEW_YORK_CITY_LABEL, value: NEW_YORK_CITY_SLUG }];
    const fallbackCity =
      cityOptions.find(
        (city) =>
          city.value === NEW_YORK_CITY_SLUG ||
          city.value === NEW_YORK_CITY_ALT_SLUG ||
          city.label.toLowerCase() === NEW_YORK_CITY_LABEL.toLowerCase() ||
          city.label.toLowerCase() === "new york city"
      ) ?? cityOptions[0];
    const requestedCityIsKnown = requestedCity ? cityOptions.some((city) => city.value === requestedCity) : false;
    const selectedCity = requestedCity && requestedCityIsKnown ? requestedCity : fallbackCity.value;
    const filteredDirectory = await filterBarberDirectory({
      city: selectedCity,
      access: viewerHasFullAccess ? "members" : "public"
    });

    const visibleBarbers = filteredDirectory.visibleBarbers;
    const lockedPreviewBarbers = filteredDirectory.lockedPreviewBarbers;
    const activeCityLabel = cityOptions.find((city) => city.value === selectedCity)?.label ?? fallbackCity.label;

    await captureServerEvent({
      distinctId: userId ?? "anonymous",
      event: "barber_directory_viewed",
      properties: {
        city: selectedCity,
        city_label: activeCityLabel,
        viewer_has_full_access: viewerHasFullAccess,
        visible_barber_count: visibleBarbers.length,
        locked_barber_count: lockedPreviewBarbers.length
      }
    });
    const heroCopy = viewerHasFullAccess
      ? (
          <>
            Showing <strong>{visibleBarbers.length}</strong> {activeCityLabel} barber{visibleBarbers.length === 1 ? "" : "s"}.
          </>
        )
      : (
          <>
            Showing <strong>{visibleBarbers.length}</strong> verified {activeCityLabel} barber
            {visibleBarbers.length === 1 ? "" : "s"}. Sign in to unlock <strong>{lockedPreviewBarbers.length}</strong> more.
          </>
        );

    return (
      <main className="barber-directory-page">
        <div className="page-shell page-shell-wide barber-directory-shell">
          <section className="barber-directory-hero grain-card">
            <div className="barber-directory-hero-copy">
              <span className="section-label">{activeCityLabel} barber directory</span>
              <h1>Find a barber for thinning hair in {activeCityLabel}.</h1>
              <p>Compare community-vetted barbers who understand balding hair, then book the next cut with less guesswork.</p>
            </div>

            <div className="barber-directory-hero-footer">
              <p>{heroCopy}</p>
              <div className="barber-directory-hero-actions">
                <Button href={viewerHasFullAccess ? "/community/space" : BARBER_SIGN_IN_HREF}>
                  {viewerHasFullAccess ? "Members area" : "Sign in to unlock all"}
                </Button>
                {!viewerHasFullAccess ? (
                  <Button href={BARBER_SIGN_UP_HREF} variant="secondary">
                    Create free account
                  </Button>
                ) : null}
                <Button href="/" variant="ghost">
                  Back to homepage
                </Button>
              </div>
            </div>
          </section>

          <BarberCityFilter cities={cityOptions} selectedCity={selectedCity} />

          {!viewerHasFullAccess ? (
            <section className="barber-signin-notice grain-card" aria-labelledby="barber-signin-notice-title">
              <div>
                <span className="section-label">Free account required</span>
                <h2 id="barber-signin-notice-title">Sign in to see every {activeCityLabel} barber.</h2>
                <p>
                  You can preview verified picks now. Signing in unlocks the full {activeCityLabel} shortlist, community comments,
                  and voting.
                </p>
              </div>
              <div className="barber-signin-notice-actions">
                <Button href={BARBER_SIGN_IN_HREF} variant="secondary">
                  Sign in
                </Button>
                <Button href={BARBER_SIGN_UP_HREF}>Create free account</Button>
              </div>
            </section>
          ) : null}

          <section className="barber-directory-results-head">
            <div>
              <span className="eyebrow">{activeCityLabel}</span>
              <h2>{viewerHasFullAccess ? `Best barbers in ${activeCityLabel}` : `Verified ${activeCityLabel} barbers`}</h2>
              <p>{viewerHasFullAccess ? `You are seeing the full ${activeCityLabel} directory.` : "Sign in to unlock hidden picks."}</p>
            </div>
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
                <h2>Want to become a verified {activeCityLabel} barber?</h2>
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown directory error.";

    return (
      <main className="barber-directory-page">
        <div className="page-shell page-shell-wide barber-directory-shell">
          <section className="barber-directory-hero grain-card">
            <div className="barber-directory-hero-copy">
              <span className="section-label">Barber directory</span>
              <h1>The directory is temporarily offline.</h1>
              <p>We found the route, but the Supabase-backed directory data is not loading correctly yet.</p>
            </div>
            <div className="barber-directory-hero-footer">
              <p>
                Current error: <strong>{message}</strong>
              </p>
              <div className="barber-directory-hero-actions">
                <Button href="/" variant="ghost">
                  Back to homepage
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }
}

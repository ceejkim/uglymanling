import { auth } from "@clerk/nextjs/server";
import { BarberDirectoryInteractive } from "@/components/barbers/barber-directory-interactive";
import { Button } from "@/components/ui/button";
import { filterBarberDirectory, getBarberDirectoryCities } from "@/lib/barber-data";

const NEW_YORK_CITY_SLUG = "new-york";
const NEW_YORK_CITY_LABEL = "New York";
const BARBER_SIGN_IN_HREF = "/sign-in?redirect_url=%2Fstyle%2Fbarbers";
const BARBER_SIGN_UP_HREF = "/sign-up?redirect_url=%2Fstyle%2Fbarbers";

export default async function BarberDirectoryPage() {
  const { userId } = await auth();
  const viewerHasFullAccess = Boolean(userId);
  const [filteredDirectory, barberDirectoryCities] = await Promise.all([
    filterBarberDirectory({
      city: NEW_YORK_CITY_SLUG,
      access: viewerHasFullAccess ? "members" : "public"
    }),
    getBarberDirectoryCities()
  ]);

  const visibleBarbers = filteredDirectory.visibleBarbers;
  const lockedPreviewBarbers = filteredDirectory.lockedPreviewBarbers;
  const activeCityLabel =
    barberDirectoryCities.find((city) => city.value === NEW_YORK_CITY_SLUG)?.label ?? NEW_YORK_CITY_LABEL;
  const heroCopy = viewerHasFullAccess
    ? (
        <>
          Showing <strong>{visibleBarbers.length}</strong> New York barber{visibleBarbers.length === 1 ? "" : "s"}.
        </>
      )
    : (
        <>
          Showing <strong>{visibleBarbers.length}</strong> verified New York barber
          {visibleBarbers.length === 1 ? "" : "s"}. Sign in to unlock <strong>{lockedPreviewBarbers.length}</strong> more.
        </>
      );

  return (
    <main className="barber-directory-page">
      <div className="page-shell page-shell-wide barber-directory-shell">
        <section className="barber-directory-hero grain-card">
          <div className="barber-directory-hero-copy">
            <span className="section-label">New York barber directory</span>
            <h1>Find a New York barber for balding hair.</h1>
            <p>Compare community-vetted barbers who understand thinning hair, then book the next cut with less guesswork.</p>
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

        {!viewerHasFullAccess ? (
          <section className="barber-signin-notice grain-card" aria-labelledby="barber-signin-notice-title">
            <div>
              <span className="section-label">Free account required</span>
              <h2 id="barber-signin-notice-title">Sign in to see every New York barber.</h2>
              <p>
                You can preview verified picks now. Signing in unlocks the full New York shortlist, community comments,
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
            <h2>{viewerHasFullAccess ? "Best barbers in New York" : "Verified New York barbers"}</h2>
            <p>{viewerHasFullAccess ? "You are seeing the full New York directory." : "Sign in to unlock hidden picks."}</p>
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
              <h2>Want to become a verified New York barber?</h2>
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

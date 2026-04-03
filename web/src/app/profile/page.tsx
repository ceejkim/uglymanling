import Link from "next/link";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Card className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile unavailable</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Log in to view your persisted profile and onboarding details.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-[var(--color-accent)] px-3 text-sm font-semibold text-white"
        >
          Go to Login
        </Link>
      </Card>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      explorerProfile: true,
      guideProfile: true,
    },
  });

  if (!user) {
    return (
      <Card className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">User not found</h1>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your Rekkoe identity</h1>
      </section>

      <Card className="p-5">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Name:</span> {user.name ?? "Unknown"}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user.role}
          </p>
        </div>
      </Card>

      {user.explorerProfile && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold tracking-tight">Explorer preferences</h2>
          <div className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
            <p>City: {user.explorerProfile.city}</p>
            <p>Intent: {user.explorerProfile.intent}</p>
            <p>Budget: {user.explorerProfile.budget}</p>
            <p>Timing: {user.explorerProfile.timing}</p>
          </div>
        </Card>
      )}

      {user.guideProfile && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold tracking-tight">Guide setup</h2>
          <div className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
            <p>Expertise: {user.guideProfile.expertise}</p>
            <p>Service type: {user.guideProfile.serviceType}</p>
            <p>Price range: {user.guideProfile.priceRange}</p>
            <p>Availability: {user.guideProfile.availability}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

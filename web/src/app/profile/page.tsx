"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { getExplorerProfile, getGuideProfile, getSession } from "@/lib/session";

export default function ProfilePage() {
  const session = useMemo(() => getSession(), []);
  const explorer = useMemo(() => getExplorerProfile(), []);
  const guide = useMemo(() => getGuideProfile(), []);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your Rekkoe identity</h1>
      </section>

      <Card className="p-5">
        {session ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Name:</span> {session.name}</p>
            <p><span className="font-semibold">Email:</span> {session.email}</p>
            <p><span className="font-semibold">Role:</span> {session.role}</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No local session found yet.</p>
        )}
      </Card>

      {explorer && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold tracking-tight">Explorer preferences</h2>
          <div className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
            <p>City: {explorer.city}</p>
            <p>Intent: {explorer.intent}</p>
            <p>Budget: {explorer.budget}</p>
            <p>Timing: {explorer.timing}</p>
          </div>
        </Card>
      )}

      {guide && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold tracking-tight">Guide setup</h2>
          <div className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
            <p>Expertise: {guide.expertise}</p>
            <p>Service type: {guide.serviceType}</p>
            <p>Price range: {guide.priceRange}</p>
            <p>Availability: {guide.availability}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

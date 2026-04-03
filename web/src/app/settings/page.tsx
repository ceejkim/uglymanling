"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)]">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Preferences and controls</h1>
      </section>

      <Card className="space-y-4 p-5">
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>Email notifications</span>
          <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications((v) => !v)} />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>SMS notifications</span>
          <input type="checkbox" checked={smsNotifications} onChange={() => setSmsNotifications((v) => !v)} />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>Public profile visibility</span>
          <input type="checkbox" checked={publicProfile} onChange={() => setPublicProfile((v) => !v)} />
        </label>
        <Button className="mt-3">Save preferences</Button>
      </Card>
    </div>
  );
}

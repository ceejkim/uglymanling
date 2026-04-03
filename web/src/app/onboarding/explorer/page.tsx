"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { saveExplorerProfile } from "@/lib/session";

export default function ExplorerOnboardingPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [intent, setIntent] = useState("Food & drinks");
  const [budget, setBudget] = useState("$50-$150");
  const [timing, setTiming] = useState("This week");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveExplorerProfile({ city, intent, budget, timing });
    trackEvent("onboarding_completed", { role: "explorer" });
    router.push("/chat");
  }

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Explorer onboarding</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Help Rekkoe personalize who you talk to first.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="city">Where are you exploring?</FieldLabel>
          <TextField
            id="city"
            required
            placeholder="Austin, TX"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="intent">What do you want to discover?</FieldLabel>
          <SelectField
            id="intent"
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
          >
            <option>Food & drinks</option>
            <option>Fitness & sports</option>
            <option>Morning routines</option>
            <option>Arts & hidden gems</option>
            <option>Skill coaching</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="budget">Budget range</FieldLabel>
          <SelectField
            id="budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            <option>$0-$50</option>
            <option>$50-$150</option>
            <option>$150-$300</option>
            <option>$300+</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="timing">When do you want to do this?</FieldLabel>
          <SelectField
            id="timing"
            value={timing}
            onChange={(event) => setTiming(event.target.value)}
          >
            <option>Today</option>
            <option>This week</option>
            <option>This month</option>
            <option>Flexible</option>
          </SelectField>
        </div>

        <Button type="submit" className="w-full">
          Finish and open chat
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { type OnboardingActionState, saveGuideOnboarding } from "@/app/actions/onboarding";

const initialState: OnboardingActionState = { ok: false };

export default function GuideOnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveGuideOnboarding, initialState);

  useEffect(() => {
    if (state.ok) {
      trackEvent("onboarding_completed", { role: "guide" });
      router.push("/chat");
    }
  }, [router, state.ok]);

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Guide onboarding</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Tell explorers what you know best and how you like to help.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="expertise">Primary expertise</FieldLabel>
          <TextField
            id="expertise"
            name="expertise"
            required
            placeholder="Local food tours, endurance training, surf coaching"
          />
        </div>

        <div>
          <FieldLabel htmlFor="serviceType">Service style</FieldLabel>
          <SelectField id="serviceType" name="serviceType" defaultValue="Guided experience">
            <option>Guided experience</option>
            <option>Self-guided playbook</option>
            <option>Chat coaching</option>
            <option>Hybrid</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="priceRange">Typical price range</FieldLabel>
          <SelectField id="priceRange" name="priceRange" defaultValue="$50-$150">
            <option>$0-$50</option>
            <option>$50-$150</option>
            <option>$150-$300</option>
            <option>$300+</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="availability">Availability</FieldLabel>
          <SelectField id="availability" name="availability" defaultValue="Evenings">
            <option>Mornings</option>
            <option>Afternoons</option>
            <option>Evenings</option>
            <option>Weekends</option>
            <option>Flexible</option>
          </SelectField>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : "Finish and open chat"}
        </Button>
      </form>
    </Card>
  );
}

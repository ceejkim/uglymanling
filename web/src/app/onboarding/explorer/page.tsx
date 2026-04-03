"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { type OnboardingActionState, saveExplorerOnboarding } from "@/app/actions/onboarding";

const initialState: OnboardingActionState = { ok: false };

export default function ExplorerOnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveExplorerOnboarding, initialState);

  useEffect(() => {
    if (state.ok) {
      trackEvent("onboarding_completed", { role: "explorer" });
      router.push("/chat");
    }
  }, [router, state.ok]);

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Explorer onboarding</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Help Rekkoe personalize who you talk to first.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="city">Where are you exploring?</FieldLabel>
          <TextField id="city" name="city" required placeholder="Austin, TX" />
        </div>

        <div>
          <FieldLabel htmlFor="intent">What do you want to discover?</FieldLabel>
          <SelectField id="intent" name="intent" defaultValue="Food & drinks">
            <option>Food & drinks</option>
            <option>Fitness & sports</option>
            <option>Morning routines</option>
            <option>Arts & hidden gems</option>
            <option>Skill coaching</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="budget">Budget range</FieldLabel>
          <SelectField id="budget" name="budget" defaultValue="$50-$150">
            <option>$0-$50</option>
            <option>$50-$150</option>
            <option>$150-$300</option>
            <option>$300+</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="timing">When do you want to do this?</FieldLabel>
          <SelectField id="timing" name="timing" defaultValue="This week">
            <option>Today</option>
            <option>This week</option>
            <option>This month</option>
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

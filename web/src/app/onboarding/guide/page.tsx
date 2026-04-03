"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { saveGuideProfile } from "@/lib/session";

export default function GuideOnboardingPage() {
  const router = useRouter();
  const [expertise, setExpertise] = useState("");
  const [serviceType, setServiceType] = useState("Guided experience");
  const [priceRange, setPriceRange] = useState("$50-$150");
  const [availability, setAvailability] = useState("Evenings");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveGuideProfile({ expertise, serviceType, priceRange, availability });
    trackEvent("onboarding_completed", { role: "guide" });
    router.push("/chat");
  }

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Guide onboarding</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Tell explorers what you know best and how you like to help.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="expertise">Primary expertise</FieldLabel>
          <TextField
            id="expertise"
            required
            placeholder="Local food tours, endurance training, surf coaching"
            value={expertise}
            onChange={(event) => setExpertise(event.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="serviceType">Service style</FieldLabel>
          <SelectField
            id="serviceType"
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
          >
            <option>Guided experience</option>
            <option>Self-guided playbook</option>
            <option>Chat coaching</option>
            <option>Hybrid</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="priceRange">Typical price range</FieldLabel>
          <SelectField
            id="priceRange"
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
          >
            <option>$0-$50</option>
            <option>$50-$150</option>
            <option>$150-$300</option>
            <option>$300+</option>
          </SelectField>
        </div>

        <div>
          <FieldLabel htmlFor="availability">Availability</FieldLabel>
          <SelectField
            id="availability"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
          >
            <option>Mornings</option>
            <option>Afternoons</option>
            <option>Evenings</option>
            <option>Weekends</option>
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

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import posthog from "posthog-js";

type BarberCityFilterProps = {
  cities: {
    label: string;
    value: string;
  }[];
  selectedCity: string | null;
};

export function BarberCityFilter({ cities, selectedCity }: BarberCityFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="barber-directory-filterbar">
      <label className="barber-directory-filterlabel" htmlFor="city">
        Filter by city
      </label>
      <select
        id="city"
        name="city"
        value={selectedCity ?? ""}
        className="barber-directory-select"
        aria-label="Filter barbers by city"
        onChange={(event) => {
          const nextCity = event.target.value;

          posthog.capture("barber_city_filtered", { city: nextCity || null });

          startTransition(() => {
            router.push(nextCity ? `/style/barbers?city=${encodeURIComponent(nextCity)}` : "/style/barbers");
          });
        }}
      >
        <option value="">All listed cities</option>
        {cities.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </select>
      <span className="barber-directory-filterhint">
        {isPending ? "Updating the shortlist..." : "Results update when you pick a city."}
      </span>
    </div>
  );
}

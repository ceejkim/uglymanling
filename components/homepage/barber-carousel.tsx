"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const featuredBarbers = [
  {
    name: "Paul",
    shop: "CutzByPaul",
    city: "New York",
    market: "Queens, NY",
    image: "/images/homepage/barber-carousel-new-york.svg",
    imageAlt: "Cartoon emoji portrait of a New York barber with clippers and blueprint grid accents",
    href: "/style/barbers?city=new-york",
    score: "#1 NYC scout pick",
    tags: ["Crowd favorite", "Thinning-hair fades", "Booking-ready"]
  },
  {
    name: "Manny Precision",
    shop: "Fade Lab LA",
    city: "Los Angeles",
    market: "Los Angeles, CA",
    image: "/images/homepage/barber-carousel-los-angeles.svg",
    imageAlt: "Cartoon emoji portrait of a Los Angeles barber with sun badge and medical grid accents",
    href: "/style/barbers?city=los-angeles",
    score: "Top west coast pick",
    tags: ["Texture blends", "Hairline-aware", "Consult-first"]
  },
  {
    name: "Dre The Detailer",
    shop: "Northside Chair",
    city: "Chicago",
    market: "Chicago, IL",
    image: "/images/homepage/barber-carousel-chicago.svg",
    imageAlt: "Cartoon emoji portrait of a Chicago barber with comb and clinical blueprint accents",
    href: "/style/barbers?city=chicago",
    score: "Midwest shortlist",
    tags: ["Crown coverage", "Sharp silhouettes", "Low-drama cuts"]
  }
] as const;

const rotationMs = 4200;

export function BarberCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBarber = featuredBarbers[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % featuredBarbers.length);
    }, rotationMs);

    return () => window.clearInterval(interval);
  }, []);

  const barberPositionLabel = useMemo(() => `${activeIndex + 1} of ${featuredBarbers.length}`, [activeIndex]);

  return (
    <div className="barber-carousel" aria-roledescription="carousel" aria-label="Featured barbers across major cities">
      <div className="barber-carousel-copy">
        <div className="section-label">Featured barbers</div>
        <h2 className="section-title">Top city barbers for balding men.</h2>
        <p className="section-copy">
          Rotating picks from major markets. Start with the shortlist, then jump into the directory for the full city view.
        </p>
      </div>

      <div className="barber-carousel-stage">
        <div className="barber-carousel-visual" key={activeBarber.image}>
          <Image
            src={activeBarber.image}
            alt={activeBarber.imageAlt}
            width={420}
            height={420}
            className="barber-carousel-image"
            priority={activeIndex === 0}
          />
        </div>

        <div className="barber-carousel-card">
          <div className="barber-carousel-card-topline">
            <span>{activeBarber.score}</span>
            <span>{barberPositionLabel}</span>
          </div>
          <div>
            <p className="barber-carousel-city">{activeBarber.city}</p>
            <h3>{activeBarber.name}</h3>
            <p className="barber-carousel-shop">{activeBarber.shop} · {activeBarber.market}</p>
          </div>
          <div className="barber-carousel-tags" aria-label={`${activeBarber.name} strengths`}>
            {activeBarber.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="barber-carousel-actions">
            <Button href={activeBarber.href} variant="secondary">
              View directory
            </Button>
          </div>
        </div>
      </div>

      <div className="barber-carousel-controls" aria-label="Choose a featured barber">
        {featuredBarbers.map((barber, index) => (
          <button
            key={barber.city}
            type="button"
            className={index === activeIndex ? "is-active" : undefined}
            aria-label={`Show ${barber.name} in ${barber.city}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            <span>{barber.city}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

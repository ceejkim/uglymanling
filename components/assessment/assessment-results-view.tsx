"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MedicalDisclaimer } from "@/components/assessment/medical-disclaimer";
import { captureAssessmentEvent, getPostHogDistinctId } from "@/lib/analytics/assessment-events";
import { trackAssessmentResultEvent } from "@/lib/analytics/assessment-result-events";
import type {
  ResultInsightCard,
  ResultInsightVisual,
  ResultNextStepBucket,
  ResultNextStepCard
} from "@/lib/assessment/derived-metrics";
import type { AssessmentResultSnapshot } from "@/lib/assessment/results";

type AssessmentResultsViewProps = {
  resumeToken: string | null;
  sessionId: string;
  snapshot: AssessmentResultSnapshot;
};

type RingStyle = CSSProperties & {
  "--result-ring-value": string;
};

type WidthStyle = CSSProperties & {
  "--result-bar-width": string;
};

function toneLabel(tone: string) {
  if (tone === "good") {
    return "Strong";
  }

  if (tone === "alert") {
    return "Needs attention";
  }

  if (tone === "watch") {
    return "Watch";
  }

  return "Neutral";
}

function ResultVisual({ visual }: { visual: ResultInsightVisual }) {
  if (visual.type === "meter") {
    return (
      <div className="results-meter-visual">
        <div className="results-meter-track" aria-hidden="true">
          <span style={{ "--result-bar-width": `${visual.value}%` } as WidthStyle} />
        </div>
        <div className="results-meter-copy">
          <strong>{visual.label}</strong>
          <span>{visual.value}/100 signal</span>
        </div>
      </div>
    );
  }

  if (visual.type === "ring") {
    return (
      <div className="results-ring-wrap">
        <div
          className="results-ring"
          style={{ "--result-ring-value": `${visual.value * 3.6}deg` } as RingStyle}
          aria-label={`${visual.label}: ${visual.value}th percentile`}
        >
          <strong>{visual.value}</strong>
          <span>pct</span>
        </div>
        <div className="results-ring-copy">
          <strong>{visual.label}</strong>
          <span>{visual.sampleLabel}</span>
        </div>
      </div>
    );
  }

  if (visual.type === "bars") {
    return (
      <div className="results-dual-bars">
        {visual.bars.map((bar) => (
          <div key={bar.label} className={`results-dual-bar is-${bar.tone}`}>
            <div>
              <span>{bar.label}</span>
              <strong>{bar.value}</strong>
            </div>
            <div className="results-mini-track" aria-hidden="true">
              <span style={{ "--result-bar-width": `${bar.value}%` } as WidthStyle} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "icons") {
    return (
      <div className="results-context-icons">
        {visual.icons.map((icon) => (
          <span
            key={icon.key}
            className={`results-context-icon${icon.active ? " is-active" : ""} is-${icon.tone}`}
            title={icon.label}
          >
            <strong>{icon.shortLabel}</strong>
            <small>{icon.label}</small>
          </span>
        ))}
      </div>
    );
  }

  if (visual.type === "rank") {
    return (
      <div className="results-rank-stack">
        {visual.items.map((item, index) => (
          <div key={item.label} className="results-rank-item">
            <span>{index + 1}</span>
            <div>
              <strong>{item.label}</strong>
              <div className="results-mini-track" aria-hidden="true">
                <span style={{ "--result-bar-width": `${item.score}%` } as WidthStyle} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`results-window-status is-${visual.tone}`}>
      <span>{toneLabel(visual.tone)}</span>
      <strong>{visual.label}</strong>
      <div className="results-mini-track" aria-hidden="true">
        <span style={{ "--result-bar-width": `${visual.value}%` } as WidthStyle} />
      </div>
    </div>
  );
}

function InsightFlipCard({
  card,
  isFlipped,
  onFlip
}: {
  card: ResultInsightCard;
  isFlipped: boolean;
  onFlip: (card: ResultInsightCard) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onFlip(card);
  }

  return (
    <article
      className={`results-flip-card${isFlipped ? " is-flipped" : ""}`}
      aria-label={`${card.title}. ${isFlipped ? "Showing context" : "Showing summary"}.`}
      aria-pressed={isFlipped}
      role="button"
      tabIndex={0}
      onClick={() => onFlip(card)}
      onKeyDown={handleKeyDown}
    >
      <span className="results-flip-inner">
        <span className="results-flip-face results-flip-front">
          <span className="results-card-kicker">Insight</span>
          <span className="results-card-title">{card.title}</span>
          <ResultVisual visual={card.visual} />
          <span className="results-card-copy">{card.frontCopy}</span>
          <span className="results-card-hint">Tap for context</span>
        </span>
        <span className="results-flip-face results-flip-back">
          <span className="results-card-kicker">Context</span>
          <span className="results-card-title">{card.backTitle}</span>
          <span className="results-card-copy">{card.backCopy}</span>
          {card.backFootnote ? <span className="results-card-footnote">{card.backFootnote}</span> : null}
          <span className="results-card-hint">Tap to return</span>
        </span>
      </span>
    </article>
  );
}

function NextStepBucket({
  bucket,
  bucketIndex,
  onCardClick
}: {
  bucket: ResultNextStepBucket;
  bucketIndex: number;
  onCardClick: (card: ResultNextStepCard, bucket: ResultNextStepBucket, position: number) => void;
}) {
  return (
    <article className="results-next-bucket">
      <div className="results-next-bucket-head">
        <span>{String(bucketIndex + 1).padStart(2, "0")}</span>
        <div>
          <h3>{bucket.title}</h3>
          <p>{bucket.subtitle}</p>
        </div>
      </div>
      <div className="results-next-card-stack">
        {bucket.cards.map((card, index) => (
          <button
            key={card.key}
            type="button"
            className="results-next-card"
            onClick={() => onCardClick(card, bucket, index + 1)}
          >
            <span className="results-next-card-meta">{card.destinationType.replaceAll("_", " ")}</span>
            <strong>{card.title}</strong>
            <span>{card.text}</span>
            <small>{card.ctaLabel}</small>
          </button>
        ))}
      </div>
    </article>
  );
}

export function AssessmentResultsView({
  resumeToken,
  sessionId,
  snapshot
}: AssessmentResultsViewProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(() => new Set());
  const hasTrackedResultsViewRef = useRef(false);
  const trackedSectionsRef = useRef<Set<string>>(new Set());
  const metrics = snapshot.derivedMetrics;
  const eventContext = useMemo(
    () => ({
      isAuthenticated: isSignedIn,
      resultVersion: snapshot.resultVersion,
      resumeToken,
      sessionId
    }),
    [isSignedIn, resumeToken, sessionId, snapshot.resultVersion]
  );

  useEffect(() => {
    if (hasTrackedResultsViewRef.current) {
      return;
    }

    hasTrackedResultsViewRef.current = true;

    trackAssessmentResultEvent("results_viewed", eventContext, {
      insight_card_count: metrics.insightCards.length,
      insight_card_keys: metrics.insightCards.map((card) => card.key),
      next_step_card_count: metrics.nextStepBuckets.reduce(
        (count, bucket) => count + bucket.cards.length,
        0
      ),
      pace_band: metrics.paceBand,
      profile_archetype: metrics.hero.archetype,
      result_card_keys: metrics.resultCardKeys,
      window_label: metrics.interventionWindow.label
    });

    captureAssessmentEvent(
      "assessment_results_viewed",
      {
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        resultVersion: snapshot.resultVersion,
        sessionId
      },
      {
        profile_band: snapshot.profileBand
      }
    );
  }, [eventContext, isSignedIn, metrics, sessionId, snapshot.profileBand, snapshot.resultVersion]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-results-section]"));

    if (sections.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("data-results-section");

          if (!sectionId || !entry.isIntersecting || entry.intersectionRatio < 0.55) {
            return;
          }

          if (trackedSectionsRef.current.has(sectionId)) {
            return;
          }

          trackedSectionsRef.current.add(sectionId);
          trackAssessmentResultEvent("section_scrolled", eventContext, {
            section_id: sectionId,
            section_seen: true
          });
        });
      },
      { threshold: [0.55] }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [eventContext]);

  function handleFlip(card: ResultInsightCard) {
    const isNowFlipped = !flippedCards.has(card.key);

    setFlippedCards((current) => {
      const next = new Set(current);

      if (next.has(card.key)) {
        next.delete(card.key);
      } else {
        next.add(card.key);
      }

      return next;
    });

    trackAssessmentResultEvent("insight_card_flipped", eventContext, {
      card_key: card.key,
      card_title: card.title,
      flipped_to_back: isNowFlipped
    });
  }

  function handleNextStepClick(
    card: ResultNextStepCard,
    bucket: ResultNextStepBucket,
    position: number
  ) {
    trackAssessmentResultEvent("next_step_card_clicked", eventContext, {
      bucket_id: bucket.id,
      cta_label: card.ctaLabel,
      destination_path: card.href,
      destination_type: card.destinationType,
      position,
      recommendation_key: card.key
    });

    if (card.ctaEvent) {
      trackAssessmentResultEvent(card.ctaEvent, eventContext, {
        bucket_id: bucket.id,
        destination_path: card.href,
        recommendation_key: card.key
      });
    }

    void fetch("/api/assessment/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "recommendation_click",
        destinationPath: card.href,
        destinationType: card.destinationType,
        position,
        recommendationKey: card.key,
        resumeToken,
        sessionId
      })
    }).catch(() => {
      // Best effort persistence only.
    });

    router.push(card.href);
  }

  return (
    <div className="results-dashboard">
      <section className="results-hero-card grain-card">
        <div className="results-hero-topline">
          <span className="eyebrow">Your hair profile</span>
          <span>{metrics.selfReportedStage}</span>
        </div>
        <div className="results-hero-main">
          <div>
            <h1>{metrics.hero.archetype}</h1>
            <p>{metrics.hero.subtitle}</p>
          </div>
          <div className="results-hero-orbit" aria-hidden="true">
            <span>{metrics.communityComparison.densityRetentionPercentile}</span>
            <small>retention pct</small>
          </div>
        </div>
        <div className="results-hero-badges">
          <span>
            <small>Pace</small>
            <strong>{metrics.paceBand}</strong>
          </span>
          <span>
            <small>Window</small>
            <strong>{metrics.interventionWindow.label}</strong>
          </span>
        </div>
        <MedicalDisclaimer />
      </section>

      <section className="results-main-section" data-results-section="insights">
        <div className="results-section-heading">
          <span className="eyebrow">Insights</span>
          <h2>What we think is happening.</h2>
        </div>
        <div className="results-insight-grid">
          {metrics.insightCards.map((card) => (
            <InsightFlipCard
              key={card.key}
              card={card}
              isFlipped={flippedCards.has(card.key)}
              onFlip={handleFlip}
            />
          ))}
        </div>
      </section>

      <section className="results-main-section" data-results-section="next_steps">
        <div className="results-section-heading">
          <span className="eyebrow">Next steps</span>
          <h2>What you should do now.</h2>
        </div>
        <div className="results-next-grid">
          {metrics.nextStepBuckets.map((bucket, index) => (
            <NextStepBucket
              key={bucket.id}
              bucket={bucket}
              bucketIndex={index}
              onCardClick={handleNextStepClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

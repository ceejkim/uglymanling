"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { captureAssessmentEvent, getPostHogDistinctId } from "@/lib/analytics/assessment-events";
import type { AssessmentResultSnapshot } from "@/lib/assessment/results";

type AssessmentResultsViewProps = {
  resumeToken: string | null;
  sessionId: string;
  snapshot: AssessmentResultSnapshot;
};

function getReportItemClassName(tone?: string) {
  return `assessment-report-item${tone ? ` is-${tone}` : ""}`;
}

export function AssessmentResultsView({
  resumeToken,
  sessionId,
  snapshot
}: AssessmentResultsViewProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackBody, setFeedbackBody] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const communityReport = snapshot.benchmarkPayload.communityReport ?? [];
  const personalReport = snapshot.benchmarkPayload.personalReport ?? [];
  const researchOpportunities = snapshot.benchmarkPayload.researchOpportunities ?? [];

  useEffect(() => {
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

    captureAssessmentEvent(
      "assessment_peer_comparison_viewed",
      {
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        resultVersion: snapshot.resultVersion,
        sessionId
      },
      {
        cohort_confidence: snapshot.benchmarkPayload.confidence,
        cohort_size: snapshot.benchmarkPayload.cohortSize
      }
    );

    snapshot.recommendationPayload.forEach((recommendation, index) => {
      captureAssessmentEvent(
        "assessment_recommendation_impression",
        {
          isAuthenticated: isSignedIn,
          posthogDistinctId: getPostHogDistinctId(),
          resultVersion: snapshot.resultVersion,
          sessionId
        },
        {
          destination_type: recommendation.destinationType,
          recommendation_key: recommendation.key,
          recommendation_rank: index + 1
        }
      );
    });

    captureAssessmentEvent(
      "assessment_membership_offer_viewed",
      {
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        resultVersion: snapshot.resultVersion,
        sessionId
      },
      {
        offer_variant: snapshot.membershipOfferVariant
      }
    );
  }, [isSignedIn, sessionId, snapshot]);

  async function handleRecommendationClick(
    recommendationKey: string,
    destinationPath: string,
    destinationType: string,
    position: number
  ) {
    void fetch("/api/assessment/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "recommendation_click",
        destinationPath,
        destinationType,
        position,
        recommendationKey,
        resumeToken,
        sessionId
      })
    });

    router.push(destinationPath);
  }

  async function handleMembershipCheckout() {
    setMembershipError(null);

    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    captureAssessmentEvent(
      "assessment_membership_cta_clicked",
      {
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        resultVersion: snapshot.resultVersion,
        sessionId
      },
      {
        benchmark_visible: snapshot.benchmarkPayload.cohortSize > 0,
        has_seen_free_results: true,
        offer_variant: snapshot.membershipOfferVariant,
        price_usd_monthly: 4.99
      }
    );

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              assessmentSessionId: sessionId,
              cancelPath: `/assessment/results/${sessionId}${resumeToken ? `?rt=${resumeToken}&membership=cancelled` : "?membership=cancelled"}`,
              entrySource: "assessment_results",
              mode: "subscription",
              offerVariant: snapshot.membershipOfferVariant,
              priceLookupKey: "membership",
              resultVersion: snapshot.resultVersion,
              successPath: `/assessment/results/${sessionId}${resumeToken ? `?rt=${resumeToken}&membership=success` : "?membership=success"}`
            })
          });

          if (!response.ok) {
            throw new Error("Unable to start checkout.");
          }

          const payload = (await response.json()) as { checkoutUrl?: string };

          if (!payload.checkoutUrl) {
            throw new Error("Missing checkout URL.");
          }

          window.location.href = payload.checkoutUrl;
        } catch (error) {
          setMembershipError(error instanceof Error ? error.message : "Unable to start checkout.");
        }
      })();
    });
  }

  async function handleFeedbackSubmit() {
    if (!feedbackRating) {
      return;
    }

    const response = await fetch("/api/assessment/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "result_feedback",
        body: feedbackBody.trim() || null,
        rating: feedbackRating,
        resumeToken,
        sessionId
      })
    });

    if (response.ok) {
      setFeedbackSaved(true);
    }
  }

  return (
    <div className="assessment-results-layout">
      <section className="assessment-results-hero grain-card">
        <div className="assessment-complete-header">
          <span className="eyebrow">Your profile</span>
          <span className="assessment-complete-badge">{snapshot.summary.badge}</span>
        </div>
        <h1>{snapshot.summary.title}</h1>
        <p>{snapshot.summary.detail}</p>
        <div className="assessment-complete-list">
          {snapshot.summary.bullets.map((bullet) => (
            <div key={bullet} className="assessment-complete-item">
              <span />
              <p>{bullet}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="assessment-results-grid">
        <div className="assessment-results-column">
          {personalReport.length > 0 ? (
            <div className="assessment-results-card grain-card">
              <span className="eyebrow">Your baseline report</span>
              <h2>The useful signals in your answers</h2>
              <p>
                These are personal survey signals, not a diagnosis. They help you compare with peers and make the next decision less vague.
              </p>
              <div className="assessment-report-grid">
                {personalReport.map((signal) => (
                  <div key={signal.id} className={getReportItemClassName(signal.tone)}>
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <p>{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="assessment-results-card grain-card">
            <span className="eyebrow">Peer comparison</span>
            <h2>Where you stand relative to peers</h2>
            <p>
              This is intentionally directional, not dramatic. We would rather be honest than overclaim.
            </p>
            <div className="assessment-benchmark-meta">
              <strong>{snapshot.benchmarkPayload.cohortLabel}</strong>
              <span>
                Cohort size: {snapshot.benchmarkPayload.cohortSize} • Confidence:{" "}
                {snapshot.benchmarkPayload.confidence}
              </span>
            </div>
            <div className="assessment-benchmark-list">
              {snapshot.benchmarkPayload.insights.map((insight) => (
                <div key={insight.id} className="assessment-benchmark-item">
                  <span />
                  <p>{insight.value}</p>
                </div>
              ))}
            </div>
          </div>

          {communityReport.length > 0 ? (
            <div className="assessment-results-card grain-card">
              <span className="eyebrow">Community report</span>
              <h2>What the dataset is starting to show</h2>
              <p>
                Like a lightweight community health report: anonymous, aggregate, and cautious until the cohort gets stronger.
              </p>
              <div className="assessment-report-grid">
                {communityReport.map((signal) => (
                  <div key={signal.id} className={getReportItemClassName(signal.tone)}>
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <p>{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="assessment-results-card grain-card">
            <span className="eyebrow">Quick feedback</span>
            <h2>Did this help you make a clearer next decision?</h2>
            <div className="assessment-rating-row">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={`assessment-rating-button${feedbackRating === rating ? " is-active" : ""}`}
                  onClick={() => setFeedbackRating(rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackBody}
              onChange={(event) => setFeedbackBody(event.target.value)}
              className="assessment-feedback-input"
              placeholder="Tell us what felt missing"
            />
            <div className="assessment-feedback-actions">
              <button
                type="button"
                className="assessment-inline-button"
                disabled={!feedbackRating || feedbackSaved}
                onClick={() => void handleFeedbackSubmit()}
              >
                {feedbackSaved ? "Saved" : "Send feedback"}
              </button>
              <p>{feedbackSaved ? "Thanks. This will directly shape the next version." : "Optional text, useful signal."}</p>
            </div>
          </div>
        </div>

        <aside className="assessment-results-sidebar">
          <div className="assessment-results-card grain-card">
            <span className="eyebrow">Recommended next steps</span>
            <h2>What to do next</h2>
            <div className="assessment-recommendation-stack">
              {snapshot.recommendationPayload.map((recommendation, index) => (
                <button
                  key={recommendation.key}
                  type="button"
                  className="assessment-recommendation-card"
                  onClick={() =>
                    void handleRecommendationClick(
                      recommendation.key,
                      recommendation.destinationPath,
                      recommendation.destinationType,
                      index + 1
                    )
                  }
                >
                  <div className="assessment-recommendation-head">
                    <strong>{recommendation.title}</strong>
                    <span>{recommendation.confidenceScore}% fit</span>
                  </div>
                  <p>{recommendation.whyItMatches}</p>
                  <small>
                    {recommendation.expectedValue} • {recommendation.timeToValue} time-to-value
                  </small>
                </button>
              ))}
            </div>
          </div>

          {researchOpportunities.length > 0 ? (
            <div className="assessment-results-card grain-card">
              <span className="eyebrow">Research roadmap</span>
              <h2>Questions worth tracking next</h2>
              <div className="assessment-research-list">
                {researchOpportunities.map((item) => (
                  <div key={item.id} className="assessment-research-item">
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="assessment-membership-card grain-card">
            <span className="eyebrow">Member data</span>
            <h2>Go deeper for $4.99/month</h2>
            <p>
              Unlock richer benchmark cuts, quarterly trend reports, evolving recommendations, and member-only resource drops without digging through noise.
            </p>
            <div className="assessment-membership-list">
              <span>Deeper benchmark comparisons</span>
              <span>Quarterly trend reports</span>
              <span>Premium assessment exports</span>
              <span>Member-only insights</span>
            </div>
            <button
              type="button"
              className="assessment-membership-button"
              disabled={isPending}
              onClick={() => void handleMembershipCheckout()}
            >
              {isPending ? "Starting checkout..." : isSignedIn ? "Unlock deeper data" : "Create account to unlock"}
            </button>
            {membershipError ? <p className="assessment-feedback-error">{membershipError}</p> : null}
          </div>

          <div className="assessment-results-links">
            <Button href="/style/barbers" variant="secondary">
              Find a barber
            </Button>
            <Button href="/consult" variant="ghost">
              Talk it through
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

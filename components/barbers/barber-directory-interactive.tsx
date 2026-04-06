"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BarberInteractionSummary } from "@/lib/barber-community";
import type { BarberCandidate, BarberCitySection } from "@/lib/barber-data";
import { formatBarberTag } from "@/lib/barber-data";

type BarberDirectoryInteractiveProps = {
  topSeedCandidates: BarberCandidate[];
  citySections: BarberCitySection[];
  selectedCity: string | null;
  selectedTag: string | null;
};

type SummaryMap = Record<string, BarberInteractionSummary>;

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function EmptyState() {
  return (
    <div className="barber-cards">
      <div className="grain-card barber-card">
        <div className="barber-panel-heading">
          <span className="eyebrow">No matches yet</span>
          <h2>Try a broader filter mix</h2>
        </div>
        <p className="barber-card-note">
          No seeded barber profiles matched this city and tag combination yet. Clear one filter and the directory
          will widen again.
        </p>
        <div className="barber-card-actions">
          <Link href="/style/barbers" className="barber-link-button barber-link-button-primary">
            Reset filters
          </Link>
        </div>
      </div>
    </div>
  );
}

function CommentComposer({
  barber,
  signedIn,
  onComment
}: {
  barber: BarberCandidate;
  signedIn: boolean;
  onComment: (barberId: string, body: string) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <div className="barber-comment-cta">
        <p>Sign in to leave the first real note on this barber.</p>
        <Button href="/sign-in" variant="secondary">
          Sign in to comment
        </Button>
      </div>
    );
  }

  return (
    <form
      className="barber-comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const trimmedBody = body.trim();

        if (trimmedBody.length < 10) {
          setError("Comment must be at least 10 characters.");
          return;
        }

        startTransition(async () => {
          try {
            await onComment(barber.id, trimmedBody);
            setBody("");
          } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Could not save comment.");
          }
        });
      }}
    >
      <label className="barber-comment-label" htmlFor={`comment-${barber.id}`}>
        Leave a note
      </label>
      <textarea
        id={`comment-${barber.id}`}
        className="barber-comment-textarea"
        rows={3}
        maxLength={400}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Did this barber handle thinning hair well, give honest direction, or help you feel more put together?"
      />
      <div className="barber-comment-form-footer">
        <span>{body.length}/400</span>
        <button type="submit" className="barber-action-button barber-action-button-primary" disabled={isPending}>
          {isPending ? "Posting..." : "Post comment"}
        </button>
      </div>
      {error ? <p className="barber-interaction-error">{error}</p> : null}
    </form>
  );
}

function BarberCard({
  barber,
  summary,
  signedIn,
  onVote,
  onComment
}: {
  barber: BarberCandidate;
  summary?: BarberInteractionSummary;
  signedIn: boolean;
  onVote: (barberId: string, value: -1 | 1) => Promise<void>;
  onComment: (barberId: string, body: string) => Promise<void>;
}) {
  const [isVoting, startVoteTransition] = useTransition();

  return (
    <div className="grain-card barber-card">
      <div className="barber-card-top">
        <div>
          <span className="eyebrow">
            #{barber.rank} overall · {barber.city}
          </span>
          <h3>{barber.barberName}</h3>
          <p>
            {barber.shopName} · {barber.neighborhood}
          </p>
        </div>
        <div className="barber-score-pill">
          <strong>{barber.confidenceScore}/5</strong>
          <span>confidence</span>
        </div>
      </div>

      <div className="barber-meta-row">
        <span>{barber.priceTier}</span>
        <span>{barber.sourceCount} sources</span>
        <span>{barber.shopAddress}</span>
      </div>

      <div className="barber-filter-row">
        {barber.recommendedTags.slice(0, 6).map((tag) => (
          <Badge key={tag} tone="accent">
            {formatBarberTag(tag)}
          </Badge>
        ))}
      </div>

      <p className="barber-card-note">{barber.rankingNotes}</p>

      <div className="barber-card-copy">
        <p>{barber.evidenceSummary}</p>
        <p>{barber.reviewSignalSummary}</p>
      </div>

      <div className="barber-interaction-summary">
        <div className="barber-interaction-stat">
          <strong>{summary?.score ?? 0}</strong>
          <span>score</span>
        </div>
        <div className="barber-interaction-stat">
          <strong>{summary?.upvotes ?? 0}</strong>
          <span>upvotes</span>
        </div>
        <div className="barber-interaction-stat">
          <strong>{summary?.downvotes ?? 0}</strong>
          <span>downvotes</span>
        </div>
        <div className="barber-interaction-stat">
          <strong>{summary?.commentCount ?? 0}</strong>
          <span>comments</span>
        </div>
      </div>

      <div className="barber-card-actions">
        {barber.primaryBookingUrl ? (
          <a className="barber-link-button barber-link-button-primary" href={barber.primaryBookingUrl} target="_blank" rel="noreferrer">
            View booking profile
          </a>
        ) : (
          <span className="barber-link-button barber-link-button-muted">Booking link pending</span>
        )}
        {signedIn ? (
          <>
            <button
              type="button"
              className={`barber-action-button ${summary?.currentUserVote === 1 ? "is-active" : ""}`.trim()}
              disabled={isVoting}
              onClick={() =>
                startVoteTransition(async () => {
                  await onVote(barber.id, 1);
                })
              }
            >
              {isVoting && summary?.currentUserVote !== 1 ? "Saving..." : "Upvote"}
            </button>
            <button
              type="button"
              className={`barber-action-button ${summary?.currentUserVote === -1 ? "is-active" : ""}`.trim()}
              disabled={isVoting}
              onClick={() =>
                startVoteTransition(async () => {
                  await onVote(barber.id, -1);
                })
              }
            >
              {isVoting && summary?.currentUserVote !== -1 ? "Saving..." : "Downvote"}
            </button>
          </>
        ) : (
          <Button href="/sign-in" variant="ghost">
            Sign in to vote
          </Button>
        )}
      </div>

      <div className="barber-comments-section">
        <div className="barber-comments-header">
          <strong>Community notes</strong>
          <span>{summary?.commentCount ?? 0} posted</span>
        </div>

        {summary && summary.comments.length > 0 ? (
          <div className="barber-comment-stack">
            {summary.comments.slice(0, 3).map((comment) => (
              <div key={comment.id} className="barber-comment">
                <strong>{comment.authorLabel}</strong>
                <span>{formatCommentDate(comment.createdAt)}</span>
                <p>{comment.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="barber-empty-comments">No community notes yet. The first trusted write-up matters here.</p>
        )}

        <CommentComposer barber={barber} signedIn={signedIn} onComment={onComment} />
      </div>
    </div>
  );
}

export function BarberDirectoryInteractive({
  topSeedCandidates,
  citySections,
  selectedCity,
  selectedTag
}: BarberDirectoryInteractiveProps) {
  const { isSignedIn } = useUser();
  const [summaries, setSummaries] = useState<SummaryMap>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetch("/api/barbers/interactions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load barber interactions.");
        }

        const payload = (await response.json()) as { summaries: BarberInteractionSummary[] };

        if (!isActive) {
          return;
        }

        setSummaries(
          Object.fromEntries(payload.summaries.map((summary) => [summary.barberId, summary])) satisfies SummaryMap
        );
      })
      .catch((nextError) => {
        if (isActive) {
          setError(nextError instanceof Error ? nextError.message : "Could not load barber interactions.");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const visibleBarbers = useMemo(
    () => citySections.flatMap((citySection) => citySection.candidates),
    [citySections]
  );

  async function mutateInteraction(input: { type: "vote"; barberId: string; value: -1 | 1 } | { type: "comment"; barberId: string; body: string }) {
    const response = await fetch("/api/barbers/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    const payload = (await response.json()) as { error?: string; summary?: BarberInteractionSummary };

    if (!response.ok || !payload.summary) {
      throw new Error(payload.error ?? "Could not save interaction.");
    }

    setSummaries((current) => ({
      ...current,
      [payload.summary!.barberId]: payload.summary!
    }));
  }

  return (
    <>
      {error ? <p className="barber-interaction-error">{error}</p> : null}

      <div className="barber-cards">
        {topSeedCandidates.length > 0 ? (
          topSeedCandidates.map((barber) => (
            <BarberCard
              key={`${barber.city}-${barber.barberName}`}
              barber={barber}
              summary={summaries[barber.id]}
              signedIn={Boolean(isSignedIn)}
              onVote={(barberId, value) => mutateInteraction({ type: "vote", barberId, value })}
              onComment={(barberId, body) => mutateInteraction({ type: "comment", barberId, body })}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {visibleBarbers.length > 0 ? (
        <section className="barber-city-sections">
          {citySections.map((city) => (
            <div key={city.city} className="grain-card barber-city-card">
              <div className="barber-city-header">
                <div>
                  <span className="eyebrow">{city.city}</span>
                  <h2>
                    {city.candidates.length} matching barbers shown · {city.actualCount} seeded out of {city.targetCount} target
                  </h2>
                </div>
                <div className="barber-city-meta">
                  <span>{city.state}</span>
                  <span>{city.manualReviewFlags.length} flagged for review</span>
                </div>
              </div>

              <p className="barber-city-summary">{city.marketSummary}</p>

              <div className="barber-filter-row">
                {city.topCandidateNames.map((candidateName) => (
                  <Badge key={candidateName}>{candidateName}</Badge>
                ))}
              </div>

              <div className="barber-city-list">
                {city.candidates.map((barber) => {
                  const summary = summaries[barber.id];

                  return (
                    <div key={`${city.city}-${barber.barberName}`} className="barber-city-row">
                      <div className="barber-city-row-main">
                        <strong>
                          #{barber.rank} {barber.barberName}
                        </strong>
                        <p>
                          {barber.shopName} · {barber.neighborhood}
                        </p>
                      </div>
                      <div className="barber-city-row-aside">
                        <span>{barber.confidenceScore}/5 confidence</span>
                        <span>{barber.sourceCount} sources</span>
                        <span>{summary?.score ?? 0} score</span>
                        <span>{summary?.commentCount ?? 0} comments</span>
                      </div>
                      <div className="barber-city-row-tags">
                        {barber.recommendedTags.slice(0, 4).map((tag) => (
                          <Badge key={tag} tone="accent">
                            {formatBarberTag(tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : selectedCity || selectedTag ? (
        <section className="barber-city-sections" />
      ) : null}
    </>
  );
}

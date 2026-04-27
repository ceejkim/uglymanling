"use client";

import { useEffect, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { BarberInteractionSummary } from "@/lib/barber-community";
import type { BarberCandidate } from "@/lib/barber-data";

type BarberDirectoryInteractiveProps = {
  barbers: BarberCandidate[];
  selectedCityLabel: string;
};

type SummaryMap = Record<string, BarberInteractionSummary>;

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getReviewSynthesis(barber: BarberCandidate) {
  const reviewSignal = barber.reviewSignalSummary.trim();

  return reviewSignal ? reviewSignal : "No reviews yet";
}

function EmptyState({ selectedCityLabel }: { selectedCityLabel: string }) {
  return (
    <div className="grain-card barber-empty-state">
      <span className="eyebrow">{selectedCityLabel}</span>
      <h3>No barbers found for that selection yet.</h3>
      <p>Try another city for now. We’ll keep tightening the directory as more recommendations come in.</p>
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
        <p>Sign in to leave a note for the next guy.</p>
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
        placeholder="What did this barber do well? Did he help with a tricky hairline, beard shape, or a cleaner reset?"
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
    <details className="grain-card barber-card">
      <summary className="barber-card-summary">
        <div className="barber-card-primary">
          <div>
            <div className="barber-card-kicker">
              <span className="barber-card-city">{barber.city}</span>
              {barber.isUglyManlingVerified ? (
                <span className="barber-verified-badge" aria-label="Ugly Manling verified">
                  <span aria-hidden="true">✓</span>
                  Ugly Manling verified
                </span>
              ) : null}
            </div>
            <h3>{barber.barberName}</h3>
            <p>
              {barber.shopName} · {barber.neighborhood}
            </p>
          </div>
        </div>

        <div className="barber-card-meta">
          <div className="barber-score-pill">
            <strong>{summary?.score ?? 0}</strong>
            <span>score</span>
          </div>
          <div className="barber-card-statbar">
            <span>{summary?.upvotes ?? 0} up</span>
            <span>{summary?.commentCount ?? 0} notes</span>
          </div>
          <span className="barber-card-toggle">Expand</span>
        </div>
      </summary>

      <div className="barber-card-details">
        <div className="barber-card-copy">
          <span className="barber-card-copy-label">Review synthesis</span>
          <p>{getReviewSynthesis(barber)}</p>
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
                Upvote
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
                Downvote
              </button>
            </>
          ) : (
            <Button href="/sign-in" variant="ghost">
              Sign in to comment and vote
            </Button>
          )}
        </div>

        <div className="barber-interaction-summary">
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

        <div className="barber-comments-section">
          <div className="barber-comments-header">
            <strong>Community notes</strong>
            <span>{summary?.commentCount ?? 0} posted</span>
          </div>

          {summary && summary.comments.length > 0 ? (
            <div className="barber-comment-stack">
              {summary.comments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="barber-comment">
                  <strong>{comment.authorLabel}</strong>
                  <span>{formatCommentDate(comment.createdAt)}</span>
                  <p>{comment.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="barber-empty-comments">No notes yet. The first useful review here matters.</p>
          )}

          <CommentComposer barber={barber} signedIn={signedIn} onComment={onComment} />
        </div>
      </div>
    </details>
  );
}

function SuggestBarberForm({ signedIn }: { signedIn: boolean }) {
  const [barberName, setBarberName] = useState("");
  const [barbershop, setBarbershop] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <section className="grain-card barber-submit-card">
        <div>
          <span className="section-label">Know a good barber?</span>
          <h2>Suggest a barber for manual review.</h2>
          <p>Sign in to send us a name and barbershop. We will review it before anything goes live.</p>
        </div>
        <Button href="/sign-in" variant="secondary">
          Sign in to suggest a barber
        </Button>
      </section>
    );
  }

  return (
    <section className="grain-card barber-submit-card">
      <div>
        <span className="section-label">Know a good barber?</span>
        <h2>Suggest a barber for manual review.</h2>
        <p>Send us the basics. We will verify the fit before adding anyone to the directory.</p>
      </div>

      <form
        className="barber-submit-form"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setMessage(null);

          startTransition(async () => {
            try {
              const response = await fetch("/api/barbers/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ barberName, barbershop })
              });
              const payload = (await response.json()) as { error?: string };

              if (!response.ok) {
                throw new Error(payload.error ?? "Could not submit barber.");
              }

              setBarberName("");
              setBarbershop("");
              setMessage("Submitted for review.");
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : "Could not submit barber.");
            }
          });
        }}
      >
        <label className="barber-comment-label" htmlFor="barber-name">
          Barber name
        </label>
        <input
          id="barber-name"
          className="barber-submit-input"
          maxLength={120}
          value={barberName}
          onChange={(event) => setBarberName(event.target.value)}
          placeholder="Jane the Barber"
          required
        />

        <label className="barber-comment-label" htmlFor="barbershop">
          Barbershop
        </label>
        <input
          id="barbershop"
          className="barber-submit-input"
          maxLength={140}
          value={barbershop}
          onChange={(event) => setBarbershop(event.target.value)}
          placeholder="Clean Cut Studio"
          required
        />

        <div className="barber-comment-form-footer">
          <span>Manual review before publishing</span>
          <button type="submit" className="barber-action-button barber-action-button-primary" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit barber"}
          </button>
        </div>
        {message ? <p className="barber-submit-success">{message}</p> : null}
        {error ? <p className="barber-interaction-error">{error}</p> : null}
      </form>
    </section>
  );
}

export function BarberDirectoryInteractive({ barbers, selectedCityLabel }: BarberDirectoryInteractiveProps) {
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

        setSummaries(Object.fromEntries(payload.summaries.map((summary) => [summary.barberId, summary])));
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

  async function mutateInteraction(input: { type: "vote"; barberId: string; value: -1 | 1 } | { type: "comment"; barberId: string; body: string }) {
    const response = await fetch("/api/barbers/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    const payload = (await response.json()) as { error?: string; summary?: BarberInteractionSummary };

    if (!response.ok || !payload.summary) {
      throw new Error(payload.error ?? "Could not save interaction.");
    }

    const nextSummary = payload.summary;

    setSummaries((current) => ({
      ...current,
      [nextSummary.barberId]: nextSummary
    }));
  }

  if (barbers.length === 0) {
    return <EmptyState selectedCityLabel={selectedCityLabel} />;
  }

  const sortedBarbers = [...barbers].sort((left, right) => {
    const leftSummary = summaries[left.id];
    const rightSummary = summaries[right.id];
    const leftPopularity = (leftSummary?.score ?? 0) * 100 + (leftSummary?.commentCount ?? 0) * 10 + (leftSummary?.upvotes ?? 0);
    const rightPopularity = (rightSummary?.score ?? 0) * 100 + (rightSummary?.commentCount ?? 0) * 10 + (rightSummary?.upvotes ?? 0);

    if (rightPopularity !== leftPopularity) {
      return rightPopularity - leftPopularity;
    }

    return left.rank - right.rank;
  });

  return (
    <>
      {error ? <p className="barber-interaction-error">{error}</p> : null}
      <section className="barber-results-grid">
        {sortedBarbers.map((barber) => (
          <BarberCard
            key={barber.id}
            barber={barber}
            summary={summaries[barber.id]}
            signedIn={Boolean(isSignedIn)}
            onVote={(barberId, value) => mutateInteraction({ type: "vote", barberId, value })}
            onComment={(barberId, body) => mutateInteraction({ type: "comment", barberId, body })}
          />
        ))}
      </section>
      <SuggestBarberForm signedIn={Boolean(isSignedIn)} />
    </>
  );
}

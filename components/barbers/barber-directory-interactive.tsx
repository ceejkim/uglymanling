"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { BarberInteractionSummary } from "@/lib/barber-community";
import type { BarberCandidate } from "@/lib/barber-data";

type BarberDirectoryInteractiveProps = {
  barbers: BarberCandidate[];
  lockedPreviewBarbers: BarberCandidate[];
  selectedCityLabel: string;
  viewerHasFullAccess: boolean;
};

type SummaryMap = Record<string, BarberInteractionSummary>;

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getCommentSummary(summary?: BarberInteractionSummary) {
  if (!summary) {
    return "Loading community comments...";
  }

  return summary.commentSummary;
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

function VerifiedOnlyEmptyState({
  lockedPreviewCount,
  selectedCityLabel
}: {
  lockedPreviewCount: number;
  selectedCityLabel: string;
}) {
  return (
    <div className="grain-card barber-empty-state">
      <span className="eyebrow">{selectedCityLabel}</span>
      <h3>No verified barbers are public in this selection yet.</h3>
      <p>
        There {lockedPreviewCount === 1 ? "is" : "are"} <strong>{lockedPreviewCount}</strong> more barber
        {lockedPreviewCount === 1 ? "" : "s"} behind the free member gate.
      </p>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const commentCount = summary?.commentCount ?? 0;
  const hasMvpSeededComments = summary?.comments.some((comment) => comment.sourceTag === "mvp") ?? false;
  const detailsButtonLabel = isExpanded
    ? "Hide details"
    : commentCount > 0
      ? `Read ${commentCount} comment${commentCount === 1 ? "" : "s"}`
      : "Read comments";

  return (
    <article className={`grain-card barber-card${isExpanded ? " is-expanded" : ""}`}>
      <div className="barber-card-summary">
        <div className="barber-card-primary">
          <div className="barber-card-heading">
            <div className="barber-card-identity">
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

            <div className="barber-card-meta">
              {signedIn ? (
                <div className="barber-card-vote-rail" role="group" aria-label={`Vote on ${barber.barberName}`}>
                  <span className="barber-vote-label">Vote</span>
                  <button
                    type="button"
                    className={`barber-vote-button ${summary?.currentUserVote === 1 ? "is-active" : ""}`.trim()}
                    disabled={isVoting}
                    aria-label={`Recommend ${barber.barberName}`}
                    onClick={() =>
                      startVoteTransition(async () => {
                        await onVote(barber.id, 1);
                      })
                    }
                  >
                    ▲
                  </button>
                  <strong className="barber-vote-score">{summary?.score ?? 0}</strong>
                  <button
                    type="button"
                    className={`barber-vote-button ${summary?.currentUserVote === -1 ? "is-active" : ""}`.trim()}
                    disabled={isVoting}
                    aria-label={`Mark ${barber.barberName} not a fit`}
                    onClick={() =>
                      startVoteTransition(async () => {
                        await onVote(barber.id, -1);
                      })
                    }
                  >
                    ▼
                  </button>
                </div>
              ) : (
                <Link href="/sign-in" className="barber-link-button barber-link-button-muted barber-link-button-compact">
                  Sign in to vote
                </Link>
              )}
            </div>
          </div>

          <div className="barber-card-summary-actions">
            <div className="barber-card-summary-buttons">
              <button
                type="button"
                className="barber-card-toggle"
                aria-expanded={isExpanded}
                aria-controls={`barber-details-${barber.id}`}
                onClick={() => setIsExpanded((current) => !current)}
              >
                {detailsButtonLabel}
              </button>
              {barber.primaryBookingUrl ? (
                <a className="barber-link-button barber-link-button-primary barber-link-button-compact" href={barber.primaryBookingUrl} target="_blank" rel="noreferrer">
                  Book now
                </a>
              ) : (
                <span className="barber-link-button barber-link-button-muted barber-link-button-compact">No booking link yet</span>
              )}
            </div>
            <div className="barber-card-statbar">
              <span>{summary?.score ?? 0} score</span>
              <span>{summary?.upvotes ?? 0} recommend</span>
              <span>{commentCount} comments</span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div id={`barber-details-${barber.id}`} className="barber-card-details">
          <div className="barber-card-copy">
            <div className="barber-card-copy-heading">
              <span className="barber-card-copy-label">What people are saying</span>
              {hasMvpSeededComments ? <span className="barber-seed-badge">MVP</span> : null}
            </div>
            <p>{getCommentSummary(summary)}</p>
          </div>

          <div className="barber-interaction-summary">
            <div className="barber-interaction-stat">
              <strong>{summary?.upvotes ?? 0}</strong>
              <span>recommend</span>
            </div>
            <div className="barber-interaction-stat">
              <strong>{summary?.downvotes ?? 0}</strong>
              <span>not a fit</span>
            </div>
            <div className="barber-interaction-stat">
              <strong>{commentCount}</strong>
              <span>comments</span>
            </div>
          </div>

          <div className="barber-comments-section">
            <div className="barber-comments-header">
              <strong>Community comments</strong>
              <span>{commentCount} posted</span>
            </div>

            {summary && summary.comments.length > 0 ? (
              <div className="barber-comment-stack">
                {summary.comments.slice(0, 2).map((comment) => (
                  <div key={comment.id} className="barber-comment">
                    <div className="barber-comment-meta">
                      <strong>{comment.authorLabel}</strong>
                      <span>{formatCommentDate(comment.createdAt)}</span>
                      {comment.sourceTag === "mvp" ? <span className="barber-seed-badge">MVP</span> : null}
                    </div>
                    <p>{comment.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="barber-empty-comments">No comments yet. The first useful note here matters.</p>
            )}

            <CommentComposer barber={barber} signedIn={signedIn} onComment={onComment} />
          </div>
        </div>
      ) : null}
    </article>
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
          <h2>Suggest a barber for review.</h2>
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
        <h2>Suggest a barber for review.</h2>
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

function LockedPreviewCard({ barber }: { barber: BarberCandidate }) {
  return (
    <article className="grain-card barber-card barber-card-locked">
      <div className="barber-card-summary">
        <div className="barber-card-primary">
          <div className="barber-card-heading">
            <div className="barber-card-identity">
              <div className="barber-card-kicker">
                <span className="barber-card-city">{barber.city}</span>
              </div>
              <h3>{barber.barberName}</h3>
              <p>{barber.shopName}</p>
            </div>

            <div className="barber-card-meta barber-card-meta-locked">
              <div className="barber-card-vote-rail barber-card-vote-rail-locked" aria-hidden="true">
                <span className="barber-vote-label">Vote</span>
                <span className="barber-vote-button">▲</span>
                <strong className="barber-vote-score">?</strong>
                <span className="barber-vote-button">▼</span>
              </div>
            </div>
          </div>

          <div className="barber-card-summary-actions">
            <div className="barber-card-summary-buttons">
              <span className="barber-card-toggle barber-card-toggle-locked">Details locked</span>
              <span className="barber-link-button barber-link-button-muted barber-link-button-compact barber-link-button-locked">
                Account required
              </span>
            </div>
            <div className="barber-card-statbar">
              <span>Neighborhood hidden</span>
              <span>Comments hidden</span>
            </div>
          </div>
        </div>
      </div>
      <div className="barber-card-locked-scrim" aria-hidden="true" />
    </article>
  );
}

function LockedPreviewGate({
  lockedPreviewCount,
  selectedCityLabel
}: {
  lockedPreviewCount: number;
  selectedCityLabel: string;
}) {
  const normalizedCityLabel = selectedCityLabel.toLowerCase();

  return (
    <div className="grain-card barber-member-gate barber-member-gate-floating">
      <div>
        <span className="section-label">Full directory</span>
        <h2>Sign in to see all barbers</h2>
        <p>
          Unlock {lockedPreviewCount} more community recommended barber{lockedPreviewCount === 1 ? "" : "s"} in{" "}
          {normalizedCityLabel}.
        </p>
      </div>
      <div className="barber-member-gate-actions">
        <Button href="/sign-in" variant="secondary">
          Sign in
        </Button>
        <Button href="/sign-up">Create free account</Button>
      </div>
    </div>
  );
}

function LockedPreviewSection({
  lockedPreviewBarbers,
  selectedCityLabel
}: {
  lockedPreviewBarbers: BarberCandidate[];
  selectedCityLabel: string;
}) {
  return (
    <section className="barber-locked-preview-shell">
      <section className="barber-results-grid barber-results-grid-locked" aria-hidden="true">
        {lockedPreviewBarbers.map((barber) => (
          <LockedPreviewCard key={barber.id} barber={barber} />
        ))}
      </section>
      <div className="barber-locked-preview-overlay">
        <LockedPreviewGate lockedPreviewCount={lockedPreviewBarbers.length} selectedCityLabel={selectedCityLabel} />
      </div>
    </section>
  );
}

export function BarberDirectoryInteractive({
  barbers,
  lockedPreviewBarbers,
  selectedCityLabel,
  viewerHasFullAccess
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

  if (barbers.length === 0 && lockedPreviewBarbers.length === 0) {
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
  const sortedLockedPreviewBarbers = [...lockedPreviewBarbers].sort((left, right) => left.rank - right.rank);

  return (
    <>
      {error ? <p className="barber-interaction-error">{error}</p> : null}
      {sortedBarbers.length > 0 ? (
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
      ) : !viewerHasFullAccess && sortedLockedPreviewBarbers.length > 0 ? (
        <VerifiedOnlyEmptyState lockedPreviewCount={sortedLockedPreviewBarbers.length} selectedCityLabel={selectedCityLabel} />
      ) : null}
      {!viewerHasFullAccess && sortedLockedPreviewBarbers.length > 0 ? (
        <LockedPreviewSection lockedPreviewBarbers={sortedLockedPreviewBarbers} selectedCityLabel={selectedCityLabel} />
      ) : null}
      <SuggestBarberForm signedIn={Boolean(isSignedIn)} />
    </>
  );
}

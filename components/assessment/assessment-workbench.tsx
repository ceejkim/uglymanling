"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { Button } from "@/components/ui/button";
import {
  captureAssessmentEvent,
  getPostHogDistinctId
} from "@/lib/analytics/assessment-events";
import {
  assessmentQuestions,
  assessmentSections,
  assessmentSectionsById,
  assessmentVersion,
  getNextIncompleteQuestionIndex,
  getQuestionLabel,
  type AssessmentAnswerMap,
  type AssessmentQuestion
} from "@/lib/assessment/questions";
import { buildAssessmentCompletionSummary } from "@/lib/assessment/summary";

const activeSessionIdKey = "uglymanling.assessment.active_session_id";
const activeSessionTokenKey = "uglymanling.assessment.active_resume_token";
const anonymousIdKey = "uglymanling.assessment.anonymous_id";

type SessionRecord = {
  completionStatus: "started" | "completed" | "abandoned";
  id: string;
  resumeToken: string;
  totalElapsedMs: number;
};

type SessionBootstrapResponse = {
  answers: AssessmentAnswerMap;
  didResume: boolean;
  session: SessionRecord;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

function safeStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage issues so the assessment still works.
  }
}

function safeStorageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage issues so the assessment still works.
  }
}

function makeAnonymousId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `anon_${Math.random().toString(36).slice(2, 11)}`;
}

function getOrCreateAnonymousId() {
  const existing = safeStorageGet(anonymousIdKey);

  if (existing) {
    return existing;
  }

  const nextId = makeAnonymousId();
  safeStorageSet(anonymousIdKey, nextId);
  return nextId;
}

function buildEntryContext() {
  const params = new URLSearchParams(window.location.search);

  return {
    entryPath: window.location.pathname,
    entrySource: params.get("src") ?? "direct",
    utmCampaign: params.get("utm_campaign"),
    utmMedium: params.get("utm_medium"),
    utmSource: params.get("utm_source")
  };
}

function getQuestionCardClass(input: AssessmentQuestion["input"], active: boolean) {
  if (input === "norwood") {
    return `assessment-stage-card${active ? " is-active" : ""}`;
  }

  if (input === "chips") {
    return `assessment-chip${active ? " is-active" : ""}`;
  }

  return `assessment-option-card${active ? " is-active" : ""}`;
}

function getQuestionCountForSection(sectionId: string) {
  return assessmentQuestions.filter((question) => question.sectionId === sectionId).length;
}

function getStatusLabel(saveStatus: SaveStatus) {
  switch (saveStatus) {
    case "saving":
      return "Saving progress";
    case "saved":
      return "Progress saved";
    case "error":
      return "Save needs retry";
    case "idle":
    default:
      return "Private by default";
  }
}

async function bootstrapSession() {
  const anonymousId = getOrCreateAnonymousId();
  const entryContext = buildEntryContext();
  const response = await fetch("/api/assessment/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "start_or_resume",
      anonymousId,
      assessmentVersion,
      entryPath: entryContext.entryPath,
      entrySource: entryContext.entrySource,
      posthogDistinctId: getPostHogDistinctId(),
      resumeToken: safeStorageGet(activeSessionTokenKey),
      sessionId: safeStorageGet(activeSessionIdKey),
      utmCampaign: entryContext.utmCampaign,
      utmMedium: entryContext.utmMedium,
      utmSource: entryContext.utmSource
    })
  });

  if (!response.ok) {
    throw new Error("Unable to start assessment session.");
  }

  const payload = (await response.json()) as SessionBootstrapResponse;
  safeStorageSet(activeSessionIdKey, payload.session.id);
  safeStorageSet(activeSessionTokenKey, payload.session.resumeToken);

  return payload;
}

function QuestionOptions({
  question,
  selectedValue,
  onSelect
}: {
  onSelect: (value: string) => void;
  question: AssessmentQuestion;
  selectedValue?: string;
}) {
  const groupClassName =
    question.input === "norwood"
      ? "assessment-stage-rail"
      : question.input === "chips"
        ? "assessment-chip-group"
        : "assessment-option-grid";

  return (
    <div className={groupClassName}>
      {question.options.map((option) => {
        const active = selectedValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={getQuestionCardClass(question.input, active)}
            onClick={() => onSelect(option.value)}
          >
            {question.input === "norwood" ? (
              <>
                <span className="assessment-stage-pill">{option.shortLabel ?? option.label}</span>
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </>
            ) : (
              <>
                <strong>{option.label}</strong>
                {option.description ? <span>{option.description}</span> : null}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function AssessmentWorkbench() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<AssessmentAnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [session, setSession] = useState<SessionRecord | null>(null);
  const hasBootstrappedRef = useRef(false);
  const hasTrackedLandingRef = useRef(false);
  const completedSectionsRef = useRef<Set<string>>(new Set());
  const questionEnteredAtRef = useRef<number>(Date.now());
  const startedAtRef = useRef<number>(Date.now());

  const completedQuestions = assessmentQuestions.filter((question) => answers[question.id]).length;
  const currentQuestion = assessmentQuestions[currentIndex];
  const currentSectionIndex = assessmentSections.findIndex(
    (section) => section.id === currentQuestion?.sectionId
  );
  const progressPercent =
    assessmentQuestions.length === 0
      ? 0
      : Math.round((completedQuestions / assessmentQuestions.length) * 100);
  const remainingQuestions = Math.max(assessmentQuestions.length - completedQuestions, 0);
  const completionSummary = buildAssessmentCompletionSummary(answers);

  async function submitQuestionFeedback(questionId: string, sentiment: -1 | 1) {
    if (!session) {
      return;
    }

    await fetch("/api/assessment/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "question_feedback",
        questionId,
        resumeToken: session.resumeToken,
        sentiment,
        sessionId: session.id
      })
    });

    const entryContext = buildEntryContext();

    captureAssessmentEvent(
      "assessment_feedback_submitted",
      {
        clerkUserId: userId,
        entrySource: entryContext.entrySource,
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        sessionId: session.id,
        utmCampaign: entryContext.utmCampaign,
        utmMedium: entryContext.utmMedium,
        utmSource: entryContext.utmSource
      },
      {
        question_id: questionId,
        sentiment,
        scope: "question"
      }
    );
  }

  useEffect(() => {
    if (hasTrackedLandingRef.current || typeof window === "undefined") {
      return;
    }

    hasTrackedLandingRef.current = true;
    const entryContext = buildEntryContext();

    captureAssessmentEvent(
      "assessment_landing_viewed",
      {
        clerkUserId: userId,
        entrySource: entryContext.entrySource,
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        utmCampaign: entryContext.utmCampaign,
        utmMedium: entryContext.utmMedium,
        utmSource: entryContext.utmSource
      },
      {
        path: entryContext.entryPath
      }
    );
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (hasBootstrappedRef.current || typeof window === "undefined") {
      return;
    }

    hasBootstrappedRef.current = true;

    void (async () => {
      try {
        const payload = await bootstrapSession();
        const resumedAnswers = payload.answers ?? {};
        const nextIndex = getNextIncompleteQuestionIndex(resumedAnswers);
        const entryContext = buildEntryContext();

        setAnswers(resumedAnswers);
        setCurrentIndex(nextIndex);
        setSession(payload.session);
        setIsComplete(payload.session.completionStatus === "completed");
        startedAtRef.current = Date.now() - payload.session.totalElapsedMs;
        questionEnteredAtRef.current = Date.now();

        assessmentSections.forEach((section) => {
          const isSectionComplete =
            assessmentQuestions.filter((question) => question.sectionId === section.id).every((question) => resumedAnswers[question.id]);

          if (isSectionComplete) {
            completedSectionsRef.current.add(section.id);
          }
        });

        captureAssessmentEvent(
          payload.didResume ? "assessment_resumed" : "assessment_started",
          {
            clerkUserId: userId,
            entrySource: entryContext.entrySource,
            isAuthenticated: isSignedIn,
            posthogDistinctId: getPostHogDistinctId(),
            sessionId: payload.session.id,
            utmCampaign: entryContext.utmCampaign,
            utmMedium: entryContext.utmMedium,
            utmSource: entryContext.utmSource
          },
          {
            answers_completed: Object.keys(resumedAnswers).length
          }
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load the assessment.");
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (!session || isComplete || !currentQuestion) {
      return;
    }

    const entryContext = buildEntryContext();
    questionEnteredAtRef.current = Date.now();

    captureAssessmentEvent(
      "assessment_question_viewed",
      {
        clerkUserId: userId,
        entrySource: entryContext.entrySource,
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        sessionId: session.id,
        utmCampaign: entryContext.utmCampaign,
        utmMedium: entryContext.utmMedium,
        utmSource: entryContext.utmSource
      },
      {
        question_id: currentQuestion.id,
        questions_remaining: remainingQuestions,
        section_id: currentQuestion.sectionId,
        step_index: currentIndex
      }
    );
  }, [currentIndex, currentQuestion, isComplete, isSignedIn, remainingQuestions, session, userId]);

  useEffect(() => {
    if (!session || !userId) {
      return;
    }

    void fetch("/api/assessment/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "start_or_resume",
        anonymousId: safeStorageGet(anonymousIdKey) ?? getOrCreateAnonymousId(),
        assessmentVersion,
        posthogDistinctId: getPostHogDistinctId(),
        resumeToken: session.resumeToken,
        sessionId: session.id
      })
    }).catch(() => {
      // Best effort session linking only.
    });
  }, [session, userId]);

  useEffect(() => {
    if (!session || isComplete) {
      return;
    }

    const handlePageHide = () => {
      const current = assessmentQuestions[currentIndex];
      const body = JSON.stringify({
        action: "abandon",
        lastQuestionId: current?.id ?? null,
        lastSectionId: current?.sectionId ?? null,
        resumeToken: session.resumeToken,
        sessionId: session.id,
        totalElapsedMs: Date.now() - startedAtRef.current
      });

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/assessment/sessions",
            new Blob([body], { type: "application/json" })
          );
        } else {
          void fetch("/api/assessment/sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body,
            keepalive: true
          });
        }
      } catch {
        // Best effort only.
      }

      const entryContext = buildEntryContext();

      captureAssessmentEvent(
        "assessment_abandoned",
        {
          clerkUserId: userId,
          entrySource: entryContext.entrySource,
          isAuthenticated: isSignedIn,
          posthogDistinctId: getPostHogDistinctId(),
          sessionId: session.id,
          utmCampaign: entryContext.utmCampaign,
          utmMedium: entryContext.utmMedium,
          utmSource: entryContext.utmSource
        },
        {
          answers_completed: completedQuestions,
          last_question_id: current?.id ?? undefined,
          last_section_id: current?.sectionId ?? undefined,
          total_elapsed_ms: Date.now() - startedAtRef.current
        }
      );
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [completedQuestions, currentIndex, isComplete, isSignedIn, session, userId]);

  async function persistAnswer(question: AssessmentQuestion, answerValue: string, previousValue?: string) {
    if (!session) {
      return;
    }

    const entryContext = buildEntryContext();
    const elapsedMs = Date.now() - questionEnteredAtRef.current;
    const answerLabel = getQuestionLabel(question.id, answerValue);
    const nextAnswers = {
      ...answers,
      [question.id]: answerValue
    };

    setAnswers(nextAnswers);
    setSaveStatus("saving");
    setErrorMessage(null);

    captureAssessmentEvent(
      previousValue && previousValue !== answerValue
        ? "assessment_question_changed"
        : "assessment_question_answered",
      {
        clerkUserId: userId,
        entrySource: entryContext.entrySource,
        isAuthenticated: isSignedIn,
        posthogDistinctId: getPostHogDistinctId(),
        sessionId: session.id,
        utmCampaign: entryContext.utmCampaign,
        utmMedium: entryContext.utmMedium,
        utmSource: entryContext.utmSource
      },
      {
        answer_label: answerLabel,
        answer_value: answerValue,
        elapsed_ms: elapsedMs,
        question_id: question.id,
        questions_remaining: Math.max(assessmentQuestions.length - Object.keys(nextAnswers).length, 0),
        section_id: question.sectionId,
        step_index: currentIndex,
        was_auto_advanced: question.autoAdvance ?? false
      }
    );

    try {
      const response = await fetch("/api/assessment/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "save_answer",
          answerLabel,
          answerValue,
          changedFrom: previousValue ?? null,
          elapsedMs,
          questionId: question.id,
          resumeToken: session.resumeToken,
          sectionId: question.sectionId,
          sessionId: session.id,
          stepIndex: currentIndex,
          totalElapsedMs: Date.now() - startedAtRef.current
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save answer.");
      }

      setSaveStatus("saved");

      captureAssessmentEvent(
        "assessment_progress_saved",
        {
          clerkUserId: userId,
          entrySource: entryContext.entrySource,
          isAuthenticated: isSignedIn,
          posthogDistinctId: getPostHogDistinctId(),
          sessionId: session.id,
          utmCampaign: entryContext.utmCampaign,
          utmMedium: entryContext.utmMedium,
          utmSource: entryContext.utmSource
        },
        {
          question_id: question.id,
          section_id: question.sectionId,
          step_index: currentIndex
        }
      );
    } catch (error) {
      setSaveStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to save answer.");
    }

    const sectionQuestions = assessmentQuestions.filter(
      (candidate) => candidate.sectionId === question.sectionId
    );
    const isSectionComplete = sectionQuestions.every((candidate) => nextAnswers[candidate.id]);

    if (isSectionComplete && !completedSectionsRef.current.has(question.sectionId)) {
      completedSectionsRef.current.add(question.sectionId);

      captureAssessmentEvent(
        "assessment_section_completed",
        {
          clerkUserId: userId,
          entrySource: entryContext.entrySource,
          isAuthenticated: isSignedIn,
          posthogDistinctId: getPostHogDistinctId(),
          sessionId: session.id,
          utmCampaign: entryContext.utmCampaign,
          utmMedium: entryContext.utmMedium,
          utmSource: entryContext.utmSource
        },
        {
          answers_in_section: getQuestionCountForSection(question.sectionId),
          section_id: question.sectionId,
          section_index: assessmentSections.findIndex((section) => section.id === question.sectionId),
          section_elapsed_ms: Date.now() - startedAtRef.current
        }
      );
    }

    const isLastQuestion = currentIndex >= assessmentQuestions.length - 1;

    if (isLastQuestion) {
      try {
        const response = await fetch("/api/assessment/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "complete",
            answers: nextAnswers,
            resumeToken: session.resumeToken,
            sessionId: session.id,
            totalElapsedMs: Date.now() - startedAtRef.current
          })
        });

        if (!response.ok) {
          throw new Error("Failed to complete assessment.");
        }

        setIsComplete(true);
        setSession({
          ...session,
          completionStatus: "completed"
        });
        safeStorageRemove(activeSessionIdKey);
        safeStorageRemove(activeSessionTokenKey);

        captureAssessmentEvent(
          "assessment_completed",
          {
            clerkUserId: userId,
            entrySource: entryContext.entrySource,
            isAuthenticated: isSignedIn,
            posthogDistinctId: getPostHogDistinctId(),
            sessionId: session.id,
            utmCampaign: entryContext.utmCampaign,
            utmMedium: entryContext.utmMedium,
            utmSource: entryContext.utmSource
          },
          {
            total_elapsed_ms: Date.now() - startedAtRef.current
          }
        );

        router.push(`/assessment/results/${session.id}?rt=${session.resumeToken}`);
      } catch (error) {
        setSaveStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Failed to complete assessment.");
      }

      return;
    }

    window.setTimeout(() => {
      setCurrentIndex((index) => Math.min(index + 1, assessmentQuestions.length - 1));
    }, question.autoAdvance ? 220 : 0);
  }

  if (isBootstrapping) {
    return (
      <div className="assessment-loading grain-card">
        <span className="eyebrow">Assessment</span>
        <h1>Setting up your profile.</h1>
        <p>Building a private session and loading the first step.</p>
      </div>
    );
  }

  if (errorMessage && !session) {
    return (
      <div className="assessment-loading grain-card">
        <span className="eyebrow">Assessment</span>
        <h1>We could not start the assessment.</h1>
        <p>{errorMessage}</p>
        <button
          type="button"
          className="assessment-inline-button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return null;
  }

  return (
    <AssessmentShell
      progress={
        <AssessmentProgress
          completedQuestions={completedQuestions}
          currentSectionIndex={isComplete ? assessmentSections.length - 1 : currentSectionIndex}
          progressPercent={isComplete ? 100 : progressPercent}
          remainingQuestions={isComplete ? 0 : remainingQuestions}
          sectionCount={assessmentSections.length}
          statusLabel={isLoaded ? getStatusLabel(saveStatus) : "Loading session"}
        />
      }
      footer={
        !isComplete ? (
          <>
            <button
              type="button"
              className="assessment-nav-button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
            >
              Back
            </button>
            <p className="assessment-mobile-bar-copy">
              {errorMessage ? errorMessage : currentQuestion.autoAdvance ? "Tap an answer to continue." : "Choose an option to continue."}
            </p>
          </>
        ) : undefined
      }
    >
      {isComplete ? (
        <section className="assessment-complete grain-card">
          <div className="assessment-complete-header">
            <span className="eyebrow">Foundation complete</span>
            <span className="assessment-complete-badge">{completionSummary.badge}</span>
          </div>
          <h1>{completionSummary.title}</h1>
          <p>{completionSummary.detail}</p>
          <div className="assessment-complete-list">
            {completionSummary.bullets.map((bullet) => (
              <div key={bullet} className="assessment-complete-item">
                <span />
                <p>{bullet}</p>
              </div>
            ))}
          </div>
          <div className="assessment-answer-summary">
            {assessmentSections.map((section) => (
              <div key={section.id} className="assessment-answer-section">
                <p>{section.title}</p>
                <div>
                  {assessmentQuestions
                    .filter((question) => question.sectionId === section.id)
                    .map((question) => (
                      <span key={question.id}>
                        {getQuestionLabel(question.id, answers[question.id] ?? "not_sure")}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="assessment-complete-actions">
            <Button href="/style/barbers" variant="secondary">
              Find a barber
            </Button>
            <Button href="/consult" variant="primary">
              Talk it through
            </Button>
            <Button href="/community" variant="ghost">
              See real examples
            </Button>
          </div>
        </section>
      ) : (
        <section className="assessment-question-card grain-card">
          <div className="assessment-question-meta">
            <span className="assessment-section-kicker">
              {assessmentSectionsById[currentQuestion.sectionId]?.title}
            </span>
            <p>{currentQuestion.sectionRationale}</p>
          </div>
          <div className="assessment-question-copy">
            <h1>{currentQuestion.prompt}</h1>
            {currentQuestion.helper ? <p>{currentQuestion.helper}</p> : null}
          </div>
          <QuestionOptions
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            onSelect={(value) =>
              void persistAnswer(currentQuestion, value, answers[currentQuestion.id])
            }
          />
          <div className="assessment-question-feedback">
            <span>Was this question useful?</span>
            <div>
              <button
                type="button"
                className="assessment-feedback-chip"
                onClick={() => void submitQuestionFeedback(currentQuestion.id, 1)}
              >
                Useful
              </button>
              <button
                type="button"
                className="assessment-feedback-chip"
                onClick={() => void submitQuestionFeedback(currentQuestion.id, -1)}
              >
                Off
              </button>
            </div>
          </div>
          <div className="assessment-question-foot">
            <div>
              <strong>{currentIndex + 1}</strong>
              <span> of {assessmentQuestions.length}</span>
            </div>
            <p>
              {assessmentSections.findIndex((section) => section.id === currentQuestion.sectionId) +
                1}{" "}
              / {assessmentSections.length} sections
            </p>
          </div>
        </section>
      )}
    </AssessmentShell>
  );
}

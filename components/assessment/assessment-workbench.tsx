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
  assessmentSectionsById,
  assessmentVersion,
  getFilteredVisibleAnswers,
  getNextIncompleteQuestionIndex,
  getQuestionLabel,
  getVisibleAssessmentQuestions,
  getVisibleAssessmentSections,
  isQuestionAnswered,
  parseAnswerValueList,
  parseUploadManifest,
  serializeAnswerValueList,
  serializeUploadManifest,
  type AssessmentAnswerMap,
  type AssessmentOption,
  type AssessmentQuestion,
  type AssessmentUploadSlot,
  type UploadManifest
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
  if (input === "image_scale") {
    return `assessment-stage-card${active ? " is-active" : ""}`;
  }

  if (input === "chips" || input === "multi_select") {
    return `assessment-chip${active ? " is-active" : ""}`;
  }

  return `assessment-option-card${active ? " is-active" : ""}`;
}

function getQuestionCountForSection(sectionId: string, visibleQuestions: AssessmentQuestion[]) {
  return visibleQuestions.filter((question) => question.sectionId === sectionId).length;
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

function ScaleVisual({ option }: { option: AssessmentOption }) {
  if (!option.visual) {
    return <span className="assessment-stage-pill">{option.shortLabel ?? option.label}</span>;
  }

  if (typeof option.visual === "object" && "level" in option.visual) {
    return (
      <figure
        className={`assessment-scale-visual is-${option.visual.scale}`}
        data-level={option.visual.level}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </figure>
    );
  }

  const visual = option.visual as string | { scale: string };
  const visualName = typeof visual === "string" ? visual : visual.scale;
  const scale = visualName.includes("diffuse") ? "ludwig" : "norwood";
  const levelMap: Record<string, number> = {
    advanced: 6,
    diffuse_advanced: 3,
    diffuse_mid: 2,
    diffuse_mild: 1,
    hairline_low: 1,
    hairline_mild: 2,
    hairline_receded: 3,
    unknown: 1,
    vertex_early: 4,
    vertex_mid: 5
  };

  return (
    <figure
      className={`assessment-scale-visual is-${scale}`}
      data-level={levelMap[visualName] ?? 1}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </figure>
  );
}

function getGroupClassName(input: AssessmentQuestion["input"]) {
  if (input === "image_scale") {
    return "assessment-stage-rail";
  }

  if (input === "chips" || input === "multi_select") {
    return "assessment-chip-group";
  }

  return "assessment-option-grid";
}

function toggleMultiValue(question: AssessmentQuestion, selectedValues: string[], option: AssessmentOption) {
  const isActive = selectedValues.includes(option.value);
  const isExclusiveValue = option.exclusive || option.value === question.noneValue;

  if (isExclusiveValue) {
    return isActive ? [] : [option.value];
  }

  const exclusiveValues = new Set(
    question.options
      .filter((candidate) => candidate.exclusive || candidate.value === question.noneValue)
      .map((candidate) => candidate.value)
  );
  const withoutNoneValue = selectedValues.filter((value) => !exclusiveValues.has(value));

  if (isActive) {
    return withoutNoneValue.filter((value) => value !== option.value);
  }

  return [...withoutNoneValue, option.value];
}

function MultiSelectQuestion({
  onSelect,
  question,
  selectedValue
}: {
  onSelect: (value: string) => void;
  question: AssessmentQuestion;
  selectedValue?: string;
}) {
  const [draftValues, setDraftValues] = useState(() => parseAnswerValueList(selectedValue));

  return (
    <div className="assessment-stacked-control">
      <div className="assessment-chip-group">
        {(question.options ?? []).map((option) => {
          const active = draftValues.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              className={getQuestionCardClass(question.input, active)}
              onClick={() => setDraftValues((values) => toggleMultiValue(question, values, option))}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="assessment-inline-button assessment-continue-button"
        disabled={draftValues.length === 0}
        onClick={() => onSelect(serializeAnswerValueList(draftValues))}
      >
        Continue
      </button>
    </div>
  );
}

function SliderQuestion({
  onSelect,
  question,
  selectedValue
}: {
  onSelect: (value: string) => void;
  question: AssessmentQuestion;
  selectedValue?: string;
}) {
  const slider = {
    defaultValue: Math.round(((question.min ?? 1) + (question.max ?? 10)) / 2),
    max: question.max ?? 10,
    maxLabel: question.maxLabel ?? "High",
    min: question.min ?? 1,
    minLabel: question.minLabel ?? "Low",
    step: question.step ?? 1
  };
  const [draftValue, setDraftValue] = useState(
    () => Number(selectedValue ?? slider.defaultValue)
  );

  const valueLabel = `${draftValue}/${slider.max}`;

  return (
    <div className="assessment-slider-control">
      <div className="assessment-slider-value">
        <strong>{draftValue}</strong>
        <span>{valueLabel}</span>
      </div>
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={draftValue}
        onChange={(event) => setDraftValue(Number(event.target.value))}
      />
      <div className="assessment-slider-labels">
        <span>{slider.minLabel}</span>
        <span>{slider.maxLabel}</span>
      </div>
      <button
        type="button"
        className="assessment-inline-button assessment-continue-button"
        onClick={() => onSelect(String(draftValue))}
      >
        Continue
      </button>
    </div>
  );
}

function uploadManifestWithAsset(manifest: UploadManifest, asset: UploadManifest["assets"][number]) {
  const withoutSlot = manifest.assets.filter((candidate) => candidate.imageSlot !== asset.imageSlot);

  return {
    assets: [...withoutSlot, asset],
    status: "uploaded" as const
  };
}

function UploadQuestion({
  onSelect,
  question,
  selectedValue,
  session
}: {
  onSelect: (value: string) => void;
  question: AssessmentQuestion;
  selectedValue?: string;
  session: SessionRecord | null;
}) {
  const [manifest, setManifest] = useState(() => parseUploadManifest(selectedValue));
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(option: AssessmentUploadSlot, file?: File) {
    if (!file || !session) {
      return;
    }

    setUploadError(null);
    setUploadingSlot(option.id);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("imageSlot", option.id);
      body.append("questionId", question.id);
      body.append("resumeToken", session.resumeToken);
      body.append("sessionId", session.id);

      const response = await fetch("/api/assessment/uploads", {
        method: "POST",
        body
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Upload failed.");
      }

      const payload = (await response.json()) as { asset: UploadManifest["assets"][number] };
      const nextManifest = uploadManifestWithAsset(manifest, payload.asset);
      setManifest(nextManifest);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingSlot(null);
    }
  }

  function skipPhotos() {
    const nextManifest: UploadManifest = {
      assets: [],
      status: "skipped"
    };
    setManifest(nextManifest);
    onSelect(serializeUploadManifest(nextManifest));
  }

  return (
    <div className="assessment-upload-control">
      <div className="assessment-upload-grid">
        {(question.uploadSlots ?? []).map((option) => {
          const uploadedAsset = manifest.assets.find((asset) => asset.imageSlot === option.id);

          return (
            <label key={option.id} className="assessment-upload-card">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                onChange={(event) => void handleFileChange(option, event.target.files?.[0])}
              />
              <strong>{option.label}</strong>
              <span>
                {uploadingSlot === option.id
                  ? "Uploading..."
                  : uploadedAsset
                    ? "Added"
                    : option.description}
              </span>
            </label>
          );
        })}
      </div>
      {uploadError ? <p className="assessment-upload-error">{uploadError}</p> : null}
      {manifest.assets.length > 0 ? (
        <button
          type="button"
          className="assessment-inline-button assessment-continue-button"
          onClick={() => onSelect(serializeUploadManifest(manifest))}
        >
          Continue with photos
        </button>
      ) : null}
      <button
        type="button"
        className="assessment-inline-button assessment-continue-button"
        onClick={skipPhotos}
      >
        Skip photos for now
      </button>
    </div>
  );
}

function QuestionOptions({
  question,
  selectedValue,
  onSelect,
  session
}: {
  onSelect: (value: string) => void;
  question: AssessmentQuestion;
  selectedValue?: string;
  session: SessionRecord | null;
}) {
  if (question.input === "multi_select") {
    return <MultiSelectQuestion question={question} selectedValue={selectedValue} onSelect={onSelect} />;
  }

  if (question.input === "scale") {
    return <SliderQuestion question={question} selectedValue={selectedValue} onSelect={onSelect} />;
  }

  if (question.input === "upload") {
    return (
      <UploadQuestion
        question={question}
        selectedValue={selectedValue}
        session={session}
        onSelect={onSelect}
      />
    );
  }

  const groupClassName = getGroupClassName(question.input);

  return (
    <div className={groupClassName}>
      {(question.options ?? []).map((option) => {
        const active = selectedValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={getQuestionCardClass(question.input, active)}
            onClick={() => onSelect(option.value)}
          >
            {question.input === "image_scale" ? (
              <>
                <ScaleVisual option={option} />
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
  const [hasEnteredSurvey, setHasEnteredSurvey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [session, setSession] = useState<SessionRecord | null>(null);
  const hasBootstrappedRef = useRef(false);
  const hasTrackedLandingRef = useRef(false);
  const completedSectionsRef = useRef<Set<string>>(new Set());
  const questionEnteredAtRef = useRef<number>(Date.now());
  const startedAtRef = useRef<number>(Date.now());

  const visibleQuestions = getVisibleAssessmentQuestions(answers);
  const visibleSections = getVisibleAssessmentSections(answers);
  const filteredAnswers = getFilteredVisibleAnswers(answers);
  const completedQuestions = visibleQuestions.filter((question) => isQuestionAnswered(question, answers)).length;
  const currentQuestion = visibleQuestions[currentIndex];
  const currentSectionIndex = visibleSections.findIndex(
    (section) => section.id === currentQuestion?.sectionId
  );
  const progressPercent =
    visibleQuestions.length === 0
      ? 0
      : Math.round((completedQuestions / visibleQuestions.length) * 100);
  const remainingQuestions = Math.max(visibleQuestions.length - completedQuestions, 0);
  const completionSummary = buildAssessmentCompletionSummary(filteredAnswers);

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
    if (visibleQuestions.length === 0) {
      return;
    }

    if (currentIndex > visibleQuestions.length - 1) {
      setCurrentIndex(visibleQuestions.length - 1);
    }
  }, [currentIndex, visibleQuestions.length]);

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
        setHasEnteredSurvey(true);
        startedAtRef.current = Date.now() - payload.session.totalElapsedMs;
        questionEnteredAtRef.current = Date.now();

        const resumedVisibleQuestions = getVisibleAssessmentQuestions(resumedAnswers);
        const resumedVisibleSections = getVisibleAssessmentSections(resumedAnswers);

        resumedVisibleSections.forEach((section) => {
          const isSectionComplete =
            resumedVisibleQuestions
              .filter((question) => question.sectionId === section.id)
              .every((question) => isQuestionAnswered(question, resumedAnswers));

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
      const current = currentQuestion;
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
  }, [completedQuestions, currentQuestion, isComplete, isSignedIn, session, userId]);

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
    const nextVisibleQuestions = getVisibleAssessmentQuestions(nextAnswers);
    const nextVisibleSections = getVisibleAssessmentSections(nextAnswers);
    const nextCompletedQuestions = nextVisibleQuestions.filter((candidate) =>
      isQuestionAnswered(candidate, nextAnswers)
    ).length;

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
        questions_remaining: Math.max(nextVisibleQuestions.length - nextCompletedQuestions, 0),
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

    const sectionQuestions = nextVisibleQuestions.filter(
      (candidate) => candidate.sectionId === question.sectionId
    );
    const isSectionComplete = sectionQuestions.every((candidate) =>
      isQuestionAnswered(candidate, nextAnswers)
    );

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
          answers_in_section: getQuestionCountForSection(question.sectionId, nextVisibleQuestions),
          section_id: question.sectionId,
          section_index: nextVisibleSections.findIndex((section) => section.id === question.sectionId),
          section_elapsed_ms: Date.now() - startedAtRef.current
        }
      );
    }

    const visibleAnswerPayload = getFilteredVisibleAnswers(nextAnswers);
    const isLastQuestion = nextVisibleQuestions.every((candidate) =>
      isQuestionAnswered(candidate, nextAnswers)
    );

    if (isLastQuestion) {
      try {
        const response = await fetch("/api/assessment/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "complete",
            answers: visibleAnswerPayload,
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
      const currentVisibleIndex = nextVisibleQuestions.findIndex(
        (candidate) => candidate.id === question.id
      );
      const fallbackIndex = getNextIncompleteQuestionIndex(nextAnswers);
      const nextIndex =
        currentVisibleIndex === -1
          ? fallbackIndex
          : Math.min(currentVisibleIndex + 1, nextVisibleQuestions.length - 1);

      setCurrentIndex(nextIndex);
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

  if (!hasEnteredSurvey && !isComplete) {
    return (
      <AssessmentShell
        progress={
          <AssessmentProgress
            completedQuestions={0}
            currentSectionIndex={0}
            progressPercent={0}
            remainingQuestions={visibleQuestions.length}
            sectionCount={visibleSections.length}
            statusLabel={isLoaded ? getStatusLabel(saveStatus) : "Loading session"}
          />
        }
      >
        <section className="assessment-intro-card grain-card">
          <span className="eyebrow">Anonymous community survey</span>
          <h1>Help build the clearest hair loss dataset we can.</h1>
          <p>
            This survey helps the hair loss community better understand the underlying factors,
            patterns, treatments, and lifestyle variables associated with hair loss. By contributing
            anonymous information, members can help uncover trends related to progression, recovery,
            treatment effectiveness, stress, sleep, diet, hormones, medical history, and more. The
            goal is to create one of the most comprehensive community-driven hair loss datasets
            available.
          </p>
          <div className="assessment-intro-grid">
            <div>
              <strong>6-8 minutes</strong>
              <span>Mostly taps, sliders, and optional photo uploads.</span>
            </div>
            <div>
              <strong>Anonymous by default</strong>
              <span>Your responses help generate aggregate insights and educational resources.</span>
            </div>
            <div>
              <strong>Community-driven</strong>
              <span>Better data can reveal patterns that isolated posts usually miss.</span>
            </div>
          </div>
          <button
            type="button"
            className="assessment-inline-button assessment-start-button"
            onClick={() => setHasEnteredSurvey(true)}
          >
            Start anonymous survey
          </button>
        </section>
      </AssessmentShell>
    );
  }

  return (
    <AssessmentShell
      progress={
        <AssessmentProgress
          completedQuestions={completedQuestions}
          currentSectionIndex={isComplete ? visibleSections.length - 1 : Math.max(currentSectionIndex, 0)}
          progressPercent={isComplete ? 100 : progressPercent}
          remainingQuestions={isComplete ? 0 : remainingQuestions}
          sectionCount={visibleSections.length}
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
              {errorMessage ? errorMessage : "Progress saves as you go."}
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
            {visibleSections.map((section) => (
              <div key={section.id} className="assessment-answer-section">
                <p>{section.title}</p>
                <div>
                  {visibleQuestions
                    .filter((question) => question.sectionId === section.id)
                    .slice(0, 5)
                    .map((question) => (
                      <span key={question.id}>
                        {getQuestionLabel(question.id, filteredAnswers[question.id] ?? "not_sure")}
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
            key={currentQuestion.id}
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            session={session}
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
              <span> of {visibleQuestions.length}</span>
            </div>
            <p>
              {visibleSections.findIndex((section) => section.id === currentQuestion.sectionId) + 1} /{" "}
              {visibleSections.length} sections
            </p>
          </div>
        </section>
      )}
    </AssessmentShell>
  );
}

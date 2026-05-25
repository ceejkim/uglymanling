"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
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
type QuestionFeedbackStatus = "idle" | "saving" | "saved" | "error";

type SectionCelebration = {
  nextTitle?: string;
  sectionId: string;
  title: string;
};

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
  if (option.imageSrc) {
    return (
      <Image
        className="assessment-scale-image"
        src={option.imageSrc}
        alt={option.imageAlt ?? `${option.label} visual guide`}
        width={160}
        height={120}
        loading="lazy"
      />
    );
  }

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
              onClick={() =>
                setDraftValues((values) => {
                  const nextValues = toggleMultiValue(question, values, option);
                  onSelect(serializeAnswerValueList(nextValues));
                  return nextValues;
                })
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
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
        Save rating
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
          Save photos
        </button>
      ) : null}
      <button
        type="button"
        className="assessment-inline-button assessment-continue-button"
        onClick={skipPhotos}
      >
        Skip photos
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
  const [isBuildingResults, setIsBuildingResults] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasEnteredSurvey, setHasEnteredSurvey] = useState(false);
  const [questionFeedbackBody, setQuestionFeedbackBody] = useState("");
  const [questionFeedbackStatus, setQuestionFeedbackStatus] = useState<QuestionFeedbackStatus>("idle");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [sectionCelebration, setSectionCelebration] = useState<SectionCelebration | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const hasBootstrappedRef = useRef(false);
  const hasTrackedLandingRef = useRef(false);
  const completedSectionsRef = useRef<Set<string>>(new Set());
  const questionEnteredAtRef = useRef<number>(Date.now());
  const resultRedirectTimeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const visibleQuestions = getVisibleAssessmentQuestions(answers);
  const visibleSections = getVisibleAssessmentSections(answers);
  const filteredAnswers = getFilteredVisibleAnswers(answers);
  const completedQuestions = visibleQuestions.filter((question) => isQuestionAnswered(question, answers)).length;
  const completedSectionIds = visibleSections
    .filter((section) => {
      const sectionQuestions = visibleQuestions.filter((question) => question.sectionId === section.id);

      return sectionQuestions.length > 0 && sectionQuestions.every((question) => isQuestionAnswered(question, answers));
    })
    .map((section) => section.id);
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
  const isCurrentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(currentQuestion, answers)
    : false;
  const isFinalVisibleQuestion = currentIndex >= visibleQuestions.length - 1;

  async function submitQuestionFeedback(questionId: string) {
    if (!session) {
      return;
    }

    const trimmedFeedback = questionFeedbackBody.trim();

    if (!trimmedFeedback) {
      setQuestionFeedbackStatus("error");
      return;
    }

    setQuestionFeedbackStatus("saving");

    const response = await fetch("/api/assessment/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "question_feedback",
        body: trimmedFeedback,
        questionId,
        resumeToken: session.resumeToken,
        sessionId: session.id
      })
    });

    if (!response.ok) {
      setQuestionFeedbackStatus("error");
      return;
    }

    setQuestionFeedbackBody("");
    setQuestionFeedbackStatus("saved");

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
        feedback_length: trimmedFeedback.length,
        question_id: questionId,
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
    return () => {
      if (resultRedirectTimeoutRef.current) {
        window.clearTimeout(resultRedirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (visibleQuestions.length === 0) {
      return;
    }

    if (currentIndex > visibleQuestions.length - 1) {
      setCurrentIndex(visibleQuestions.length - 1);
    }
  }, [currentIndex, visibleQuestions.length]);

  useEffect(() => {
    setQuestionFeedbackBody("");
    setQuestionFeedbackStatus("idle");
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!sectionCelebration) {
      return;
    }

    const timeout = window.setTimeout(() => setSectionCelebration(null), 5200);

    return () => window.clearTimeout(timeout);
  }, [sectionCelebration]);

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

  async function completeAssessment(nextAnswers: AssessmentAnswerMap) {
    if (!session) {
      return;
    }

    const entryContext = buildEntryContext();
    const visibleAnswerPayload = getFilteredVisibleAnswers(nextAnswers);

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
      setIsBuildingResults(true);
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

      resultRedirectTimeoutRef.current = window.setTimeout(() => {
        router.push(`/assessment/results/${session.id}?rt=${session.resumeToken}`);
      }, 2300);
    } catch (error) {
      setIsBuildingResults(false);
      setSaveStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to complete assessment.");
    }
  }

  function moveToNextQuestion(question: AssessmentQuestion, nextVisibleQuestions: AssessmentQuestion[], nextAnswers: AssessmentAnswerMap) {
    const currentVisibleIndex = nextVisibleQuestions.findIndex(
      (candidate) => candidate.id === question.id
    );
    const allVisibleQuestionsAnswered = nextVisibleQuestions.every((candidate) =>
      isQuestionAnswered(candidate, nextAnswers)
    );

    if (allVisibleQuestionsAnswered && currentVisibleIndex >= nextVisibleQuestions.length - 1) {
      void completeAssessment(nextAnswers);
      return;
    }

    const fallbackIndex = getNextIncompleteQuestionIndex(nextAnswers);
    const nextIndex =
      currentVisibleIndex === -1
        ? fallbackIndex
        : Math.min(currentVisibleIndex + 1, nextVisibleQuestions.length - 1);

    setCurrentIndex(nextIndex === currentVisibleIndex ? fallbackIndex : nextIndex);
  }

  function handleNextQuestion() {
    if (!currentQuestion) {
      return;
    }

    if (!isQuestionAnswered(currentQuestion, answers)) {
      setErrorMessage("Choose or save an answer to continue.");
      return;
    }

    setErrorMessage(null);
    moveToNextQuestion(currentQuestion, getVisibleAssessmentQuestions(answers), answers);
  }

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
        was_auto_advanced: false
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
      return;
    }

    const sectionQuestions = nextVisibleQuestions.filter(
      (candidate) => candidate.sectionId === question.sectionId
    );
    const isSectionComplete = sectionQuestions.every((candidate) =>
      isQuestionAnswered(candidate, nextAnswers)
    );

    if (isSectionComplete && !completedSectionsRef.current.has(question.sectionId)) {
      completedSectionsRef.current.add(question.sectionId);
      const completedSectionIndex = nextVisibleSections.findIndex((section) => section.id === question.sectionId);
      const completedSection = nextVisibleSections[completedSectionIndex];
      const nextSection = nextVisibleSections[completedSectionIndex + 1];

      if (completedSection) {
        setSectionCelebration({
          nextTitle: nextSection?.title,
          sectionId: completedSection.id,
          title: completedSection.title
        });
      }

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
            completedSectionIds={[]}
            completedQuestions={0}
            currentSectionIndex={0}
            progressPercent={0}
            remainingQuestions={visibleQuestions.length}
            sections={visibleSections}
            statusLabel={isLoaded ? getStatusLabel(saveStatus) : "Loading session"}
          />
        }
      >
        <section className="assessment-intro-card grain-card">
          <span className="eyebrow">Anonymous hair loss self-assessment</span>
          <h1>Get a clearer baseline, then help the dataset get smarter.</h1>
          <p>
            This gives you a practical read on pattern, pace, treatment context, and next steps.
            If you opt in, your anonymous answers also strengthen community reports on progression,
            treatment response, stress, sleep, scalp symptoms, labs, styling, and other signals that
            isolated forum posts usually miss.
          </p>
          <div className="assessment-intro-grid">
            <div>
              <strong>Personal baseline</strong>
              <span>See the signals that matter for your next decision.</span>
            </div>
            <div>
              <strong>Anonymous by default</strong>
              <span>You choose whether answers enter aggregate community reports.</span>
            </div>
            <div>
              <strong>6-8 minutes</strong>
              <span>Mostly taps, sliders, and optional photo uploads.</span>
            </div>
          </div>
          <button
            type="button"
            className="assessment-inline-button assessment-start-button"
            onClick={() => setHasEnteredSurvey(true)}
          >
            Start my baseline
          </button>
        </section>
      </AssessmentShell>
    );
  }

  return (
    <AssessmentShell
      progress={
        <AssessmentProgress
          completedSectionIds={isComplete ? visibleSections.map((section) => section.id) : completedSectionIds}
          completedQuestions={completedQuestions}
          currentSectionIndex={isComplete ? visibleSections.length - 1 : Math.max(currentSectionIndex, 0)}
          progressPercent={isComplete ? 100 : progressPercent}
          remainingQuestions={isComplete ? 0 : remainingQuestions}
          sections={visibleSections}
          statusLabel={isLoaded ? getStatusLabel(saveStatus) : "Loading session"}
        />
      }
      footer={
        !isComplete ? (
          <>
            <div className="assessment-nav-actions">
              <button
                type="button"
                className="assessment-nav-button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
              >
                Back
              </button>
              <button
                type="button"
                className="assessment-nav-button assessment-nav-button-primary"
                disabled={!isCurrentQuestionAnswered || saveStatus === "saving"}
                onClick={() => handleNextQuestion()}
              >
                {isFinalVisibleQuestion ? "Finish" : "Next"}
              </button>
            </div>
            <p className="assessment-mobile-bar-copy">
              {errorMessage
                ? errorMessage
                : isCurrentQuestionAnswered
                  ? "Answer saved. Move when you are ready."
                  : "Choose or save an answer to continue."}
            </p>
          </>
        ) : undefined
      }
    >
      {sectionCelebration && !isComplete ? (
        <div className="assessment-section-complete" role="status" aria-live="polite">
          <span>Section complete</span>
          <strong>Congrats, you completed {sectionCelebration.title}.</strong>
          <p>
            {sectionCelebration.nextTitle
              ? `Next up: ${sectionCelebration.nextTitle}.`
              : "You are on the final stretch."}
          </p>
        </div>
      ) : null}
      {isComplete && isBuildingResults ? (
        <section className="assessment-results-building grain-card" role="status" aria-live="polite">
          <span className="eyebrow">Results</span>
          <h1>Building your hair profile.</h1>
          <div className="assessment-build-steps">
            <span>Building your hair profile...</span>
            <span>Comparing your pattern...</span>
            <span>Finding your highest-leverage next steps...</span>
          </div>
        </section>
      ) : isComplete ? (
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
          <details className="assessment-question-feedback">
            <summary>Question unclear?</summary>
            <div className="assessment-question-feedback-entry">
              <label htmlFor={`question-feedback-${currentQuestion.id}`}>
                What should we improve about this question?
              </label>
              <textarea
                id={`question-feedback-${currentQuestion.id}`}
                className="assessment-question-feedback-input"
                value={questionFeedbackBody}
                placeholder="Tell us what felt unclear, missing, or useful."
                rows={3}
                onChange={(event) => {
                  setQuestionFeedbackBody(event.target.value);
                  if (questionFeedbackStatus !== "idle") {
                    setQuestionFeedbackStatus("idle");
                  }
                }}
              />
              <button
                type="button"
                className="assessment-feedback-submit"
                disabled={questionFeedbackStatus === "saving" || questionFeedbackBody.trim().length === 0}
                onClick={() => void submitQuestionFeedback(currentQuestion.id)}
              >
                {questionFeedbackStatus === "saving" ? "Sending" : "Send feedback"}
              </button>
              {questionFeedbackStatus === "saved" ? <p>Thanks. Your note helps improve the survey.</p> : null}
              {questionFeedbackStatus === "error" ? <p>Please add a short note before sending.</p> : null}
            </div>
          </details>
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

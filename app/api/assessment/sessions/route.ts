import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncSignedInUser } from "@/lib/clerk-supabase";
import {
  assessmentQuestions,
  assessmentVersion,
  getVisibleAssessmentQuestions,
  parseAnswerValueList,
  type AssessmentAnswerMap
} from "@/lib/assessment/questions";
import { buildAssessmentAnswerInsight } from "@/lib/assessment/insights";
import { buildAndPersistAssessmentResult } from "@/lib/assessment/results";
import type { AssessmentDashboardMetrics } from "@/lib/assessment/derived-metrics";
import { buildLegacyAssessmentPayload } from "@/lib/assessment/summary";
import { selectSupabaseRows, upsertSupabaseRow } from "@/lib/supabase";

type AssessmentSessionRow = {
  abandoned_at?: string | null;
  anonymous_id: string;
  assessment_version: string;
  clerk_user_id: string | null;
  completed_at: string | null;
  completion_status: "started" | "completed" | "abandoned";
  created_at?: string;
  entry_path: string | null;
  entry_source: string | null;
  id: string;
  last_question_id: string | null;
  last_section_id: string | null;
  posthog_distinct_id: string;
  resume_token: string;
  started_at?: string;
  total_elapsed_ms: number;
  updated_at?: string;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_source: string | null;
};

type AssessmentAnswerRow = {
  answer_label: string | null;
  answer_value: string | null;
  answer_values: string[];
  changed_from: string | null;
  elapsed_ms: number;
  question_id: string;
  section_id: string;
  session_id: string;
  step_index: number;
};

type StartOrResumeBody = {
  action: "start_or_resume";
  anonymousId?: string;
  assessmentVersion?: string;
  entryPath?: string;
  entrySource?: string;
  posthogDistinctId?: string;
  resumeToken?: string;
  sessionId?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
};

type SaveAnswerBody = {
  action: "save_answer";
  answerLabel?: string;
  answerValue?: string;
  changedFrom?: string | null;
  elapsedMs?: number;
  questionId?: string;
  resumeToken?: string;
  sectionId?: string;
  sessionId?: string;
  stepIndex?: number;
  totalElapsedMs?: number;
};

type CompleteBody = {
  action: "complete";
  answers?: AssessmentAnswerMap;
  resumeToken?: string;
  sessionId?: string;
  totalElapsedMs?: number;
};

type AbandonBody = {
  action: "abandon";
  lastQuestionId?: string | null;
  lastSectionId?: string | null;
  resumeToken?: string;
  sessionId?: string;
  totalElapsedMs?: number;
};

type RequestBody = StartOrResumeBody | SaveAnswerBody | CompleteBody | AbandonBody;

function makeToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `token_${Math.random().toString(36).slice(2, 14)}`;
}

async function getSessionById(sessionId: string) {
  const rows = await selectSupabaseRows<AssessmentSessionRow>({
    table: "assessment_sessions",
    filters: [`id=eq.${sessionId}`],
    limit: 1
  });

  return rows[0] ?? null;
}

async function loadAnswers(sessionId: string) {
  const rows = await selectSupabaseRows<AssessmentAnswerRow>({
    table: "assessment_answers",
    filters: [`session_id=eq.${sessionId}`],
    orderBy: "step_index",
    ascending: true
  });

  return Object.fromEntries(
    rows
      .filter((row) => row.answer_value)
      .map((row) => [row.question_id, row.answer_value as string])
  ) as AssessmentAnswerMap;
}

async function maybeAttachUser(session: AssessmentSessionRow, clerkUserId: string | null) {
  if (!clerkUserId || session.clerk_user_id === clerkUserId) {
    return session;
  }

  await syncSignedInUser(clerkUserId);

  const [updated] = await upsertSupabaseRow<AssessmentSessionRow>({
    table: "assessment_sessions",
    values: {
      ...session,
      clerk_user_id: clerkUserId
    },
    onConflict: "id"
  });

  return updated ?? session;
}

function toClientSession(session: AssessmentSessionRow) {
  return {
    completionStatus: session.completion_status,
    id: session.id,
    resumeToken: session.resume_token,
    totalElapsedMs: session.total_elapsed_ms ?? 0
  };
}

async function startNewSession({
  anonymousId,
  assessmentVersionValue,
  clerkUserId,
  entryPath,
  entrySource,
  posthogDistinctId,
  utmCampaign,
  utmMedium,
  utmSource
}: {
  anonymousId: string;
  assessmentVersionValue: string;
  clerkUserId: string | null;
  entryPath?: string;
  entrySource?: string;
  posthogDistinctId?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
}) {
  if (clerkUserId) {
    await syncSignedInUser(clerkUserId);
  }

  const [session] = await upsertSupabaseRow<AssessmentSessionRow>({
    table: "assessment_sessions",
    values: {
      id: crypto.randomUUID(),
      anonymous_id: anonymousId,
      assessment_version: assessmentVersionValue,
      clerk_user_id: clerkUserId,
      completion_status: "started",
      completed_at: null,
      entry_path: entryPath ?? null,
      entry_source: entrySource ?? "direct",
      last_question_id: null,
      last_section_id: null,
      posthog_distinct_id: posthogDistinctId ?? anonymousId,
      resume_token: makeToken(),
      total_elapsed_ms: 0,
      utm_campaign: utmCampaign ?? null,
      utm_medium: utmMedium ?? null,
      utm_source: utmSource ?? null
    },
    onConflict: "id"
  });

  return session;
}

async function upsertLegacyAssessmentSubmission(
  clerkUserId: string,
  sessionId: string,
  answers: AssessmentAnswerMap
) {
  await syncSignedInUser(clerkUserId);

  const legacy = buildLegacyAssessmentPayload(answers);

  await upsertSupabaseRow({
    table: "assessment_submissions",
    values: {
      clerk_user_id: clerkUserId,
      assessment_version: assessmentVersion,
      answers_snapshot: answers,
      budget: legacy.budget,
      completed_at: new Date().toISOString(),
      goal: legacy.goal,
      lane_badge: legacy.lane_badge,
      lane_checklist: legacy.lane_checklist,
      lane_summary: legacy.lane_summary,
      lane_title: legacy.lane_title,
      latest_session_id: sessionId,
      stage: legacy.stage,
      urgency: legacy.urgency
    },
    onConflict: "clerk_user_id"
  });
}

async function persistDashboardSessionFields({
  answers,
  metrics,
  session
}: {
  answers: AssessmentAnswerMap;
  metrics: AssessmentDashboardMetrics;
  session: AssessmentSessionRow;
}) {
  try {
    await upsertSupabaseRow({
      table: "assessment_sessions",
      values: {
        ...session,
        age_bucket: metrics.ageBucket,
        concern_level: metrics.concernLevel,
        derived_metrics_json: metrics,
        lifestyle_flags: metrics.lifestyleFlags,
        medical_flags: metrics.medicalFlags,
        pace_score: metrics.paceScore,
        raw_response_json: answers,
        self_reported_stage: metrics.selfReportedStage,
        style_flags: metrics.styleFlags,
        visible_loss_score: metrics.visibleLossScore
      },
      onConflict: "id"
    });
  } catch {
    // New dashboard columns are migration-backed. Completion should still succeed before migration.
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "start_or_resume": {
        if (!body.anonymousId && !userId) {
          return NextResponse.json({ error: "Missing anonymous session context" }, { status: 400 });
        }

        const assessmentVersionValue = body.assessmentVersion ?? assessmentVersion;
        let session = null;
        let didResume = false;

        if (body.sessionId && body.resumeToken) {
          const existing = await getSessionById(body.sessionId);

          if (existing && existing.resume_token === body.resumeToken) {
            if (existing.completion_status === "completed") {
              session = null;
            } else {
              session = await maybeAttachUser(existing, userId);
              didResume = true;
            }
          }
        }

        if (!session && userId) {
          const rows = await selectSupabaseRows<AssessmentSessionRow>({
            table: "assessment_sessions",
            filters: [`clerk_user_id=eq.${userId}`],
            orderBy: "started_at",
            ascending: false,
            limit: 10
          });

          const resumable = rows.find((row) => row.completion_status !== "completed");

          if (resumable) {
            session = resumable;
            didResume = true;
          }
        }

        if (!session) {
          session = await startNewSession({
            anonymousId: body.anonymousId ?? userId ?? "anonymous",
            assessmentVersionValue,
            clerkUserId: userId,
            entryPath: body.entryPath,
            entrySource: body.entrySource,
            posthogDistinctId: body.posthogDistinctId,
            utmCampaign: body.utmCampaign,
            utmMedium: body.utmMedium,
            utmSource: body.utmSource
          });
        }

        const answers = await loadAnswers(session.id);

        return NextResponse.json({
          answers,
          didResume,
          session: toClientSession(session)
        });
      }
      case "save_answer": {
        if (
          !body.sessionId ||
          !body.resumeToken ||
          !body.questionId ||
          typeof body.answerValue !== "string" ||
          !body.sectionId ||
          typeof body.stepIndex !== "number"
        ) {
          return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
        }

        const session = await getSessionById(body.sessionId);

        if (!session || session.resume_token !== body.resumeToken) {
          return NextResponse.json({ error: "Unknown session" }, { status: 404 });
        }

        const question = assessmentQuestions.find((entry) => entry.id === body.questionId);

        if (!question || question.sectionId !== body.sectionId) {
          return NextResponse.json({ error: "Question metadata mismatch" }, { status: 400 });
        }

        await upsertSupabaseRow<AssessmentAnswerRow>({
          table: "assessment_answers",
          values: {
            answer_label: body.answerLabel ?? body.answerValue,
            answer_value: body.answerValue,
            answer_values: parseAnswerValueList(body.answerValue),
            changed_from: body.changedFrom ?? null,
            elapsed_ms: body.elapsedMs ?? 0,
            question_id: body.questionId,
            section_id: body.sectionId,
            session_id: body.sessionId,
            step_index: body.stepIndex
          },
          onConflict: "session_id,question_id"
        });

        const [updatedSession] = await upsertSupabaseRow<AssessmentSessionRow>({
          table: "assessment_sessions",
          values: {
            ...session,
            abandoned_at: null,
            clerk_user_id: userId ?? session.clerk_user_id,
            completion_status: "started",
            last_question_id: body.questionId,
            last_section_id: body.sectionId,
            posthog_distinct_id: session.posthog_distinct_id,
            total_elapsed_ms: body.totalElapsedMs ?? session.total_elapsed_ms ?? 0
          },
          onConflict: "id"
        });

        let answerInsight = null;

        try {
          answerInsight = await buildAssessmentAnswerInsight({
            answerValue: body.answerValue,
            question
          });
        } catch {
          answerInsight = null;
        }

        return NextResponse.json({
          answerInsight,
          ok: true,
          session: toClientSession(updatedSession ?? session)
        });
      }
      case "complete": {
        if (!body.sessionId || !body.resumeToken || !body.answers) {
          return NextResponse.json({ error: "Invalid completion payload" }, { status: 400 });
        }

        const session = await getSessionById(body.sessionId);

        if (!session || session.resume_token !== body.resumeToken) {
          return NextResponse.json({ error: "Unknown session" }, { status: 404 });
        }

        const visibleQuestions = getVisibleAssessmentQuestions(body.answers);
        const lastVisibleQuestion = visibleQuestions[visibleQuestions.length - 1];

        const [completedSession] = await upsertSupabaseRow<AssessmentSessionRow>({
          table: "assessment_sessions",
          values: {
            ...session,
            clerk_user_id: userId ?? session.clerk_user_id,
            completed_at: new Date().toISOString(),
            completion_status: "completed",
            last_question_id: lastVisibleQuestion?.id ?? assessmentQuestions[assessmentQuestions.length - 1]?.id ?? session.last_question_id,
            last_section_id: lastVisibleQuestion?.sectionId ?? assessmentQuestions[assessmentQuestions.length - 1]?.sectionId ?? session.last_section_id,
            total_elapsed_ms: body.totalElapsedMs ?? session.total_elapsed_ms ?? 0
          },
          onConflict: "id"
        });

        const clerkUserId = userId ?? session.clerk_user_id;

        if (clerkUserId) {
          await upsertLegacyAssessmentSubmission(clerkUserId, body.sessionId, body.answers);
        }

        const snapshot = await buildAndPersistAssessmentResult(body.sessionId, body.answers);

        await persistDashboardSessionFields({
          answers: body.answers,
          metrics: snapshot.derivedMetrics,
          session: completedSession ?? session
        });

        return NextResponse.json({
          ok: true,
          session: toClientSession(completedSession ?? session)
        });
      }
      case "abandon": {
        if (!body.sessionId || !body.resumeToken) {
          return NextResponse.json({ ok: true });
        }

        const session = await getSessionById(body.sessionId);

        if (!session || session.resume_token !== body.resumeToken || session.completion_status === "completed") {
          return NextResponse.json({ ok: true });
        }

        await upsertSupabaseRow<AssessmentSessionRow>({
          table: "assessment_sessions",
          values: {
            ...session,
            abandoned_at: new Date().toISOString(),
            clerk_user_id: userId ?? session.clerk_user_id,
            completion_status: "abandoned",
            last_question_id: body.lastQuestionId ?? session.last_question_id,
            last_section_id: body.lastSectionId ?? session.last_section_id,
            total_elapsed_ms: body.totalElapsedMs ?? session.total_elapsed_ms ?? 0
          } as AssessmentSessionRow & { abandoned_at: string },
          onConflict: "id"
        });

        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment session request failed" },
      { status: 500 }
    );
  }
}

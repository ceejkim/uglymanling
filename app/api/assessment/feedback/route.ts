import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/posthog-server";
import { getAssessmentSession } from "@/lib/assessment/server";
import { upsertSupabaseRow } from "@/lib/supabase";

type QuestionFeedbackBody = {
  action: "question_feedback";
  body?: string;
  questionId?: string;
  resumeToken?: string;
  sentiment?: -1 | 1;
  sessionId?: string;
};

type ResultFeedbackBody = {
  action: "result_feedback";
  body?: string;
  rating?: number;
  resumeToken?: string;
  sessionId?: string;
};

type RecommendationClickBody = {
  action: "recommendation_click";
  destinationPath?: string;
  destinationType?: string;
  position?: number;
  recommendationKey?: string;
  resumeToken?: string;
  sessionId?: string;
};

type RequestBody = QuestionFeedbackBody | ResultFeedbackBody | RecommendationClickBody;

async function authorize(sessionId?: string, resumeToken?: string, userId?: string | null) {
  if (!sessionId) {
    return null;
  }

  const session = await getAssessmentSession(sessionId);

  if (!session) {
    return null;
  }

  if (userId && session.clerk_user_id === userId) {
    return session;
  }

  if (resumeToken && session.resume_token === resumeToken) {
    return session;
  }

  return null;
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
    const session = await authorize(body.sessionId, body.resumeToken, userId);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (body.action) {
      case "question_feedback": {
        if (!body.questionId || !body.sentiment) {
          return NextResponse.json({ error: "Invalid question feedback payload" }, { status: 400 });
        }

        await upsertSupabaseRow({
          table: "assessment_feedback",
          values: {
            id: crypto.randomUUID(),
            body: body.body ?? null,
            feedback_scope: "question",
            question_id: body.questionId,
            rating: null,
            sentiment: body.sentiment,
            session_id: session.id
          }
        });

        await captureServerEvent({
          distinctId: session.clerk_user_id ?? session.id,
          event: "assessment_feedback_submitted",
          properties: {
            question_id: body.questionId,
            scope: "question",
            sentiment: body.sentiment,
            session_id: session.id
          }
        });

        return NextResponse.json({ ok: true });
      }
      case "result_feedback": {
        if (typeof body.rating !== "number") {
          return NextResponse.json({ error: "Invalid result feedback payload" }, { status: 400 });
        }

        await upsertSupabaseRow({
          table: "assessment_feedback",
          values: {
            id: crypto.randomUUID(),
            body: body.body ?? null,
            feedback_scope: "result",
            question_id: null,
            rating: body.rating,
            sentiment: null,
            session_id: session.id
          }
        });

        await captureServerEvent({
          distinctId: session.clerk_user_id ?? session.id,
          event: "assessment_feedback_completed",
          properties: {
            rating: body.rating,
            scope: "result",
            session_id: session.id
          }
        });

        return NextResponse.json({ ok: true });
      }
      case "recommendation_click": {
        if (
          !body.recommendationKey ||
          !body.destinationType ||
          typeof body.position !== "number"
        ) {
          return NextResponse.json({ error: "Invalid recommendation click payload" }, { status: 400 });
        }

        await upsertSupabaseRow({
          table: "assessment_recommendation_clicks",
          values: {
            id: crypto.randomUUID(),
            destination_path: body.destinationPath ?? null,
            destination_type: body.destinationType,
            position: body.position,
            recommendation_key: body.recommendationKey,
            session_id: session.id
          }
        });

        await captureServerEvent({
          distinctId: session.clerk_user_id ?? session.id,
          event: "assessment_recommendation_clicked",
          properties: {
            destination_path: body.destinationPath ?? null,
            destination_type: body.destinationType,
            recommendation_key: body.recommendationKey,
            recommendation_rank: body.position,
            session_id: session.id
          }
        });

        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment feedback request failed" },
      { status: 500 }
    );
  }
}


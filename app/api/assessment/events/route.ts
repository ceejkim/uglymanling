import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAssessmentSession } from "@/lib/assessment/server";
import { upsertSupabaseRow } from "@/lib/supabase";

type AssessmentEventBody = {
  eventPayload?: Record<string, unknown>;
  eventType?: string;
  resumeToken?: string | null;
  sessionId?: string;
};

async function authorize(sessionId?: string, resumeToken?: string | null, userId?: string | null) {
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

function isPlainPayload(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  let body: AssessmentEventBody;

  try {
    body = (await request.json()) as AssessmentEventBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.eventType || body.eventType.length > 120) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  try {
    const session = await authorize(body.sessionId, body.resumeToken, userId);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await upsertSupabaseRow({
      table: "assessment_events",
      values: {
        id: crypto.randomUUID(),
        event_payload: isPlainPayload(body.eventPayload) ? body.eventPayload : {},
        event_type: body.eventType,
        session_id: session.id
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment event request failed" },
      { status: 500 }
    );
  }
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncSignedInUser } from "@/lib/clerk-supabase";
import { selectSupabaseRows, upsertSupabaseRow } from "@/lib/supabase";

type AssessmentBody = {
  budget: string;
  goal: string;
  laneBadge: string;
  laneChecklist: string[];
  laneSummary: string;
  laneTitle: string;
  stage: string;
  urgency: string;
};

type AssessmentRow = {
  budget: string;
  clerk_user_id: string;
  goal: string;
  lane_badge: string;
  lane_checklist: string[];
  lane_summary: string;
  lane_title: string;
  stage: string;
  urgency: string;
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await selectSupabaseRows<AssessmentRow>({
      table: "assessment_submissions",
      filters: [`clerk_user_id=eq.${userId}`],
      orderBy: "updated_at",
      limit: 1
    });

    return NextResponse.json({ assessment: rows[0] ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment query failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<AssessmentBody>;

  if (
    !body.stage ||
    !body.goal ||
    !body.budget ||
    !body.urgency ||
    !body.laneTitle ||
    !body.laneSummary ||
    !body.laneBadge ||
    !Array.isArray(body.laneChecklist)
  ) {
    return NextResponse.json({ error: "Invalid assessment payload" }, { status: 400 });
  }

  try {
    await syncSignedInUser(userId);

    const assessment: AssessmentRow = {
      clerk_user_id: userId,
      stage: body.stage,
      goal: body.goal,
      budget: body.budget,
      urgency: body.urgency,
      lane_title: body.laneTitle,
      lane_summary: body.laneSummary,
      lane_badge: body.laneBadge,
      lane_checklist: body.laneChecklist
    };

    const [saved] = await upsertSupabaseRow({
      table: "assessment_submissions",
      values: assessment,
      onConflict: "clerk_user_id"
    });

    return NextResponse.json({ ok: true, assessment: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment save failed" },
      { status: 500 }
    );
  }
}

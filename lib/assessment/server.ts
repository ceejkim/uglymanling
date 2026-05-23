import "server-only";
import type { AssessmentAnswerMap } from "@/lib/assessment/questions";
import { selectSupabaseRows } from "@/lib/supabase";

export type AssessmentSessionRecord = {
  clerk_user_id: string | null;
  completed_at: string | null;
  completion_status: "started" | "completed" | "abandoned";
  id: string;
  resume_token: string;
};

type AssessmentAnswerRecord = {
  answer_value: string | null;
  question_id: string;
  session_id: string;
};

export async function getAssessmentSession(sessionId: string) {
  const rows = await selectSupabaseRows<AssessmentSessionRecord>({
    table: "assessment_sessions",
    filters: [`id=eq.${sessionId}`],
    limit: 1
  });

  return rows[0] ?? null;
}

export async function getAssessmentAnswers(sessionId: string): Promise<AssessmentAnswerMap> {
  const rows = await selectSupabaseRows<AssessmentAnswerRecord>({
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


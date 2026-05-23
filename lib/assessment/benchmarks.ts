import "server-only";
import {
  assessmentQuestionsById,
  getQuestionLabel,
  type AssessmentAnswerMap
} from "@/lib/assessment/questions";
import { selectSupabaseRows } from "@/lib/supabase";

type SessionRow = {
  completed_at: string | null;
  id: string;
};

type AnswerRow = {
  answer_value: string | null;
  question_id: string;
  session_id: string;
};

export type AssessmentBenchmarkPayload = {
  cohortLabel: string;
  cohortSize: number;
  confidence: "high" | "low" | "medium";
  insights: Array<{
    id: string;
    value: string;
  }>;
};

const stageRank: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  III_vertex: 4,
  IV: 5,
  V_plus: 6,
  not_sure: 3
};

function buildConfidence(cohortSize: number): "high" | "low" | "medium" {
  if (cohortSize >= 250) {
    return "high";
  }

  if (cohortSize >= 100) {
    return "medium";
  }

  return "low";
}

function getMode(values: string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  let winner = "";
  let winnerCount = -1;

  counts.forEach((count, value) => {
    if (count > winnerCount) {
      winner = value;
      winnerCount = count;
    }
  });

  return winner;
}

export async function buildBenchmarkPayload(
  sessionId: string,
  answers: AssessmentAnswerMap
): Promise<AssessmentBenchmarkPayload> {
  const completedSessions = await selectSupabaseRows<SessionRow>({
    table: "assessment_sessions",
    orderBy: "completed_at",
    ascending: false,
    limit: 300
  });

  const completedOnly = completedSessions.filter((row) => Boolean(row.completed_at));

  if (completedOnly.length === 0) {
    return {
      cohortLabel: "All completed users",
      cohortSize: 0,
      confidence: "low",
      insights: [
        {
          id: "insufficient_data",
          value: "We need more completed profiles before peer comparison becomes reliable."
        }
      ]
    };
  }

  const ids = completedOnly.map((row) => row.id).join(",");
  const answerRows = await selectSupabaseRows<AnswerRow>({
    table: "assessment_answers",
    filters: [`session_id=in.(${ids})`, "question_id=in.(norwood_stage,primary_goal,next_step_preference)"],
    orderBy: "answered_at",
    ascending: true
  });

  const answerMap = new Map<string, AssessmentAnswerMap>();

  for (const row of answerRows) {
    if (!row.answer_value) {
      continue;
    }

    const record = answerMap.get(row.session_id) ?? {};
    record[row.question_id] = row.answer_value;
    answerMap.set(row.session_id, record);
  }

  const candidateSessions = completedOnly
    .filter((row) => row.id !== sessionId)
    .map((row) => ({
      id: row.id,
      answers: answerMap.get(row.id) ?? {}
    }))
    .filter((row) => Object.keys(row.answers).length > 0);

  const strictCohort = candidateSessions.filter(
    (row) =>
      row.answers.norwood_stage === answers.norwood_stage &&
      row.answers.primary_goal === answers.primary_goal
  );
  const stageOnlyCohort = candidateSessions.filter(
    (row) => row.answers.norwood_stage === answers.norwood_stage
  );
  const cohort =
    strictCohort.length >= 8
      ? strictCohort
      : stageOnlyCohort.length >= 8
        ? stageOnlyCohort
        : candidateSessions;

  const cohortLabel =
    cohort === strictCohort
      ? "Users with your stage and primary goal"
      : cohort === stageOnlyCohort
        ? "Users at a similar Norwood stage"
        : "All completed users";

  const cohortSize = cohort.length;

  if (cohortSize === 0) {
    return {
      cohortLabel,
      cohortSize,
      confidence: "low",
      insights: [
        {
          id: "insufficient_data",
          value: "We need more completed profiles before peer comparison becomes reliable."
        }
      ]
    };
  }

  const stageValues = cohort
    .map((row) => row.answers.norwood_stage)
    .filter((value): value is string => Boolean(value));
  const nextStepValues = cohort
    .map((row) => row.answers.next_step_preference)
    .filter((value): value is string => Boolean(value));
  const currentStageRank = stageRank[answers.norwood_stage ?? "not_sure"] ?? 3;
  const earlierCount = stageValues.filter((value) => (stageRank[value] ?? 3) > currentStageRank).length;
  const percentileEarlier = Math.round((earlierCount / Math.max(stageValues.length, 1)) * 100);
  const nextStepMode = getMode(nextStepValues);

  const insights = [
    {
      id: "stage_percentile",
      value:
        percentileEarlier > 0
          ? `You appear earlier than ${percentileEarlier}% of ${cohortLabel.toLowerCase()}.`
          : `Your stage sits near the middle of ${cohortLabel.toLowerCase()} in our current sample.`
    }
  ];

  if (nextStepMode) {
    insights.push({
      id: "common_next_step",
      value: `Most similar users next explore ${getQuestionLabel("next_step_preference", nextStepMode).toLowerCase()}.`
    });
  }

  if (answers.primary_goal && assessmentQuestionsById.primary_goal) {
    insights.push({
      id: "goal_alignment",
      value: `Your current priority reads as ${getQuestionLabel("primary_goal", answers.primary_goal).toLowerCase()}, which tends to cluster with calmer decision-making than random product hopping.`
    });
  }

  return {
    cohortLabel,
    cohortSize,
    confidence: buildConfidence(cohortSize),
    insights
  };
}

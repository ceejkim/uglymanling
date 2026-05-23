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
  "ludwig:frontal_accentuated": 3,
  "ludwig:ludwig_i": 1,
  "ludwig:ludwig_ii": 3,
  "ludwig:ludwig_iii": 5,
  "ludwig:not_sure": 3,
  "norwood:I": 1,
  "norwood:II": 2,
  "norwood:III": 3,
  "norwood:III_vertex": 4,
  "norwood:IV": 5,
  "norwood:V": 6,
  "norwood:V_plus": 6,
  "norwood:VI": 7,
  "norwood:VII": 8,
  "norwood:not_sure": 3
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

function getClassificationStage(answers: AssessmentAnswerMap) {
  if (answers.norwood_stage) {
    return {
      questionId: "norwood_stage",
      value: answers.norwood_stage,
      rankKey: `norwood:${answers.norwood_stage}`
    };
  }

  if (answers.ludwig_stage) {
    return {
      questionId: "ludwig_stage",
      value: answers.ludwig_stage,
      rankKey: `ludwig:${answers.ludwig_stage}`
    };
  }

  return {
    questionId: "norwood_stage",
    value: "not_sure",
    rankKey: "norwood:not_sure"
  };
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
    filters: [
      `session_id=in.(${ids})`,
      "question_id=in.(norwood_stage,ludwig_stage,primary_goal,next_step_preference,anonymous_research_consent)"
    ],
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

  const currentStage = getClassificationStage(answers);
  const strictCohort = candidateSessions.filter((row) => {
    const rowStage = getClassificationStage(row.answers);

    return rowStage.rankKey === currentStage.rankKey && row.answers.primary_goal === answers.primary_goal;
  });
  const stageOnlyCohort = candidateSessions.filter((row) => {
    const rowStage = getClassificationStage(row.answers);

    return rowStage.rankKey === currentStage.rankKey;
  });
  const cohort =
    strictCohort.length >= 8
      ? strictCohort
      : stageOnlyCohort.length >= 8
        ? stageOnlyCohort
        : candidateSessions;

  const cohortLabel =
    cohort === strictCohort
      ? "Users with your classification and primary goal"
      : cohort === stageOnlyCohort
        ? "Users with a similar classification"
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
    .map((row) => getClassificationStage(row.answers).rankKey)
    .filter(Boolean);
  const nextStepValues = cohort
    .map((row) => row.answers.next_step_preference)
    .filter((value): value is string => Boolean(value));
  const currentStageRank = stageRank[currentStage.rankKey] ?? 3;
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
      value: `Your current priority reads as ${getQuestionLabel("primary_goal", answers.primary_goal).toLowerCase()}, which is useful for comparing treatment timing, lifestyle patterns, and progress tracking.`
    });
  }

  if (answers[currentStage.questionId]) {
    insights.push({
      id: "classification_label",
      value: `Your baseline classification is ${getQuestionLabel(currentStage.questionId, currentStage.value).toLowerCase()}.`
    });
  }

  return {
    cohortLabel,
    cohortSize,
    confidence: buildConfidence(cohortSize),
    insights
  };
}

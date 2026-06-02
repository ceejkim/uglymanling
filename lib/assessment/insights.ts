import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  getAnswerValuesForStorage,
  getQuestionLabel,
  type AssessmentQuestion
} from "@/lib/assessment/questions";

export type AssessmentAnswerInsight = {
  answerCount?: number;
  answerLabel: string;
  answerValue: string;
  body: string;
  confidence: "low" | "medium" | "personal";
  footnote: string;
  isAnonymousAggregate: boolean;
  percent?: number;
  questionId: string;
  sampleSize?: number;
  source: "curated_guidance" | "live_aggregate" | "privacy";
  title: string;
};

type InsightSeedRow = {
  answer_value: string;
  fallback_copy: string;
  insight_template: string;
  insight_title: string;
  min_sample_size: number;
  source_label: string;
};

type InsightStatsRow = {
  answer_count: number | string;
  answer_value: string;
  has_sufficient_sample: boolean;
  question_id: string;
  response_rate: number | string | null;
  sample_size: number | string;
};

const liveInsightMinimumSampleSize = 1;

function formatPercent(value: number) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function buildAnswerShareInsight({
  answerCount,
  answerLabel,
  answerValue,
  cohortLabel,
  percent,
  questionId,
  sampleSize
}: {
  answerCount: number;
  answerLabel: string;
  answerValue: string;
  cohortLabel: string;
  percent: number;
  questionId: string;
  sampleSize: number;
}): AssessmentAnswerInsight {
  return {
    answerCount,
    answerLabel,
    answerValue,
    body: `${formatPercent(percent)} of users gave this answer.`,
    confidence: sampleSize >= 30 ? "medium" : "low",
    footnote: `Based on ${sampleSize} ${cohortLabel}. You can view this whether or not you contribute.`,
    isAnonymousAggregate: true,
    percent,
    questionId,
    sampleSize,
    source: "live_aggregate",
    title: "Answer share"
  };
}

function buildPendingAnswerShareInsight(
  question: AssessmentQuestion,
  answerValue: string,
  answerLabel: string
): AssessmentAnswerInsight {
  return {
    answerLabel,
    answerValue,
    body: "Community share is still warming up for this answer.",
    confidence: "personal",
    footnote:
      "This appears once there are enough anonymous community responses. Your personal report still uses your answer now.",
    isAnonymousAggregate: false,
    questionId: question.id,
    source: "privacy",
    title: "Answer saved"
  };
}

async function getSeedRows(questionId: string, answerValues: string[]) {
  if (answerValues.length === 0) {
    return [];
  }

  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("assessment_question_insights")
    .select("answer_value,fallback_copy,insight_template,insight_title,min_sample_size,source_label")
    .eq("question_id", questionId)
    .eq("is_active", true)
    .in("answer_value", answerValues);

  if (error) {
    return [];
  }

  return (data ?? []) as InsightSeedRow[];
}

async function getStatsRows(questionId: string, answerValues: string[], minimumSampleSize: number) {
  if (answerValues.length === 0) {
    return [];
  }

  const client = getSupabaseAdminClient();
  const { data, error } = await client.rpc("get_assessment_answer_insight", {
    p_answer_values: answerValues,
    p_min_sample_size: minimumSampleSize,
    p_question_id: questionId
  });

  if (error) {
    return [];
  }

  return (data ?? []) as InsightStatsRow[];
}

function getEquivalentStoredAnswerValues(questionId: string, answerValue: string) {
  if (questionId === "anonymous_research_consent" && answerValue === "no") {
    return ["no", "not_sure"];
  }

  return [answerValue];
}

async function getAllResponseStatsRows(questionId: string, answerValues: string[]) {
  if (answerValues.length === 0) {
    return [];
  }

  const client = getSupabaseAdminClient();
  const { count: sampleSize, error: sampleError } = await client
    .from("assessment_answers")
    .select("session_id", { count: "exact", head: true })
    .eq("question_id", questionId);

  if (sampleError) {
    return [];
  }

  const rows = await Promise.all(
    answerValues.map(async (answerValue): Promise<InsightStatsRow | null> => {
      const equivalentAnswerValues = getEquivalentStoredAnswerValues(questionId, answerValue);
      let answerQuery = client
        .from("assessment_answers")
        .select("session_id", { count: "exact", head: true })
        .eq("question_id", questionId);

      answerQuery =
        equivalentAnswerValues.length === 1
          ? answerQuery.eq("answer_value", equivalentAnswerValues[0])
          : answerQuery.in("answer_value", equivalentAnswerValues);

      const { count: answerCount, error } = await answerQuery;

      if (error) {
        return null;
      }

      const safeSampleSize = sampleSize ?? 0;
      const safeAnswerCount = answerCount ?? 0;

      return {
        answer_count: safeAnswerCount,
        answer_value: answerValue,
        has_sufficient_sample: safeSampleSize >= liveInsightMinimumSampleSize,
        question_id: questionId,
        response_rate:
          safeSampleSize > 0 ? Math.round((safeAnswerCount / safeSampleSize) * 1000) / 10 : null,
        sample_size: safeSampleSize
      };
    })
  );

  return rows.filter((row): row is InsightStatsRow => Boolean(row));
}

function selectBestStats(rows: InsightStatsRow[], seed?: InsightSeedRow) {
  if (seed) {
    return rows.find((row) => row.answer_value === seed.answer_value) ?? rows[0];
  }

  return [...rows].sort((left, right) => {
    if (left.has_sufficient_sample !== right.has_sufficient_sample) {
      return left.has_sufficient_sample ? -1 : 1;
    }

    return Number(right.answer_count) - Number(left.answer_count);
  })[0];
}

export async function buildAssessmentAnswerInsight({
  answerValue,
  question
}: {
  answerValue: string;
  question: AssessmentQuestion;
}): Promise<AssessmentAnswerInsight> {
  const answerLabel = getQuestionLabel(question.id, answerValue);
  const answerValues = getAnswerValuesForStorage(question, answerValue).filter(Boolean);

  if (answerValues.length === 0) {
    return buildPendingAnswerShareInsight(question, answerValue, answerLabel);
  }

  const seeds = await getSeedRows(question.id, answerValues);
  const seed = seeds[0];
  const minimumSampleSize = liveInsightMinimumSampleSize;
  const statsRows =
    question.id === "anonymous_research_consent"
      ? await getAllResponseStatsRows(question.id, answerValues)
      : await getStatsRows(question.id, answerValues, minimumSampleSize);
  const stats = selectBestStats(statsRows, seed);
  const statsAnswerValue = stats?.answer_value ?? seed?.answer_value ?? answerValues[0] ?? answerValue;
  const statsAnswerLabel =
    question.input === "multi_select" || question.input === "multi_chips"
      ? getQuestionLabel(question.id, statsAnswerValue)
      : answerLabel;
  const sampleSize = Number(stats?.sample_size ?? 0);
  const answerCount = Number(stats?.answer_count ?? 0);
  const percent = Number(stats?.response_rate ?? 0);

  if (stats?.has_sufficient_sample && sampleSize > 0 && Number.isFinite(percent)) {
    return buildAnswerShareInsight({
      answerCount,
      answerLabel: statsAnswerLabel,
      answerValue: statsAnswerValue,
      cohortLabel:
        question.id === "anonymous_research_consent"
          ? "survey consent responses"
          : "anonymous community responses",
      percent,
      questionId: question.id,
      sampleSize
    });
  }

  return buildPendingAnswerShareInsight(question, answerValue, answerLabel);
}

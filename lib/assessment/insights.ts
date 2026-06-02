import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  getAnswerValuesForStorage,
  getQuestionLabel,
  type AssessmentAnswerMap,
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

const bundledSeedInsights: Record<string, InsightSeedRow[]> = {
  progression_pace: [
    {
      answer_value: "rapid_6mo",
      fallback_copy:
        "Rapid 6-month change is a useful signal to document. If it continues, a clinician can help rule out shedding triggers, medication effects, thyroid or iron issues, and inflammatory scalp conditions.",
      insight_template:
        "{percent} of opted-in respondents also described rapid change over 6 months.",
      insight_title: "Fast change deserves a rule-out",
      min_sample_size: liveInsightMinimumSampleSize,
      source_label: "anonymous opted-in survey responses"
    }
  ]
};

function formatPercent(value: number) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function interpolateInsightTemplate(
  template: string,
  {
    answerLabel,
    answerCount,
    percent,
    sampleSize
  }: {
    answerCount: number;
    answerLabel: string;
    percent: number;
    sampleSize: number;
  }
) {
  return template
    .replaceAll("{answer_count}", String(answerCount))
    .replaceAll("{answer_label}", answerLabel)
    .replaceAll("{percent}", formatPercent(percent))
    .replaceAll("{sample_size}", String(sampleSize));
}

function buildPersonalInsight(question: AssessmentQuestion, answerValue: string, answerLabel: string) {
  const sectionCopy: Record<string, string> = {
    baseline_profile:
      "This helps anchor pattern, pace, and comparison groups before the report interprets anything else.",
    goals_impact:
      "This helps turn the final report toward the next step you are most likely to use.",
    lifestyle_habits:
      "This adds context for stress, sleep, nutrition, scalp, and routine signals that can make shedding harder to interpret.",
    medical_history:
      "This helps separate ordinary pattern change from factors that may be worth ruling out with a clinician.",
    treatment_outcomes:
      "This helps compare treatment experience, consistency, barriers, and outcomes without guessing from one data point."
  };

  return {
    answerLabel,
    answerValue,
    body: `${answerLabel}: ${sectionCopy[question.sectionId] ?? "This answer sharpens your personal report."}`,
    confidence: "personal" as const,
    footnote: "Your response is not added to aggregate community reporting unless you opt in.",
    isAnonymousAggregate: false,
    questionId: question.id,
    source: "privacy" as const,
    title: "Private insight"
  };
}

function buildConsentInsight(answerValue: string, answerLabel: string): AssessmentAnswerInsight {
  if (answerValue === "yes") {
    return {
      answerLabel,
      answerValue,
      body:
        "Your answers can now be grouped with others to improve community insights.",
      confidence: "personal",
      footnote: "Community insights use grouped response patterns, not individual profiles.",
      isAnonymousAggregate: false,
      questionId: "anonymous_research_consent",
      source: "privacy",
      title: "Anonymous insights enabled"
    };
  }

  return {
    answerLabel,
    answerValue,
    body:
      "No problem. You will still get your personal report, and this response stays out of community trend reports.",
    confidence: "personal",
    footnote: "Only explicit yes responses are included in grouped community insights.",
    isAnonymousAggregate: false,
    questionId: "anonymous_research_consent",
    source: "privacy",
    title: "Private by default"
  };
}

async function getSeedRows(questionId: string, answerValues: string[]) {
  if (answerValues.length === 0) {
    return [];
  }

  const bundledSeeds = (bundledSeedInsights[questionId] ?? []).filter((seed) =>
    answerValues.includes(seed.answer_value)
  );
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("assessment_question_insights")
    .select("answer_value,fallback_copy,insight_template,insight_title,min_sample_size,source_label")
    .eq("question_id", questionId)
    .eq("is_active", true)
    .in("answer_value", answerValues);

  if (error) {
    return bundledSeeds;
  }

  const databaseSeeds = (data ?? []) as InsightSeedRow[];
  const databaseSeedValues = new Set(databaseSeeds.map((seed) => seed.answer_value));

  return [
    ...databaseSeeds,
    ...bundledSeeds.filter((seed) => !databaseSeedValues.has(seed.answer_value))
  ];
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
  answers,
  question
}: {
  answerValue: string;
  answers: AssessmentAnswerMap;
  question: AssessmentQuestion;
}): Promise<AssessmentAnswerInsight> {
  const answerLabel = getQuestionLabel(question.id, answerValue);

  if (question.id === "anonymous_research_consent") {
    return buildConsentInsight(answerValue, answerLabel);
  }

  if (answers.anonymous_research_consent !== "yes") {
    return buildPersonalInsight(question, answerValue, answerLabel);
  }

  const answerValues = getAnswerValuesForStorage(question, answerValue).filter(Boolean);

  if (answerValues.length === 0) {
    return buildPersonalInsight(question, answerValue, answerLabel);
  }

  const seeds = await getSeedRows(question.id, answerValues);
  const seed = seeds[0];
  const minimumSampleSize = liveInsightMinimumSampleSize;
  const statsRows = await getStatsRows(question.id, answerValues, minimumSampleSize);
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
    const template =
      seed?.insight_template ??
      "{percent} of opted-in respondents also chose {answer_label}.";

    return {
      answerCount,
      answerLabel: statsAnswerLabel,
      answerValue: statsAnswerValue,
      body: interpolateInsightTemplate(template, {
        answerCount,
        answerLabel: statsAnswerLabel,
        percent,
        sampleSize
      }),
      confidence: sampleSize >= 30 ? "medium" : "low",
      footnote: `Based on ${sampleSize} opted-in anonymous responses.`,
      isAnonymousAggregate: true,
      percent,
      questionId: question.id,
      sampleSize,
      source: "live_aggregate",
      title: seed?.insight_title ?? "Community pattern"
    };
  }

  if (seed) {
    return {
      answerCount: answerCount || undefined,
      answerLabel: statsAnswerLabel,
      answerValue: statsAnswerValue,
      body: seed.fallback_copy,
      confidence: "low",
      footnote: "Live percentage appears once opted-in responses exist for this question.",
      isAnonymousAggregate: true,
      questionId: question.id,
      sampleSize: sampleSize || undefined,
      source: "curated_guidance",
      title: seed.insight_title
    };
  }

  return {
    answerCount: answerCount || undefined,
    answerLabel: statsAnswerLabel,
    answerValue: statsAnswerValue,
    body: `${statsAnswerLabel}: your answer is now part of the anonymous benchmark pool for this question.`,
    confidence: "low",
    footnote: "Community percentage appears once opted-in responses exist.",
    isAnonymousAggregate: true,
    questionId: question.id,
    sampleSize: sampleSize || undefined,
    source: "curated_guidance",
    title: "Community insight warming up"
  };
}

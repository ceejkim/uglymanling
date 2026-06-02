import "server-only";
import {
  assessmentQuestionsById,
  getQuestionLabel,
  parseAnswerValueList,
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
  communityReport?: AssessmentReportSignal[];
  insights: Array<{
    id: string;
    value: string;
  }>;
  personalReport?: AssessmentReportSignal[];
  researchOpportunities?: AssessmentResearchOpportunity[];
};

export type AssessmentReportSignal = {
  detail: string;
  id: string;
  label: string;
  tone?: "neutral" | "positive" | "watch";
  value: string;
};

export type AssessmentResearchOpportunity = {
  detail: string;
  id: string;
  label: string;
};

const stageRank: Record<string, number> = {
  "ludwig:I": 1,
  "ludwig:II": 3,
  "ludwig:III": 5,
  "ludwig:frontal": 3,
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

function getFirstAnswer(answers: AssessmentAnswerMap, ...questionIds: string[]) {
  for (const questionId of questionIds) {
    const value = answers[questionId];

    if (value) {
      return value;
    }
  }

  return "";
}

function getConsentValue(answers: AssessmentAnswerMap) {
  return getFirstAnswer(answers, "anonymous_research_consent", "anonymous_data_contribution");
}

function getLabel(questionId: string, value?: string) {
  return value ? getQuestionLabel(questionId, value) : "Not captured";
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

function getModeForQuestion(
  cohort: Array<{ answers: AssessmentAnswerMap }>,
  questionId: string
) {
  const values = cohort
    .map((row) => row.answers[questionId])
    .filter((value): value is string => Boolean(value));

  return getMode(values);
}

function getShareWithAnyValue(
  cohort: Array<{ answers: AssessmentAnswerMap }>,
  questionId: string,
  excludedValues: string[]
) {
  if (cohort.length === 0) {
    return 0;
  }

  const count = cohort.filter((row) =>
    parseAnswerValueList(row.answers[questionId]).some((value) => !excludedValues.includes(value))
  ).length;

  return Math.round((count / cohort.length) * 100);
}

function buildPersonalReport(answers: AssessmentAnswerMap): AssessmentReportSignal[] {
  const currentStage = getClassificationStage(answers);
  const progressionPace = answers.progression_pace;
  const sheddingAmount = answers.shedding_amount;
  const diagnosis = answers.clinical_diagnosis_status;
  const treatmentStatus = answers.current_treatment_status;
  const primaryTreatment = answers.primary_treatment_focus;
  const nextStep = answers.next_step_preference;
  const baselineFields = [
    currentStage.value,
    progressionPace,
    sheddingAmount,
    answers.primary_concern_area,
    answers.hair_texture,
    diagnosis,
    treatmentStatus,
    answers.confidence_impact,
    answers.primary_goal,
    nextStep
  ];
  const completeness = Math.round(
    (baselineFields.filter(Boolean).length / baselineFields.length) * 100
  );
  const treatmentValue =
    primaryTreatment && primaryTreatment !== "not_sure"
      ? getLabel("primary_treatment_focus", primaryTreatment)
      : treatmentStatus
        ? getLabel("current_treatment_status", treatmentStatus)
        : "No treatment baseline";

  return [
    {
      id: "pattern_baseline",
      label: "Pattern baseline",
      value: getLabel(currentStage.questionId, currentStage.value),
      detail: "This anchors peer matching; it is a classification signal, not a diagnosis.",
      tone: currentStage.value === "not_sure" ? "watch" : "neutral"
    },
    {
      id: "trajectory_signal",
      label: "Trajectory signal",
      value: progressionPace ? getLabel("progression_pace", progressionPace) : "Timeline unclear",
      detail: sheddingAmount
        ? `Current shedding reads as ${getLabel("shedding_amount", sheddingAmount).toLowerCase()}.`
        : "Adding shedding context makes future comparisons more useful.",
      tone: progressionPace === "rapid_6mo" || sheddingAmount === "heavy_daily" || sheddingAmount === "episodic_clumps" ? "watch" : "neutral"
    },
    {
      id: "context_quality",
      label: "Context quality",
      value: diagnosis ? getLabel("clinical_diagnosis_status", diagnosis) : "Self-reported only",
      detail:
        "Clinician-labeled context helps separate pattern loss, shedding events, inflammatory scalp issues, and treatment response.",
      tone: diagnosis && !["no_diagnosis", "not_sure"].includes(diagnosis) ? "positive" : "neutral"
    },
    {
      id: "tracking_readiness",
      label: "Tracking readiness",
      value: `${completeness}% baseline filled`,
      detail: `Your main action signal is ${nextStep ? getLabel("next_step_preference", nextStep).toLowerCase() : "not captured yet"}; your treatment baseline is ${treatmentValue.toLowerCase()}.`,
      tone: completeness >= 80 ? "positive" : "neutral"
    }
  ];
}

function buildCommunityReport(
  cohort: Array<{ answers: AssessmentAnswerMap }>,
  cohortLabel: string
): AssessmentReportSignal[] {
  if (cohort.length === 0) {
    return [
      {
        id: "cohort_building",
        label: "Community signal",
        value: "Cohort still building",
        detail: "We need more completed, opted-in profiles before making useful community comparisons.",
        tone: "watch"
      }
    ];
  }

  const nextStepMode = getModeForQuestion(cohort, "next_step_preference");
  const progressionMode = getModeForQuestion(cohort, "progression_pace");
  const sheddingMode = getModeForQuestion(cohort, "shedding_amount");
  const treatmentMode = getModeForQuestion(cohort, "primary_treatment_focus");
  const treatmentResultMode = getModeForQuestion(cohort, "treatment_result");
  const scalpSymptomShare = getShareWithAnyValue(cohort, "scalp_symptoms", ["none"]);
  const report: AssessmentReportSignal[] = [
    {
      id: "cohort_health",
      label: "Matched cohort",
      value: `${cohort.length} opted-in profiles`,
      detail: `${cohortLabel}. Confidence improves as more anonymous completions enter this segment.`,
      tone: cohort.length >= 100 ? "positive" : "neutral"
    }
  ];

  if (nextStepMode) {
    report.push({
      id: "common_next_step_report",
      label: "Common next move",
      value: getLabel("next_step_preference", nextStepMode),
      detail: "This is the most common next-step preference in the current comparison cohort.",
      tone: "neutral"
    });
  }

  if (progressionMode || sheddingMode) {
    report.push({
      id: "trajectory_report",
      label: "Trajectory pattern",
      value: progressionMode ? getLabel("progression_pace", progressionMode) : getLabel("shedding_amount", sheddingMode),
      detail: sheddingMode
        ? `The most common shedding signal is ${getLabel("shedding_amount", sheddingMode).toLowerCase()}.`
        : "Progression pace is becoming a useful comparison axis.",
      tone: "neutral"
    });
  }

  if (treatmentMode || treatmentResultMode) {
    report.push({
      id: "treatment_report",
      label: "Treatment signal",
      value: treatmentMode ? getLabel("primary_treatment_focus", treatmentMode) : getLabel("treatment_result", treatmentResultMode),
      detail: treatmentResultMode
        ? `Most reported result in this slice is ${getLabel("treatment_result", treatmentResultMode).toLowerCase()}.`
        : "Main-treatment labels will make outcome comparisons more trustworthy.",
      tone: "neutral"
    });
  }

  if (scalpSymptomShare > 0) {
    report.push({
      id: "scalp_symptom_report",
      label: "Scalp context",
      value: `${scalpSymptomShare}% report symptoms`,
      detail: "Scalp symptoms are tracked because inflammation, flaking, itching, and irritation can change interpretation.",
      tone: scalpSymptomShare >= 40 ? "watch" : "neutral"
    });
  }

  return report.slice(0, 4);
}

function buildResearchOpportunities(answers: AssessmentAnswerMap): AssessmentResearchOpportunity[] {
  const opportunities: AssessmentResearchOpportunity[] = [];
  const stressScore = Number(answers.stress_level ?? 0);
  const sleepQuality = Number(answers.sleep_quality ?? 0);
  const nutritionGaps = parseAnswerValueList(answers.nutrition_gaps).filter(
    (value) => !["none_known", "not_sure"].includes(value)
  );
  const labFlags = parseAnswerValueList(answers.abnormal_lab_markers).filter(
    (value) => value !== "not_sure"
  );

  if (answers.shedding_amount === "heavy_daily" || answers.shedding_amount === "episodic_clumps") {
    opportunities.push({
      id: "shedding_trigger_cluster",
      label: "Shedding trigger cluster",
      detail:
        "Compare rapid or episodic shedding against stress, illness, sleep, nutrition, medication changes, and timing windows."
    });
  }

  if (stressScore >= 7 || (sleepQuality > 0 && sleepQuality <= 4)) {
    opportunities.push({
      id: "stress_sleep_axis",
      label: "Stress and sleep axis",
      detail:
        "Track whether higher stress or lower sleep quality clusters with shedding pace, scalp symptoms, and delayed recovery."
    });
  }

  if (answers.primary_treatment_focus && answers.treatment_duration && answers.treatment_result) {
    opportunities.push({
      id: "treatment_response_timeline",
      label: "Treatment response timeline",
      detail:
        "Link main treatment, duration, adherence, reported result, and side effects to reduce noisy treatment comparisons."
    });
  }

  if (nutritionGaps.length > 0 || labFlags.length > 0) {
    opportunities.push({
      id: "lab_nutrition_context",
      label: "Lab and nutrition context",
      detail:
        "Compare low ferritin, vitamin D, thyroid, zinc, B12, and nutrition gaps against progression and treatment response."
    });
  }

  if (answers.hair_texture || answers.current_hairstyle_confidence || answers.next_step_preference === "barber") {
    opportunities.push({
      id: "style_outcome_mapping",
      label: "Style outcome mapping",
      detail:
        "Pair hair texture, visible concern area, confidence impact, and barber actions with self-reported appearance lift."
    });
  }

  return opportunities.slice(0, 4);
}

export async function buildBenchmarkPayload(
  sessionId: string,
  answers: AssessmentAnswerMap
): Promise<AssessmentBenchmarkPayload> {
  const personalReport = buildPersonalReport(answers);
  const researchOpportunities = buildResearchOpportunities(answers);
  const completedSessions = await selectSupabaseRows<SessionRow>({
    table: "assessment_sessions",
    orderBy: "completed_at",
    ascending: false,
    limit: 300
  });

  const completedOnly = completedSessions.filter((row) => Boolean(row.completed_at));

  if (completedOnly.length === 0) {
    return {
      cohortLabel: "All opted-in completed users",
      cohortSize: 0,
      confidence: "low",
      communityReport: buildCommunityReport([], "All opted-in completed users"),
      insights: [
        {
          id: "insufficient_data",
          value: "We need more opted-in completed profiles before peer comparison becomes reliable."
        }
      ],
      personalReport,
      researchOpportunities
    };
  }

  const ids = completedOnly.map((row) => row.id).join(",");
  const answerRows = await selectSupabaseRows<AnswerRow>({
    table: "assessment_answers",
    filters: [
      `session_id=in.(${ids})`,
      "question_id=in.(norwood_stage,ludwig_stage,primary_goal,next_step_preference,anonymous_research_consent,anonymous_data_contribution,progression_pace,shedding_amount,current_treatment_status,primary_treatment_focus,treatment_duration,treatment_result,scalp_symptoms,hair_texture,clinical_diagnosis_status,confidence_impact,stress_level,sleep_quality,nutrition_gaps,abnormal_lab_markers)"
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
    .filter((row) => Object.keys(row.answers).length > 0)
    .filter((row) => getConsentValue(row.answers) === "yes");

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
    strictCohort.length > 0
      ? strictCohort
      : stageOnlyCohort.length > 0
        ? stageOnlyCohort
        : candidateSessions;

  const cohortLabel =
    cohort === strictCohort
      ? "Opted-in users with your classification and primary goal"
      : cohort === stageOnlyCohort
        ? "Opted-in users with a similar classification"
        : "All opted-in completed users";

  const cohortSize = cohort.length;

  if (cohortSize === 0) {
    return {
      cohortLabel,
      cohortSize,
      confidence: "low",
      communityReport: buildCommunityReport([], cohortLabel),
      insights: [
        {
          id: "insufficient_data",
          value: "We need more opted-in completed profiles before peer comparison becomes reliable."
        }
      ],
      personalReport,
      researchOpportunities
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
    communityReport: buildCommunityReport(cohort, cohortLabel),
    confidence: buildConfidence(cohortSize),
    insights,
    personalReport,
    researchOpportunities
  };
}

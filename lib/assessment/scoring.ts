import { parseAnswerValueList, type AssessmentAnswerMap } from "@/lib/assessment/questions";

export type AssessmentScores = {
  appearanceOptimizationScore: number;
  communityReadinessScore: number;
  expertSupportScore: number;
  stabilizationIntentScore: number;
};

function clamp(score: number) {
  return Math.max(0, Math.min(100, score));
}

const confidenceImpactScore: Record<string, number> = {
  high: 8,
  low: 2,
  moderate: 5,
  very_high: 10
};

const riskToleranceScore: Record<string, number> = {
  experimental: 9,
  high: 8,
  low: 3,
  moderate: 5,
  very_low: 1
};

export function scoreAssessment(answers: AssessmentAnswerMap): AssessmentScores {
  let stabilizationIntentScore = 20;
  let appearanceOptimizationScore = 20;
  let expertSupportScore = 16;
  let communityReadinessScore = 12;
  const confidenceImpact = confidenceImpactScore[answers.confidence_impact ?? ""] ?? 0;
  const riskTolerance = riskToleranceScore[answers.risk_tolerance ?? ""] ?? 10;
  const researchConsent = answers.anonymous_research_consent ?? answers.anonymous_data_contribution;
  const primaryConcerns = [
    answers.loss_pattern_primary,
    answers.pattern_general,
    ...parseAnswerValueList(answers.primary_concern_area)
  ].filter((value): value is string => Boolean(value));
  const treatmentBarriers = parseAnswerValueList(answers.treatment_barriers);
  const sideEffects = parseAnswerValueList(answers.side_effects ?? answers.treatment_side_effects);
  const labFlags = parseAnswerValueList(answers.abnormal_labs ?? answers.abnormal_lab_markers);
  const medicalSignals = [
    ...parseAnswerValueList(answers.hormonal_history),
    ...parseAnswerValueList(answers.autoimmune_skin_history ?? answers.autoimmune_skin_conditions),
    ...parseAnswerValueList(answers.metabolic_history),
    ...parseAnswerValueList(answers.medication_categories ?? answers.medications_history)
  ];

  if (answers.primary_goal === "regrowth") {
    stabilizationIntentScore += 22;
    expertSupportScore += 18;
  }

  if (answers.primary_goal === "root_cause") {
    expertSupportScore += 14;
    communityReadinessScore += 10;
  }

  if (
    answers.primary_goal === "stabilize" ||
    answers.primary_goal === "clarity" ||
    answers.primary_goal === "maintain" ||
    answers.primary_goal === "avoid_transplant"
  ) {
    stabilizationIntentScore += 18;
  }

  if (
    answers.current_treatment_status === "none" &&
    (answers.progression_pace === "recent_12mo" ||
      answers.progression_pace === "rapid_6mo" ||
      answers.progression_pace === "episodic_shedding")
  ) {
    stabilizationIntentScore += 30;
  }

  if (answers.current_treatment_status === "researching") {
    expertSupportScore += 10;
  }

  if (answers.next_step_preference === "barber") {
    appearanceOptimizationScore += 30;
  }

  if (answers.next_step_preference === "tracking") {
    communityReadinessScore += 12;
    stabilizationIntentScore += 12;
  }

  if (answers.next_step_preference === "consult") {
    expertSupportScore += 30;
  }

  if (answers.next_step_preference === "community") {
    communityReadinessScore += 28;
  }

  if (answers.next_step_preference === "research") {
    stabilizationIntentScore += 14;
  }

  if (answers.urgency_level === "high") {
    appearanceOptimizationScore += 8;
    expertSupportScore += 12;
  }

  if (confidenceImpact >= 7) {
    appearanceOptimizationScore += 15;
    expertSupportScore += 15;
  }

  if (
    primaryConcerns.some((value) =>
      ["hairline", "temples", "crown", "diffuse", "shedding", "top_diffuse", "overall_density"].includes(value)
    ) ||
    answers.current_hairstyle_confidence === "low" ||
    answers.current_hairstyle_confidence === "very_low"
  ) {
    appearanceOptimizationScore += 18;
  }

  if (riskTolerance <= 3 || treatmentBarriers.includes("side_effect_fear")) {
    expertSupportScore += 10;
  }

  if (
    answers.norwood_stage === "IV" ||
    answers.norwood_stage === "V_plus" ||
    answers.norwood_stage === "V" ||
    answers.norwood_stage === "VI" ||
    answers.norwood_stage === "VII" ||
    answers.ludwig_stage === "II" ||
    answers.ludwig_stage === "III"
  ) {
    expertSupportScore += 16;
  }

  if (answers.budget_band === "150_300" || answers.budget_band === "300_plus") {
    expertSupportScore += 12;
  }

  if (answers.budget_band === "0" || answers.budget_band === "under_50") {
    appearanceOptimizationScore += 6;
    expertSupportScore -= 6;
  }

  if (medicalSignals.some((value) => !["none", "none_known", "not_sure", "prefer_not_to_say"].includes(value))) {
    expertSupportScore += 14;
  }

  if (labFlags.some((value) => !["none_flagged", "not_sure"].includes(value))) {
    expertSupportScore += 12;
    stabilizationIntentScore += 8;
  }

  if (sideEffects.some((value) => value !== "none")) {
    expertSupportScore += 12;
  }

  if (researchConsent === "yes") {
    communityReadinessScore += 16;
  }

  if (answers.next_step_preference === "tracking") {
    communityReadinessScore += 12;
    stabilizationIntentScore += 8;
  }

  return {
    appearanceOptimizationScore: clamp(appearanceOptimizationScore),
    communityReadinessScore: clamp(communityReadinessScore),
    expertSupportScore: clamp(expertSupportScore),
    stabilizationIntentScore: clamp(stabilizationIntentScore)
  };
}

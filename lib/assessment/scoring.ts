import type { AssessmentAnswerMap } from "@/lib/assessment/questions";

export type AssessmentScores = {
  appearanceOptimizationScore: number;
  communityReadinessScore: number;
  expertSupportScore: number;
  stabilizationIntentScore: number;
};

function clamp(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function scoreAssessment(answers: AssessmentAnswerMap): AssessmentScores {
  let stabilizationIntentScore = 20;
  let appearanceOptimizationScore = 20;
  let expertSupportScore = 16;
  let communityReadinessScore = 12;

  if (answers.primary_goal === "appearance") {
    appearanceOptimizationScore += 35;
  }

  if (answers.primary_goal === "regrowth") {
    stabilizationIntentScore += 22;
    expertSupportScore += 18;
  }

  if (answers.primary_goal === "clarity") {
    expertSupportScore += 14;
    communityReadinessScore += 10;
  }

  if (answers.current_treatment_status === "none" && answers.progression_timeline === "accelerating") {
    stabilizationIntentScore += 30;
  }

  if (answers.current_treatment_status === "researching") {
    expertSupportScore += 10;
  }

  if (answers.next_step_preference === "barber") {
    appearanceOptimizationScore += 30;
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

  if (answers.confidence_impact === "high" || answers.confidence_impact === "very_high") {
    appearanceOptimizationScore += 15;
    expertSupportScore += 15;
  }

  if (answers.current_hairstyle_confidence === "low" || answers.current_hairstyle_confidence === "very_low") {
    appearanceOptimizationScore += 18;
  }

  if (answers.change_openness === "major") {
    appearanceOptimizationScore += 8;
  }

  if (answers.norwood_stage === "IV" || answers.norwood_stage === "V_plus") {
    expertSupportScore += 16;
  }

  if (answers.budget_band === "all_in") {
    expertSupportScore += 12;
  }

  if (answers.budget_band === "lean") {
    appearanceOptimizationScore += 6;
    expertSupportScore -= 6;
  }

  return {
    appearanceOptimizationScore: clamp(appearanceOptimizationScore),
    communityReadinessScore: clamp(communityReadinessScore),
    expertSupportScore: clamp(expertSupportScore),
    stabilizationIntentScore: clamp(stabilizationIntentScore)
  };
}


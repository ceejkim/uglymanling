import { parseAnswerValueList, type AssessmentAnswerMap } from "@/lib/assessment/questions";
import { scoreAssessment, type AssessmentScores } from "@/lib/assessment/scoring";

export type AssessmentRecommendation = {
  confidenceScore: number;
  destinationPath: string;
  destinationType: "barber_directory" | "community" | "consult" | "research";
  expectedValue: string;
  key: string;
  timeToValue: "fast" | "medium";
  title: string;
  whyItMatches: string;
};

type RecommendationDraft = Omit<AssessmentRecommendation, "confidenceScore"> & {
  score: number;
};

const confidenceImpactScore: Record<string, number> = {
  high: 8,
  low: 2,
  moderate: 5,
  very_high: 10
};

function getDrafts(
  answers: AssessmentAnswerMap,
  scores: AssessmentScores
): RecommendationDraft[] {
  const confidenceImpact = confidenceImpactScore[answers.confidence_impact ?? ""] ?? 0;
  const researchConsent = answers.anonymous_research_consent ?? answers.anonymous_data_contribution;
  const primaryConcerns = [
    answers.loss_pattern_primary,
    answers.pattern_general,
    ...parseAnswerValueList(answers.primary_concern_area)
  ].filter((value): value is string => Boolean(value));
  const sideEffects = parseAnswerValueList(answers.side_effects ?? answers.treatment_side_effects);
  const labFlags = parseAnswerValueList(answers.abnormal_labs ?? answers.abnormal_lab_markers).filter(
    (value) => value !== "not_sure"
  );
  const wantsTracking = answers.next_step_preference === "tracking";
  const hasVisibleConcern = primaryConcerns.some((value) =>
    ["hairline", "temples", "crown", "diffuse", "diffuse_top", "shedding", "top_diffuse", "overall_density", "hairline_temples", "crown_vertex"].includes(value)
  );

  return [
    {
      key: "barber_directory",
      title: "Find a barber who knows how to work with thinning density",
      whyItMatches:
        hasVisibleConcern ||
        confidenceImpact >= 7 ||
        answers.current_hairstyle_confidence === "low" ||
        answers.current_hairstyle_confidence === "very_low"
          ? "Your answers suggest visible presentation is one of the highest-leverage fixes."
          : "A better haircut can reduce noise fast while you figure out deeper decisions.",
      expectedValue: "Sharper framing, lower styling friction, and a faster confidence lift.",
      timeToValue: "fast",
      destinationType: "barber_directory",
      destinationPath: "/style/barbers",
      score:
        scores.appearanceOptimizationScore +
        (answers.next_step_preference === "barber" ? 18 : 0) +
        (answers.urgency_level === "high" ? 10 : 0)
    },
    {
      key: "consult",
      title: "Talk through the clinical and treatment signals with a qualified expert",
      whyItMatches:
        scores.expertSupportScore >= 50 || sideEffects.some((value) => value !== "none") || labFlags.length > 0
          ? "Your profile has enough medical, lab, progression, or side-effect context that interpretation matters."
          : "A consult is useful if you want help narrowing the real options without spinning.",
      expectedValue: "Faster decision quality, fewer random experiments, and a clearer safety conversation.",
      timeToValue: "fast",
      destinationType: "consult",
      destinationPath: "/consult",
      score:
        scores.expertSupportScore +
        (answers.next_step_preference === "consult" ? 18 : 0) +
        (confidenceImpact >= 9 ? 8 : 0)
    },
    {
      key: "research",
      title: "Read the evidence without falling into product chaos",
      whyItMatches:
        answers.primary_goal === "root_cause" || answers.current_treatment_status === "researching"
          ? "You seem motivated by understanding what is worth doing before you commit."
          : "A smaller evidence pass can help you avoid low-quality next steps.",
      expectedValue: "Cleaner decision criteria and less wasted money.",
      timeToValue: "medium",
      destinationType: "research",
      destinationPath: "/research",
      score:
        scores.stabilizationIntentScore +
        (answers.next_step_preference === "research" ? 12 : 0)
    },
    {
      key: "community",
      title: "See anonymous community patterns from people with similar profiles",
      whyItMatches:
        answers.next_step_preference === "community" ||
        researchConsent === "yes" ||
        wantsTracking
          ? "You appear likely to benefit from aggregate patterns, grounded examples, and follow-up data."
          : "Community data can add context once you have a basic plan.",
      expectedValue: "Pattern recognition, trend context, and fewer isolated decisions.",
      timeToValue: "medium",
      destinationType: "community",
      destinationPath: "/community",
      score:
        scores.communityReadinessScore +
        (answers.next_step_preference === "community" ? 18 : 0)
    }
  ];
}

export function buildRecommendations(answers: AssessmentAnswerMap) {
  const scores = scoreAssessment(answers);
  const drafts = getDrafts(answers, scores)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  return drafts.map((draft) => ({
    confidenceScore: Math.max(54, Math.min(93, Math.round(draft.score))),
    destinationPath: draft.destinationPath,
    destinationType: draft.destinationType,
    expectedValue: draft.expectedValue,
    key: draft.key,
    timeToValue: draft.timeToValue,
    title: draft.title,
    whyItMatches: draft.whyItMatches
  }));
}

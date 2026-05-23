import type { AssessmentAnswerMap } from "@/lib/assessment/questions";
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

function getDrafts(
  answers: AssessmentAnswerMap,
  scores: AssessmentScores
): RecommendationDraft[] {
  return [
    {
      key: "barber_directory",
      title: "Find a barber who knows how to work with thinning density",
      whyItMatches:
        answers.current_hairstyle_confidence === "low" || answers.primary_goal === "appearance"
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
      title: "Book a 1:1 consult if you want the shortest path to clarity",
      whyItMatches:
        scores.expertSupportScore >= 50
          ? "You look more likely to benefit from direct guidance than from another week of fragmented reading."
          : "A consult is useful if you want help narrowing the real options without spinning.",
      expectedValue: "Faster decision quality, fewer random experiments, and better prioritization.",
      timeToValue: "fast",
      destinationType: "consult",
      destinationPath: "/consult",
      score:
        scores.expertSupportScore +
        (answers.next_step_preference === "consult" ? 18 : 0) +
        (answers.confidence_impact === "very_high" ? 8 : 0)
    },
    {
      key: "research",
      title: "Read the evidence without falling into product chaos",
      whyItMatches:
        answers.primary_goal === "clarity" || answers.current_treatment_status === "researching"
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
      title: "See how other men with similar pressure handled it",
      whyItMatches:
        answers.next_step_preference === "community" || answers.primary_goal === "clarity"
          ? "You appear likely to benefit from grounded examples, not just theory."
          : "Community proof can add context once you have a basic plan.",
      expectedValue: "Pattern recognition, social proof, and fewer isolated decisions.",
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


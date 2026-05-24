import {
  getQuestionLabel,
  parseAnswerValueList,
  type AssessmentAnswerMap
} from "@/lib/assessment/questions";

type LegacyLane = {
  badge: string;
  checklist: string[];
  summary: string;
  title: string;
};

export type AssessmentCompletionSummary = {
  badge: string;
  bullets: string[];
  detail: string;
  title: string;
};

const confidenceImpactScore: Record<string, number> = {
  high: 8,
  low: 2,
  moderate: 5,
  very_high: 10
};

function getLane({
  budget,
  goal,
  stage,
  urgency
}: {
  budget: string;
  goal: string;
  stage: string;
  urgency: string;
}): LegacyLane {
  if (goal === "appearance") {
    return {
      title: "Style and confidence lane",
      summary:
        "The fastest visible win is likely a smarter presentation move first, then a more measured decision on treatment.",
      checklist: [
        "Tighten the haircut and grooming strategy around current density.",
        "Use evidence to remove noise, not delay action.",
        "Track changes so future decisions are less emotional."
      ],
      badge: "Fast visible gain"
    };
  }

  if (goal === "regrow" && (urgency === "high" || budget === "all-in")) {
    return {
      title: "Treatment review lane",
      summary:
        "You are likely to benefit from a more direct treatment review instead of stitching together fragmented advice.",
      checklist: [
        "Map the treatment path before spending into guesswork.",
        "Separate evidence-backed options from community noise.",
        "Track adherence, photos, and side effects deliberately."
      ],
      badge: "High support"
    };
  }

  if (stage === "advanced") {
    return {
      title: "Reality-based planning lane",
      summary:
        "A mixed strategy is probably strongest here: presentation, treatment history, and goals should be weighed together.",
      checklist: [
        "Clarify whether the main goal is maintenance, regrowth, presentation, or root-cause clarity.",
        "Avoid miracle-product logic.",
        "Use expert interpretation where the downside of guessing is higher."
      ],
      badge: "Most honest"
    };
  }

  return {
    title: "Stabilize and learn lane",
    summary:
      "You still have room to make calm, evidence-aware moves while contributing useful pattern data.",
    checklist: [
      "Focus on the variables that can be tracked reliably.",
      "Prefer simple repeatable habits over complexity.",
      "Use community proof as context, not as medical advice."
    ],
    badge: "Strong starting point"
  };
}

export function getCompatibilityStage(classificationStage: string) {
  switch (classificationStage) {
    case "V_plus":
    case "V":
    case "VI":
    case "VII":
    case "III_ludwig":
    case "ludwig_iii_ludwig":
      return "advanced";
    case "III":
    case "III_vertex":
    case "IV":
    case "II_ludwig":
    case "frontal_ludwig":
    case "ludwig_ii_ludwig":
    case "frontal_accentuated_ludwig":
      return "accelerating";
    case "I":
    case "II":
    case "I_ludwig":
    case "ludwig_i_ludwig":
    case "not_sure":
    default:
      return "early";
  }
}

export function getCompatibilityGoal(primaryGoal: string) {
  switch (primaryGoal) {
    case "appearance":
      return "appearance";
    case "regrowth":
      return "regrow";
    case "avoid_transplant":
    case "maintain":
    case "stabilize":
    case "clarity":
    case "root_cause":
    default:
      return "stabilize";
  }
}

export function getCompatibilityBudget(budgetBand: string) {
  switch (budgetBand) {
    case "0":
    case "under_50":
      return "lean";
    case "150_300":
    case "300_plus":
      return "all-in";
    case "50_150":
    case "depends":
    case "balanced":
    default:
      return "balanced";
  }
}

export function getCompatibilityUrgency(urgencyLevel: string) {
  switch (urgencyLevel) {
    case "low":
    case "high":
      return urgencyLevel;
    case "medium":
    default:
      return "medium";
  }
}

export function buildLegacyAssessmentPayload(answers: AssessmentAnswerMap) {
  const classificationStage = answers.norwood_stage
    ? answers.norwood_stage
    : answers.ludwig_stage
      ? `${answers.ludwig_stage}_ludwig`
      : "not_sure";
  const stage = getCompatibilityStage(classificationStage);
  const goal = getCompatibilityGoal(answers.primary_goal ?? "root_cause");
  const budget = getCompatibilityBudget(answers.budget_band ?? "depends");
  const urgency = getCompatibilityUrgency(answers.urgency_level ?? "medium");
  const lane = getLane({ stage, goal, budget, urgency });

  return {
    budget,
    goal,
    lane_badge: lane.badge,
    lane_checklist: lane.checklist,
    lane_summary: lane.summary,
    lane_title: lane.title,
    stage,
    urgency
  };
}

function getClassificationLabel(answers: AssessmentAnswerMap) {
  if (answers.norwood_stage) {
    return getQuestionLabel("norwood_stage", answers.norwood_stage);
  }

  if (answers.ludwig_stage) {
    return getQuestionLabel("ludwig_stage", answers.ludwig_stage);
  }

  return "Your classification";
}

export function buildAssessmentCompletionSummary(
  answers: AssessmentAnswerMap
): AssessmentCompletionSummary {
  const primaryGoal = answers.primary_goal ?? "root_cause";
  const treatmentStatus = answers.current_treatment_status ?? "researching";
  const confidenceImpact = confidenceImpactScore[answers.confidence_impact ?? ""] ?? 0;
  const nextStep = answers.next_step_preference ?? "research";
  const stageLabel = getClassificationLabel(answers);
  const labFlags = parseAnswerValueList(answers.abnormal_labs ?? answers.abnormal_lab_markers).filter(
    (value) => value !== "not_sure"
  );
  const treatmentSideEffects = parseAnswerValueList(answers.side_effects ?? answers.treatment_side_effects).filter(
    (value) => value !== "none"
  );
  const medicalContext = [
    ...parseAnswerValueList(answers.hormonal_history),
    ...parseAnswerValueList(answers.autoimmune_skin_history ?? answers.autoimmune_skin_conditions),
    ...parseAnswerValueList(answers.metabolic_history)
  ].filter((value) => !["none", "none_known", "not_sure", "prefer_not_to_say"].includes(value));

  if (confidenceImpact >= 7) {
    return {
      title: "Your profile deserves both data and support.",
      detail:
        "Your answers suggest the emotional load is meaningful. A strong next step should reduce uncertainty without making this feel heavier than it already does.",
      badge: "Higher support profile",
      bullets: [
        `${stageLabel} is one useful signal, but progression, stress, treatment history, and goals matter too.`,
        "Presentation support and evidence-aware planning can work together.",
        `Your preferred next step is ${getQuestionLabel("next_step_preference", nextStep).toLowerCase()}.`
      ]
    };
  }

  if (treatmentStatus === "none" && (primaryGoal === "stabilize" || primaryGoal === "regrowth")) {
    return {
      title: "You still have room to act calmly.",
      detail:
        "This looks like a good moment for structure: classify the pattern, understand possible contributors, and avoid random experimentation.",
      badge: "Good planning window",
      bullets: [
        `${stageLabel} does not automatically mean you need an extreme response.`,
        "Your answers can help the community compare early action, lifestyle patterns, and treatment timing.",
        "A simple tracking plan can make future changes easier to interpret."
      ]
    };
  }

  if (labFlags.length > 0 || medicalContext.length > 0 || treatmentSideEffects.length > 0) {
    return {
      title: "Your profile has useful clinical context.",
      detail:
        "The strongest insight may come from connecting hair-loss pattern, labs, medical history, medication exposure, and treatment response rather than looking at one variable alone.",
      badge: "Multi-factor profile",
      bullets: [
        "Flagged labs, medical history, or side effects are valuable structured signals for aggregate analysis.",
        "This is the kind of profile where careful interpretation beats one-size-fits-all advice.",
        "Longitudinal tracking could be especially useful if you change treatments or correct deficiencies."
      ]
    };
  }

  return {
    title: "You are helping turn scattered experiences into clearer patterns.",
    detail:
      "Your answers create a structured baseline that can support community insights, treatment comparisons, and future progress tracking.",
    badge: "Research-ready baseline",
    bullets: [
      `${stageLabel} is only one signal. Lifestyle, medical context, goals, and treatment history add the useful texture.`,
      "The dataset gets stronger when members contribute honest, normalized answers.",
      "You can use this baseline later for progress photos, treatment timelines, and personalized insights."
    ]
  };
}

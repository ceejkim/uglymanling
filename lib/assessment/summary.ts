import { getQuestionLabel, type AssessmentAnswerMap } from "@/lib/assessment/questions";

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
        "Tighten the haircut and grooming strategy around your current density.",
        "Use research to eliminate noise, not delay action.",
        "Pull in expert help only if you want a second opinion on treatment."
      ],
      badge: "Fast visible gain"
    };
  }

  if (goal === "regrow" && (urgency === "high" || budget === "all-in")) {
    return {
      title: "Treatment sprint lane",
      summary:
        "You are likely to benefit from a more direct treatment review instead of stitching together random advice.",
      checklist: [
        "Map the treatment path before spending into guesswork.",
        "Shorten the path to clarity with real expert context if needed.",
        "Track any intervention deliberately so you know what is helping."
      ],
      badge: "High support"
    };
  }

  if (stage === "advanced") {
    return {
      title: "Reality-based planning lane",
      summary:
        "A mixed strategy is probably strongest here: presentation first, treatment only where it still earns its cost.",
      checklist: [
        "Clarify whether your goal is maintenance, presentation, or education.",
        "Ignore miracle product logic.",
        "Lean on expert judgment where the downside of guessing is higher."
      ],
      badge: "Most honest"
    };
  }

  return {
    title: "Stabilize and learn lane",
    summary:
      "You still have room to make calm, evidence-backed moves without turning this into a full-time hobby.",
    checklist: [
      "Focus on the few levers that matter.",
      "Prefer simple repeatable habits over complexity.",
      "Use community proof as context, not as medical advice."
    ],
    badge: "Strong starting point"
  };
}

export function getCompatibilityStage(norwoodStage: string) {
  switch (norwoodStage) {
    case "IV":
      return "accelerating";
    case "V_plus":
      return "advanced";
    case "III":
    case "III_vertex":
      return "accelerating";
    case "I":
    case "II":
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
    case "stabilize":
    case "clarity":
    default:
      return "stabilize";
  }
}

export function getCompatibilityBudget(budgetBand: string) {
  switch (budgetBand) {
    case "lean":
      return "lean";
    case "all_in":
      return "all-in";
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
  const stage = getCompatibilityStage(answers.norwood_stage ?? "not_sure");
  const goal = getCompatibilityGoal(answers.primary_goal ?? "clarity");
  const budget = getCompatibilityBudget(answers.budget_band ?? "balanced");
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

export function buildAssessmentCompletionSummary(
  answers: AssessmentAnswerMap
): AssessmentCompletionSummary {
  const primaryGoal = answers.primary_goal ?? "clarity";
  const treatmentStatus = answers.current_treatment_status ?? "researching";
  const confidenceImpact = answers.confidence_impact ?? "moderate";
  const styleConfidence = answers.current_hairstyle_confidence ?? "okay";
  const nextStep = answers.next_step_preference ?? "research";
  const stageLabel = getQuestionLabel("norwood_stage", answers.norwood_stage ?? "not_sure");

  if (primaryGoal === "appearance") {
    return {
      title: "Your profile leans style-first.",
      detail:
        "The strongest short-term win is probably a better presentation move before you disappear into treatment rabbit holes.",
      badge: "Fastest relief",
      bullets: [
        `${stageLabel} is often more manageable than it feels when the cut is working.`,
        "Your answers point toward visible confidence gains before deeper intervention.",
        `A ${nextStep === "barber" ? "barber-led" : "style-led"} next step is likely to feel most rewarding.`
      ]
    };
  }

  if (treatmentStatus === "none" && (primaryGoal === "stabilize" || primaryGoal === "regrowth")) {
    return {
      title: "You still have room to act calmly.",
      detail:
        "This looks more like a decision-quality problem than a no-hope problem. A simple evidence-backed plan should beat random experimentation.",
      badge: "Good intervention window",
      bullets: [
        `${stageLabel} does not automatically mean you need an extreme response.`,
        "Starting with structure now is likely better than collecting more vague opinions.",
        "You should be able to narrow the next move without overcommitting."
      ]
    };
  }

  if (confidenceImpact === "high" || confidenceImpact === "very_high" || styleConfidence === "very_low") {
    return {
      title: "Support and presentation should work together.",
      detail:
        "Your answers suggest the emotional weight is high enough that speed and clarity matter more than theoretical perfection.",
      badge: "Higher urgency profile",
      bullets: [
        "A better cut or grooming reset could create relief faster than more reading.",
        "If you want the shortest path to clarity, expert guidance may be worth it.",
        "You do not need to solve every hair question before making a useful first move."
      ]
    };
  }

  return {
    title: "You are closer to a clarity-first profile.",
    detail:
      "You likely need a cleaner framework more than a dramatic intervention. That is a good place to start.",
    badge: "Strong foundation",
    bullets: [
      `${stageLabel} is only one signal. The surrounding grooming and confidence context matters too.`,
      "A structured next step should help more than another week of scrolling.",
      "You look well suited to a simple plan that keeps optionality open."
    ]
  };
}


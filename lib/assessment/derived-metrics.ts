import type { AssessmentBenchmarkPayload } from "@/lib/assessment/benchmarks";
import {
  getQuestionLabel,
  parseAnswerValueList,
  type AssessmentAnswerMap
} from "@/lib/assessment/questions";

export type ResultMetricTone = "alert" | "good" | "neutral" | "watch";

export type ResultInsightVisual =
  | {
      label: string;
      type: "meter";
      value: number;
    }
  | {
      label: string;
      sampleLabel: string;
      type: "ring";
      value: number;
    }
  | {
      bars: Array<{
        label: string;
        tone: ResultMetricTone;
        value: number;
      }>;
      type: "bars";
    }
  | {
      icons: Array<{
        active: boolean;
        key: string;
        label: string;
        shortLabel: string;
        tone: ResultMetricTone;
      }>;
      type: "icons";
    }
  | {
      items: Array<{
        detail: string;
        label: string;
        score: number;
      }>;
      type: "rank";
    }
  | {
      label: string;
      tone: ResultMetricTone;
      type: "status";
      value: number;
    };

export type ResultInsightCard = {
  backCopy: string;
  backFootnote?: string;
  backTitle: string;
  frontCopy: string;
  key: string;
  title: string;
  visual: ResultInsightVisual;
};

type ResultContextIcon = Extract<ResultInsightVisual, { type: "icons" }>["icons"][number];

export type ResultCtaEvent =
  | "barber_cta_clicked"
  | "dermatologist_cta_clicked"
  | "lifestyle_cta_clicked"
  | "style_cta_clicked";

export type ResultNextStepCard = {
  ctaEvent?: ResultCtaEvent;
  ctaLabel: string;
  destinationType: string;
  href: string;
  key: string;
  priority: number;
  text: string;
  title: string;
};

export type ResultNextStepBucket = {
  cards: ResultNextStepCard[];
  id: "lifestyle" | "medical" | "style";
  subtitle: string;
  title: string;
};

export type AssessmentDashboardMetrics = {
  ageBucket: string;
  communityComparison: {
    basis: "early_benchmark" | "live_cohort";
    confidence: "high" | "low" | "medium";
    densityRetentionPercentile: number;
    sampleSize: number;
  };
  concernLevel: number;
  hero: {
    archetype: string;
    subtitle: string;
  };
  insightCards: ResultInsightCard[];
  interventionWindow: {
    copy: string;
    label: "Delayed" | "Moderate" | "Strong";
    score: number;
    tone: ResultMetricTone;
  };
  lifestyleFlags: string[];
  lifestyleRiskScore: number;
  medicalFlags: string[];
  nextStepBuckets: ResultNextStepBucket[];
  paceBand: "Fast" | "Gradual" | "Moderate";
  paceScore: number;
  resultCardKeys: string[];
  selfReportedStage: string;
  styleFlags: string[];
  topDrivers: Array<{
    detail: string;
    key: "genetic_pattern" | "lifestyle_amplification" | "styling_contrast";
    label: string;
    score: number;
  }>;
  visibleLossScore: number;
};

type PopulationStat = {
  avgConcernLevel: number;
  avgLifestyleRiskScore: number;
  avgPaceScore: number;
  avgVisibleLossScore: number;
  sampleSize: number;
};

const populationStats: Record<string, PopulationStat> = {
  "under_18": {
    avgConcernLevel: 64,
    avgLifestyleRiskScore: 44,
    avgPaceScore: 52,
    avgVisibleLossScore: 28,
    sampleSize: 46
  },
  "18_24": {
    avgConcernLevel: 68,
    avgLifestyleRiskScore: 48,
    avgPaceScore: 50,
    avgVisibleLossScore: 34,
    sampleSize: 184
  },
  "25_34": {
    avgConcernLevel: 62,
    avgLifestyleRiskScore: 46,
    avgPaceScore: 48,
    avgVisibleLossScore: 42,
    sampleSize: 322
  },
  "35_44": {
    avgConcernLevel: 56,
    avgLifestyleRiskScore: 44,
    avgPaceScore: 44,
    avgVisibleLossScore: 52,
    sampleSize: 218
  },
  "45_54": {
    avgConcernLevel: 50,
    avgLifestyleRiskScore: 42,
    avgPaceScore: 40,
    avgVisibleLossScore: 60,
    sampleSize: 136
  },
  "55_plus": {
    avgConcernLevel: 46,
    avgLifestyleRiskScore: 40,
    avgPaceScore: 36,
    avgVisibleLossScore: 66,
    sampleSize: 94
  }
};

const visibleStageScore: Record<string, number> = {
  "ludwig:I": 30,
  "ludwig:II": 58,
  "ludwig:III": 84,
  "ludwig:frontal": 52,
  "ludwig:not_sure": 44,
  "norwood:I": 12,
  "norwood:II": 26,
  "norwood:III": 42,
  "norwood:III_vertex": 50,
  "norwood:IV": 62,
  "norwood:V": 76,
  "norwood:V_plus": 78,
  "norwood:VI": 88,
  "norwood:VII": 96,
  "norwood:not_sure": 42,
  "pattern:crown_vertex": 50,
  "pattern:diffuse_top": 54,
  "pattern:hairline_temples": 42,
  "pattern:not_sure": 42,
  "pattern:patchy": 62
};

const concernScore: Record<string, number> = {
  high: 78,
  low: 24,
  moderate: 52,
  very_high: 92
};

const progressionScore: Record<string, number> = {
  episodic_shedding: 76,
  gradual: 38,
  not_sure: 50,
  rapid_6mo: 88,
  recent_12mo: 62,
  stable: 18
};

const sheddingScore: Record<string, number> = {
  episodic_clumps: 88,
  heavy_daily: 82,
  more_than_usual: 60,
  not_much: 20,
  not_sure: 46
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function answerValues(answers: AssessmentAnswerMap, ...questionIds: string[]) {
  return questionIds.flatMap((questionId) => parseAnswerValueList(answers[questionId]));
}

function hasSignal(
  answers: AssessmentAnswerMap,
  questionIds: string[],
  excludedValues: string[]
) {
  return answerValues(answers, ...questionIds).some((value) => !excludedValues.includes(value));
}

function numericAnswer(answers: AssessmentAnswerMap, questionId: string) {
  const value = Number(answers[questionId] ?? 0);

  return Number.isFinite(value) ? value : 0;
}

function getStage(answers: AssessmentAnswerMap) {
  if (answers.norwood_stage) {
    return {
      key: `norwood:${answers.norwood_stage}`,
      label: getQuestionLabel("norwood_stage", answers.norwood_stage)
    };
  }

  if (answers.ludwig_stage) {
    return {
      key: `ludwig:${answers.ludwig_stage}`,
      label: getQuestionLabel("ludwig_stage", answers.ludwig_stage)
    };
  }

  if (answers.pattern_general) {
    return {
      key: `pattern:${answers.pattern_general}`,
      label: getQuestionLabel("pattern_general", answers.pattern_general)
    };
  }

  return {
    key: "pattern:not_sure",
    label: "Not sure"
  };
}

function buildVisibleLossScore(answers: AssessmentAnswerMap) {
  const stage = getStage(answers);
  const primaryConcern = answerValues(answers, "primary_concern_area");
  let score = visibleStageScore[stage.key] ?? 42;

  if (primaryConcern.includes("overall_density") || primaryConcern.includes("top_diffuse")) {
    score += 6;
  }

  if (primaryConcern.includes("crown")) {
    score += 4;
  }

  if (primaryConcern.includes("not_sure")) {
    score -= 3;
  }

  return clampScore(score);
}

function buildConcernLevel(answers: AssessmentAnswerMap) {
  let score = concernScore[answers.confidence_impact ?? ""] ?? 45;
  const socialImpact = answerValues(answers, "social_impact").filter((value) => value !== "none");

  if (answers.urgency_level === "high") {
    score += 10;
  } else if (answers.urgency_level === "low") {
    score -= 8;
  }

  score += Math.min(12, socialImpact.length * 4);

  if (answers.current_hairstyle_confidence === "very_low") {
    score += 9;
  } else if (answers.current_hairstyle_confidence === "low") {
    score += 6;
  }

  return clampScore(score);
}

function buildPaceScore(answers: AssessmentAnswerMap) {
  const progression = progressionScore[answers.progression_pace ?? ""] ?? 46;
  const shedding = sheddingScore[answers.shedding_amount ?? ""] ?? 42;
  let score = progression * 0.62 + shedding * 0.38;
  const triggerEvents = answerValues(answers, "trigger_events_recent").filter((value) => value !== "none");

  if (triggerEvents.length > 0) {
    score += 6;
  }

  if (answers.covid_illness_link === "yes_covid" || answers.covid_illness_link === "yes_other_illness") {
    score += 5;
  }

  return clampScore(score);
}

function buildLifestyleRiskScore(answers: AssessmentAnswerMap) {
  const stress = numericAnswer(answers, "stress_level");
  const sleepQuality = numericAnswer(answers, "sleep_quality");
  const sleepDuration = answers.sleep_duration;
  let score = 18;

  if (stress > 0) {
    score += stress * 4;
  }

  if (sleepQuality > 0) {
    score += (10 - sleepQuality) * 3;
  }

  if (sleepDuration === "under_5") {
    score += 18;
  } else if (sleepDuration === "5_6") {
    score += 12;
  } else if (sleepDuration === "6_7") {
    score += 4;
  }

  if (hasSignal(answers, ["nicotine_use"], ["none"])) {
    score += answers.nicotine_frequency === "daily_heavy" ? 18 : 10;
  }

  if (answers.diet_pattern === "inconsistent") {
    score += 10;
  }

  if (answerValues(answers, "nutrition_gaps").some((value) => !["none_known", "not_sure"].includes(value))) {
    score += 12;
  }

  if (answerValues(answers, "recent_stressors").some((value) => value !== "none")) {
    score += 8;
  }

  return clampScore(score);
}

function buildMedicalFlags(answers: AssessmentAnswerMap) {
  const flags: string[] = [];

  if (answers.progression_pace === "rapid_6mo" || answers.shedding_amount === "heavy_daily" || answers.shedding_amount === "episodic_clumps") {
    flags.push("rapid shedding");
  }

  if (answerValues(answers, "primary_concern_area").includes("top_diffuse") || answers.pattern_general === "diffuse_top") {
    flags.push("diffuse thinning");
  }

  if (answers.pattern_general === "patchy" || answers.clinical_diagnosis_status === "alopecia_areata") {
    flags.push("unusual pattern");
  }

  if (hasSignal(answers, ["medications_history"], ["none"])) {
    flags.push("medication context");
  }

  if (
    hasSignal(answers, ["hormonal_history"], ["none_known", "not_sure"]) ||
    answerValues(answers, "abnormal_lab_markers").includes("thyroid")
  ) {
    flags.push("thyroid/endocrine");
  }

  if (hasSignal(answers, ["autoimmune_skin_conditions"], ["none_known"])) {
    flags.push("autoimmune/scalp");
  }

  if (
    answerValues(answers, "medications_history").includes("blood_pressure") ||
    answerValues(answers, "metabolic_history").some((value) => ["cardiovascular", "diabetes", "insulin_resistance", "sleep_apnea"].includes(value))
  ) {
    flags.push("health flags");
  }

  if (answers.clinical_diagnosis_status === "no_diagnosis" || answers.clinical_diagnosis_status === "not_sure") {
    flags.push("high uncertainty");
  }

  return flags;
}

function buildLifestyleFlags(answers: AssessmentAnswerMap) {
  const flags: string[] = [];
  const stress = numericAnswer(answers, "stress_level");
  const sleepQuality = numericAnswer(answers, "sleep_quality");

  if (stress >= 7 || answerValues(answers, "recent_stressors").some((value) => value !== "none")) {
    flags.push("stress");
  }

  if (sleepQuality > 0 && sleepQuality <= 4) {
    flags.push("sleep");
  }

  if (answers.sleep_duration === "under_5" || answers.sleep_duration === "5_6") {
    flags.push("short sleep");
  }

  if (hasSignal(answers, ["nicotine_use"], ["none"])) {
    flags.push("nicotine");
  }

  if (answerValues(answers, "nutrition_gaps").some((value) => !["none_known", "not_sure"].includes(value))) {
    flags.push("nutrition");
  }

  if (answers.diet_pattern === "inconsistent") {
    flags.push("routine");
  }

  return flags;
}

function buildStyleFlags(answers: AssessmentAnswerMap) {
  const flags: string[] = [];
  const concerns = answerValues(answers, "primary_concern_area");

  if (answers.current_hairstyle_confidence === "low" || answers.current_hairstyle_confidence === "very_low") {
    flags.push("haircut dissatisfaction");
  }

  if (concerns.includes("hairline") || concerns.includes("temples") || answers.pattern_general === "hairline_temples") {
    flags.push("hairline contrast");
  }

  if (concerns.includes("crown") || answers.pattern_general === "crown_vertex") {
    flags.push("crown contrast");
  }

  if (answers.primary_goal === "appearance" || answers.next_step_preference === "barber") {
    flags.push("appearance priority");
  }

  return flags;
}

function buildPaceBand(paceScore: number): AssessmentDashboardMetrics["paceBand"] {
  if (paceScore >= 70) {
    return "Fast";
  }

  if (paceScore >= 42) {
    return "Moderate";
  }

  return "Gradual";
}

function buildInterventionWindow(
  visibleLossScore: number,
  paceScore: number
): AssessmentDashboardMetrics["interventionWindow"] {
  if (visibleLossScore <= 52 && paceScore <= 74) {
    return {
      copy: "This is a high-option stage. The next move can still be boring, structured, and useful.",
      label: "Strong",
      score: 82,
      tone: "good"
    };
  }

  if (visibleLossScore <= 78) {
    return {
      copy: "There is still room to make a cleaner plan. Less panic, more pattern recognition.",
      label: "Moderate",
      score: 58,
      tone: "watch"
    };
  }

  return {
    copy: "Your answers suggest fewer quick wins, but still useful routes: classification, styling, and realistic planning.",
    label: "Delayed",
    score: 32,
    tone: "alert"
  };
}

function buildHero(
  concernLevel: number,
  visibleLossScore: number,
  paceBand: AssessmentDashboardMetrics["paceBand"]
) {
  if (paceBand === "Fast") {
    return {
      archetype: "Active Shedding Signal",
      subtitle: "Your answers point to faster recent change. Rule-outs beat guessing here."
    };
  }

  if (concernLevel - visibleLossScore >= 24) {
    return {
      archetype: "High-Alert Early Stage",
      subtitle: "Your concern appears louder than your visible loss. Common, annoying, and useful to catch early."
    };
  }

  if (visibleLossScore <= 42) {
    return {
      archetype: "High-Option Density Shift",
      subtitle: "Your pattern looks early enough that the next move matters more than panic."
    };
  }

  if (visibleLossScore >= 74) {
    return {
      archetype: "Advanced Pattern Planning",
      subtitle: "Your answers suggest a clearer pattern with fewer low-effort wins, but still real options."
    };
  }

  return {
    archetype: "Gradual Density Shift",
    subtitle: "Your pattern suggests slower, longer-term change rather than sudden collapse."
  };
}

function buildTopDrivers(
  answers: AssessmentAnswerMap,
  visibleLossScore: number,
  lifestyleRiskScore: number,
  styleFlags: string[]
) {
  const familyHistory = answers.family_history;
  const geneticScore = clampScore(
    34 +
      visibleLossScore * 0.5 +
      (familyHistory && !["none_known", "not_sure"].includes(familyHistory) ? 18 : 0)
  );
  const lifestyleScore = clampScore(
    18 +
      lifestyleRiskScore * 0.62 +
      (answers.progression_pace === "episodic_shedding" || answers.shedding_amount === "heavy_daily" ? 10 : 0)
  );
  const styleScore = clampScore(
    22 +
      styleFlags.length * 16 +
      (answers.current_hairstyle_confidence === "very_low" ? 16 : 0)
  );

  return [
    {
      detail: "Family history, stage, and pattern answers raise this signal.",
      key: "genetic_pattern" as const,
      label: "Genetic pattern",
      score: geneticScore
    },
    {
      detail: "Stress, sleep, nicotine, nutrition, illness, or trigger timing can amplify the picture.",
      key: "lifestyle_amplification" as const,
      label: "Lifestyle amplification",
      score: lifestyleScore
    },
    {
      detail: "Cut length, contrast, crown exposure, and confidence with the current style change how visible this feels.",
      key: "styling_contrast" as const,
      label: "Styling contrast",
      score: styleScore
    }
  ].sort((left, right) => right.score - left.score);
}

function buildCommunityComparison(
  ageBucket: string,
  visibleLossScore: number,
  benchmarkPayload?: AssessmentBenchmarkPayload
): AssessmentDashboardMetrics["communityComparison"] {
  const fallback = populationStats[ageBucket] ?? populationStats["25_34"];
  const liveCohortIsUseful = Boolean(benchmarkPayload && benchmarkPayload.cohortSize >= 8);
  const densityRetentionPercentile = clampScore(
    50 + (fallback.avgVisibleLossScore - visibleLossScore) * 0.86
  );

  return {
    basis: liveCohortIsUseful ? "live_cohort" : "early_benchmark",
    confidence: liveCohortIsUseful ? benchmarkPayload?.confidence ?? "low" : "low",
    densityRetentionPercentile,
    sampleSize: liveCohortIsUseful ? benchmarkPayload?.cohortSize ?? 0 : fallback.sampleSize
  };
}

function iconState(
  key: string,
  label: string,
  shortLabel: string,
  flags: string[]
): ResultContextIcon {
  const active = flags.includes(key) || (key === "sleep" && flags.includes("short sleep"));

  return {
    active,
    key,
    label,
    shortLabel,
    tone: active ? "watch" : "neutral"
  };
}

function buildInsightCards(metrics: Omit<AssessmentDashboardMetrics, "insightCards" | "nextStepBuckets" | "resultCardKeys">): ResultInsightCard[] {
  const contextFlags = [...metrics.lifestyleFlags, ...metrics.medicalFlags];
  const paceCopy =
    metrics.paceBand === "Fast"
      ? "Faster than the quiet baseline for your age band"
      : metrics.paceBand === "Moderate"
        ? "Noticeable, but not automatically catastrophic"
        : "Slower than average for your age band";
  const perceptionGap = metrics.concernLevel - metrics.visibleLossScore;

  return [
    {
      backCopy:
        metrics.paceBand === "Fast"
          ? "Your recent timeline and shedding answers make pace the signal to respect. It does not diagnose a cause, but it does make a medical rule-out more sensible."
          : "Your timeline reads more controlled than emergency-coded. Keep watching the pattern, but the goal is not panic. The goal is pattern recognition.",
      backFootnote: "Educational only. Pace is inferred from self-reported survey answers.",
      backTitle: "Why we read it this way",
      frontCopy: paceCopy,
      key: "hair_loss_pace",
      title: "Hair Loss Pace",
      visual: {
        label: metrics.paceBand,
        type: "meter",
        value: metrics.paceScore
      }
    },
    {
      backCopy:
        metrics.communityComparison.basis === "live_cohort"
          ? "This compares your self-reported visible-loss signal with anonymous completed profiles. Useful directionally, not clinically."
          : "This uses an early benchmark while live cohorts grow. Treat it as a starting estimate, not a verdict.",
      backFootnote:
        "Community comparisons are based on user-reported survey data and should not be interpreted as clinical evidence.",
      backTitle: "What the percentile means",
      frontCopy: "Compared to your age band",
      key: "community_comparison",
      title: "Community Comparison",
      visual: {
        label: "Estimated density retention",
        sampleLabel: `${metrics.communityComparison.sampleSize} profiles`,
        type: "ring",
        value: metrics.communityComparison.densityRetentionPercentile
      }
    },
    {
      backCopy:
        perceptionGap >= 18
          ? "Your concern appears higher than your estimated visible severity, which is common in early-stage change. Your brain is not broken. It is just running loud."
          : "Your concern and visible-loss estimate look relatively aligned. That usually makes the next decision easier to prioritize.",
      backFootnote: "This is not a mental health assessment or clinical severity score.",
      backTitle: "The mirror signal",
      frontCopy:
        perceptionGap >= 18
          ? "Your concern appears louder than your visible loss."
          : "Concern and visible loss look reasonably aligned.",
      key: "perception_vs_visible_loss",
      title: "Perception vs Visible Loss",
      visual: {
        bars: [
          {
            label: "Concern",
            tone: perceptionGap >= 18 ? "watch" : "neutral",
            value: metrics.concernLevel
          },
          {
            label: "Visible loss",
            tone: "neutral",
            value: metrics.visibleLossScore
          }
        ],
        type: "bars"
      }
    },
    {
      backCopy:
        contextFlags.length > 0
          ? "Some reported factors may correlate with shedding or perceived progression. Correlation does not imply causation, but it does help decide what to rule out first."
          : "You did not report many obvious amplifiers. That does not prove a cause; it just keeps the first pass cleaner.",
      backFootnote: "Not a diagnosis. Speak with a licensed clinician for medical evaluation.",
      backTitle: "Context, not causation",
      frontCopy:
        contextFlags.length > 0
          ? "Potential contributing context"
          : "Few obvious amplifiers reported",
      key: "lifestyle_medical_context",
      title: "Lifestyle / Medical Context",
      visual: {
        icons: [
          iconState("stress", "Stress", "ST", contextFlags),
          iconState("sleep", "Sleep", "SL", contextFlags),
          iconState("nicotine", "Nicotine", "NI", contextFlags),
          iconState("health flags", "Blood pressure / health", "BP", contextFlags),
          iconState("medication context", "Medications", "RX", contextFlags),
          iconState("rapid shedding", "Rapid shedding", "RS", contextFlags),
          iconState("thyroid/endocrine", "Thyroid / endocrine", "TH", contextFlags),
          iconState("autoimmune/scalp", "Autoimmune / scalp", "AI", contextFlags)
        ],
        type: "icons"
      }
    },
    {
      backCopy: "The ranking blends pattern, family-history, lifestyle, shedding, and style-confidence signals. It is a decision aid, not a cause label.",
      backFootnote: "We do not diagnose androgenetic alopecia or any other condition.",
      backTitle: "Why this driver leads",
      frontCopy: `Top signal: ${metrics.topDrivers[0]?.label ?? "Pattern context"}`,
      key: "most_likely_driver",
      title: "Most Likely Driver",
      visual: {
        items: metrics.topDrivers,
        type: "rank"
      }
    },
    {
      backCopy:
        "The window matters because earlier, cleaner decisions are easier to track. Your next steps below are prioritized around this signal.",
      backFootnote: "Educational only. Not medical advice.",
      backTitle: "Why the window matters",
      frontCopy: metrics.interventionWindow.copy,
      key: "intervention_window",
      title: "Intervention Window",
      visual: {
        label: metrics.interventionWindow.label,
        tone: metrics.interventionWindow.tone,
        type: "status",
        value: metrics.interventionWindow.score
      }
    }
  ];
}

function sortCards(cards: ResultNextStepCard[]) {
  return cards.sort((left, right) => right.priority - left.priority).slice(0, 3);
}

function buildNextStepBuckets(metrics: Omit<AssessmentDashboardMetrics, "insightCards" | "nextStepBuckets" | "resultCardKeys">): ResultNextStepBucket[] {
  const needsRuleOut = metrics.medicalFlags.some((flag) =>
    ["diffuse thinning", "health flags", "high uncertainty", "medication context", "rapid shedding", "thyroid/endocrine", "unusual pattern"].includes(flag)
  );
  const lifestyleNeedsAttention = metrics.lifestyleRiskScore >= 58 || metrics.lifestyleFlags.length > 0;
  const styleNeedsAttention = metrics.styleFlags.length > 0 || metrics.concernLevel >= 60;

  const medicalCards: ResultNextStepCard[] = [
    {
      ctaEvent: "dermatologist_cta_clicked",
      ctaLabel: "Find recommended dermatologists",
      destinationType: "dermatologist_directory",
      href: "/recommendations/dermatologists",
      key: "medical_rule_out",
      priority: needsRuleOut ? 100 : 62,
      text: needsRuleOut
        ? "Your responses suggest it may be worth speaking with a dermatologist to rule out non-genetic contributors."
        : "You do not need drama here. A clinician can still help name the pattern and reduce guessing.",
      title: needsRuleOut ? "Get a medical rule-out" : "Clarify the pattern"
    },
    {
      ctaLabel: "Explore stabilization options",
      destinationType: "stabilization_options",
      href: "/recommendations/stabilization",
      key: "stabilization_options",
      priority: metrics.interventionWindow.label === "Strong" ? 84 : 58,
      text: "If your goal is keeping what you have, compare the main stabilization lanes before buying random bottles.",
      title: "Explore stabilization options"
    }
  ];
  const lifestyleCards: ResultNextStepCard[] = [
    {
      ctaEvent: "lifestyle_cta_clicked",
      ctaLabel: "See lifestyle checklist",
      destinationType: "lifestyle_checklist",
      href: "/recommendations/lifestyle",
      key: "reduce_amplifiers",
      priority: lifestyleNeedsAttention ? 100 : 68,
      text: lifestyleNeedsAttention
        ? "Stress, poor sleep, nicotine, nutrition, or recovery issues may worsen perceived shedding for some users."
        : "Keep the basics boring so future changes are easier to interpret.",
      title: lifestyleNeedsAttention ? "Reduce amplification factors" : "Keep recovery boring"
    },
    {
      ctaEvent: "lifestyle_cta_clicked",
      ctaLabel: "See anxiety-safe tracking",
      destinationType: "lifestyle_checklist",
      href: "/recommendations/lifestyle",
      key: "mirror_loop",
      priority: metrics.concernLevel - metrics.visibleLossScore >= 18 ? 82 : 34,
      text: "Your concern may be louder than the visible signal. Track on a schedule, not every reflective surface.",
      title: "Turn down the mirror loop"
    }
  ];
  const styleCards: ResultNextStepCard[] = [
    {
      ctaEvent: "barber_cta_clicked",
      ctaLabel: "Find recommended barbers",
      destinationType: "barber_directory",
      href: "/style/barbers",
      key: "density_barber",
      priority: styleNeedsAttention ? 100 : 70,
      text: "Your haircut may be doing your hairline dirty. A density-aware barber can lower contrast fast.",
      title: "Optimize the haircut first"
    },
    {
      ctaEvent: "style_cta_clicked",
      ctaLabel: "View suggested hairstyles",
      destinationType: "hairstyle_recommendations",
      href: "/recommendations/hairstyles",
      key: "style_shapes",
      priority: metrics.styleFlags.some((flag) => ["crown contrast", "hairline contrast"].includes(flag)) ? 86 : 52,
      text: "Shorter sides, better top length, and less scalp contrast can make the same density read cleaner.",
      title: "Pick lower-contrast styles"
    }
  ];

  return [
    {
      cards: sortCards(medicalCards),
      id: "medical",
      subtitle: "Rule out what should not be guessed.",
      title: "Medical"
    },
    {
      cards: sortCards(lifestyleCards),
      id: "lifestyle",
      subtitle: "Reduce the stuff that makes the signal noisy.",
      title: "Lifestyle"
    },
    {
      cards: sortCards(styleCards),
      id: "style",
      subtitle: "Fast visible wins while the deeper plan forms.",
      title: "Style"
    }
  ];
}

export function buildAssessmentDashboardMetrics(
  answers: AssessmentAnswerMap,
  benchmarkPayload?: AssessmentBenchmarkPayload
): AssessmentDashboardMetrics {
  const ageBucket = answers.age_range ?? "25_34";
  const stage = getStage(answers);
  const visibleLossScore = buildVisibleLossScore(answers);
  const concernLevel = buildConcernLevel(answers);
  const paceScore = buildPaceScore(answers);
  const paceBand = buildPaceBand(paceScore);
  const lifestyleRiskScore = buildLifestyleRiskScore(answers);
  const medicalFlags = buildMedicalFlags(answers);
  const lifestyleFlags = buildLifestyleFlags(answers);
  const styleFlags = buildStyleFlags(answers);
  const topDrivers = buildTopDrivers(answers, visibleLossScore, lifestyleRiskScore, styleFlags);
  const interventionWindow = buildInterventionWindow(visibleLossScore, paceScore);
  const communityComparison = buildCommunityComparison(ageBucket, visibleLossScore, benchmarkPayload);
  const hero = buildHero(concernLevel, visibleLossScore, paceBand);
  const baseMetrics = {
    ageBucket,
    communityComparison,
    concernLevel,
    hero,
    interventionWindow,
    lifestyleFlags,
    lifestyleRiskScore,
    medicalFlags,
    paceBand,
    paceScore,
    selfReportedStage: stage.label,
    styleFlags,
    topDrivers,
    visibleLossScore
  };
  const insightCards = buildInsightCards(baseMetrics);
  const nextStepBuckets = buildNextStepBuckets(baseMetrics);

  return {
    ...baseMetrics,
    insightCards,
    nextStepBuckets,
    resultCardKeys: [
      ...insightCards.map((card) => card.key),
      ...nextStepBuckets.flatMap((bucket) => bucket.cards.map((card) => card.key))
    ]
  };
}

export const assessmentVersion = "2026-06-community-survey-v5";

export type AssessmentInput =
  | "cards"
  | "chips"
  | "image_scale"
  | "multi_chips"
  | "multi_select"
  | "scale"
  | "slider"
  | "upload"
  | "uploads";
export type AssessmentResponseFormat =
  | "file_upload_metadata"
  | "integer_scale"
  | "multi_select"
  | "single_choice";
export type AssessmentDataType =
  | "boolean"
  | "integer"
  | "metadata"
  | "multi_nominal"
  | "nominal"
  | "ordinal";

export type AssessmentSection = {
  description: string;
  id: string;
  title: string;
};

export type AssessmentOption = {
  description?: string;
  exclusive?: boolean;
  imageAlt?: string;
  imageSrc?: string;
  label: string;
  shortLabel?: string;
  value: string;
  visual?: {
    level: number;
    scale: "ludwig" | "norwood" | "pattern";
  };
};

export type AssessmentUploadSlot = {
  description: string;
  id: string;
  label: string;
};

export type AssessmentCondition = {
  operator: "equals" | "exists" | "includes" | "not_equals" | "one_of";
  questionId: string;
  value?: string;
  values?: string[];
};

export type AssessmentSlider = {
  defaultValue: number;
  max: number;
  maxLabel: string;
  min: number;
  minLabel: string;
  step: number;
  valueLabels?: Record<number, string>;
};

export type AssessmentQuestion = {
  analyticsCategory: string;
  autoAdvance?: boolean;
  conditions?: AssessmentCondition[];
  dataType: AssessmentDataType;
  helper?: string;
  id: string;
  input: AssessmentInput;
  max?: number;
  maxLabel?: string;
  min?: number;
  minLabel?: string;
  noneValue?: string;
  options: AssessmentOption[];
  prompt: string;
  responseFormat: AssessmentResponseFormat;
  sectionId: string;
  sectionRationale: string;
  sectionTitle: string;
  slider?: AssessmentSlider;
  step?: number;
  tags: string[];
  uploadSlots?: AssessmentUploadSlot[];
};

export type AssessmentAnswerMap = Record<string, string>;

export type AssessmentAnalyticsField = {
  dataType: AssessmentDataType;
  id: string;
  options?: string[];
  responseFormat: AssessmentResponseFormat;
  sectionId: string;
  tags: string[];
};

export type UploadManifest = {
  assets: Array<{
    fileName: string;
    fileSize: number;
    id: string;
    imageSlot: string;
    mimeType: string;
    storageBucket: string;
    storagePath: string;
  }>;
  status: "idle" | "skipped" | "uploaded";
};

const sectionContent: Record<string, AssessmentSection> = {
  baseline_profile: {
    id: "baseline_profile",
    title: "Baseline Profile",
    description: "A quick foundation for segmentation, pattern analysis, and progression modeling."
  },
  lifestyle_habits: {
    id: "lifestyle_habits",
    title: "Lifestyle and Habits",
    description: "Everyday signals that may correlate with shedding, inflammation, hormones, or stress."
  },
  medical_history: {
    id: "medical_history",
    title: "Medical History",
    description: "Systemic, endocrine, autoimmune, medication, and infection context."
  },
  treatment_outcomes: {
    id: "treatment_outcomes",
    title: "Treatments and Results",
    description: "Real-world treatment use, adherence, side effects, outcomes, and barriers."
  },
  goals_impact: {
    id: "goals_impact",
    title: "Goals and Impact",
    description: "Emotional impact, motivations, risk tolerance, budget, and community contribution."
  }
};

function question(
  sectionId: keyof typeof sectionContent,
  details: Omit<AssessmentQuestion, "options" | "sectionId" | "sectionRationale" | "sectionTitle"> & {
    options?: AssessmentOption[];
  }
): AssessmentQuestion {
  const section = sectionContent[sectionId];

  return {
    ...details,
    max: details.max ?? details.slider?.max,
    maxLabel: details.maxLabel ?? details.slider?.maxLabel,
    min: details.min ?? details.slider?.min,
    minLabel: details.minLabel ?? details.slider?.minLabel,
    step: details.step ?? details.slider?.step,
    options: details.options ?? [],
    sectionId: section.id,
    sectionRationale: section.description,
    sectionTitle: section.title,
    uploadSlots:
      details.uploadSlots ??
      (details.input === "upload" || details.input === "uploads"
        ? (details.options ?? []).map((option) => ({
            description: option.description ?? option.label,
            id: option.value,
            label: option.label
          }))
        : undefined)
  };
}

export const assessmentSections: AssessmentSection[] = [
  sectionContent.baseline_profile,
  sectionContent.lifestyle_habits,
  sectionContent.medical_history,
  sectionContent.treatment_outcomes,
  sectionContent.goals_impact
];

export const assessmentQuestions: AssessmentQuestion[] = [
  question("baseline_profile", {
    id: "anonymous_research_consent",
    analyticsCategory: "privacy",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Can your anonymous responses be included in aggregate community insights?",
    helper: "We report trends, not personal profiles. This helps the community compare patterns, treatments, and lifestyle signals more responsibly.",
    responseFormat: "single_choice",
    tags: ["privacy", "anonymous", "research_consent"],
    options: [
      { value: "yes", label: "Yes", description: "Use my anonymous answers for aggregate reports." },
      { value: "not_sure", label: "Not sure yet", description: "Let me answer, but keep this cautious." }
    ]
  }),
  question("baseline_profile", {
    id: "gender_identity",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Which profile should guide pattern and hormone questions?",
    helper: "This only controls adaptive questions. Choose what makes the survey fit best.",
    responseFormat: "single_choice",
    tags: ["segmentation", "sex_gender"],
    options: [
      { value: "male", label: "Male", description: "Show Norwood-based pattern questions." },
      { value: "female", label: "Female", description: "Show Ludwig and female hormone questions." },
      { value: "nonbinary", label: "Nonbinary", description: "Use general pattern questions." },
      { value: "prefer_not", label: "Prefer not to say", description: "Use general pattern questions." }
    ]
  }),
  question("baseline_profile", {
    id: "age_range",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "ordinal",
    input: "chips",
    prompt: "What age range are you in?",
    responseFormat: "single_choice",
    tags: ["age", "segmentation"],
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_24", label: "18-24" },
      { value: "25_34", label: "25-34" },
      { value: "35_44", label: "35-44" },
      { value: "45_54", label: "45-54" },
      { value: "55_plus", label: "55+" }
    ]
  }),
  question("baseline_profile", {
    id: "hair_texture",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "nominal",
    input: "chips",
    prompt: "Which hair texture best describes your natural hair?",
    helper: "This improves styling recommendations and lets community reports compare patterns more fairly.",
    responseFormat: "single_choice",
    tags: ["baseline", "hair_texture", "styling"],
    options: [
      { value: "straight", label: "Straight" },
      { value: "wavy", label: "Wavy" },
      { value: "curly", label: "Curly" },
      { value: "coily", label: "Coily" },
      { value: "buzzed_or_shaved", label: "Buzzed/shaved" },
      { value: "not_sure", label: "Not sure" }
    ]
  }),
  question("baseline_profile", {
    id: "norwood_stage",
    analyticsCategory: "baseline",
    autoAdvance: true,
    conditions: [{ questionId: "gender_identity", operator: "equals", value: "male" }],
    dataType: "ordinal",
    input: "image_scale",
    prompt: "Which Norwood stage looks closest to your current pattern?",
    helper: "Pick the closest visual match. Not sure is a valid answer.",
    responseFormat: "single_choice",
    tags: ["classification", "norwood", "pattern"],
    options: [
      {
        value: "I",
        label: "Norwood I",
        shortLabel: "I",
        description: "Little or no visible recession",
        imageAlt: "Top-view illustration of Norwood stage I with an intact hairline.",
        imageSrc: "/images/assessment/norwood/norwood-1.svg",
        visual: { level: 1, scale: "norwood" }
      },
      {
        value: "II",
        label: "Norwood II",
        shortLabel: "II",
        description: "Slight temple recession",
        imageAlt: "Top-view illustration of Norwood stage II with slight temple recession.",
        imageSrc: "/images/assessment/norwood/norwood-2.svg",
        visual: { level: 2, scale: "norwood" }
      },
      {
        value: "III",
        label: "Norwood III",
        shortLabel: "III",
        description: "Deeper temple recession",
        imageAlt: "Top-view illustration of Norwood stage III with deeper frontal recession.",
        imageSrc: "/images/assessment/norwood/norwood-3.svg",
        visual: { level: 3, scale: "norwood" }
      },
      {
        value: "III_vertex",
        label: "Norwood III Vertex",
        shortLabel: "III V",
        description: "Stage II hairline with crown thinning",
        imageAlt: "Top-view illustration of Norwood stage III Vertex with crown thinning.",
        imageSrc: "/images/assessment/norwood/norwood-3-vertex.svg",
        visual: { level: 4, scale: "norwood" }
      },
      {
        value: "IV",
        label: "Norwood IV",
        shortLabel: "IV",
        description: "Frontal recession and crown loss",
        imageAlt: "Top-view illustration of Norwood stage IV with frontal and crown loss separated by hair.",
        imageSrc: "/images/assessment/norwood/norwood-4.svg",
        visual: { level: 5, scale: "norwood" }
      },
      {
        value: "V",
        label: "Norwood V",
        shortLabel: "V",
        description: "Larger front and crown areas, narrow bridge",
        imageAlt: "Top-view illustration of Norwood stage V with larger frontal and crown loss separated by a narrow bridge.",
        imageSrc: "/images/assessment/norwood/norwood-5.svg",
        visual: { level: 6, scale: "norwood" }
      },
      {
        value: "VI",
        label: "Norwood VI",
        shortLabel: "VI",
        description: "Frontal and crown areas mostly joined",
        imageAlt: "Top-view illustration of Norwood stage VI where frontal and crown hair loss have joined.",
        imageSrc: "/images/assessment/norwood/norwood-6.svg",
        visual: { level: 7, scale: "norwood" }
      },
      {
        value: "VII",
        label: "Norwood VII",
        shortLabel: "VII",
        description: "Thin horseshoe band remains",
        imageAlt: "Top-view illustration of Norwood stage VII with only a thin horseshoe band of hair around the sides.",
        imageSrc: "/images/assessment/norwood/norwood-7.svg",
        visual: { level: 8, scale: "norwood" }
      },
      { value: "not_sure", label: "Not sure", shortLabel: "?", description: "I would rather classify later", visual: { level: 3, scale: "pattern" } }
    ]
  }),
  question("baseline_profile", {
    id: "ludwig_stage",
    analyticsCategory: "baseline",
    autoAdvance: true,
    conditions: [{ questionId: "gender_identity", operator: "equals", value: "female" }],
    dataType: "ordinal",
    input: "image_scale",
    prompt: "Which Ludwig pattern looks closest to your current density?",
    helper: "This is a pattern guide, not a diagnosis.",
    responseFormat: "single_choice",
    tags: ["classification", "ludwig", "pattern"],
    options: [
      { value: "I", label: "Ludwig I", shortLabel: "I", description: "Mild diffuse thinning on top", visual: { level: 1, scale: "ludwig" } },
      { value: "II", label: "Ludwig II", shortLabel: "II", description: "Moderate widening or lower density", visual: { level: 3, scale: "ludwig" } },
      { value: "III", label: "Ludwig III", shortLabel: "III", description: "Advanced diffuse thinning", visual: { level: 5, scale: "ludwig" } },
      { value: "frontal", label: "Frontal accentuated", shortLabel: "Front", description: "Front density or part widening leads", visual: { level: 3, scale: "ludwig" } },
      { value: "not_sure", label: "Not sure", shortLabel: "?", description: "I would rather classify later", visual: { level: 3, scale: "pattern" } }
    ]
  }),
  question("baseline_profile", {
    id: "pattern_general",
    analyticsCategory: "baseline",
    autoAdvance: true,
    conditions: [{ questionId: "gender_identity", operator: "one_of", values: ["nonbinary", "prefer_not"] }],
    dataType: "nominal",
    input: "cards",
    prompt: "Which pattern best describes what you are seeing?",
    responseFormat: "single_choice",
    tags: ["classification", "pattern"],
    options: [
      { value: "hairline_temples", label: "Hairline or temples", description: "The front edge is changing most." },
      { value: "crown_vertex", label: "Crown or vertex", description: "The top-back area is the main concern." },
      { value: "diffuse_top", label: "Diffuse thinning", description: "Density feels lower across the top." },
      { value: "patchy", label: "Patchy spots", description: "Loss appears in distinct areas." },
      { value: "not_sure", label: "Not sure", description: "I need help classifying it." }
    ]
  }),
  question("baseline_profile", {
    id: "age_first_noticed",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "ordinal",
    input: "chips",
    prompt: "When did you first notice meaningful hair loss or shedding?",
    responseFormat: "single_choice",
    tags: ["onset_age", "progression"],
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_24", label: "18-24" },
      { value: "25_34", label: "25-34" },
      { value: "35_44", label: "35-44" },
      { value: "45_plus", label: "45+" },
      { value: "not_sure", label: "Not sure" }
    ]
  }),
  question("baseline_profile", {
    id: "progression_pace",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "ordinal",
    input: "cards",
    prompt: "How has the progression felt over the last 12 months?",
    responseFormat: "single_choice",
    tags: ["progression", "velocity"],
    options: [
      { value: "stable", label: "Mostly stable", description: "I do not see much change lately." },
      { value: "gradual", label: "Gradual", description: "Slow change over time." },
      { value: "recent_12mo", label: "Recently noticeable", description: "It became clearer in the last year." },
      { value: "rapid_6mo", label: "Rapid in 6 months", description: "The pace feels unusually fast." },
      { value: "episodic_shedding", label: "Shedding episodes", description: "It comes in waves or flares." },
      { value: "not_sure", label: "Not sure", description: "The timeline is hard to judge." }
    ]
  }),
  question("baseline_profile", {
    id: "shedding_amount",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "ordinal",
    input: "cards",
    prompt: "How much shedding are you noticing right now?",
    helper: "This helps separate gradual pattern change from active shedding signals.",
    responseFormat: "single_choice",
    tags: ["shedding", "trajectory", "telogen"],
    options: [
      { value: "not_much", label: "Not much", description: "Mostly noticing shape or density change." },
      { value: "more_than_usual", label: "More than usual", description: "Extra hairs in shower, sink, or brush." },
      { value: "heavy_daily", label: "Heavy daily", description: "Shedding feels clearly elevated most days." },
      { value: "episodic_clumps", label: "Episodes or clumps", description: "It comes in waves or visible bursts." },
      { value: "not_sure", label: "Not sure", description: "Hard to tell what normal is." }
    ]
  }),
  question("baseline_profile", {
    id: "primary_concern_area",
    analyticsCategory: "baseline",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Which areas concern you most right now?",
    helper: "Select all that apply.",
    responseFormat: "multi_select",
    tags: ["pattern", "primary_concern"],
    options: [
      { value: "hairline", label: "Hairline" },
      { value: "temples", label: "Temples" },
      { value: "crown", label: "Crown" },
      { value: "top_diffuse", label: "Diffuse top thinning" },
      { value: "overall_density", label: "Overall density" },
      { value: "shedding", label: "Active shedding" },
      { value: "scalp_health", label: "Scalp symptoms" },
      { value: "not_sure", label: "Not sure", exclusive: true }
    ]
  }),
  question("baseline_profile", {
    id: "family_history",
    analyticsCategory: "baseline",
    autoAdvance: true,
    dataType: "nominal",
    input: "chips",
    prompt: "Is there a family history of hair loss?",
    responseFormat: "single_choice",
    tags: ["family_history", "genetics"],
    options: [
      { value: "both_sides", label: "Both sides" },
      { value: "maternal", label: "Mother's side" },
      { value: "paternal", label: "Father's side" },
      { value: "none_known", label: "None known" },
      { value: "not_sure", label: "Not sure" }
    ]
  }),

  question("lifestyle_habits", {
    id: "nicotine_use",
    analyticsCategory: "lifestyle",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Which nicotine habits apply currently?",
    helper: "Select all that apply.",
    responseFormat: "multi_select",
    tags: ["nicotine", "vascular", "lifestyle"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "smoking", label: "Smoking" },
      { value: "vaping", label: "Vaping" },
      { value: "pouches", label: "Nicotine pouches" },
      { value: "quit_recently", label: "Quit in last 12 months" }
    ]
  }),
  question("lifestyle_habits", {
    id: "nicotine_frequency",
    analyticsCategory: "lifestyle",
    autoAdvance: true,
    conditions: [
      { questionId: "nicotine_use", operator: "exists" },
      { questionId: "nicotine_use", operator: "not_equals", value: "none" }
    ],
    dataType: "ordinal",
    input: "chips",
    prompt: "How often do you use nicotine?",
    responseFormat: "single_choice",
    tags: ["nicotine", "frequency"],
    options: [
      { value: "occasional", label: "Occasional" },
      { value: "weekly", label: "Weekly" },
      { value: "daily_light", label: "Daily, light" },
      { value: "daily_heavy", label: "Daily, heavy" }
    ]
  }),
  question("lifestyle_habits", {
    id: "alcohol_frequency",
    analyticsCategory: "lifestyle",
    autoAdvance: true,
    dataType: "ordinal",
    input: "chips",
    prompt: "How often do you drink alcohol?",
    responseFormat: "single_choice",
    tags: ["alcohol", "lifestyle"],
    options: [
      { value: "none", label: "None" },
      { value: "monthly", label: "Monthly" },
      { value: "weekly_1_3", label: "1-3 times/week" },
      { value: "weekly_4_plus", label: "4+ times/week" },
      { value: "most_days", label: "Most days" }
    ]
  }),
  question("lifestyle_habits", {
    id: "sleep_duration",
    analyticsCategory: "lifestyle",
    autoAdvance: true,
    dataType: "ordinal",
    input: "chips",
    prompt: "How much sleep do you usually get?",
    responseFormat: "single_choice",
    tags: ["sleep", "recovery"],
    options: [
      { value: "under_5", label: "<5 hours" },
      { value: "5_6", label: "5-6 hours" },
      { value: "6_7", label: "6-7 hours" },
      { value: "7_8", label: "7-8 hours" },
      { value: "8_plus", label: "8+ hours" }
    ]
  }),
  question("lifestyle_habits", {
    id: "sleep_quality",
    analyticsCategory: "lifestyle",
    dataType: "integer",
    input: "scale",
    prompt: "How would you rate your sleep quality lately?",
    responseFormat: "integer_scale",
    slider: { defaultValue: 5, max: 10, maxLabel: "Excellent", min: 1, minLabel: "Poor", step: 1 },
    tags: ["sleep", "quality", "recovery"]
  }),
  question("lifestyle_habits", {
    id: "sleep_apnea_status",
    analyticsCategory: "lifestyle",
    autoAdvance: true,
    dataType: "nominal",
    input: "chips",
    prompt: "Has sleep apnea or heavy snoring been part of your health picture?",
    responseFormat: "single_choice",
    tags: ["sleep_apnea", "metabolic", "inflammation"],
    options: [
      { value: "diagnosed", label: "Diagnosed" },
      { value: "suspected", label: "Suspected" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" }
    ]
  }),
  question("lifestyle_habits", {
    id: "stress_level",
    analyticsCategory: "lifestyle",
    dataType: "integer",
    input: "scale",
    prompt: "How high has your stress been over the last 3 months?",
    responseFormat: "integer_scale",
    slider: { defaultValue: 5, max: 10, maxLabel: "Extremely high", min: 1, minLabel: "Very low", step: 1 },
    tags: ["stress", "psychological", "telogen"]
  }),
  question("lifestyle_habits", {
    id: "recent_stressors",
    analyticsCategory: "lifestyle",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any major stressors in the last 6 months?",
    helper: "Select all that apply.",
    responseFormat: "multi_select",
    tags: ["stress", "trigger_events"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "work_school", label: "Work or school pressure" },
      { value: "relationship", label: "Relationship stress" },
      { value: "grief", label: "Grief or loss" },
      { value: "financial", label: "Financial pressure" },
      { value: "moving", label: "Move or major life change" }
    ]
  }),
  question("lifestyle_habits", {
    id: "diet_pattern",
    analyticsCategory: "lifestyle",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Which eating pattern is closest to normal for you?",
    responseFormat: "single_choice",
    tags: ["diet", "nutrition"],
    options: [
      { value: "balanced", label: "Balanced mixed diet", description: "No major restrictions." },
      { value: "high_protein", label: "High protein", description: "Protein is a priority." },
      { value: "plant_based", label: "Plant-based", description: "Vegetarian, vegan, or mostly plant-based." },
      { value: "low_carb_keto", label: "Low-carb or keto", description: "Carbs are intentionally limited." },
      { value: "inconsistent", label: "Inconsistent", description: "Irregular meals, dieting cycles, or low appetite." }
    ]
  }),
  question("lifestyle_habits", {
    id: "nutrition_gaps",
    analyticsCategory: "lifestyle",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any known or suspected nutrition gaps?",
    helper: "These are common signals for later correlation analysis, not a diagnosis.",
    responseFormat: "multi_select",
    tags: ["nutrition", "deficiencies", "labs"],
    options: [
      { value: "none_known", label: "None known", exclusive: true },
      { value: "low_vitamin_d", label: "Low vitamin D" },
      { value: "low_ferritin_iron", label: "Low ferritin or iron" },
      { value: "low_zinc", label: "Low zinc" },
      { value: "low_b12", label: "Low B12" },
      { value: "low_protein", label: "Low protein intake" },
      { value: "crash_dieting", label: "Crash dieting or rapid weight loss" }
    ]
  }),
  question("lifestyle_habits", {
    id: "hormone_ped_use",
    analyticsCategory: "lifestyle",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Have hormone or performance-enhancing compounds been part of your routine?",
    helper: "Sensitive answers are anonymous. Select all that apply.",
    responseFormat: "multi_select",
    tags: ["androgens", "hormones", "ped"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "trt", label: "TRT" },
      { value: "anabolic_steroids", label: "Anabolic steroids" },
      { value: "sarms", label: "SARMs" },
      { value: "dht_derivatives", label: "DHT-derived compounds" },
      { value: "not_sure", label: "Not sure", exclusive: true }
    ]
  }),
  question("lifestyle_habits", {
    id: "scalp_symptoms",
    analyticsCategory: "lifestyle",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Which scalp symptoms show up for you?",
    responseFormat: "multi_select",
    tags: ["dermatology", "inflammation", "scalp"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "itching", label: "Itching" },
      { value: "flaking", label: "Flaking" },
      { value: "redness", label: "Redness" },
      { value: "oiliness", label: "Oiliness" },
      { value: "pain_burning", label: "Pain or burning" },
      { value: "dandruff", label: "Dandruff" }
    ]
  }),
  question("lifestyle_habits", {
    id: "trigger_events_recent",
    analyticsCategory: "lifestyle",
    conditions: [
      { questionId: "progression_pace", operator: "one_of", values: ["recent_12mo", "rapid_6mo", "episodic_shedding"] }
    ],
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Since the faster shedding started, did any trigger events happen first?",
    helper: "Select anything that came before or around the change.",
    responseFormat: "multi_select",
    tags: ["telogen", "timeline", "triggers"],
    options: [
      { value: "none", label: "None I can identify", exclusive: true },
      { value: "covid", label: "COVID or viral illness" },
      { value: "surgery", label: "Surgery or anesthesia" },
      { value: "high_fever", label: "High fever" },
      { value: "major_stress", label: "Major stress event" },
      { value: "crash_diet", label: "Crash diet or weight loss" },
      { value: "medication_change", label: "Medication change" }
    ]
  }),

  question("medical_history", {
    id: "hormonal_history",
    analyticsCategory: "medical",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any hormonal or endocrine issues in your history?",
    responseFormat: "multi_select",
    tags: ["endocrine", "hormones", "thyroid"],
    options: [
      { value: "none_known", label: "None known", exclusive: true },
      { value: "thyroid_hypo", label: "Hypothyroid" },
      { value: "thyroid_hyper", label: "Hyperthyroid" },
      { value: "testosterone_low", label: "Low testosterone" },
      { value: "testosterone_high", label: "High testosterone" },
      { value: "adrenal_issue", label: "Adrenal or cortisol issue" },
      { value: "not_sure", label: "Not sure", exclusive: true }
    ]
  }),
  question("medical_history", {
    id: "clinical_diagnosis_status",
    analyticsCategory: "medical",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Has a clinician ever named the likely type of hair loss?",
    helper: "This is not required, but it makes aggregate comparisons more trustworthy.",
    responseFormat: "single_choice",
    tags: ["diagnosis", "data_quality", "clinical_context"],
    options: [
      { value: "androgenetic", label: "Pattern hair loss", description: "Often called androgenetic or male/female pattern hair loss." },
      { value: "telogen_effluvium", label: "Telogen shedding", description: "Shedding linked to stress, illness, weight change, or another trigger." },
      { value: "alopecia_areata", label: "Alopecia areata", description: "Patchy autoimmune-related hair loss." },
      { value: "traction_or_damage", label: "Traction or damage", description: "Styling tension, breakage, or processing was named." },
      { value: "scarring_or_inflammatory", label: "Scarring/inflammatory", description: "A scarring or inflammatory scalp condition was discussed." },
      { value: "no_diagnosis", label: "No diagnosis yet", description: "No clinician has named a likely type." },
      { value: "not_sure", label: "Not sure", description: "I do not remember or it was unclear." }
    ]
  }),
  question("medical_history", {
    id: "female_hormonal_factors",
    analyticsCategory: "medical",
    conditions: [{ questionId: "gender_identity", operator: "equals", value: "female" }],
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any female-specific hormone or life-stage factors?",
    helper: "Select all that apply.",
    responseFormat: "multi_select",
    tags: ["female_health", "hormones", "menopause", "pcos", "postpartum"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "pcos", label: "PCOS" },
      { value: "cycle_irregularity", label: "Irregular cycles" },
      { value: "postpartum_0_12", label: "Postpartum, 0-12 months" },
      { value: "postpartum_12_24", label: "Postpartum, 12-24 months" },
      { value: "perimenopause", label: "Perimenopause" },
      { value: "menopause", label: "Menopause" },
      { value: "fertility_treatment", label: "Fertility treatment" },
      { value: "birth_control_change", label: "Birth control change" }
    ]
  }),
  question("medical_history", {
    id: "bloodwork_recent",
    analyticsCategory: "medical",
    autoAdvance: true,
    dataType: "nominal",
    input: "chips",
    prompt: "Have you had relevant bloodwork in the last 12 months?",
    responseFormat: "single_choice",
    tags: ["bloodwork", "labs"],
    options: [
      { value: "yes_normal", label: "Yes, normal" },
      { value: "yes_abnormal", label: "Yes, abnormal" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" }
    ]
  }),
  question("medical_history", {
    id: "abnormal_lab_markers",
    analyticsCategory: "medical",
    conditions: [{ questionId: "bloodwork_recent", operator: "equals", value: "yes_abnormal" }],
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Which lab markers were low, high, or flagged?",
    helper: "Select any you know. Skipping details is fine.",
    responseFormat: "multi_select",
    tags: ["deficiencies", "endocrine", "labs"],
    options: [
      { value: "not_sure", label: "Not sure", exclusive: true },
      { value: "ferritin_iron", label: "Ferritin or iron" },
      { value: "vitamin_d", label: "Vitamin D" },
      { value: "thyroid", label: "Thyroid markers" },
      { value: "testosterone", label: "Testosterone" },
      { value: "dht", label: "DHT" },
      { value: "zinc", label: "Zinc" },
      { value: "inflammation", label: "Inflammatory markers" }
    ]
  }),
  question("medical_history", {
    id: "autoimmune_skin_conditions",
    analyticsCategory: "medical",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any autoimmune, inflammatory, or skin conditions?",
    responseFormat: "multi_select",
    tags: ["autoimmune", "dermatology", "inflammation"],
    options: [
      { value: "none_known", label: "None known", exclusive: true },
      { value: "seborrheic_dermatitis", label: "Seborrheic dermatitis" },
      { value: "psoriasis", label: "Psoriasis" },
      { value: "eczema", label: "Eczema" },
      { value: "alopecia_areata", label: "Alopecia areata" },
      { value: "lupus", label: "Lupus" },
      { value: "other_autoimmune", label: "Other autoimmune condition" }
    ]
  }),
  question("medical_history", {
    id: "metabolic_history",
    analyticsCategory: "medical",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any metabolic or cardiovascular factors?",
    responseFormat: "multi_select",
    tags: ["cardiovascular", "metabolic", "sleep_apnea"],
    options: [
      { value: "none_known", label: "None known", exclusive: true },
      { value: "diabetes", label: "Diabetes" },
      { value: "insulin_resistance", label: "Insulin resistance" },
      { value: "obesity", label: "Obesity" },
      { value: "sleep_apnea", label: "Sleep apnea" },
      { value: "cardiovascular", label: "Cardiovascular condition" }
    ]
  }),
  question("medical_history", {
    id: "medications_history",
    analyticsCategory: "medical",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Any medication categories currently or recently relevant?",
    helper: "Only choose categories you are comfortable sharing anonymously.",
    responseFormat: "multi_select",
    tags: ["iatrogenic", "medications", "timeline"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "antidepressants", label: "Antidepressants" },
      { value: "adhd_meds", label: "ADHD medication" },
      { value: "accutane", label: "Accutane/isotretinoin" },
      { value: "hormone_therapy", label: "Hormone therapy" },
      { value: "glp_1", label: "GLP-1 medication" },
      { value: "steroids", label: "Steroids" },
      { value: "blood_pressure", label: "Blood pressure meds" }
    ]
  }),
  question("medical_history", {
    id: "covid_illness_link",
    analyticsCategory: "medical",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Did hair loss worsen after COVID, infection, or a significant illness?",
    responseFormat: "single_choice",
    tags: ["covid", "infection", "telogen"],
    options: [
      { value: "yes_covid", label: "Yes, after COVID", description: "Timing felt connected." },
      { value: "yes_other_illness", label: "Yes, after another illness", description: "A non-COVID illness came first." },
      { value: "no_clear_link", label: "No clear link", description: "I do not see a connection." },
      { value: "not_sure", label: "Not sure", description: "The timing is hard to judge." }
    ]
  }),
  question("medical_history", {
    id: "mental_health_factors",
    analyticsCategory: "medical",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Which mental health or behavior factors have been present?",
    helper: "This is asked because stress physiology and hair-focused behaviors can matter.",
    responseFormat: "multi_select",
    tags: ["mental_health", "stress", "trichotillomania"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "anxiety", label: "Anxiety" },
      { value: "depression", label: "Depression" },
      { value: "chronic_stress", label: "Chronic stress" },
      { value: "hair_touching", label: "Frequent hair touching/checking" },
      { value: "hair_pulling", label: "Hair pulling" }
    ]
  }),

  question("treatment_outcomes", {
    id: "current_treatment_status",
    analyticsCategory: "treatment",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Where are you with hair loss treatments right now?",
    responseFormat: "single_choice",
    tags: ["status", "treatment"],
    options: [
      { value: "none", label: "Not using treatment", description: "No active treatment yet." },
      { value: "researching", label: "Researching", description: "Learning, but not started." },
      { value: "currently_using", label: "Currently using", description: "I have an active routine." },
      { value: "tried_and_stopped", label: "Tried and stopped", description: "I used something before." }
    ]
  }),
  question("treatment_outcomes", {
    id: "active_treatments",
    analyticsCategory: "treatment",
    conditions: [{ questionId: "current_treatment_status", operator: "one_of", values: ["currently_using", "tried_and_stopped"] }],
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Which treatments have you used?",
    responseFormat: "multi_select",
    tags: ["modalities", "treatment"],
    options: [
      { value: "topical_minoxidil", label: "Topical minoxidil" },
      { value: "oral_minoxidil", label: "Oral minoxidil" },
      { value: "finasteride", label: "Finasteride" },
      { value: "dutasteride", label: "Dutasteride" },
      { value: "microneedling", label: "Microneedling" },
      { value: "prp", label: "PRP" },
      { value: "laser", label: "Laser/LLLT" },
      { value: "supplements", label: "Supplements" },
      { value: "natural_remedies", label: "Natural remedies" },
      { value: "transplant", label: "Hair transplant" }
    ]
  }),
  question("treatment_outcomes", {
    id: "primary_treatment_focus",
    analyticsCategory: "treatment",
    autoAdvance: true,
    conditions: [{ questionId: "active_treatments", operator: "exists" }],
    dataType: "nominal",
    input: "cards",
    prompt: "Which treatment do you think of as your main path?",
    helper: "If you use multiple things, choose the one you most want tracked against results.",
    responseFormat: "single_choice",
    tags: ["modalities", "outcomes", "treatment"],
    options: [
      { value: "topical_minoxidil", label: "Topical minoxidil", description: "Foam, liquid, or topical formulas." },
      { value: "oral_minoxidil", label: "Oral minoxidil", description: "Prescription oral minoxidil." },
      { value: "finasteride", label: "Finasteride", description: "Oral or topical finasteride." },
      { value: "dutasteride", label: "Dutasteride", description: "Oral or topical dutasteride." },
      { value: "microneedling", label: "Microneedling", description: "At-home or in-office microneedling." },
      { value: "prp", label: "PRP", description: "Platelet-rich plasma treatments." },
      { value: "laser", label: "Laser/LLLT", description: "Low-level light therapy devices or in-office laser." },
      { value: "supplements", label: "Supplements", description: "Vitamins, minerals, or supplement routines." },
      { value: "natural_remedies", label: "Natural remedies", description: "Oils, botanicals, or non-prescription routines." },
      { value: "transplant", label: "Hair transplant", description: "Surgical restoration is the main path." },
      { value: "mixed_stack", label: "Mixed stack", description: "No single treatment leads." },
      { value: "not_sure", label: "Not sure", description: "I cannot pick one yet." }
    ]
  }),
  question("treatment_outcomes", {
    id: "treatment_duration",
    analyticsCategory: "treatment",
    autoAdvance: true,
    conditions: [{ questionId: "active_treatments", operator: "exists" }],
    dataType: "ordinal",
    input: "chips",
    prompt: "How long have you used your main treatment path?",
    responseFormat: "single_choice",
    tags: ["duration", "treatment"],
    options: [
      { value: "under_3_months", label: "<3 months" },
      { value: "3_6_months", label: "3-6 months" },
      { value: "6_12_months", label: "6-12 months" },
      { value: "1_2_years", label: "1-2 years" },
      { value: "2_plus_years", label: "2+ years" },
      { value: "not_consistent", label: "Not consistent" }
    ]
  }),
  question("treatment_outcomes", {
    id: "adherence_level",
    analyticsCategory: "treatment",
    conditions: [{ questionId: "active_treatments", operator: "exists" }],
    dataType: "integer",
    input: "scale",
    prompt: "How consistent have you been with treatment?",
    responseFormat: "integer_scale",
    slider: { defaultValue: 6, max: 10, maxLabel: "Very consistent", min: 1, minLabel: "Rarely consistent", step: 1 },
    tags: ["adherence", "treatment"]
  }),
  question("treatment_outcomes", {
    id: "treatment_result",
    analyticsCategory: "treatment",
    autoAdvance: true,
    conditions: [{ questionId: "active_treatments", operator: "exists" }],
    dataType: "nominal",
    input: "cards",
    prompt: "What result best describes your experience so far?",
    responseFormat: "single_choice",
    tags: ["effectiveness", "treatment"],
    options: [
      { value: "regrowth", label: "Regrowth", description: "Visible improvement." },
      { value: "stabilization", label: "Stabilization", description: "Loss slowed or stopped." },
      { value: "no_effect", label: "No clear effect", description: "Hard to tell or unchanged." },
      { value: "worse", label: "Worsened", description: "Shedding or loss increased." },
      { value: "too_early", label: "Too early", description: "Not enough time yet." }
    ]
  }),
  question("treatment_outcomes", {
    id: "treatment_side_effects",
    analyticsCategory: "treatment",
    conditions: [{ questionId: "active_treatments", operator: "exists" }],
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Have you noticed any side effects?",
    helper: "Select all that apply. This is anonymous and aggregate-only.",
    responseFormat: "multi_select",
    tags: ["safety", "side_effects", "treatment"],
    options: [
      { value: "none", label: "None", exclusive: true },
      { value: "sexual", label: "Sexual side effects" },
      { value: "mood", label: "Mood or anxiety changes" },
      { value: "cardiovascular", label: "Heart rate/BP symptoms" },
      { value: "scalp_irritation", label: "Scalp irritation" },
      { value: "fatigue", label: "Fatigue" },
      { value: "brain_fog", label: "Brain fog" },
      { value: "initial_shed", label: "Initial shedding" }
    ]
  }),
  question("treatment_outcomes", {
    id: "treatment_satisfaction",
    analyticsCategory: "treatment",
    conditions: [{ questionId: "active_treatments", operator: "exists" }],
    dataType: "integer",
    input: "scale",
    prompt: "How satisfied are you with your treatment path?",
    responseFormat: "integer_scale",
    slider: { defaultValue: 5, max: 10, maxLabel: "Very satisfied", min: 1, minLabel: "Not satisfied", step: 1 },
    tags: ["satisfaction", "treatment"]
  }),
  question("treatment_outcomes", {
    id: "treatment_barriers",
    analyticsCategory: "treatment",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "What makes treatment harder to start or stay with?",
    responseFormat: "multi_select",
    tags: ["access", "barriers", "treatment"],
    options: [
      { value: "none", label: "Nothing major", exclusive: true },
      { value: "cost", label: "Cost" },
      { value: "side_effect_fear", label: "Fear of side effects" },
      { value: "access", label: "Access to doctors or prescriptions" },
      { value: "inconsistency", label: "Consistency" },
      { value: "conflicting_info", label: "Conflicting information" },
      { value: "stigma", label: "Stigma or privacy" }
    ]
  }),

  question("goals_impact", {
    id: "confidence_impact",
    analyticsCategory: "impact",
    autoAdvance: true,
    dataType: "ordinal",
    input: "cards",
    prompt: "How much is hair loss affecting your confidence right now?",
    responseFormat: "single_choice",
    tags: ["confidence", "impact", "psychological"],
    options: [
      { value: "low", label: "Low", description: "I notice it, but it is manageable." },
      { value: "moderate", label: "Moderate", description: "It changes how I think about the mirror." },
      { value: "high", label: "High", description: "It regularly shapes what I do." },
      { value: "very_high", label: "Very high", description: "It feels loud and hard to ignore." }
    ]
  }),
  question("goals_impact", {
    id: "social_impact",
    analyticsCategory: "impact",
    dataType: "multi_nominal",
    input: "multi_select",
    prompt: "Where does hair loss affect life most?",
    helper: "Select all that feel true.",
    responseFormat: "multi_select",
    tags: ["psychological", "quality_of_life", "social"],
    options: [
      { value: "none", label: "It does not affect much", exclusive: true },
      { value: "dating", label: "Dating" },
      { value: "social_events", label: "Social events" },
      { value: "photos", label: "Photos/videos" },
      { value: "work", label: "Work presence" },
      { value: "self_image", label: "Self-image" },
      { value: "mental_health", label: "Mental health" }
    ]
  }),
  question("goals_impact", {
    id: "current_hairstyle_confidence",
    analyticsCategory: "impact",
    autoAdvance: true,
    dataType: "ordinal",
    input: "cards",
    prompt: "How comfortable do you feel with your current hair presentation?",
    responseFormat: "single_choice",
    tags: ["appearance", "confidence", "styling"],
    options: [
      { value: "high", label: "Comfortable", description: "It works well enough right now." },
      { value: "okay", label: "Mixed", description: "Some days are fine, some are not." },
      { value: "low", label: "Not comfortable", description: "It affects how I show up." },
      { value: "very_low", label: "Very uncomfortable", description: "I feel stuck and want a reset." }
    ]
  }),
  question("goals_impact", {
    id: "primary_goal",
    analyticsCategory: "goals",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "What outcome matters most right now?",
    responseFormat: "single_choice",
    tags: ["goals", "intent"],
    options: [
      { value: "maintain", label: "Maintain", description: "Keep what I have." },
      { value: "stabilize", label: "Stabilize", description: "Slow or stop progression." },
      { value: "regrowth", label: "Regrow", description: "Recover visible density if possible." },
      { value: "appearance", label: "Look better now", description: "Improve presentation quickly." },
      { value: "avoid_transplant", label: "Avoid transplant", description: "Delay or prevent surgery if possible." },
      { value: "root_cause", label: "Find root cause", description: "Understand why this is happening." }
    ]
  }),
  question("goals_impact", {
    id: "urgency_level",
    analyticsCategory: "goals",
    autoAdvance: true,
    dataType: "ordinal",
    input: "chips",
    prompt: "How urgent does this feel?",
    responseFormat: "single_choice",
    tags: ["decision_making", "urgency"],
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" }
    ]
  }),
  question("goals_impact", {
    id: "risk_tolerance",
    analyticsCategory: "goals",
    autoAdvance: true,
    dataType: "ordinal",
    input: "cards",
    prompt: "How much treatment risk or side-effect uncertainty are you willing to accept?",
    responseFormat: "single_choice",
    tags: ["decision_making", "risk_tolerance"],
    options: [
      { value: "very_low", label: "Very cautious", description: "Safety and certainty matter most." },
      { value: "low", label: "Low", description: "I need strong reassurance first." },
      { value: "moderate", label: "Moderate", description: "I can weigh tradeoffs." },
      { value: "high", label: "High", description: "I am open to stronger options." },
      { value: "experimental", label: "Experimental", description: "I am interested in emerging treatments." }
    ]
  }),
  question("goals_impact", {
    id: "budget_band",
    analyticsCategory: "goals",
    autoAdvance: true,
    dataType: "ordinal",
    input: "cards",
    prompt: "What monthly budget feels realistic for hair loss care?",
    responseFormat: "single_choice",
    tags: ["access", "budget"],
    options: [
      { value: "0", label: "$0", description: "Free options only." },
      { value: "under_50", label: "Under $50", description: "Keep it lean." },
      { value: "50_150", label: "$50-150", description: "Spend when justified." },
      { value: "150_300", label: "$150-300", description: "I can support a serious plan." },
      { value: "300_plus", label: "$300+", description: "I am open to higher-cost options." },
      { value: "depends", label: "Depends", description: "I need to see value first." }
    ]
  }),
  question("goals_impact", {
    id: "next_step_preference",
    analyticsCategory: "goals",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "What would be most useful after this survey?",
    responseFormat: "single_choice",
    tags: ["next_step", "product"],
    options: [
      { value: "research", label: "Community insights", description: "Show trends and evidence summaries." },
      { value: "consult", label: "Expert guidance", description: "Help interpreting options." },
      { value: "community", label: "Similar profiles", description: "Learn from people like me." },
      { value: "tracking", label: "Progress tracking", description: "Photos, timeline, reminders." },
      { value: "barber", label: "Appearance support", description: "Haircut or styling guidance." }
    ]
  }),
  question("goals_impact", {
    id: "longitudinal_opt_in",
    analyticsCategory: "community",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Would you be open to anonymous progress check-ins over time?",
    helper: "This could support treatment timelines, image comparisons, and better trend reports later.",
    responseFormat: "single_choice",
    tags: ["longitudinal", "research", "retention"],
    options: [
      { value: "yes", label: "Yes", description: "I would contribute follow-up data." },
      { value: "maybe", label: "Maybe", description: "I may want this later." },
      { value: "no", label: "No", description: "One-time survey only." }
    ]
  }),
  question("goals_impact", {
    id: "photo_upload_consent",
    analyticsCategory: "media",
    autoAdvance: true,
    dataType: "nominal",
    input: "cards",
    prompt: "Would you like to attach optional hair photos for progress tracking?",
    helper: "Photos are optional and should avoid faces when possible. They can support future image comparisons and AI-assisted classification.",
    responseFormat: "single_choice",
    tags: ["privacy", "progress_tracking", "uploads"],
    options: [
      { value: "yes", label: "Yes, add photos", description: "Hairline, crown, temples, wet hair, or comparison photos." },
      { value: "later", label: "Maybe later", description: "I want the account/progress flow first." },
      { value: "no", label: "No", description: "Skip photo uploads." }
    ]
  }),
  question("goals_impact", {
    id: "photo_uploads",
    analyticsCategory: "media",
    conditions: [{ questionId: "photo_upload_consent", operator: "equals", value: "yes" }],
    dataType: "metadata",
    input: "upload",
    prompt: "Add any optional photos you want tracked.",
    helper: "Accepted views: hairline, crown, top-down, temples, wet hair, and progress comparison. You can skip this and still finish.",
    responseFormat: "file_upload_metadata",
    tags: ["crown", "hairline", "progress", "temples", "uploads", "wet_hair"],
    options: [
      { value: "hairline", label: "Hairline", description: "Front hairline or temples." },
      { value: "crown", label: "Crown", description: "Vertex/top-back area." },
      { value: "top_down", label: "Top-down", description: "Overhead density view." },
      { value: "temples", label: "Temples", description: "Left or right temple recession." },
      { value: "wet_hair", label: "Wet hair", description: "Wet or parted density view." },
      { value: "progress_comparison", label: "Progress comparison", description: "Before/after or timeline image." }
    ]
  })
];

export const assessmentQuestionsById = Object.fromEntries(
  assessmentQuestions.map((item) => [item.id, item])
) as Record<string, AssessmentQuestion>;

export const assessmentSectionsById = Object.fromEntries(
  assessmentSections.map((section) => [section.id, section])
) as Record<string, AssessmentSection>;

export const assessmentAnalyticsSchema: AssessmentAnalyticsField[] = assessmentQuestions.map(
  (item) => ({
    dataType: item.dataType,
    id: item.id,
    options: item.options.map((option) => option.value),
    responseFormat: item.responseFormat,
    sectionId: item.sectionId,
    tags: item.tags
  })
);

export function serializeAnswerValueList(values: string[]) {
  return values.filter(Boolean).join("|");
}

export function parseUploadManifest(value?: string): UploadManifest {
  if (!value) {
    return { assets: [], status: "idle" };
  }

  try {
    const parsed = JSON.parse(value) as Partial<UploadManifest>;

    if (parsed && Array.isArray(parsed.assets)) {
      return {
        assets: parsed.assets.filter((asset): asset is UploadManifest["assets"][number] =>
          Boolean(asset?.id && asset.imageSlot && asset.storagePath)
        ),
        status: parsed.status === "skipped" || parsed.status === "uploaded" ? parsed.status : "idle"
      };
    }
  } catch {
    return value === "skipped" ? { assets: [], status: "skipped" } : { assets: [], status: "idle" };
  }

  return { assets: [], status: "idle" };
}

export function serializeUploadManifest(manifest: UploadManifest) {
  return JSON.stringify(manifest);
}

export function parseAnswerValueList(value?: string) {
  if (!value || value === "skipped") {
    return [];
  }

  if (value.startsWith("{")) {
    const manifest = parseUploadManifest(value);

    return manifest.assets.map((asset) => asset.imageSlot);
  }

  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value) as unknown;

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item : ""))
          .filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  return value.split("|").filter(Boolean);
}

export const parseAnswerValues = parseAnswerValueList;

function hasAnswerValue(value?: string) {
  return Boolean(value && value.length > 0);
}

function conditionMatches(condition: AssessmentCondition, answers: AssessmentAnswerMap) {
  const answer = answers[condition.questionId];
  const answerValues = parseAnswerValueList(answer);

  switch (condition.operator) {
    case "equals":
      return answer === condition.value;
    case "exists":
      return hasAnswerValue(answer);
    case "includes":
      return condition.value ? answerValues.includes(condition.value) : false;
    case "not_equals":
      return hasAnswerValue(answer) && answer !== condition.value && !answerValues.includes(condition.value ?? "");
    case "one_of":
      return (condition.values ?? []).some(
        (value) => answer === value || answerValues.includes(value)
      );
    default:
      return false;
  }
}

export function isQuestionVisible(questionToCheck: AssessmentQuestion, answers: AssessmentAnswerMap) {
  return (questionToCheck.conditions ?? []).every((condition) => conditionMatches(condition, answers));
}

export function getVisibleAssessmentQuestions(answers: AssessmentAnswerMap) {
  return assessmentQuestions.filter((item) => isQuestionVisible(item, answers));
}

export function getVisibleAssessmentSections(answers: AssessmentAnswerMap) {
  const visibleSectionIds = new Set(getVisibleAssessmentQuestions(answers).map((item) => item.sectionId));

  return assessmentSections.filter((section) => visibleSectionIds.has(section.id));
}

export function isQuestionAnswered(questionToCheck: AssessmentQuestion, answers: AssessmentAnswerMap) {
  const answer = answers[questionToCheck.id];

  if (questionToCheck.input === "upload" || questionToCheck.input === "uploads") {
    const manifest = parseUploadManifest(answer);

    return manifest.status === "skipped" || manifest.assets.length > 0;
  }

  if (questionToCheck.input === "multi_chips" || questionToCheck.input === "multi_select") {
    return parseAnswerValueList(answer).length > 0;
  }

  return hasAnswerValue(answer);
}

export function getFilteredVisibleAnswers(answers: AssessmentAnswerMap) {
  return Object.fromEntries(
    getVisibleAssessmentQuestions(answers)
      .filter((item) => isQuestionAnswered(item, answers))
      .map((item) => [item.id, answers[item.id]])
  ) as AssessmentAnswerMap;
}

export function getQuestionIndex(questionId: string, answers: AssessmentAnswerMap = {}) {
  return getVisibleAssessmentQuestions(answers).findIndex((item) => item.id === questionId);
}

export function getNextIncompleteQuestionIndex(answers: AssessmentAnswerMap) {
  const visibleQuestions = getVisibleAssessmentQuestions(answers);
  const nextIndex = visibleQuestions.findIndex((item) => !isQuestionAnswered(item, answers));

  return nextIndex === -1 ? Math.max(visibleQuestions.length - 1, 0) : nextIndex;
}

export function getAnswerValuesForStorage(questionToStore: AssessmentQuestion, value: string) {
  if (questionToStore.input === "upload" || questionToStore.input === "uploads") {
    return parseUploadManifest(value).assets.map((asset) => asset.imageSlot);
  }

  if (questionToStore.input === "multi_chips" || questionToStore.input === "multi_select") {
    return parseAnswerValueList(value);
  }

  return value ? [value] : [];
}

export function getQuestionLabel(questionId: string, value: string) {
  const questionToLabel = assessmentQuestionsById[questionId];

  if (questionId === "norwood_stage" && value === "V_plus") {
    return "Norwood V+";
  }

  if (!questionToLabel) {
    return value;
  }

  if (questionToLabel.input === "scale" || questionToLabel.input === "slider") {
    const numericValue = Number(value);
    return questionToLabel.slider?.valueLabels?.[numericValue] ?? `${value}/${questionToLabel.max ?? questionToLabel.slider?.max ?? 10}`;
  }

  if (questionToLabel.input === "multi_chips" || questionToLabel.input === "multi_select") {
    const labels = parseAnswerValueList(value)
      .map((item) => questionToLabel.options.find((option) => option.value === item)?.label ?? item)
      .filter(Boolean);

    return labels.length > 0 ? labels.join(", ") : "Skipped";
  }

  if (questionToLabel.input === "upload" || questionToLabel.input === "uploads") {
    const manifest = parseUploadManifest(value);

    if (manifest.status === "skipped" || manifest.assets.length === 0) {
      return "Skipped photos";
    }

    return `${manifest.assets.length} photo ${manifest.assets.length === 1 ? "view" : "views"} attached`;
  }

  return questionToLabel.options.find((option) => option.value === value)?.label ?? value;
}

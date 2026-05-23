export const assessmentVersion = "2026-05-foundation-v1";

export type AssessmentSection = {
  description: string;
  id: string;
  title: string;
};

export type AssessmentOption = {
  description?: string;
  label: string;
  shortLabel?: string;
  value: string;
};

export type AssessmentQuestion = {
  autoAdvance?: boolean;
  helper?: string;
  id: string;
  input: "cards" | "chips" | "norwood";
  prompt: string;
  sectionId: string;
  sectionRationale: string;
  sectionTitle: string;
  options: AssessmentOption[];
};

export type AssessmentAnswerMap = Record<string, string>;

export const assessmentSections: AssessmentSection[] = [
  {
    id: "hair_loss_profile",
    title: "Hair Loss Profile",
    description: "A quick baseline so we can calibrate the rest accurately."
  },
  {
    id: "grooming_and_styling",
    title: "Grooming and Styling",
    description: "How you wear it matters as much as what you lose."
  },
  {
    id: "confidence_and_goals",
    title: "Confidence and Goals",
    description: "This helps us optimize for the outcome you actually care about."
  },
  {
    id: "current_solutions",
    title: "Current Solutions and Habits",
    description: "A few practical signals so the next steps fit real life."
  }
];

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "norwood_stage",
    sectionId: "hair_loss_profile",
    sectionTitle: "Hair Loss Profile",
    sectionRationale: "A quick baseline so we can calibrate the rest accurately.",
    prompt: "Where are you currently on the Norwood Scale?",
    helper: "Pick the closest match. Precision helps the recommendations.",
    input: "norwood",
    autoAdvance: true,
    options: [
      { value: "I", label: "Stage I", shortLabel: "I", description: "Minimal recession" },
      { value: "II", label: "Stage II", shortLabel: "II", description: "Early temple changes" },
      { value: "III", label: "Stage III", shortLabel: "III", description: "Clear frontal recession" },
      {
        value: "III_vertex",
        label: "Stage III Vertex",
        shortLabel: "III Vertex",
        description: "Early crown loss"
      },
      { value: "IV", label: "Stage IV", shortLabel: "IV", description: "Frontal and crown loss" },
      { value: "V_plus", label: "Stage V+", shortLabel: "V+", description: "More advanced loss" },
      { value: "not_sure", label: "Not sure", shortLabel: "?", description: "I need help estimating" }
    ]
  },
  {
    id: "loss_pattern_primary",
    sectionId: "hair_loss_profile",
    sectionTitle: "Hair Loss Profile",
    sectionRationale: "A quick baseline so we can calibrate the rest accurately.",
    prompt: "What pattern feels most true right now?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "hairline", label: "Mostly hairline", description: "The front is the main issue." },
      { value: "crown", label: "Mostly crown", description: "The crown worries me most." },
      { value: "diffuse", label: "Diffuse thinning", description: "It feels thinner across the top." },
      { value: "mixed", label: "Mixed pattern", description: "Hairline and crown both matter." }
    ]
  },
  {
    id: "progression_timeline",
    sectionId: "hair_loss_profile",
    sectionTitle: "Hair Loss Profile",
    sectionRationale: "A quick baseline so we can calibrate the rest accurately.",
    prompt: "How fast has this felt like it has moved?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "recent", label: "Recently noticed", description: "This feels new in the last year." },
      { value: "gradual", label: "Slow and steady", description: "It has changed gradually over time." },
      { value: "accelerating", label: "Clearly accelerating", description: "It feels faster lately." },
      { value: "not_sure", label: "Hard to tell", description: "I do not trust my own read yet." }
    ]
  },
  {
    id: "family_history",
    sectionId: "hair_loss_profile",
    sectionTitle: "Hair Loss Profile",
    sectionRationale: "A quick baseline so we can calibrate the rest accurately.",
    prompt: "Is there a family history of male hair loss?",
    input: "chips",
    autoAdvance: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "maybe", label: "Maybe" },
      { value: "no", label: "No" }
    ]
  },
  {
    id: "shedding_concern",
    sectionId: "hair_loss_profile",
    sectionTitle: "Hair Loss Profile",
    sectionRationale: "A quick baseline so we can calibrate the rest accurately.",
    prompt: "How concerned are you about active shedding?",
    input: "chips",
    autoAdvance: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "not_sure", label: "Not sure" }
    ]
  },
  {
    id: "current_hairstyle_confidence",
    sectionId: "grooming_and_styling",
    sectionTitle: "Grooming and Styling",
    sectionRationale: "How you wear it matters as much as what you lose.",
    prompt: "How confident do you feel in your current hairstyle?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "high", label: "High", description: "It still works for me." },
      { value: "okay", label: "Just okay", description: "It is passable, not ideal." },
      { value: "low", label: "Low", description: "It is part of the problem." },
      { value: "very_low", label: "Very low", description: "I feel stuck and need a reset." }
    ]
  },
  {
    id: "haircut_frequency",
    sectionId: "grooming_and_styling",
    sectionTitle: "Grooming and Styling",
    sectionRationale: "How you wear it matters as much as what you lose.",
    prompt: "How often do you get a haircut or shape-up?",
    input: "chips",
    autoAdvance: true,
    options: [
      { value: "two_weeks", label: "Every 2 weeks" },
      { value: "monthly", label: "About monthly" },
      { value: "two_to_three_months", label: "Every 2 to 3 months" },
      { value: "rarely", label: "Rarely" }
    ]
  },
  {
    id: "facial_hair_usage",
    sectionId: "grooming_and_styling",
    sectionTitle: "Grooming and Styling",
    sectionRationale: "How you wear it matters as much as what you lose.",
    prompt: "How do you currently use facial hair in the look?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "beard_anchor", label: "Beard anchor", description: "A beard carries part of the balance." },
      { value: "stubble", label: "Mostly stubble", description: "Light structure, low maintenance." },
      { value: "clean_shaven", label: "Clean shaven", description: "No facial hair in the mix." },
      { value: "open_to_try", label: "Open to trying it", description: "I have not used it much yet." }
    ]
  },
  {
    id: "styling_priority",
    sectionId: "grooming_and_styling",
    sectionTitle: "Grooming and Styling",
    sectionRationale: "How you wear it matters as much as what you lose.",
    prompt: "What would help the look most right now?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "texture", label: "More texture", description: "Make density look smarter." },
      { value: "cleaner_hairline", label: "A cleaner hairline", description: "I want sharper framing." },
      { value: "lower_maintenance", label: "Lower maintenance", description: "Simpler and easier." },
      { value: "shorter_reset", label: "A shorter reset", description: "A cleaner, tighter starting point." }
    ]
  },
  {
    id: "primary_goal",
    sectionId: "confidence_and_goals",
    sectionTitle: "Confidence and Goals",
    sectionRationale: "This helps us optimize for the outcome you actually care about.",
    prompt: "What do you want most from the next step?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "stabilize", label: "Stabilize", description: "Understand how to slow the loss intelligently." },
      { value: "appearance", label: "Look better fast", description: "Visible wins matter most right now." },
      { value: "regrowth", label: "Explore regrowth", description: "I want the strongest treatment path worth taking." },
      { value: "clarity", label: "Clarity first", description: "I need a trustworthy plan before I act." }
    ]
  },
  {
    id: "urgency_level",
    sectionId: "confidence_and_goals",
    sectionTitle: "Confidence and Goals",
    sectionRationale: "This helps us optimize for the outcome you actually care about.",
    prompt: "How urgent does this feel?",
    input: "chips",
    autoAdvance: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" }
    ]
  },
  {
    id: "confidence_impact",
    sectionId: "confidence_and_goals",
    sectionTitle: "Confidence and Goals",
    sectionRationale: "This helps us optimize for the outcome you actually care about.",
    prompt: "How much is this affecting confidence right now?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "low", label: "Low", description: "I notice it, but it is manageable." },
      { value: "moderate", label: "Moderate", description: "It changes how I think about the mirror." },
      { value: "high", label: "High", description: "It regularly shapes what I do." },
      { value: "very_high", label: "Very high", description: "It feels loud and hard to ignore." }
    ]
  },
  {
    id: "change_openness",
    sectionId: "confidence_and_goals",
    sectionTitle: "Confidence and Goals",
    sectionRationale: "This helps us optimize for the outcome you actually care about.",
    prompt: "How open are you to a meaningful style or grooming change?",
    input: "chips",
    autoAdvance: true,
    options: [
      { value: "subtle", label: "Subtle only" },
      { value: "balanced", label: "Some change is fine" },
      { value: "major", label: "I am open to a reset" }
    ]
  },
  {
    id: "current_treatment_status",
    sectionId: "current_solutions",
    sectionTitle: "Current Solutions and Habits",
    sectionRationale: "A few practical signals so the next steps fit real life.",
    prompt: "What is true about treatment right now?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "none", label: "Doing nothing yet", description: "I have not started." },
      { value: "researching", label: "Researching", description: "I am reading, but not acting." },
      { value: "currently_using", label: "Currently using something", description: "I already have a routine." },
      { value: "tried_and_stopped", label: "Tried and stopped", description: "I have some baggage here already." }
    ]
  },
  {
    id: "scalp_care_habit",
    sectionId: "current_solutions",
    sectionTitle: "Current Solutions and Habits",
    sectionRationale: "A few practical signals so the next steps fit real life.",
    prompt: "How deliberate is your scalp or hair care routine?",
    input: "chips",
    autoAdvance: true,
    options: [
      { value: "minimal", label: "Minimal" },
      { value: "basic", label: "Basic" },
      { value: "deliberate", label: "Deliberate" }
    ]
  },
  {
    id: "budget_band",
    sectionId: "current_solutions",
    sectionTitle: "Current Solutions and Habits",
    sectionRationale: "A few practical signals so the next steps fit real life.",
    prompt: "What budget shape feels realistic right now?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "lean", label: "Keep it lean", description: "Low-cost actions first." },
      { value: "balanced", label: "Balanced", description: "I will spend when it is justified." },
      { value: "all_in", label: "All in", description: "I am willing to pay for the strongest path." }
    ]
  },
  {
    id: "next_step_preference",
    sectionId: "current_solutions",
    sectionTitle: "Current Solutions and Habits",
    sectionRationale: "A few practical signals so the next steps fit real life.",
    prompt: "Which kind of next step sounds most useful right now?",
    input: "cards",
    autoAdvance: true,
    options: [
      { value: "barber", label: "Find a barber", description: "I want visible improvement first." },
      { value: "consult", label: "Talk to an expert", description: "I want faster clarity and less guesswork." },
      { value: "research", label: "Read the evidence", description: "I need better grounding first." },
      { value: "community", label: "See how other men handled it", description: "I want examples from real people." }
    ]
  }
];

export const assessmentQuestionsById = Object.fromEntries(
  assessmentQuestions.map((question) => [question.id, question])
) as Record<string, AssessmentQuestion>;

export const assessmentSectionsById = Object.fromEntries(
  assessmentSections.map((section) => [section.id, section])
) as Record<string, AssessmentSection>;

export function getQuestionIndex(questionId: string) {
  return assessmentQuestions.findIndex((question) => question.id === questionId);
}

export function getNextIncompleteQuestionIndex(answers: AssessmentAnswerMap) {
  const nextIndex = assessmentQuestions.findIndex((question) => !answers[question.id]);
  return nextIndex === -1 ? assessmentQuestions.length - 1 : nextIndex;
}

export function getQuestionLabel(questionId: string, value: string) {
  const question = assessmentQuestionsById[questionId];

  if (!question) {
    return value;
  }

  return question.options.find((option) => option.value === value)?.label ?? value;
}


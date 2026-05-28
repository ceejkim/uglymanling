import posthog from "posthog-js";
import { captureProductEvent } from "@/lib/analytics/event-tracking";
import { assessmentVersion } from "@/lib/assessment/questions";

export type AssessmentEventName =
  | "assessment_landing_viewed"
  | "assessment_started"
  | "assessment_resumed"
  | "assessment_question_viewed"
  | "assessment_question_answered"
  | "assessment_question_changed"
  | "assessment_feedback_submitted"
  | "assessment_section_completed"
  | "assessment_progress_saved"
  | "assessment_completed"
  | "assessment_abandoned"
  | "assessment_results_viewed"
  | "assessment_peer_comparison_viewed"
  | "assessment_recommendation_impression"
  | "assessment_membership_offer_viewed"
  | "assessment_membership_cta_clicked"
  | "results_viewed"
  | "insight_card_flipped"
  | "next_step_card_clicked"
  | "dermatologist_cta_clicked"
  | "barber_cta_clicked"
  | "style_cta_clicked"
  | "lifestyle_cta_clicked"
  | "section_scrolled";

type AssessmentEventProperties = Record<string, boolean | number | string | null | undefined>;

type AssessmentBaseProperties = {
  assessmentVersionOverride?: string;
  clerkUserId?: string | null;
  entrySource?: string | null;
  experimentKey?: string | null;
  experimentVariant?: string | null;
  isAuthenticated?: boolean;
  posthogDistinctId?: string | null;
  resultVersion?: string | null;
  sessionId?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
  utmSource?: string | null;
};

function compactProperties(properties: AssessmentEventProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export function getPostHogDistinctId() {
  try {
    return posthog.get_distinct_id();
  } catch {
    return undefined;
  }
}

export function captureAssessmentEvent(
  event: AssessmentEventName,
  baseProperties: AssessmentBaseProperties,
  properties: AssessmentEventProperties = {}
) {
  captureProductEvent(event, compactProperties({
      assessment_version: baseProperties.assessmentVersionOverride ?? assessmentVersion,
      clerk_user_id: baseProperties.clerkUserId ?? undefined,
      entry_source: baseProperties.entrySource ?? undefined,
      experiment_key: baseProperties.experimentKey ?? undefined,
      experiment_variant: baseProperties.experimentVariant ?? undefined,
      is_authenticated: baseProperties.isAuthenticated,
      posthog_distinct_id: baseProperties.posthogDistinctId ?? getPostHogDistinctId(),
      result_version: baseProperties.resultVersion ?? undefined,
      session_id: baseProperties.sessionId ?? undefined,
      utm_campaign: baseProperties.utmCampaign ?? undefined,
      utm_medium: baseProperties.utmMedium ?? undefined,
      utm_source: baseProperties.utmSource ?? undefined,
      ...properties
    })
  );
}

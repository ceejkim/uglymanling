import {
  captureAssessmentEvent,
  getPostHogDistinctId,
  type AssessmentEventName
} from "@/lib/analytics/assessment-events";

type PrimitiveEventValue = boolean | number | string | null | undefined;
type AssessmentResultEventPayload = Record<string, PrimitiveEventValue | PrimitiveEventValue[]>;

type AssessmentResultEventContext = {
  isAuthenticated?: boolean;
  resultVersion?: string;
  resumeToken?: string | null;
  sessionId: string;
};

const resultEventNames = new Set<AssessmentEventName>([
  "barber_cta_clicked",
  "dermatologist_cta_clicked",
  "insight_card_flipped",
  "lifestyle_cta_clicked",
  "next_step_card_clicked",
  "results_viewed",
  "section_scrolled",
  "style_cta_clicked"
]);

function primitiveProperties(properties: AssessmentResultEventPayload) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => !Array.isArray(value))
  ) as Record<string, PrimitiveEventValue>;
}

export function trackAssessmentResultEvent(
  event: AssessmentEventName,
  context: AssessmentResultEventContext,
  properties: AssessmentResultEventPayload = {}
) {
  if (!resultEventNames.has(event)) {
    return;
  }

  captureAssessmentEvent(
    event,
    {
      isAuthenticated: context.isAuthenticated,
      posthogDistinctId: getPostHogDistinctId(),
      resultVersion: context.resultVersion,
      sessionId: context.sessionId
    },
    primitiveProperties(properties)
  );

  void fetch("/api/assessment/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      eventPayload: properties,
      eventType: event,
      resumeToken: context.resumeToken,
      sessionId: context.sessionId
    })
  }).catch(() => {
    // Results analytics is best effort; never block the experience.
  });
}

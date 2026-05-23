import "server-only";
import {
  buildBenchmarkPayload,
  type AssessmentBenchmarkPayload
} from "@/lib/assessment/benchmarks";
import { type AssessmentAnswerMap } from "@/lib/assessment/questions";
import {
  buildRecommendations,
  type AssessmentRecommendation
} from "@/lib/assessment/recommendations";
import {
  buildAssessmentCompletionSummary,
  type AssessmentCompletionSummary
} from "@/lib/assessment/summary";
import { selectSupabaseRows, upsertSupabaseRow } from "@/lib/supabase";

export const resultVersion = "2026-05-results-v1";

export type AssessmentResultSnapshot = {
  benchmarkPayload: AssessmentBenchmarkPayload;
  createdAt?: string;
  membershipOfferVariant: string;
  profileBand: string;
  recommendationPayload: AssessmentRecommendation[];
  resultVersion: string;
  sessionId: string;
  summary: AssessmentCompletionSummary;
};

type AssessmentResultRow = {
  benchmark_payload: AssessmentBenchmarkPayload;
  created_at?: string;
  membership_offer_variant: string | null;
  profile_band: string;
  recommendation_payload: AssessmentRecommendation[];
  result_version: string;
  session_id: string;
  summary_badge: string;
  summary_body: string;
  summary_bullets: string[];
  summary_title: string;
};

function inferProfileBand(summary: AssessmentCompletionSummary) {
  if (summary.badge === "Fastest relief") {
    return "style_first";
  }

  if (summary.badge === "Higher urgency profile") {
    return "high_urgency";
  }

  if (summary.badge === "Good intervention window") {
    return "stabilization_window";
  }

  return "clarity_first";
}

function mapRowToSnapshot(row: AssessmentResultRow): AssessmentResultSnapshot {
  return {
    benchmarkPayload: row.benchmark_payload,
    createdAt: row.created_at,
    membershipOfferVariant: row.membership_offer_variant ?? "baseline",
    profileBand: row.profile_band,
    recommendationPayload: row.recommendation_payload,
    resultVersion: row.result_version,
    sessionId: row.session_id,
    summary: {
      badge: row.summary_badge,
      bullets: row.summary_bullets,
      detail: row.summary_body,
      title: row.summary_title
    }
  };
}

export async function buildAndPersistAssessmentResult(
  sessionId: string,
  answers: AssessmentAnswerMap
) {
  const summary = buildAssessmentCompletionSummary(answers);
  const recommendationPayload = buildRecommendations(answers);
  const benchmarkPayload = await buildBenchmarkPayload(sessionId, answers);
  const profileBand = inferProfileBand(summary);

  const [row] = await upsertSupabaseRow<AssessmentResultRow>({
    table: "assessment_results",
    values: {
      benchmark_payload: benchmarkPayload,
      membership_offer_variant: "baseline",
      profile_band: profileBand,
      recommendation_payload: recommendationPayload,
      result_version: resultVersion,
      session_id: sessionId,
      summary_badge: summary.badge,
      summary_body: summary.detail,
      summary_bullets: summary.bullets,
      summary_title: summary.title
    },
    onConflict: "session_id"
  });

  return mapRowToSnapshot(
    row ?? {
      benchmark_payload: benchmarkPayload,
      membership_offer_variant: "baseline",
      profile_band: profileBand,
      recommendation_payload: recommendationPayload,
      result_version: resultVersion,
      session_id: sessionId,
      summary_badge: summary.badge,
      summary_body: summary.detail,
      summary_bullets: summary.bullets,
      summary_title: summary.title
    }
  );
}

export async function getAssessmentResultSnapshot(sessionId: string) {
  const rows = await selectSupabaseRows<AssessmentResultRow>({
    table: "assessment_results",
    filters: [`session_id=eq.${sessionId}`],
    limit: 1
  });

  return rows[0] ? mapRowToSnapshot(rows[0]) : null;
}

import { NextRequest, NextResponse } from "next/server";
import { type BarberRow, type BarberStatus } from "@/lib/barber-data";
import { selectSupabaseRows, upsertSupabaseRow } from "@/lib/supabase";

export const runtime = "nodejs";

type BarberIngestPayload = {
  id?: string;
  rank?: number;
  barberName?: string;
  city?: string;
  neighborhood?: string | null;
  state?: string;
  shopName?: string | null;
  shopAddress?: string | null;
  primaryBookingUrl?: string | null;
  profileUrls?: string[];
  socialUrls?: string[];
  evidenceSummary?: string;
  reviewSignalSummary?: string;
  priceTier?: string | null;
  confidenceScore?: number;
  sourceCount?: number;
  recommendedTags?: string[];
  rankingNotes?: string;
  status?: BarberStatus;
  isUglyManlingVerified?: boolean;
  sourceUrls?: string[];
  discoveredBy?: string | null;
  reviewNotes?: string | null;
};

const allowedStatuses = new Set<BarberStatus>(["approved", "pending_review", "rejected"]);

function getIngestToken() {
  return process.env.BARBER_INGEST_API_TOKEN;
}

function isAuthorized(request: NextRequest) {
  const token = getIngestToken();

  if (!token) {
    return false;
  }

  const authorizationHeader = request.headers.get("authorization");
  return authorizationHeader === `Bearer ${token}`;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function cleanOptionalText(value: unknown) {
  const cleaned = cleanText(value);
  return cleaned.length > 0 ? cleaned : null;
}

function cleanUrlList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => cleanText(item))
    .filter((item) => item.length > 0);
}

function cleanTagList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => cleanText(item).toLowerCase())
    .filter((item) => item.length > 0);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePayload(payload: BarberIngestPayload): BarberRow {
  const barberName = cleanText(payload.barberName);
  const city = cleanText(payload.city);
  const state = cleanText(payload.state);

  if (barberName.length < 2 || barberName.length > 120) {
    throw new Error("barberName must be 2-120 characters.");
  }

  if (city.length < 2 || city.length > 120) {
    throw new Error("city must be 2-120 characters.");
  }

  if (state.length < 2 || state.length > 40) {
    throw new Error("state must be 2-40 characters.");
  }

  const status = payload.status ?? "pending_review";

  if (!allowedStatuses.has(status)) {
    throw new Error("status must be approved, pending_review, or rejected.");
  }

  const rank = Number.isInteger(payload.rank) ? Number(payload.rank) : 999;
  const confidenceScore = Number.isInteger(payload.confidenceScore) ? Number(payload.confidenceScore) : 3;
  const sourceCount = Number.isInteger(payload.sourceCount) ? Number(payload.sourceCount) : 1;

  if (confidenceScore < 1 || confidenceScore > 5) {
    throw new Error("confidenceScore must be between 1 and 5.");
  }

  if (sourceCount < 0) {
    throw new Error("sourceCount must be 0 or greater.");
  }

  const id = cleanText(payload.id) || slugify(`${city}-${barberName}`);

  return {
    id,
    rank,
    barber_name: barberName,
    city,
    neighborhood: cleanOptionalText(payload.neighborhood),
    state,
    shop_name: cleanOptionalText(payload.shopName),
    shop_address: cleanOptionalText(payload.shopAddress),
    primary_booking_url: cleanOptionalText(payload.primaryBookingUrl),
    profile_urls: cleanUrlList(payload.profileUrls),
    social_urls: cleanUrlList(payload.socialUrls),
    evidence_summary: cleanText(payload.evidenceSummary),
    review_signal_summary: cleanText(payload.reviewSignalSummary),
    likely_price_tier: cleanOptionalText(payload.priceTier),
    confidence_score_1_to_5: confidenceScore,
    source_count: sourceCount,
    recommended_tags: cleanTagList(payload.recommendedTags),
    ranking_notes: cleanText(payload.rankingNotes),
    status,
    is_ugly_manling_verified: Boolean(payload.isUglyManlingVerified),
    source_urls: cleanUrlList(payload.sourceUrls),
    discovered_by: cleanOptionalText(payload.discoveredBy) ?? "agent-ingest",
    review_notes: cleanOptionalText(payload.reviewNotes)
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = request.nextUrl.searchParams.get("status");
    const filters = status && allowedStatuses.has(status as BarberStatus) ? [`status=eq.${status}`] : [];
    const rows = await selectSupabaseRows<BarberRow>({
      table: "barbers",
      filters,
      limit: 1000
    });

    return NextResponse.json({ barbers: rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load barbers." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<{
      barbers: BarberIngestPayload[];
    }>;
    const payloads = Array.isArray(body.barbers) ? body.barbers : [];

    if (payloads.length === 0) {
      return NextResponse.json({ error: "barbers array is required." }, { status: 400 });
    }

    const rows = payloads.map(normalizePayload);
    const saved = await upsertSupabaseRow<BarberRow>({
      table: "barbers",
      values: rows,
      onConflict: "id"
    });

    return NextResponse.json({ ok: true, count: saved.length, barbers: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not ingest barbers." },
      { status: 500 }
    );
  }
}

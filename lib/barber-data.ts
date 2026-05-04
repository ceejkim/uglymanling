import { cache } from "react";
import { selectSupabaseRows } from "@/lib/supabase";

export type BarberStatus = "approved" | "pending_review" | "rejected";

export type BarberRow = {
  id: string;
  rank: number;
  barber_name: string;
  city: string;
  neighborhood: string | null;
  state: string;
  shop_name: string | null;
  shop_address: string | null;
  primary_booking_url: string | null;
  profile_urls: string[] | null;
  social_urls: string[] | null;
  evidence_summary: string;
  review_signal_summary: string;
  likely_price_tier: string | null;
  confidence_score_1_to_5: number;
  source_count: number;
  recommended_tags: string[] | null;
  ranking_notes: string;
  status: BarberStatus;
  is_ugly_manling_verified: boolean;
  source_urls: string[] | null;
  discovered_by: string | null;
  review_notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BarberCandidate = {
  id: string;
  rank: number;
  barberName: string;
  city: string;
  neighborhood: string;
  state: string;
  shopName: string;
  shopAddress: string;
  primaryBookingUrl: string | null;
  profileUrls: string[];
  socialUrls: string[];
  evidenceSummary: string;
  reviewSignalSummary: string;
  priceTier: string;
  confidenceScore: number;
  sourceCount: number;
  recommendedTags: string[];
  rankingNotes: string;
  isUglyManlingVerified: boolean;
};

export type BarberCitySection = {
  city: string;
  state: string;
  targetCount: number;
  actualCount: number;
  marketSummary: string;
  topCandidateNames: string[];
  manualReviewFlags: string[];
  candidates: BarberCandidate[];
};

type BarberDataset = {
  datasetName: string;
  createdAt: string;
  sourceNote: string;
  cities: BarberCitySection[];
  topSeedCandidates: BarberCandidate[];
  needsManualVerification: string[];
  remainingDataGaps: string[];
  totalCandidates: number;
  cityCount: number;
  strongestCount: number;
};

export type BarberDirectoryAccess = "public" | "members";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePriceTier(priceTier: string | null) {
  if (!priceTier) {
    return "unconfirmed";
  }

  return priceTier;
}

function normalizeRow(row: BarberRow): BarberCandidate {
  return {
    id: row.id,
    rank: row.rank,
    barberName: row.barber_name,
    city: row.city,
    neighborhood: row.neighborhood ?? "Neighborhood pending",
    state: row.state,
    shopName: row.shop_name ?? "Shop pending",
    shopAddress: row.shop_address ?? "Address pending",
    primaryBookingUrl: row.primary_booking_url,
    profileUrls: (row.profile_urls ?? []).filter((url): url is string => Boolean(url)),
    socialUrls: (row.social_urls ?? []).filter((url): url is string => Boolean(url)),
    evidenceSummary: row.evidence_summary,
    reviewSignalSummary: row.review_signal_summary,
    priceTier: normalizePriceTier(row.likely_price_tier),
    confidenceScore: row.confidence_score_1_to_5,
    sourceCount: row.source_count,
    recommendedTags: row.recommended_tags ?? [],
    rankingNotes: row.ranking_notes,
    isUglyManlingVerified: row.is_ugly_manling_verified
  };
}

function sortRows(rows: BarberRow[]) {
  return [...rows].sort((left, right) => {
    if (left.city !== right.city) {
      return left.city.localeCompare(right.city);
    }

    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    return left.barber_name.localeCompare(right.barber_name);
  });
}

function buildDatasetFromRows(rows: BarberRow[]): BarberDataset {
  const sortedRows = sortRows(rows);
  const normalizedCandidates = sortedRows.map(normalizeRow);

  const groupedCities = new Map<string, BarberCandidate[]>();

  normalizedCandidates.forEach((candidate) => {
    const key = `${candidate.city}::${candidate.state}`;
    const cityCandidates = groupedCities.get(key) ?? [];
    cityCandidates.push(candidate);
    groupedCities.set(key, cityCandidates);
  });

  const cities = Array.from(groupedCities.entries()).map(([key, candidates]) => {
    const [cityName, state] = key.split("::");

    return {
      city: cityName,
      state,
      targetCount: candidates.length,
      actualCount: candidates.length,
      marketSummary: "",
      topCandidateNames: candidates.slice(0, 10).map((candidate) => candidate.barberName),
      manualReviewFlags: [],
      candidates
    } satisfies BarberCitySection;
  });

  cities.sort((left, right) => left.city.localeCompare(right.city));

  const strongestCandidates = normalizedCandidates.slice(0, 10);

  return {
    datasetName: "Supabase barber directory",
    createdAt: new Date().toISOString(),
    sourceNote: "Supabase is the canonical source of truth for barber listings.",
    cities,
    topSeedCandidates: strongestCandidates,
    needsManualVerification: [],
    remainingDataGaps: [],
    totalCandidates: normalizedCandidates.length,
    cityCount: cities.length,
    strongestCount: strongestCandidates.length
  };
}

const loadApprovedBarberRows = cache(async () =>
  selectSupabaseRows<BarberRow>({
    table: "barbers",
    filters: ["status=eq.approved"],
    limit: 1000
  })
);

export const getBarberData = cache(async () => buildDatasetFromRows(await loadApprovedBarberRows()));

export async function getKnownBarberIds({
  access = "members"
}: {
  access?: BarberDirectoryAccess;
} = {}) {
  const barberData = await getBarberData();
  const candidates = barberData.cities.flatMap((city) => city.candidates);
  const visibleCandidates =
    access === "members"
      ? candidates
      : candidates.filter((candidate) => candidate.isUglyManlingVerified);

  return visibleCandidates.map((candidate) => candidate.id);
}

export async function getBarberDirectoryCities() {
  const barberData = await getBarberData();

  return barberData.cities.map((city) => ({
    label: city.city,
    value: getCitySlug(city.city)
  }));
}

export function formatBarberTag(tag: string) {
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCitySlug(city: string) {
  return slugify(city);
}

export function getTagSlug(tag: string) {
  return slugify(tag);
}

export async function getBarberDirectoryTags() {
  const barberData = await getBarberData();

  return Array.from(
    new Set(barberData.cities.flatMap((city) => city.candidates.flatMap((candidate) => candidate.recommendedTags)))
  )
    .sort((left, right) => left.localeCompare(right))
    .map((tag) => ({
      label: formatBarberTag(tag),
      value: getTagSlug(tag),
      raw: tag
    }));
}

export async function filterBarberDirectory({
  city,
  tag,
  access = "members"
}: {
  city?: string;
  tag?: string;
  access?: BarberDirectoryAccess;
}) {
  const barberData = await getBarberData();
  const normalizedCity = city ? getCitySlug(city) : null;
  const normalizedTag = tag ? getTagSlug(tag) : null;

  const filteredCities = barberData.cities
    .filter((citySection) => !normalizedCity || getCitySlug(citySection.city) === normalizedCity)
    .map((citySection) => ({
      ...citySection,
      candidates: citySection.candidates.filter(
        (candidate) => !normalizedTag || candidate.recommendedTags.some((candidateTag) => getTagSlug(candidateTag) === normalizedTag)
      )
    }))
    .filter((citySection) => citySection.candidates.length > 0);

  const filteredTopSeedCandidates = barberData.topSeedCandidates.filter((candidate) => {
    const cityMatch = !normalizedCity || getCitySlug(candidate.city) === normalizedCity;
    const tagMatch =
      !normalizedTag || candidate.recommendedTags.some((candidateTag) => getTagSlug(candidateTag) === normalizedTag);

    return cityMatch && tagMatch;
  });

  const allFilteredBarbers = filteredCities.flatMap((citySection) => citySection.candidates);
  const visibleBarbers =
    access === "members"
      ? allFilteredBarbers
      : allFilteredBarbers.filter((candidate) => candidate.isUglyManlingVerified);
  const lockedPreviewBarbers =
    access === "members"
      ? []
      : allFilteredBarbers.filter((candidate) => !candidate.isUglyManlingVerified);

  return {
    selectedCity: normalizedCity,
    selectedTag: normalizedTag,
    citySections: filteredCities,
    featuredBarbers: allFilteredBarbers,
    visibleBarbers,
    lockedPreviewBarbers,
    topSeedCandidates: filteredTopSeedCandidates,
    resultCount: allFilteredBarbers.length,
    visibleCount: visibleBarbers.length,
    lockedPreviewCount: lockedPreviewBarbers.length
  };
}

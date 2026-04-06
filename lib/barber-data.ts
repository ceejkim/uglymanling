import rawBarberDatabase from "@/app/community/space/barber-database.json";

type RawBarberCandidate = {
  rank: number;
  barber_name: string;
  city: string;
  neighborhood: string | null;
  state: string;
  shop_name: string | null;
  shop_address: string | null;
  primary_booking_url: string | null;
  profile_url_1: string | null;
  profile_url_2: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  evidence_summary: string;
  review_signal_summary: string;
  likely_price_tier: string | null;
  confidence_score_1_to_5: number;
  source_count: number;
  recommended_tags: string[];
  ranking_notes: string;
};

type RawCityDataset = {
  city: string;
  state: string;
  target_count: number;
  actual_count: number;
  market_summary: string;
  top_10_city_candidates: string[];
  manual_review_flags: string[];
  candidates: RawBarberCandidate[];
};

type RawTopSeedCandidate = {
  rank: number;
  barber_name: string;
  city: string;
};

type RawBarberDataset = {
  dataset_name: string;
  created_at: string;
  source_note: string;
  cities: RawCityDataset[];
  top_seed_candidates_all_cities: RawTopSeedCandidate[];
  needs_manual_verification: string[];
  remaining_data_gaps: string[];
};

export type BarberCandidate = {
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

const dataset = rawBarberDatabase as RawBarberDataset;

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

function normalizeCandidate(candidate: RawBarberCandidate): BarberCandidate {
  return {
    rank: candidate.rank,
    barberName: candidate.barber_name,
    city: candidate.city,
    neighborhood: candidate.neighborhood ?? "Neighborhood pending",
    state: candidate.state,
    shopName: candidate.shop_name ?? "Shop pending",
    shopAddress: candidate.shop_address ?? "Address pending",
    primaryBookingUrl: candidate.primary_booking_url,
    profileUrls: [candidate.profile_url_1, candidate.profile_url_2].filter((url): url is string => Boolean(url)),
    socialUrls: [candidate.instagram_url, candidate.tiktok_url].filter((url): url is string => Boolean(url)),
    evidenceSummary: candidate.evidence_summary,
    reviewSignalSummary: candidate.review_signal_summary,
    priceTier: normalizePriceTier(candidate.likely_price_tier),
    confidenceScore: candidate.confidence_score_1_to_5,
    sourceCount: candidate.source_count,
    recommendedTags: candidate.recommended_tags,
    rankingNotes: candidate.ranking_notes
  };
}

const cities = dataset.cities.map((city): BarberCitySection => ({
  city: city.city,
  state: city.state,
  targetCount: city.target_count,
  actualCount: city.actual_count,
  marketSummary: city.market_summary,
  topCandidateNames: city.top_10_city_candidates,
  manualReviewFlags: city.manual_review_flags,
  candidates: city.candidates.map(normalizeCandidate)
}));

const candidatesByKey = new Map(
  cities.flatMap((city) =>
    city.candidates.map((candidate) => [`${candidate.city}::${candidate.barberName}`, candidate] as const)
  )
);

const topSeedCandidates = dataset.top_seed_candidates_all_cities
  .map((candidate) => candidatesByKey.get(`${candidate.city}::${candidate.barber_name}`))
  .filter((candidate): candidate is BarberCandidate => Boolean(candidate));

export const barberData: BarberDataset = {
  datasetName: dataset.dataset_name,
  createdAt: dataset.created_at,
  sourceNote: dataset.source_note,
  cities,
  topSeedCandidates,
  needsManualVerification: dataset.needs_manual_verification,
  remainingDataGaps: dataset.remaining_data_gaps,
  totalCandidates: cities.reduce((total, city) => total + city.candidates.length, 0),
  cityCount: cities.length,
  strongestCount: topSeedCandidates.length
};

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

export const barberDirectoryCities = barberData.cities.map((city) => ({
  label: city.city,
  value: getCitySlug(city.city)
}));

export const barberDirectoryTags = Array.from(
  new Set(barberData.cities.flatMap((city) => city.candidates.flatMap((candidate) => candidate.recommendedTags)))
)
  .sort((left, right) => left.localeCompare(right))
  .map((tag) => ({
    label: formatBarberTag(tag),
    value: getTagSlug(tag),
    raw: tag
  }));

export function filterBarberDirectory({
  city,
  tag
}: {
  city?: string;
  tag?: string;
}) {
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

  return {
    selectedCity: normalizedCity,
    selectedTag: normalizedTag,
    citySections: filteredCities,
    topSeedCandidates: filteredTopSeedCandidates,
    resultCount: filteredCities.reduce((total, citySection) => total + citySection.candidates.length, 0)
  };
}

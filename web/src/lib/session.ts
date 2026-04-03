export type UserRole = "explorer" | "guide";

export type SessionUser = {
  name: string;
  email: string;
  role: UserRole;
};

export type ExplorerProfile = {
  city: string;
  intent: string;
  budget: string;
  timing: string;
};

export type GuideProfile = {
  expertise: string;
  serviceType: string;
  priceRange: string;
  availability: string;
};

const SESSION_KEY = "rekkoe_session_v1";
const EXPLORER_PROFILE_KEY = "rekkoe_explorer_profile_v1";
const GUIDE_PROFILE_KEY = "rekkoe_guide_profile_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getSession(): SessionUser | null {
  return readJson<SessionUser>(SESSION_KEY);
}

export function saveSession(session: SessionUser) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}

export function getExplorerProfile() {
  return readJson<ExplorerProfile>(EXPLORER_PROFILE_KEY);
}

export function getGuideProfile() {
  return readJson<GuideProfile>(GUIDE_PROFILE_KEY);
}

export function saveExplorerProfile(payload: ExplorerProfile) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(EXPLORER_PROFILE_KEY, JSON.stringify(payload));
}

export function saveGuideProfile(payload: GuideProfile) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(GUIDE_PROFILE_KEY, JSON.stringify(payload));
}

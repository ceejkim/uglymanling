export type UserRole = "explorer" | "guide";

export type SessionUser = {
  name: string;
  email: string;
  role: UserRole;
};

const SESSION_KEY = "rekkoe_session_v1";
const EXPLORER_PROFILE_KEY = "rekkoe_explorer_profile_v1";
const GUIDE_PROFILE_KEY = "rekkoe_guide_profile_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getSession(): SessionUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
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

export function saveExplorerProfile(payload: {
  city: string;
  intent: string;
  budget: string;
  timing: string;
}) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(EXPLORER_PROFILE_KEY, JSON.stringify(payload));
}

export function saveGuideProfile(payload: {
  expertise: string;
  serviceType: string;
  priceRange: string;
  availability: string;
}) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(GUIDE_PROFILE_KEY, JSON.stringify(payload));
}

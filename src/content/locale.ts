export type Locale = "zh" | "en";

export const LOCALE_SESSION_KEY = "waijade-locale";
export const LOCALE_CHANGE_EVENT = "waijade:locale-change";

const ZH_REGIONS = new Set(["CN", "HK", "MO", "SG", "TW"]);
const ZH_TIMEZONES = ["asia/shanghai", "asia/hong_kong", "asia/macau", "asia/taipei", "asia/singapore"];

function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

function getSessionLocaleOverride(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const override = window.sessionStorage.getItem(LOCALE_SESSION_KEY);
  return isLocale(override) ? override : null;
}

function isZhLocaleTag(localeTag: string) {
  const normalizedTag = localeTag.toLowerCase();
  if (normalizedTag.startsWith("zh")) {
    return true;
  }

  try {
    const region = new Intl.Locale(localeTag).region;
    return Boolean(region && ZH_REGIONS.has(region.toUpperCase()));
  } catch {
    return false;
  }
}

export function detectPreferredLocale(): Locale {
  const sessionOverride = getSessionLocaleOverride();
  if (sessionOverride) {
    return sessionOverride;
  }

  if (typeof navigator !== "undefined") {
    const localeCandidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
    if (localeCandidates.some(isZhLocaleTag)) {
      return "zh";
    }
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase();
    if (timeZone && ZH_TIMEZONES.includes(timeZone)) {
      return "zh";
    }
  } catch {
    // ignore and fall back to English
  }

  return "en";
}

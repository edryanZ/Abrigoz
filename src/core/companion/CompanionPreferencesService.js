import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

const DEFAULTS = Object.freeze({
  version: 2, enabled: true, displayCount: 5, preferredCategories: [],
  hiddenCategories: [], preferredMinutes: null, useFavorites: true,
  useGoals: true, useHabits: true, useCalendar: true, showMusic: true,
  showScreen: true, showBooks: true, showActivities: true, reduceRepeats: true,
  shortTexts: false, blocked: [], categoryWeights: {}, interactions: [],
  sets: [], cursor: -1,
});

function strings(value, limit = 100) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string"))].slice(-limit)
    : [];
}

export function loadCompanionPreferences() {
  const raw = storage.get(STORAGE_KEYS.COMPANION);
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const legacyBlocked = strings(raw.blockedSuggestions);
  return {
    ...DEFAULTS, ...raw, version: 2,
    displayCount: [3, 4, 5].includes(Number(raw.displayCount))
      ? Number(raw.displayCount) : 5,
    preferredCategories: strings(raw.preferredCategories, 20),
    hiddenCategories: strings(raw.hiddenCategories ?? raw.hiddenTypes, 20),
    blocked: strings(raw.blocked ?? legacyBlocked, 120),
    categoryWeights: raw.categoryWeights && typeof raw.categoryWeights === "object"
      ? raw.categoryWeights : {},
    interactions: Array.isArray(raw.interactions)
      ? raw.interactions.filter((item) => item?.id && item?.at).slice(-120) : [],
    sets: Array.isArray(raw.sets)
      ? raw.sets.filter((set) => Array.isArray(set)).slice(-10) : [],
    cursor: Number.isInteger(raw.cursor) ? raw.cursor : -1,
  };
}

export function saveCompanionPreferences(input, sync = true) {
  const safe = { ...loadCompanionPreferences(), ...input, version: 2 };
  safe.blocked = strings(safe.blocked, 120);
  safe.hiddenCategories = strings(safe.hiddenCategories, 20);
  safe.preferredCategories = strings(safe.preferredCategories, 20);
  safe.interactions = (safe.interactions ?? []).slice(-120);
  safe.sets = (safe.sets ?? []).slice(-10);
  storage.set(STORAGE_KEYS.COMPANION, safe);
  if (sync) emitSync({ module: "companion", action: "update", recordId: "preferences" });
  return safe;
}

export function clearCompanionHistory() {
  return saveCompanionPreferences({ interactions: [], sets: [], cursor: -1 });
}

export function restoreBlockedSuggestions() {
  return saveCompanionPreferences({ blocked: [] });
}

import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

export const DEFAULT_AI_PREFERENCES = Object.freeze({
  version: 1,
  assistantEnabled: false,
  allowSelectedContent: false,
  saveHistory: false,
  allowStatistics: false,
  allowMood: false,
  externalRecommendations: false,
  autoRedact: true,
});

export function loadAIPreferences() {
  const saved = storage.get(STORAGE_KEYS.AI_PREFERENCES);
  return saved?.version === 1
    ? { ...DEFAULT_AI_PREFERENCES, ...saved }
    : { ...DEFAULT_AI_PREFERENCES };
}

export function saveAIPreferences(changes) {
  const next = { ...loadAIPreferences(), ...changes, version: 1 };
  storage.set(STORAGE_KEYS.AI_PREFERENCES, next);
  return next;
}

import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const DEFAULTS = Object.freeze({
  version: 1, notifyOffline: true, updateWhenConfirmed: true,
});

export function loadOfflinePreferences() {
  const saved = storage.get(STORAGE_KEYS.OFFLINE_PREFERENCES);
  return saved?.version === 1 ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
}

export function saveOfflinePreferences(changes) {
  const next = { ...loadOfflinePreferences(), ...changes, version: 1 };
  storage.set(STORAGE_KEYS.OFFLINE_PREFERENCES, next);
  return next;
}

import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const DEFAULTS = Object.freeze({
  version: 1, defaultExpiry: "day", removeMetadata: true,
  requirePreview: true, requireConfirmation: true,
});

export function loadSharePreferences() {
  const saved = storage.get(STORAGE_KEYS.SHARE_PREFERENCES);
  return saved?.version === 1 ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
}

export function saveSharePreferences(changes) {
  const next = { ...loadSharePreferences(), ...changes, version: 1 };
  storage.set(STORAGE_KEYS.SHARE_PREFERENCES, next);
  return next;
}

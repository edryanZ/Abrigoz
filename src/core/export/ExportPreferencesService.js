import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const DEFAULTS = Object.freeze({
  version: 1, format: "json", includeMetadata: false,
  protectByDefault: false, period: "all",
});

export function loadExportPreferences() {
  const saved = storage.get(STORAGE_KEYS.EXPORT_PREFERENCES);
  return saved?.version === 1 ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
}

export function saveExportPreferences(changes) {
  const next = { ...loadExportPreferences(), ...changes, version: 1 };
  storage.set(STORAGE_KEYS.EXPORT_PREFERENCES, next);
  return next;
}

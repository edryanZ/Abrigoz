import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

export function getAnalyticsConsent() {
  return storage.get(STORAGE_KEYS.ANALYTICS_CONSENT)?.enabled === true;
}

export function persistAnalyticsConsent(enabled) {
  return storage.set(STORAGE_KEYS.ANALYTICS_CONSENT, {
    version: 1,
    enabled: Boolean(enabled),
  });
}

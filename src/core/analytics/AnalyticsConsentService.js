import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const NOTICE_KEY = "abrigo:analytics-notice:v1";

export function getAnalyticsConsent() {
  const preference = storage.get(STORAGE_KEYS.ANALYTICS_CONSENT);
  return preference?.enabled !== false;
}

export function persistAnalyticsConsent(enabled) {
  return storage.set(STORAGE_KEYS.ANALYTICS_CONSENT, {
    version: 2,
    enabled: Boolean(enabled),
  });
}

export function hasSeenAnalyticsNotice() {
  return storage.get(NOTICE_KEY)?.seen === true;
}

export function persistAnalyticsNoticeSeen() {
  return storage.set(NOTICE_KEY, {
    version: 1,
    seen: true,
  });
}
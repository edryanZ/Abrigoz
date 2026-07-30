import STORAGE_KEYS from "../constants/storageKeys.js";
import { encodeBase64Url } from "../crypto/Base64Url.js";
import { storage } from "../storage/storage.js";
import {
  ALLOWED_ANALYTICS_EVENTS,
  validateAnalyticsEvent,
} from "./AnalyticsPolicy.js";
const APP_VERSION = "2.0";
const HEARTBEAT_MS = 60_000;
const EVENT_INTERVAL_MS = 1_000;

let sessionTokenHash = null;
let heartbeatTimer = null;
let lastEventAt = 0;

export function getAnalyticsConsent() {
  return storage.get(STORAGE_KEYS.ANALYTICS_CONSENT)?.enabled === true;
}

async function createSessionHash() {
  if (sessionTokenHash) return sessionTokenHash;
  if (!globalThis.crypto?.subtle) return null;
  const token = crypto.getRandomValues(new Uint8Array(32));
  const digest = await crypto.subtle.digest("SHA-256", token);
  token.fill(0);
  sessionTokenHash = encodeBase64Url(new Uint8Array(digest));
  return sessionTokenHash;
}

function deviceCategory() {
  const width = globalThis.innerWidth ?? 1024;
  return width < 600 ? "mobile" : width < 1024 ? "tablet" : "desktop";
}

async function safePresence() {
  if (!getAnalyticsConsent() || document.visibilityState === "hidden") return;
  const hash = await createSessionHash();
  if (!hash) return;
  const { AnalyticsRepository } = await import("../repository/AnalyticsRepository.js");
  await AnalyticsRepository.heartbeat({
    sessionTokenHash: hash,
    deviceCategory: deviceCategory(),
    appVersion: APP_VERSION,
  });
}

export function stopAnalytics() {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  sessionTokenHash = null;
  lastEventAt = 0;
}

export async function setAnalyticsConsent(enabled) {
  storage.set(STORAGE_KEYS.ANALYTICS_CONSENT, { version: 1, enabled: Boolean(enabled) });
  if (!enabled) {
    stopAnalytics();
    return false;
  }
  startAnalytics();
  return true;
}

export async function trackAnonymousEvent(name, fields = {}) {
  if (!getAnalyticsConsent() || !validateAnalyticsEvent(name, fields)) return false;
  if (Date.now() - lastEventAt < EVENT_INTERVAL_MS) return false;
  lastEventAt = Date.now();
  const hash = await createSessionHash();
  if (!hash) return false;
  const { AnalyticsRepository } = await import("../repository/AnalyticsRepository.js");
  const result = await AnalyticsRepository.recordEvent({
    name,
    page: fields.page,
    errorCode: fields.errorCode,
    sessionTokenHash: hash,
    deviceCategory: deviceCategory(),
    appVersion: APP_VERSION,
  });
  return result.ok;
}

export function startAnalytics() {
  if (!getAnalyticsConsent() || heartbeatTimer) return;
  void safePresence();
  void trackAnonymousEvent("app_open");
  heartbeatTimer = window.setInterval(() => { void safePresence(); }, HEARTBEAT_MS);
}

export { ALLOWED_ANALYTICS_EVENTS };

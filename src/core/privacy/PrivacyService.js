import STORAGE_KEYS from "../constants/storageKeys";
import { storage } from "../storage/storage";

export function isPrivacyModeEnabled() {
  const value = storage.get(STORAGE_KEYS.PRIVACY_MODE);
  return value === true || value?.enabled === true;
}

export function setPrivacyMode(enabled) {
  const value = { version: 1, enabled: Boolean(enabled) };
  storage.set(STORAGE_KEYS.PRIVACY_MODE, value);
  window.dispatchEvent(new CustomEvent("abrigo:privacy-change", { detail: value.enabled }));
  return value.enabled;
}

export function applyPrivacyMode(enabled = isPrivacyModeEnabled()) {
  document.body.classList.toggle("abrigo-privacy", enabled);
  return enabled;
}

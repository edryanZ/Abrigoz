import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

export const DEFAULT_ACCESSIBILITY = Object.freeze({
  version: 1,
  textSize: "standard",
  highContrast: false,
  readingFont: "standard",
});

export function normalizeAccessibilityPreferences(value) {
  return {
    version: 1,
    textSize: ["small", "standard", "large"].includes(value?.textSize) ? value.textSize : "standard",
    highContrast: value?.highContrast === true,
    readingFont: ["standard", "comfortable"].includes(value?.readingFont) ? value.readingFont : "standard",
  };
}

export function loadAccessibilityPreferences() {
  return normalizeAccessibilityPreferences(storage.get(STORAGE_KEYS.ACCESSIBILITY));
}

export function applyAccessibilityPreferences(preferences = loadAccessibilityPreferences()) {
  if (typeof document === "undefined") return preferences;
  const root = document.documentElement;
  ["small", "standard", "large"].forEach((size) => root.classList.remove(`text-size-${size}`));
  root.classList.add(`text-size-${preferences.textSize}`);
  root.classList.toggle("high-contrast", preferences.highContrast);
  root.classList.toggle("comfortable-reading", preferences.readingFont === "comfortable");
  return preferences;
}

export function saveAccessibilityPreferences(changes) {
  const next = normalizeAccessibilityPreferences({ ...loadAccessibilityPreferences(), ...changes });
  if (!storage.set(STORAGE_KEYS.ACCESSIBILITY, next)) throw new Error("Não foi possível guardar esta preferência.");
  applyAccessibilityPreferences(next);
  return next;
}

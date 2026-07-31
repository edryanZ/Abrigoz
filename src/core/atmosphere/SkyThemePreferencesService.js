import { storage } from "../storage/storage.js";

export const SKY_PREFERENCES_KEY = "abrigo:sky-preferences:v1";
export const DEFAULT_SKY_PREFERENCES = Object.freeze({
  version: 1, automatic: true, useDeviceTime: true, intensity: "standard",
  showStars: true, showGlows: true, allowAnimations: true, reduceEffects: false,
  staticBackground: false, colorMode: "system",
});

const BOOLEAN_PREFERENCES = [
  "automatic", "useDeviceTime", "showStars", "showGlows",
  "allowAnimations", "reduceEffects", "staticBackground",
];

export function normalizeSkyPreferences(value) {
  if (!value || typeof value !== "object" || value.version !== 1) {
    return { ...DEFAULT_SKY_PREFERENCES };
  }
  const next = { ...DEFAULT_SKY_PREFERENCES };
  BOOLEAN_PREFERENCES.forEach((key) => {
    if (typeof value[key] === "boolean") next[key] = value[key];
  });
  if (["soft","standard","strong"].includes(value.intensity)) {
    next.intensity = value.intensity;
  }
  if (["light","dark","system"].includes(value.colorMode)) {
    next.colorMode = value.colorMode;
  }
  return next;
}

export function loadSkyPreferences() {
  return normalizeSkyPreferences(storage.get(SKY_PREFERENCES_KEY));
}

export function saveSkyPreferences(changes) {
  const next = normalizeSkyPreferences({
    ...loadSkyPreferences(), ...changes, version: 1,
  });
  storage.set(SKY_PREFERENCES_KEY, next);
  window.dispatchEvent(new CustomEvent("abrigo:sky-preferences", { detail: next }));
  return next;
}

export function restoreSkyPreferences() {
  storage.remove(SKY_PREFERENCES_KEY);
  const next = { ...DEFAULT_SKY_PREFERENCES };
  window.dispatchEvent(new CustomEvent("abrigo:sky-preferences", { detail: next }));
  return next;
}

import { storage } from "../storage/storage.js";

export const SKY_PREFERENCES_KEY = "abrigo:sky-preferences:v1";
export const DEFAULT_SKY_PREFERENCES = Object.freeze({
  version: 1, automatic: true, useDeviceTime: true, intensity: "standard",
  showStars: true, showGlows: true, allowAnimations: true, reduceEffects: false,
  staticBackground: false, colorMode: "system",
});

export function loadSkyPreferences() {
  const value = storage.get(SKY_PREFERENCES_KEY);
  return value?.version === 1
    ? { ...DEFAULT_SKY_PREFERENCES, ...value }
    : { ...DEFAULT_SKY_PREFERENCES };
}

export function saveSkyPreferences(changes) {
  const next = { ...loadSkyPreferences(), ...changes, version: 1 };
  if (!["soft","standard","strong"].includes(next.intensity)) next.intensity = "standard";
  if (!["light","dark","system"].includes(next.colorMode)) next.colorMode = "system";
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

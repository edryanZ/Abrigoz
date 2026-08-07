import { storage } from "../storage/storage.js";

export const ATMOSPHERE_PREFERENCES_KEY = "abrigo:atmosphere-preferences:v1";
export const DEFAULT_ATMOSPHERE_PREFERENCES = Object.freeze({
  version: 1,
  silenceMode: false,
  interactiveSky: true,
  rareEvents: true,
  ambientEnabled: false,
  ambientSound: "none",
  ambientVolume: 0.2,
});

export function normalizeAtmospherePreferences(value) {
  if (!value || typeof value !== "object" || value.version !== 1) {
    return { ...DEFAULT_ATMOSPHERE_PREFERENCES };
  }
  const next = { ...DEFAULT_ATMOSPHERE_PREFERENCES };
  ["silenceMode", "interactiveSky", "rareEvents", "ambientEnabled"].forEach((key) => {
    if (typeof value[key] === "boolean") next[key] = value[key];
  });
  if (typeof value.ambientSound === "string") next.ambientSound = value.ambientSound;
  if (Number.isFinite(value.ambientVolume)) {
    next.ambientVolume = Math.min(1, Math.max(0, value.ambientVolume));
  }
  return next;
}

export function loadAtmospherePreferences() {
  return normalizeAtmospherePreferences(storage.get(ATMOSPHERE_PREFERENCES_KEY));
}

export function saveAtmospherePreferences(changes) {
  const next = normalizeAtmospherePreferences({
    ...loadAtmospherePreferences(), ...changes, version: 1,
  });
  storage.set(ATMOSPHERE_PREFERENCES_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("abrigo:atmosphere-preferences", { detail: next }));
  }
  return next;
}

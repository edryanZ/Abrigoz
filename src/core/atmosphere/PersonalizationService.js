import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

export const ATMOSPHERE_THEMES = Object.freeze({
  serene: "Sereno", aurora: "Aurora", rain: "Chuva",
  sunset: "Entardecer", starry: "Noite Estrelada",
});

export const DEFAULT_PERSONALIZATION = Object.freeze({
  version: 1, personalPhrase: "", atmosphereTheme: "serene", visualEnergy: "quiet",
  showReflectionsOnHome: true, introspectiveContent: true,
  monthlyRituals: false,
});

export function normalizePersonalization(value) {
  if (!value || typeof value !== "object" || value.version !== 1) {
    return { ...DEFAULT_PERSONALIZATION };
  }
  return {
    version: 1,
    personalPhrase: String(value.personalPhrase ?? "").trim().slice(0, 120),
    atmosphereTheme: ATMOSPHERE_THEMES[value.atmosphereTheme]
      ? value.atmosphereTheme : DEFAULT_PERSONALIZATION.atmosphereTheme,
    visualEnergy: ["quiet", "vivid"].includes(value.visualEnergy)
      ? value.visualEnergy : DEFAULT_PERSONALIZATION.visualEnergy,
    showReflectionsOnHome: value.showReflectionsOnHome !== false,
    introspectiveContent: value.introspectiveContent !== false,
    monthlyRituals: value.monthlyRituals === true,
  };
}

export function loadPersonalization() {
  return normalizePersonalization(storage.get(STORAGE_KEYS.PERSONALIZATION));
}

export function savePersonalization(changes) {
  const next = normalizePersonalization({ ...loadPersonalization(), ...changes, version: 1 });
  if (!storage.set(STORAGE_KEYS.PERSONALIZATION, next)) {
    throw new Error("Não foi possível guardar esta preferência agora.");
  }
  emitSync({ module: "personalization", action: "update" });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("abrigo:personalization", { detail: next }));
  }
  return next;
}

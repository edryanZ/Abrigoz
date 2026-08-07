import STORAGE_KEYS from "../constants/storageKeys.js";
import ROUTES from "../constants/routes.js";
import { storage } from "../storage/storage.js";

export const NAV_DESTINATIONS = Object.freeze([
  ["moment", "Momento do Dia", ROUTES.MOMENT], ["pause", "Só Ficar", ROUTES.PAUSE],
  ["diary", "Reflexões", ROUTES.DIARY], ["letters", "Cartas", ROUTES.LETTERS],
  ["favorites", "Coisas que fazem bem", ROUTES.FAVORITES], ["habits", "Pequenos Cuidados", ROUTES.HABITS],
  ["goals", "Intenções", ROUTES.GOALS], ["calendar", "Meu Dia", ROUTES.CALENDAR],
  ["capsules", "Cápsulas", ROUTES.CAPSULES], ["statistics", "Retrospectiva", ROUTES.STATISTICS],
  ["search", "Pesquisa", ROUTES.SEARCH], ["export", "Exportar", ROUTES.EXPORT],
]);

const OPTIONAL_IDS = new Set(NAV_DESTINATIONS.map(([id]) => id));
const SIMPLIFIED_HIDDEN = new Set(["favorites", "habits", "goals", "capsules", "statistics", "export"]);
const DEFAULTS = Object.freeze({ version: 1, simplified: false, hiddenModules: [], favorites: [] });

export function loadNavigationPreferences() {
  const value = storage.get(STORAGE_KEYS.NAVIGATION_PREFERENCES);
  if (value?.version !== 1) return { ...DEFAULTS };
  return {
    version: 1, simplified: value.simplified === true,
    hiddenModules: Array.isArray(value.hiddenModules) ? [...new Set(value.hiddenModules.filter((id) => OPTIONAL_IDS.has(id)))] : [],
    favorites: Array.isArray(value.favorites) ? [...new Set(value.favorites.filter((id) => OPTIONAL_IDS.has(id)))].slice(0, 3) : [],
  };
}

export function saveNavigationPreferences(changes) {
  const current = loadNavigationPreferences();
  const next = { ...current, ...changes, version: 1 };
  next.hiddenModules = [...new Set((next.hiddenModules ?? []).filter((id) => OPTIONAL_IDS.has(id)))];
  next.favorites = [...new Set((next.favorites ?? []).filter((id) => OPTIONAL_IDS.has(id)))].slice(0, 3);
  storage.set(STORAGE_KEYS.NAVIGATION_PREFERENCES, next);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("abrigo:navigation-preferences", { detail: next }));
  return next;
}

export function isNavigationItemVisible(id, preferences = loadNavigationPreferences()) {
  if (!OPTIONAL_IDS.has(id)) return true;
  return !preferences.hiddenModules.includes(id) && !(preferences.simplified && SIMPLIFIED_HIDDEN.has(id));
}

export function setNavigationFavorite(id, enabled) {
  const current = loadNavigationPreferences();
  const favorites = enabled ? [...current.favorites, id] : current.favorites.filter((item) => item !== id);
  if (enabled && new Set(favorites).size > 3) throw new Error("Escolha no máximo 3 atalhos favoritos.");
  return saveNavigationPreferences({ favorites });
}

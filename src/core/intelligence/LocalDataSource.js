import STORAGE_KEYS from "../constants/storageKeys";
import { storage } from "../storage/storage";

function items(key) {
  const value = storage.get(key);
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.items) ? value.items : [];
}

export function readLocalData() {
  const moods = storage.get(STORAGE_KEYS.MOODS)
    ?? storage.get("abrigo_moods")
    ?? { moods: [] };
  return {
    calendar: items(STORAGE_KEYS.EVENTS),
    favorites: items(STORAGE_KEYS.FAVORITE_ITEMS),
    goals: items(STORAGE_KEYS.GOALS),
    habits: items(STORAGE_KEYS.HABITS),
    diary: items(STORAGE_KEYS.DIARY),
    moods: Array.isArray(moods) ? moods : (moods?.items ?? moods?.moods ?? []),
    letters: storage.get(STORAGE_KEYS.LETTERS),
    achievements: storage.get(STORAGE_KEYS.ACHIEVEMENTS)
      ?? storage.get("abrigo_achievements"),
  };
}

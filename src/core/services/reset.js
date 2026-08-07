import STORAGE_KEYS from "../constants/storageKeys";
import { storage } from "../storage/storage.js";

export function resetAbrigo() {
  const legacyKeys = ["abrigo_streak", "abrigo_statistics", "abrigo_moods", "abrigo_achievements"];
  return storage.removeMany([...Object.values(STORAGE_KEYS), ...legacyKeys]);
}

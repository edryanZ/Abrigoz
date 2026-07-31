import STORAGE_KEYS from "../constants/storageKeys";
import { storage } from "../storage/storage.js";

export function resetAbrigo() {
  return storage.removeMany(Object.values(STORAGE_KEYS));
}

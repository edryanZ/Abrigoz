import STORAGE_KEYS from "../../../core/constants/storageKeys";
import { emitSync } from "../../../core/services/sync";
import { storage } from "../../../core/storage/storage";

export function getEntries() {
  const value = storage.get(STORAGE_KEYS.DIARY);
  return Array.isArray(value) ? value : (value?.items ?? []);
}
export function saveEntry(entry) {
  const entries = getEntries();
  const next = entry.id ? entries.map((item) => item.id === entry.id ? entry : item) : [{ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...entries];
  storage.set(STORAGE_KEYS.DIARY, next); emitSync(); return next;
}
export function deleteEntry(id) {
  const next = getEntries().filter((entry) => entry.id !== id);
  storage.set(STORAGE_KEYS.DIARY, next); emitSync(); return next;
}

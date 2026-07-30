import STORAGE_KEYS from "../../../core/constants/storageKeys";
import { emitSync } from "../../../core/services/sync";

export function getEntries() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.DIARY) || "[]"); }
export function saveEntry(entry) {
  const entries = getEntries();
  const next = entry.id ? entries.map((item) => item.id === entry.id ? entry : item) : [{ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...entries];
  localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(next)); emitSync(); return next;
}
export function deleteEntry(id) { const next = getEntries().filter((entry) => entry.id !== id); localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(next)); emitSync(); return next; }

import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

export function getMonthlyRitualPhase(date = new Date()) {
  const day = date.getDate();
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  if (day <= 3) return "opening";
  if (day >= last - 2) return "closing";
  return null;
}

export function saveMonthlyRitual({ phase, text = "", carry = "", release = "" }, date = new Date()) {
  if (!["opening", "closing"].includes(phase)) throw new Error("Ritual inválido.");
  const item = { id: crypto.randomUUID(), phase,
    month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    text: String(text).trim().slice(0, 500), carry: String(carry).trim().slice(0, 300),
    release: String(release).trim().slice(0, 300), createdAt: new Date().toISOString() };
  const raw = storage.get(STORAGE_KEYS.MONTHLY_RITUALS);
  const items = raw?.version === 1 && Array.isArray(raw.items) ? raw.items : [];
  storage.set(STORAGE_KEYS.MONTHLY_RITUALS, { version: 1, items: [...items, item].slice(-36) });
  emitSync({ module: "monthly-rituals", action: "create", recordId: item.id });
  return item;
}

export function listMonthlyRituals() {
  const raw = storage.get(STORAGE_KEYS.MONTHLY_RITUALS);
  return raw?.version === 1 && Array.isArray(raw.items) ? raw.items : [];
}

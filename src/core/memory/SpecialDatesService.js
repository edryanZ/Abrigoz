import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

function read() {
  const value = storage.get(STORAGE_KEYS.SPECIAL_DATES);
  return value?.version === 1 && Array.isArray(value.items) ? value.items : [];
}

export function listSpecialDates() {
  return read().map((item) => ({ ...item }));
}

export function saveSpecialDate({ date, name = "", description = "" }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) throw new Error("Escolha uma data válida.");
  const item = {
    id: crypto.randomUUID(), date,
    name: String(name).trim().slice(0, 100),
    description: String(description).trim().slice(0, 300),
    createdAt: new Date().toISOString(),
  };
  storage.set(STORAGE_KEYS.SPECIAL_DATES, { version: 1, items: [...read(), item].slice(-200) });
  emitSync({ module: "special-dates", action: "create", recordId: item.id });
  return item;
}

export function deleteSpecialDate(id) {
  const items = read();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  storage.set(STORAGE_KEYS.SPECIAL_DATES, { version: 1, items: next });
  emitSync({ module: "special-dates", action: "delete", recordId: id });
  return true;
}

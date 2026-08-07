import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

function rawItems() {
  const value = storage.get(STORAGE_KEYS.HIDDEN_CONTENT);
  return value?.version === 1 && Array.isArray(value.items) ? value.items : [];
}

export function listHiddenContent() {
  const current = rawItems();
  const legacy = storage.get(STORAGE_KEYS.HIDDEN_MEMORIES);
  const legacyIds = Array.isArray(legacy?.ids) ? legacy.ids : [];
  const merged = [...current];
  legacyIds.forEach((id) => {
    if (!merged.some((item) => item.id === id)) merged.push({ id, type: "memory", label: "Memória ocultada anteriormente", hiddenAt: null });
  });
  return merged;
}

export function hideContent({ id, type = "suggestion", label = "Conteúdo ocultado" }) {
  if (!id) return false;
  const items = rawItems().filter((item) => item.id !== String(id));
  items.push({ id: String(id), type: String(type).slice(0, 40), label: String(label).slice(0, 120), hiddenAt: new Date().toISOString() });
  storage.set(STORAGE_KEYS.HIDDEN_CONTENT, { version: 1, items: items.slice(-500) });
  emitSync({ module: "content-visibility", action: "hide", recordId: String(id) });
  return true;
}

export function isContentHidden(id) {
  return listHiddenContent().some((item) => item.id === String(id));
}

export function restoreHiddenContent(id) {
  const target = String(id);
  storage.set(STORAGE_KEYS.HIDDEN_CONTENT, { version: 1, items: rawItems().filter((item) => item.id !== target) });
  const legacy = storage.get(STORAGE_KEYS.HIDDEN_MEMORIES);
  if (Array.isArray(legacy?.ids)) storage.set(STORAGE_KEYS.HIDDEN_MEMORIES, { ...legacy, ids: legacy.ids.filter((item) => item !== target) });
  emitSync({ module: "content-visibility", action: "restore", recordId: target });
  return true;
}

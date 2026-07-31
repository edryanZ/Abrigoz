import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const LIMIT = 30;

export function loadAIHistory(enabled) {
  if (!enabled) return [];
  const value = storage.get(STORAGE_KEYS.AI_HISTORY);
  return value?.version === 1 && Array.isArray(value.items) ? value.items.slice(-LIMIT) : [];
}

export function appendAIHistory(item, enabled) {
  if (!enabled) return null;
  const items = [...loadAIHistory(true), {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(),
    request: String(item.request ?? "").slice(0, 1200),
    response: String(item.response ?? "").slice(0, 6000),
  }].slice(-LIMIT);
  storage.set(STORAGE_KEYS.AI_HISTORY, { version: 1, items });
  return items.at(-1);
}

export function clearAIHistory() {
  storage.remove(STORAGE_KEYS.AI_HISTORY);
}

export function deleteAIConversation(id) {
  const items = loadAIHistory(true).filter((item) => item.id !== id);
  storage.set(STORAGE_KEYS.AI_HISTORY, { version: 1, items });
  return items;
}

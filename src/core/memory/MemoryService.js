import STORAGE_KEYS from "../constants/storageKeys.js";
import { localDateKey } from "../intelligence/localDates.js";
import { readLocalData } from "../intelligence/LocalDataSource.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

export const DEFAULT_MEMORY_PREFERENCES = Object.freeze({
  version: 1,
  enabled: true,
  reflectionsEnabled: true,
});

function deterministicIndex(text, length) {
  let value = 2166136261;
  for (const character of text) {
    value ^= character.codePointAt(0);
    value = Math.imul(value, 16777619);
  }
  return length ? (value >>> 0) % length : -1;
}

function pauseRecords() {
  const raw = storage.get(STORAGE_KEYS.PAUSE_MOMENTS);
  return raw?.version === 1 && Array.isArray(raw.items) ? raw.items : [];
}

function hiddenIds() {
  const raw = storage.get(STORAGE_KEYS.HIDDEN_MEMORIES);
  return Array.isArray(raw?.ids) ? raw.ids : [];
}

export function loadMemoryPreferences() {
  const raw = storage.get(STORAGE_KEYS.MEMORY_PREFERENCES);
  if (raw?.version === 1) {
    return {
      version: 1,
      enabled: raw.enabled !== false,
      reflectionsEnabled: raw.reflectionsEnabled !== false,
    };
  }
  const legacy = storage.get(STORAGE_KEYS.DASHBOARD_PREFERENCES);
  return { ...DEFAULT_MEMORY_PREFERENCES, enabled: legacy?.memoriesEnabled !== false };
}

export function saveMemoryPreferences(changes) {
  const next = { ...loadMemoryPreferences(), ...changes, version: 1 };
  next.enabled = next.enabled !== false;
  next.reflectionsEnabled = next.reflectionsEnabled !== false;
  storage.set(STORAGE_KEYS.MEMORY_PREFERENCES, next);
  emitSync({ module: "memory-preferences", action: "update" });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("abrigo:memory-preferences", { detail: next }));
  }
  return next;
}

export function savePauseMoment({ phrase = "", period = "" }, now = new Date()) {
  const item = {
    id: crypto.randomUUID(), date: localDateKey(now), period: String(period).slice(0, 24),
    phrase: String(phrase).trim().slice(0, 500), createdAt: new Date().toISOString(),
  };
  const items = [...pauseRecords(), item].slice(-120);
  if (!storage.set(STORAGE_KEYS.PAUSE_MOMENTS, { version: 1, items })) {
    throw new Error("Não foi possível guardar este momento agora.");
  }
  emitSync({ module: "pause-moments", action: "create", recordId: item.id });
  return item;
}

export function getGentleMemory(reference = new Date(), data = readLocalData()) {
  const preferences = loadMemoryPreferences();
  if (!preferences.enabled) return null;
  const today = localDateKey(reference);
  const hidden = new Set(hiddenIds());
  const candidates = [
    ...(preferences.reflectionsEnabled ? data.diary.map((item) => ({
      id: `reflection:${item.id}`, type: "reflection", date: String(item.createdAt ?? item.date ?? "").slice(0, 10),
      title: item.title ?? "Uma reflexão antiga", text: item.content ?? item.text ?? "",
    })) : []),
    ...data.favorites.map((item) => ({
      id: `favorite:${item.id}`, type: "wellbeing", date: String(item.createdAt ?? "").slice(0, 10),
      title: item.title ?? "Algo que fez bem", text: item.description ?? "",
    })),
    ...pauseRecords().map((item) => ({
      id: `pause:${item.id}`, type: "pause", date: item.date,
      title: "Um momento que você guardou", text: item.phrase || `Uma pausa de ${item.period || "outro momento"}.`,
    })),
  ].filter((item) => item.date && item.date < today && !hidden.has(item.id));
  const index = deterministicIndex(today, candidates.length);
  return index >= 0 ? candidates[index] : null;
}

export function hideGentleMemory(id) {
  const ids = [...new Set([...hiddenIds(), String(id)])].slice(-500);
  storage.set(STORAGE_KEYS.HIDDEN_MEMORIES, { version: 1, ids });
  emitSync({ module: "memories", action: "hide", recordId: String(id) });
  return true;
}

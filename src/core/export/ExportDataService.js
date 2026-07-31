import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

export const EXPORT_MODULES = Object.freeze({
  diary: { label: "Diário", key: STORAGE_KEYS.DIARY },
  calendar: { label: "Calendário", key: STORAGE_KEYS.EVENTS },
  goals: { label: "Metas", key: STORAGE_KEYS.GOALS },
  habits: { label: "Hábitos", key: STORAGE_KEYS.HABITS },
  favorites: { label: "Favoritos", key: STORAGE_KEYS.FAVORITE_ITEMS },
  achievements: { label: "Conquistas", key: STORAGE_KEYS.ACHIEVEMENTS },
  statistics: { label: "Estatísticas", key: STORAGE_KEYS.STATISTICS },
  assistant: { label: "Assistente", key: STORAGE_KEYS.AI_HISTORY },
});

const FORBIDDEN = /keyhash|synckey|cryptokey|abrigoid|deviceid|credential|secret|ciphertext|syncqueue/i;

function safeClone(value) {
  if (Array.isArray(value)) return value.map(safeClone);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !FORBIDDEN.test(key))
    .map(([key, item]) => [key, safeClone(item)]));
}

function periodStart(period, now = new Date()) {
  if (period === "all") return null;
  const days = { week: 7, month: 30, year: 365 }[period] ?? 0;
  return new Date(now.getTime() - days * 86400000);
}

function itemDate(item) {
  const value = item?.date ?? item?.createdAt ?? item?.updatedAt ?? item?.data;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function collectExportData(moduleIds, { period = "all", itemIdsByModule = null } = {}) {
  const start = periodStart(period);
  const modules = {};
  for (const id of moduleIds) {
    const definition = EXPORT_MODULES[id];
    if (!definition) continue;
    const raw = storage.get(definition.key);
    const container = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : raw;
    let data = safeClone(container ?? []);
    if (Array.isArray(data)) {
      const itemIds = itemIdsByModule?.[id] ?? null;
      data = data.filter((item) => (!itemIds || item.id == null || itemIds.includes(String(item.id)))
        && (!start || !itemDate(item) || itemDate(item) >= start));
    }
    modules[id] = data;
  }
  return { type: "abrigo-export", version: 1, createdAt: new Date().toISOString(), modules };
}

export function removeExportFields(document, options = {}) {
  const walk = (value) => {
    if (Array.isArray(value)) return value.map(walk);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).filter(([key]) =>
      !(options.hideDates && /date|createdat|updatedat/i.test(key))
      && !(options.hideMood && /mood|humor/i.test(key))
      && !(options.hideTags && /tag/i.test(key))
      && !(options.hideNames && /name|nome|author/i.test(key)))
      .map(([key, item]) => [key, walk(item)]));
  };
  return walk(document);
}

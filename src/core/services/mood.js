import STORAGE_KEYS from "../constants/storageKeys";
import { localDateKey } from "../intelligence/localDates";
import { storage } from "../storage/storage";
import { emitSync } from "../sync";

export const MOOD_VERSION = 2;
export const MOODS = {
  very_happy: "Muito bem", happy: "Bem", calm: "Tranquilo", excited: "Animado",
  tired: "Cansado", unmotivated: "Sem motivação", anxious: "Ansioso",
  sad: "Triste", irritated: "Irritado", confused: "Confuso",
  prefer_not: "Prefiro não dizer", custom: "Personalizado", normal: "Tranquilo",
};
const LEGACY_KEY = "abrigo_moods";

function normalize(entry) {
  const now = new Date().toISOString();
  const createdAt = entry.createdAt ?? now;
  return {
    id: String(entry.id ?? crypto.randomUUID()),
    mood: MOODS[entry.mood] ? entry.mood : "prefer_not",
    customMood: String(entry.customMood ?? "").slice(0, 60),
    intensity: entry.intensity == null ? null
      : Math.max(1, Math.min(5, Number(entry.intensity) || 1)),
    note: String(entry.note ?? "").slice(0, 1000),
    date: /^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? "")
      ? entry.date : localDateKey(new Date(createdAt)),
    period: ["morning", "afternoon", "evening", "night"].includes(entry.period)
      ? entry.period : periodOf(new Date(createdAt)),
    tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 10).map(String) : [],
    helpfulActivities: Array.isArray(entry.helpfulActivities)
      ? entry.helpfulActivities.slice(0, 10).map(String) : [],
    dashboardVisible: entry.dashboardVisible !== false,
    createdAt,
  };
}

function periodOf(date = new Date()) {
  const hour = date.getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function migrate(raw) {
  const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.moods ?? []);
  return { version: MOOD_VERSION, items: items.map(normalize).slice(-1000) };
}

export function getMoodData() {
  const raw = storage.get(STORAGE_KEYS.MOODS) ?? storage.get(LEGACY_KEY);
  const data = migrate(raw);
  if (raw?.version !== MOOD_VERSION) storage.set(STORAGE_KEYS.MOODS, data);
  return data;
}

export function saveMoodData(data) {
  const safe = migrate(data);
  storage.set(STORAGE_KEYS.MOODS, safe);
  emitSync({ module: "moods", action: "update", recordId: "history" });
  return safe;
}

export function saveMood(mood, note = "", options = {}) {
  const data = getMoodData();
  const now = new Date();
  const entry = normalize({ mood, note, date: localDateKey(now), createdAt: now.toISOString(), ...options });
  data.items.push(entry);
  storage.set(STORAGE_KEYS.MOODS, data);
  emitSync({ module: "moods", action: "create", recordId: entry.id });
  return entry;
}

export function getTodayMood() {
  return getMoodData().items.filter((item) => item.date === localDateKey())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}
export function getMoodHistory() {
  return [...getMoodData().items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getMoodCount() { return getMoodData().items.length; }
export function getLastMood() { return getMoodHistory()[0] ?? null; }
export function getMoodByDate(date) {
  return getMoodHistory().find((item) => item.date === date) ?? null;
}
export function deleteMood(idOrDate) {
  const data = getMoodData();
  data.items = data.items.filter((item) => item.id !== idOrDate && item.date !== idOrDate);
  return saveMoodData(data);
}
export function clearMoodHistory() {
  storage.remove(STORAGE_KEYS.MOODS);
  storage.remove(LEGACY_KEY);
}

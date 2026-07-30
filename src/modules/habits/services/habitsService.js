import STORAGE_KEYS from "../../../core/constants/storageKeys";
import { storage } from "../../../core/storage/storage";
import { emitSync } from "../../../core/sync";
import {
  localDateKey,
  parseLocalDate,
  shiftDays,
} from "../utils/habitDates";

export const HABITS_VERSION = 1;

function normalizeHabit(habit) {
  const now = new Date().toISOString();
  return {
    id: String(habit.id ?? crypto.randomUUID()),
    name: String(habit.name ?? habit.nome ?? "Hábito sem nome").trim(),
    description: String(habit.description ?? habit.descricao ?? ""),
    icon: String(habit.icon ?? habit.icone ?? "🌱").slice(0, 8),
    color: /^#[0-9a-f]{6}$/i.test(habit.color ?? "")
      ? habit.color
      : "#7d8ff2",
    frequency: ["daily", "weekdays", "weekly_count"].includes(habit.frequency)
      ? habit.frequency
      : "daily",
    weekdays: Array.isArray(habit.weekdays)
      ? [...new Set(habit.weekdays.map(Number).filter((day) =>
        Number.isInteger(day) && day >= 0 && day <= 6))]
      : [],
    time: /^\d{2}:\d{2}$/.test(habit.time ?? "") ? habit.time : "",
    target: Math.max(1, Math.min(7, Number(habit.target) || 1)),
    startDate: parseLocalDate(habit.startDate)
      ? habit.startDate
      : localDateKey(new Date()),
    archived: Boolean(habit.archived ?? habit.arquivado),
    completions: Array.isArray(habit.completions)
      ? [...new Set(habit.completions.filter(parseLocalDate))].sort()
      : [],
    createdAt: habit.createdAt ?? now,
    updatedAt: habit.updatedAt ?? now,
  };
}

function migrate(raw) {
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items) ? raw.items : [];
  return { version: HABITS_VERSION, items: items.map(normalizeHabit) };
}

function persist(data) {
  if (!storage.set(STORAGE_KEYS.HABITS, data)) {
    throw new Error("Não foi possível salvar seus hábitos.");
  }
}

export function loadHabits() {
  const raw = storage.get(STORAGE_KEYS.HABITS);
  const migrated = migrate(raw);
  if (raw?.version !== HABITS_VERSION) persist(migrated);
  return migrated;
}

export function saveHabit(input) {
  const data = loadHabits();
  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("O nome é obrigatório.");
  const existing = data.items.find((habit) => habit.id === input.id);
  const habit = normalizeHabit({
    ...existing,
    ...input,
    name,
    id: existing?.id ?? crypto.randomUUID(),
    completions: input.completions ?? existing?.completions ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  data.items = existing
    ? data.items.map((item) => item.id === habit.id ? habit : item)
    : [habit, ...data.items];
  persist(data);
  emitSync({
    module: "habits",
    action: existing ? "update" : "create",
    recordId: habit.id,
  });
  return habit;
}

export function deleteHabit(id) {
  const data = loadHabits();
  if (!data.items.some((habit) => habit.id === id)) return false;
  data.items = data.items.filter((habit) => habit.id !== id);
  persist(data);
  emitSync({ module: "habits", action: "delete", recordId: id });
  return true;
}

export function setHabitArchived(id, archived) {
  const habit = loadHabits().items.find((item) => item.id === id);
  return habit ? saveHabit({ ...habit, archived }) : null;
}

export function toggleHabitCompletion(id, dateKey = localDateKey()) {
  if (!parseLocalDate(dateKey)) throw new Error("Data inválida.");
  const habit = loadHabits().items.find((item) => item.id === id);
  if (!habit) return null;
  const exists = habit.completions.includes(dateKey);
  return saveHabit({
    ...habit,
    completions: exists
      ? habit.completions.filter((date) => date !== dateKey)
      : [...habit.completions, dateKey],
  });
}

export function isHabitScheduled(habit, date = new Date()) {
  if (localDateKey(date) < habit.startDate) return false;
  if (habit.frequency === "weekdays") {
    return habit.weekdays.includes(date.getDay());
  }
  return true;
}

export function habitStats(habit, reference = new Date()) {
  const completionSet = new Set(habit.completions);
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;
  let scheduled = 0;
  let completed = 0;
  const start = parseLocalDate(habit.startDate) ?? reference;
  const days = Math.min(
    3660,
    Math.max(1, Math.floor((reference - start) / 86400000) + 1)
  );

  for (let index = 0; index < days; index += 1) {
    const date = shiftDays(start, index);
    if (!isHabitScheduled(habit, date)) continue;
    scheduled += 1;
    if (completionSet.has(localDateKey(date))) {
      completed += 1;
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  let cursor = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate()
  );
  for (let checked = 0; checked < 3660 && cursor >= start; checked += 1) {
    if (isHabitScheduled(habit, cursor)) {
      if (!completionSet.has(localDateKey(cursor))) break;
      currentStreak += 1;
    }
    cursor = shiftDays(cursor, -1);
  }

  return {
    currentStreak,
    longestStreak,
    completionRate: scheduled ? Math.round((completed / scheduled) * 100) : 0,
  };
}

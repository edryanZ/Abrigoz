import STORAGE_KEYS from "../constants/storageKeys";
import { storage } from "../storage/storage";
import { readLocalData } from "./LocalDataSource";
import { calculateStatistics } from "./StatisticsEngine";
import { localDateKey, resolvePeriod, shiftLocalDate } from "./localDates";

export const DEFAULT_DASHBOARD_CARDS = [
  "today", "organization", "weekly", "memory", "companion", "achievements", "protection",
];

export function loadDashboardPreferences() {
  const raw = storage.get(STORAGE_KEYS.DASHBOARD_PREFERENCES);
  const order = Array.isArray(raw?.order)
    ? [...new Set(raw.order.filter((item) => DEFAULT_DASHBOARD_CARDS.includes(item)))]
    : DEFAULT_DASHBOARD_CARDS;
  DEFAULT_DASHBOARD_CARDS.forEach((item) => { if (!order.includes(item)) order.push(item); });
  return {
    version: 1,
    order,
    hidden: Array.isArray(raw?.hidden)
      ? raw.hidden.filter((item) => DEFAULT_DASHBOARD_CARDS.includes(item)) : [],
    summariesEnabled: raw?.summariesEnabled !== false,
    memoriesEnabled: raw?.memoriesEnabled !== false,
  };
}

export function saveDashboardPreferences(input) {
  const safe = { ...loadDashboardPreferences(), ...input, version: 1 };
  safe.order = [...new Set(safe.order)].filter((item) => DEFAULT_DASHBOARD_CARDS.includes(item));
  safe.hidden = [...new Set(safe.hidden)].filter((item) => DEFAULT_DASHBOARD_CARDS.includes(item));
  storage.set(STORAGE_KEYS.DASHBOARD_PREFERENCES, safe);
  return safe;
}

function itemDate(item) {
  return String(item.date ?? item.completedAt ?? item.createdAt ?? "").slice(0, 10);
}

export function getTodayOverview(reference = new Date(), data = readLocalData()) {
  const today = localDateKey(reference);
  const todayEvents = data.calendar.filter((item) => item.date === today)
    .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
  const habits = data.habits.filter((item) => !item.archived && item.startDate <= today
    && (item.frequency !== "weekdays" || item.weekdays?.includes(reference.getDay())));
  const priorityGoals = data.goals.filter((item) =>
    item.status !== "completed" && (item.priority === "high"
      || (item.dueDate && item.dueDate <= localDateKey(shiftLocalDate(reference, 7)))))
    .slice(0, 3);
  return {
    date: today,
    greeting: reference.getHours() < 12 ? "Bom dia" : reference.getHours() < 18 ? "Boa tarde" : "Boa noite",
    events: todayEvents.slice(0, 3),
    nextEvent: todayEvents[0] ?? null,
    habits: habits.slice(0, 5),
    habitsCompleted: habits.filter((item) => item.completions?.includes(today)).length,
    priorityGoals,
  };
}

export function getMemories(reference = new Date(), data = readLocalData()) {
  const today = localDateKey(reference).slice(5);
  const currentYear = reference.getFullYear();
  const hiddenRaw = storage.get(STORAGE_KEYS.HIDDEN_MEMORIES);
  const hidden = new Set(Array.isArray(hiddenRaw?.ids) ? hiddenRaw.ids : []);
  const sources = [
    ["diary", data.diary, "Registro do Diário"],
    ["calendar", data.calendar, "Evento"],
    ["favorites", data.favorites, "Favorito"],
    ["goals", data.goals.filter((item) => item.completedAt), "Meta concluída"],
  ];
  return sources.flatMap(([module, items, fallback]) => items.map((item) => {
    const date = itemDate(item);
    return {
      id: `${module}:${item.id}:${date}`, module, date,
      title: item.title ?? item.name ?? fallback,
    };
  })).filter((item) => item.date.slice(5) === today
    && Number(item.date.slice(0, 4)) < currentYear
    && !hidden.has(item.id))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
}

export function hideMemory(id) {
  const raw = storage.get(STORAGE_KEYS.HIDDEN_MEMORIES);
  const ids = Array.isArray(raw?.ids) ? raw.ids : [];
  storage.set(STORAGE_KEYS.HIDDEN_MEMORIES, {
    version: 1, ids: [...new Set([...ids, id])].slice(-500),
  });
}

export function getLocalSummary(kind = "week", reference = new Date(), data = readLocalData()) {
  const period = kind === "month"
    ? resolvePeriod("month", reference)
    : resolvePeriod("7d", reference);
  const stats = calculateStatistics(data, period, reference);
  return {
    kind, period,
    activeDays: stats.general.activeDays,
    habitsCompleted: stats.habits.completed,
    goalsCompleted: stats.goals.completedInPeriod,
    events: stats.calendar.total,
    diaryDays: stats.diary.days,
    favorites: stats.favorites.added,
    message: stats.general.activeDays
      ? `${stats.general.activeDays} dia(s) receberam algum momento. Cada ritmo tem seu valor.`
      : "Este período está tranquilo. Você pode começar quando quiser.",
  };
}

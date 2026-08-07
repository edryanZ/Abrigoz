import ROUTES from "../constants/routes.js";
import STORAGE_KEYS from "../constants/storageKeys.js";
import { readLocalData } from "../intelligence/LocalDataSource.js";
import { storage } from "../storage/storage.js";

const GROUP_LIMIT = 8;
const ALLOWED_MODULES = new Set([
  "all", "diary", "calendar", "favorites", "goals", "habits", "achievements", "letters",
]);

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

function text(value, limit = 800) {
  return String(value ?? "").slice(0, limit);
}

function currentLanguage(value) {
  return String(value ?? "")
    .replace(/conquistas/gi, (match) => match[0] === "C" ? "Marcos" : "marcos")
    .replace(/conquista/gi, (match) => match[0] === "C" ? "Marco" : "marco")
    .replace(/sequências/gi, (match) => match[0] === "S" ? "Continuidades" : "continuidades")
    .replace(/sequência/gi, (match) => match[0] === "S" ? "Continuidade" : "continuidade")
    .replace(/metas/gi, (match) => match[0] === "M" ? "Intenções" : "intenções")
    .replace(/meta/gi, (match) => match[0] === "M" ? "Intenção" : "intenção")
    .replace(/hábitos/gi, (match) => match[0] === "H" ? "Cuidados" : "cuidados")
    .replace(/hábito/gi, (match) => match[0] === "H" ? "Cuidado" : "cuidado")
    .replace(/progresso/gi, (match) => match[0] === "P" ? "Caminho" : "caminho")
    .replace(/desempenho/gi, (match) => match[0] === "D" ? "Percurso" : "percurso");
}

function result(module, item, title, body, extra = {}) {
  return {
    id: `${module}:${item.id ?? extra.date ?? title}`,
    sourceId: String(item.id ?? ""),
    module,
    title: text(title, 180),
    body: text(body),
    date: text(extra.date ?? item.updatedAt ?? item.createdAt ?? item.date, 30),
    category: text(extra.category ?? item.category, 80),
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 12).map((tag) => text(tag, 40)) : [],
    status: text(extra.status ?? item.status, 40),
    route: extra.route,
  };
}

const adapters = {
  diary: (data) => data.diary.map((item) =>
    result("diary", item, item.title ?? item.titulo ?? "Reflexão guardada",
      item.content ?? item.text ?? item.conteudo, { route: ROUTES.DIARY })),
  calendar: (data) => data.calendar.map((item) =>
    result("calendar", item, item.title ?? item.titulo, `${item.description ?? ""} ${item.location ?? ""}`,
      { route: ROUTES.CALENDAR })),
  favorites: (data) => data.favorites.map((item) =>
    result("favorites", item, item.title, item.description,
      { route: ROUTES.FAVORITES, category: item.type })),
  goals: (data) => data.goals.flatMap((item) => [
    result("goals", item, item.title, `${item.description ?? ""} ${item.notes ?? ""}`,
      { route: ROUTES.GOALS }),
    ...(item.steps ?? []).map((step) => result("goals", step, step.title,
      `Parte guardada de ${item.title}`, { route: ROUTES.GOALS, status: step.completed ? "completed" : "pending",
        date: item.updatedAt })),
  ]),
  habits: (data) => data.habits.map((item) =>
    result("habits", item, item.name, item.description,
      { route: ROUTES.HABITS, status: item.archived ? "archived" : "active" })),
  achievements: (data) => {
    const items = Array.isArray(data.achievements?.items) ? data.achievements.items : [];
    return items.map((item) => result("achievements", item,
      currentLanguage(item.title), currentLanguage(item.description),
      { route: ROUTES.STATISTICS, status: item.unlocked ? "guardado" : "histórico" }));
  },
  letters: () => [],
};

export function createSearchIndex(data = readLocalData()) {
  return Object.entries(adapters).flatMap(([, adapter]) => adapter(data))
    .slice(0, 10000);
}

function relevance(item, query) {
  const title = normalizeSearchText(item.title);
  const body = normalizeSearchText(item.body);
  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (body.includes(query)) return 30;
  return 0;
}

export function searchLocal(index, input, filters = {}) {
  const query = normalizeSearchText(input);
  if (query.length < 2) return { total: 0, groups: {} };
  const moduleFilter = ALLOWED_MODULES.has(filters.module) ? filters.module : "all";
  const matches = index.map((item) => ({ ...item, score: relevance(item, query) }))
    .filter((item) => item.score > 0
      && (moduleFilter === "all" || item.module === moduleFilter)
      && (!filters.category || normalizeSearchText(item.category) === normalizeSearchText(filters.category))
      && (!filters.status || normalizeSearchText(item.status) === normalizeSearchText(filters.status))
      && (!filters.tag || item.tags.some((tag) =>
        normalizeSearchText(tag) === normalizeSearchText(filters.tag)))
      && (!filters.start || item.date.slice(0, 10) >= filters.start)
      && (!filters.end || item.date.slice(0, 10) <= filters.end))
    .sort((a, b) => filters.order === "date"
      ? b.date.localeCompare(a.date)
      : b.score - a.score || b.date.localeCompare(a.date));
  return {
    total: matches.length,
    groups: Object.groupBy
      ? Object.groupBy(matches, (item) => item.module)
      : matches.reduce((groups, item) => {
        (groups[item.module] ??= []).push(item);
        return groups;
      }, {}),
    limit: GROUP_LIMIT,
  };
}

const DEFAULT_PREFERENCES = { version: 1, historyEnabled: false, recent: [] };

export function loadSearchPreferences() {
  const value = storage.get(STORAGE_KEYS.SEARCH_PREFERENCES);
  return value?.version === 1 ? {
    ...DEFAULT_PREFERENCES,
    historyEnabled: Boolean(value.historyEnabled),
    recent: Array.isArray(value.recent) ? value.recent.filter((item) =>
      typeof item === "string").slice(0, 5) : [],
  } : { ...DEFAULT_PREFERENCES };
}

export function saveSearchPreferences(next) {
  const safe = {
    version: 1,
    historyEnabled: Boolean(next.historyEnabled),
    recent: next.historyEnabled
      ? [...new Set((next.recent ?? []).map((item) => text(item, 100)).filter(Boolean))].slice(0, 5)
      : [],
  };
  storage.set(STORAGE_KEYS.SEARCH_PREFERENCES, safe);
  return safe;
}

export function rememberSearch(query) {
  const current = loadSearchPreferences();
  if (!current.historyEnabled || normalizeSearchText(query).length < 2) return current;
  return saveSearchPreferences({ ...current, recent: [query.trim(), ...current.recent] });
}

export function clearSearchHistory() {
  const current = loadSearchPreferences();
  return saveSearchPreferences({ ...current, recent: [] });
}

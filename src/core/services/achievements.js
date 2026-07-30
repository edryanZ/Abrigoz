import STORAGE_KEYS from "../constants/storageKeys.js";
import { readLocalData } from "../intelligence/LocalDataSource.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

export const ACHIEVEMENTS_VERSION = 2;
const LEGACY_KEY = "abrigo_achievements";

export const ACHIEVEMENTS = [
  ["first_visit", "Primeiros passos", "Você abriu seu Abrigo.", "🌱", "primeiros_passos", false],
  ["profile_created", "Um lugar seu", "Você personalizou seu perfil.", "🏡", "primeiros_passos", false],
  ["first_letter", "Primeira carta", "Você abriu sua primeira carta.", "💌", "cartas", false],
  ["letters_10", "Cartas pelo caminho", "Você abriu dez cartas.", "📖", "cartas", false],
  ["first_diary", "Primeiro registro", "Você guardou um momento no Diário.", "✍️", "diary", false],
  ["diary_7", "Uma semana com registros", "Sete dias diferentes receberam registros.", "📓", "diary", false],
  ["first_event", "Um encontro marcado", "Você criou seu primeiro evento.", "📅", "calendar", false],
  ["first_favorite", "Guardado com carinho", "Você salvou seu primeiro favorito.", "⭐", "favorites", false],
  ["first_goal", "Um pequeno passo", "Você criou sua primeira meta.", "🎯", "goals", false],
  ["first_goal_done", "Caminho concluído", "Você concluiu uma meta.", "🌤️", "goals", false],
  ["first_habit", "Cuidado cotidiano", "Você registrou uma conclusão de hábito.", "🌿", "habits", false],
  ["habit_3", "Três dias de cuidado", "Uma sequência chegou a três dias.", "🪴", "habits", false],
  ["habit_7", "Sete dias de cuidado", "Uma sequência chegou a sete dias.", "🌳", "habits", false],
  ["five_modules", "Explorando o Abrigo", "Você usou cinco espaços diferentes.", "🧭", "exploration", false],
  ["first_mood", "Como estou hoje", "Você registrou como estava se sentindo.", "💛", "care", false],
  ["rest_day", "Descanso respeitado", "Você acolheu um dia sem tarefas concluídas.", "☁️", "care", true],
  ["first_backup", "Cópia protegida", "Você criou um backup protegido.", "🛡️", "security", false],
  ["first_sync", "Proteção conectada", "Você concluiu uma sincronização protegida.", "🔐", "security", false],
].map(([id, title, description, icon, category, secret]) => ({
  id, title, description, icon, category, secret, version: 1,
}));

function normalizeItem(definition, existing) {
  return {
    ...definition,
    requirement: definition.id,
    progress: Math.max(0, Math.min(100, Number(existing?.progress) || 0)),
    unlocked: Boolean(existing?.unlocked),
    unlockedAt: existing?.unlockedAt ?? null,
  };
}

function migrate(raw) {
  const legacyUnlocked = Array.isArray(raw?.unlocked) ? raw.unlocked : [];
  const previousItems = Array.isArray(raw?.items) ? raw.items : [];
  return {
    version: ACHIEVEMENTS_VERSION,
    notificationsEnabled: raw?.notificationsEnabled !== false,
    celebrationsEnabled: raw?.celebrationsEnabled !== false,
    items: ACHIEVEMENTS.map((definition) => {
      const previous = previousItems.find((item) => item.id === definition.id);
      const legacy = legacyUnlocked.includes(definition.id);
      return normalizeItem(definition, previous ?? (legacy
        ? { unlocked: true, progress: 100, unlockedAt: raw?.updatedAt ?? null }
        : null));
    }),
  };
}

function persist(data, sync = false) {
  storage.set(STORAGE_KEYS.ACHIEVEMENTS, data);
  if (sync) emitSync({ module: "achievements", action: "update", recordId: "progress" });
}

export function getAchievements() {
  const raw = storage.get(STORAGE_KEYS.ACHIEVEMENTS) ?? storage.get(LEGACY_KEY);
  const migrated = migrate(raw);
  if (raw?.version !== ACHIEVEMENTS_VERSION) persist(migrated);
  return migrated;
}

function longestHabitStreak(habits) {
  return habits.reduce((best, habit) => {
    const dates = [...new Set(habit.completions ?? [])].sort();
    let running = 0;
    let longest = 0;
    let previous = null;
    dates.forEach((date) => {
      const current = new Date(`${date}T12:00:00`);
      const contiguous = previous && Math.round((current - previous) / 86400000) === 1;
      running = contiguous ? running + 1 : 1;
      longest = Math.max(longest, running);
      previous = current;
    });
    return Math.max(best, longest);
  }, 0);
}

export function evaluateAchievementFacts(data = readLocalData(), extras = {}) {
  const diaryDays = new Set(data.diary.map((item) =>
    String(item.date ?? item.createdAt ?? "").slice(0, 10))).size;
  const modules = [
    data.diary.length, data.calendar.length, data.favorites.length,
    data.goals.length, data.habits.length,
  ].filter(Boolean).length;
  const streak = longestHabitStreak(data.habits);
  return {
    first_visit: extras.firstVisit ? 100 : 0,
    profile_created: extras.profileCreated ? 100 : 0,
    first_letter: (extras.lettersRead ?? 0) >= 1 ? 100 : 0,
    letters_10: Math.min(100, ((extras.lettersRead ?? 0) / 10) * 100),
    first_diary: data.diary.length ? 100 : 0,
    diary_7: Math.min(100, (diaryDays / 7) * 100),
    first_event: data.calendar.length ? 100 : 0,
    first_favorite: data.favorites.length ? 100 : 0,
    first_goal: data.goals.length ? 100 : 0,
    first_goal_done: data.goals.some((item) => item.status === "completed") ? 100 : 0,
    first_habit: data.habits.some((item) => item.completions?.length) ? 100 : 0,
    habit_3: Math.min(100, (streak / 3) * 100),
    habit_7: Math.min(100, (streak / 7) * 100),
    five_modules: Math.min(100, (modules / 5) * 100),
    first_mood: data.moods.length || (extras.moodsRegistered ?? 0) ? 100 : 0,
    rest_day: extras.restDay ? 100 : 0,
    first_backup: extras.protectedBackup ? 100 : 0,
    first_sync: extras.protectedSync ? 100 : 0,
  };
}

export function processAchievements(extras = {}) {
  const current = getAchievements();
  const facts = evaluateAchievementFacts(readLocalData(), extras);
  let changed = false;
  const newlyUnlocked = [];
  const items = current.items.map((item) => {
    const progress = Math.max(item.progress, Math.round(facts[item.id] ?? 0));
    const unlockNow = !item.unlocked && progress >= 100;
    if (progress !== item.progress || unlockNow) changed = true;
    if (unlockNow) newlyUnlocked.push(item.id);
    return {
      ...item,
      progress,
      unlocked: item.unlocked || unlockNow,
      unlockedAt: item.unlockedAt ?? (unlockNow ? new Date().toISOString() : null),
    };
  });
  const next = { ...current, items };
  if (changed) persist(next, newlyUnlocked.length > 0);
  return { data: next, newlyUnlocked };
}

export function setAchievementPreferences(preferences) {
  const current = getAchievements();
  const next = {
    ...current,
    notificationsEnabled: preferences.notificationsEnabled !== false,
    celebrationsEnabled: preferences.celebrationsEnabled !== false,
  };
  persist(next, true);
  return next;
}

// Compatibilidade com a API anterior.
export function isUnlocked(id) {
  return getAchievements().items.some((item) => item.id === id && item.unlocked);
}
export function unlockAchievement(id) {
  const current = getAchievements();
  if (current.items.find((item) => item.id === id)?.unlocked) return false;
  current.items = current.items.map((item) => item.id === id
    ? { ...item, unlocked: true, progress: 100, unlockedAt: new Date().toISOString() }
    : item);
  persist(current, true);
  return true;
}
export function getUnlockedAchievements() {
  return getAchievements().items.filter((item) => item.unlocked).map((item) => item.id);
}
export function getUnlockedCount() { return getUnlockedAchievements().length; }
export function getAchievementById(id) {
  return getAchievements().items.find((item) => item.id === id);
}
export function getLockedAchievements() {
  return getAchievements().items.filter((item) => !item.unlocked);
}
export function getUnlockedAchievementObjects() {
  return getAchievements().items.filter((item) => item.unlocked);
}
export function checkAchievements(extras) {
  return processAchievements(extras).data.items.filter((item) => item.unlocked);
}
export function resetAchievements() {
  storage.remove(STORAGE_KEYS.ACHIEVEMENTS);
  storage.remove(LEGACY_KEY);
}

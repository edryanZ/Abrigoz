import { COMPANION_CATALOG } from "./companionCatalog.js";
import {
  loadCompanionPreferences,
  saveCompanionPreferences,
} from "./CompanionPreferencesService.js";
import { getTodayMood } from "../services/mood.js";

const dayKey = (date = new Date()) => [
  date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

function period(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function moodId(mood) {
  if (!mood || mood.mood === "prefer_not") return "neutral";
  if (mood.mood === "very_happy") return "happy";
  return mood.mood;
}

function stableNumber(value) {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function scoreSuggestion(item, context, preferences) {
  let score = 20;
  if (item.moods.includes(context.mood)) score += 24;
  if (item.periods.includes("all") || item.periods.includes(context.period)) score += 12;
  if (context.weekend && item.periods.includes("weekend")) score += 8;
  if (context.minutes && item.minutes <= context.minutes) score += 16;
  if (context.category && item.categories.includes(context.category)) score += 28;
  if (context.energy && item.energy === context.energy) score += 7;
  score += item.categories.reduce((sum, category) =>
    sum + Number(preferences.categoryWeights[category] ?? 0), 0);
  if (preferences.preferredCategories.some((category) =>
    item.categories.includes(category))) score += 6;
  const seen = preferences.interactions.filter((entry) => entry.id === item.id);
  score -= seen.length * 7;
  if (seen.some((entry) => entry.action === "helped")) score += 8;
  if (seen.some((entry) => entry.action === "not_helped")) score -= 14;
  return score;
}

function eligible(item, context, preferences, excluded) {
  if (preferences.blocked.includes(item.id) || excluded.has(item.id)) return false;
  if (preferences.hiddenCategories.some((category) => item.categories.includes(category))) return false;
  if (!preferences.showMusic && item.categories.includes("music")) return false;
  if (!preferences.showScreen && item.categories.includes("screen")) return false;
  if (!preferences.showBooks && item.categories.includes("books")) return false;
  if (context.minutes && item.minutes > context.minutes) return false;
  if (context.category && !item.categories.includes(context.category)) return false;
  return true;
}

export function selectCompanionSuggestions(options = {}, now = new Date()) {
  const preferences = loadCompanionPreferences();
  if (!preferences.enabled) return { enabled: false, suggestions: [], preferences };
  const context = {
    mood: options.mood ?? moodId(getTodayMood()),
    period: options.period ?? period(now),
    weekend: [0, 6].includes(now.getDay()),
    minutes: Number(options.minutes) || null,
    category: options.category ?? null,
    energy: options.energy ?? null,
  };
  const today = dayKey(now);
  const recentIds = new Set(preferences.interactions
    .filter((entry) => entry.day === today || entry.action === "later")
    .map((entry) => entry.id));
  const lastSet = new Set(preferences.sets.at(-1) ?? []);
  const excluded = new Set([...recentIds, ...lastSet]);
  let candidates = COMPANION_CATALOG.filter((item) =>
    eligible(item, context, preferences, excluded));
  if (candidates.length < preferences.displayCount) {
    candidates = COMPANION_CATALOG.filter((item) =>
      eligible(item, context, preferences, recentIds));
  }
  const ranked = candidates.map((item) => ({
    item,
    score: scoreSuggestion(item, context, preferences),
    tie: stableNumber(`${today}:${item.id}:${preferences.sets.length}`),
  })).sort((a, b) => b.score - a.score || a.tie - b.tie);
  const selected = [];
  const categoryCounts = {};
  for (const candidate of ranked) {
    const primary = candidate.item.categories[0];
    if ((categoryCounts[primary] ?? 0) >= 2) continue;
    selected.push({ ...candidate.item, score: candidate.score });
    categoryCounts[primary] = (categoryCounts[primary] ?? 0) + 1;
    if (selected.length >= preferences.displayCount) break;
  }
  const setIds = selected.map((item) => item.id);
  const next = saveCompanionPreferences({
    sets: [...preferences.sets, setIds].slice(-10),
    cursor: Math.min(9, preferences.sets.length),
    interactions: [...preferences.interactions,
      ...setIds.map((id) => ({ id, action: "viewed", day: today, at: now.toISOString() }))]
      .slice(-120),
  }, false);
  return { enabled: true, mood: context.mood, suggestions: selected,
    preferences: next, filters: context };
}

export function getPreviousSuggestionSet() {
  const preferences = loadCompanionPreferences();
  if (preferences.sets.length < 2) return [];
  const ids = preferences.sets.at(-2);
  return ids.map((id) => COMPANION_CATALOG.find((item) => item.id === id)).filter(Boolean);
}

export function respondToSuggestion(id, action, categories = []) {
  const preferences = loadCompanionPreferences();
  const day = dayKey();
  const interaction = { id, action, day, at: new Date().toISOString() };
  const categoryWeights = { ...preferences.categoryWeights };
  if (action === "more") categories.forEach((category) => {
    categoryWeights[category] = Math.min(20, Number(categoryWeights[category] ?? 0) + 4);
  });
  if (action === "less") categories.forEach((category) => {
    categoryWeights[category] = Math.max(-20, Number(categoryWeights[category] ?? 0) - 5);
  });
  return saveCompanionPreferences({
    categoryWeights,
    blocked: action === "never"
      ? [...new Set([...preferences.blocked, id])] : preferences.blocked,
    interactions: [...preferences.interactions, interaction].slice(-120),
  });
}

export function setCompanionEnabled(enabled) {
  return saveCompanionPreferences({ enabled: Boolean(enabled) });
}

// Compatibilidade com consumidores anteriores.
export function getCompanionSuggestion() {
  const result = selectCompanionSuggestions();
  return { ...result, suggestion: result.suggestions[0] ?? null };
}

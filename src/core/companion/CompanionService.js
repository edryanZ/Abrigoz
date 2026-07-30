import STORAGE_KEYS from "../constants/storageKeys";
import { readLocalData } from "../intelligence/LocalDataSource";
import { getTodayMood } from "../services/mood";
import { storage } from "../storage/storage";
import { emitSync } from "../sync";

export const COMPANION_RULES_VERSION = 1;
const DEFAULTS = {
  version: 1, enabled: true, lightOnly: false, hiddenTypes: [],
  blockedSuggestions: [], recent: [],
};

const SUGGESTIONS = {
  neutral: [
    ["pause", "Faça uma pausa curta, se quiser.", "Uma sugestão neutra para este momento.", "/lar"],
    ["diary", "Guarde algumas palavras no Diário.", "Escrever é uma opção, não uma obrigação.", "/diario"],
    ["water", "Que tal beber um pouco de água?", "Um cuidado simples para qualquer momento.", "/lar"],
  ],
  excited: [
    ["creative", "Aproveite a energia em uma atividade criativa.", "Você informou estar animado.", "/lar"],
    ["goal", "Escolha um pequeno avanço em uma meta.", "Você informou estar animado.", "/metas"],
  ],
  tired: [
    ["rest", "Talvez seja um bom momento para descansar.", "Você informou estar cansado.", "/lar"],
    ["essential", "Se precisar fazer algo, escolha somente o essencial.", "Uma opção leve para um momento cansado.", "/metas"],
  ],
  anxious: [
    ["breath", "Experimente uma respiração lenta por alguns instantes.", "Uma sugestão simples porque você informou ansiedade.", "/lar"],
    ["small_task", "Organize apenas uma pequena tarefa.", "Uma opção de baixa intensidade.", "/metas"],
  ],
  sad: [
    ["trust", "Se fizer sentido, fale com alguém de confiança.", "Você informou tristeza; esta é apenas uma opção.", "/lar"],
    ["comfort", "Reencontre algo confortável nos seus Favoritos.", "Um favorito pode oferecer companhia.", "/favoritos"],
  ],
  irritated: [
    ["walk", "Considere uma pausa ou caminhada breve.", "Você informou irritação; evite decisões por impulso.", "/lar"],
    ["private_write", "Escreva em privado antes de decidir algo.", "Uma pausa para organizar pensamentos.", "/diario"],
  ],
  unmotivated: [
    ["two_minutes", "Escolha uma ação de aproximadamente dois minutos.", "Uma pequena ação já pode ser suficiente.", "/lar"],
    ["enough", "Isso já pode ter sido suficiente por hoje.", "Descanso também importa.", "/lar"],
  ],
};

function load() {
  const raw = storage.get(STORAGE_KEYS.COMPANION);
  return raw?.version === 1 ? {
    ...DEFAULTS, ...raw,
    hiddenTypes: Array.isArray(raw.hiddenTypes) ? raw.hiddenTypes.slice(0, 20) : [],
    blockedSuggestions: Array.isArray(raw.blockedSuggestions) ? raw.blockedSuggestions.slice(0, 100) : [],
    recent: Array.isArray(raw.recent) ? raw.recent.slice(-30) : [],
  } : { ...DEFAULTS };
}

function persist(value) {
  storage.set(STORAGE_KEYS.COMPANION, value);
  emitSync({ module: "companion", action: "update", recordId: "preferences" });
  return value;
}

function moodGroup(mood) {
  if (!mood) return "neutral";
  if (["very_happy", "happy", "excited"].includes(mood.mood)) return "excited";
  return SUGGESTIONS[mood.mood] ? mood.mood : "neutral";
}

function favoriteSuggestion(data, mood, preferences) {
  const candidates = data.favorites.filter((item) => !item.doNotRecommend
    && !preferences.blockedSuggestions.includes(`favorite:${item.id}`)
    && (!mood || !item.avoidWhenTired || mood.mood !== "tired")
    && (!preferences.hiddenTypes.includes(item.type))
    && ((item.moodTags ?? []).includes(mood?.mood) || item.primary || item.pinned));
  const item = candidates[0];
  return item ? {
    id: `favorite:${item.id}`, type: "favorite", title: item.title,
    reason: item.moodTags?.includes(mood?.mood)
      ? "Você marcou este favorito para momentos como este."
      : "Este item está entre os seus Favoritos.",
    route: "/favoritos",
  } : null;
}

export function getCompanionSuggestion() {
  const preferences = load();
  if (!preferences.enabled) return { enabled: false };
  const mood = getTodayMood();
  const favorite = favoriteSuggestion(readLocalData(), mood, preferences);
  if (favorite) return { enabled: true, mood: mood?.mood ?? null, suggestion: favorite };
  const group = moodGroup(mood);
  const available = SUGGESTIONS[group].filter(([id]) =>
    !preferences.blockedSuggestions.includes(id)
    && !preferences.recent.slice(-3).includes(id));
  const [id, title, reason, route] = available[0] ?? SUGGESTIONS.neutral[0];
  return { enabled: true, mood: mood?.mood ?? null,
    suggestion: { id, type: group, title, reason, route } };
}

export function respondToSuggestion(id, response) {
  const preferences = load();
  const next = {
    ...preferences,
    recent: [...preferences.recent, id].slice(-30),
    blockedSuggestions: response === "never"
      ? [...new Set([...preferences.blockedSuggestions, id])].slice(-100)
      : preferences.blockedSuggestions,
  };
  persist(next);
  return getCompanionSuggestion();
}

export function setCompanionEnabled(enabled) {
  return persist({ ...load(), enabled: Boolean(enabled) });
}

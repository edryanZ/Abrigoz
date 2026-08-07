import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

const CURRENT_FAVORITES_VERSION = 3;

function compatibleDocument(raw, item) {
  if (Array.isArray(raw)) return [item, ...raw];
  if (raw && typeof raw === "object" && Array.isArray(raw.items)) {
    return { ...raw, items: [item, ...raw.items] };
  }
  return { version: CURRENT_FAVORITES_VERSION, items: [item] };
}

export function saveWellbeingMoment({ title, description = "", source = "moment" }) {
  const safeTitle = String(title ?? "").trim().slice(0, 180);
  const safeDescription = String(description ?? "").trim().slice(0, 1800);
  if (!safeTitle) throw new Error("Não há conteúdo para guardar agora.");
  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(), title: safeTitle, type: "text", description: safeDescription,
    link: "", imageUrl: "", tags: ["momento"], pinned: false, primary: false,
    moodTags: [], atmosphere: "", intensity: "light", approximateDuration: "",
    qualities: [], avoidWhenTired: false, recommendationNote: "", doNotRecommend: false,
    source: String(source).slice(0, 40), createdAt: now, updatedAt: now,
  };
  const raw = storage.get(STORAGE_KEYS.FAVORITE_ITEMS);
  if (!storage.set(STORAGE_KEYS.FAVORITE_ITEMS, compatibleDocument(raw, item))) {
    throw new Error("Não foi possível guardar este momento agora.");
  }
  emitSync({ module: "favorites", action: "create", recordId: item.id });
  return item;
}

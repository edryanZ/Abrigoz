import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

export const LEGACY_ASSISTANT_HISTORY_KEY = "abrigo:ai-history:v1";

export function hasLegacyAssistantHistory() {
  return storage.has(LEGACY_ASSISTANT_HISTORY_KEY);
}

export function clearLegacyAssistantHistory() {
  const removed = storage.remove(LEGACY_ASSISTANT_HISTORY_KEY);
  if (removed) {
    emitSync({ module: "legacy-assistant-history", action: "delete" });
  }
  return removed;
}

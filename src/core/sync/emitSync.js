import { emit } from "./EventBus";
export const SYNC_EVENT = "abrigo:sync";
export function emitSync({ module = "unknown", action = "updated", recordId = null, timestamp = new Date().toISOString() } = {}) {
  emit(SYNC_EVENT, { module, action, recordId, timestamp });
}

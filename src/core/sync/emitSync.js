import { emit } from "./EventBus.js";
import { isPersonalWorkspace } from "../privacy/WorkspaceModeService.js";
export const SYNC_EVENT = "abrigo:sync";
export function emitSync({ module = "unknown", action = "updated", recordId = null, timestamp = new Date().toISOString() } = {}) {
  if (!isPersonalWorkspace()) return false;
  emit(SYNC_EVENT, { module, action, recordId, timestamp });
  return true;
}

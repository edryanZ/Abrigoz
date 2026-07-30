const KEY = "abrigo:sync-queue:v1";
const STATE_KEY = "abrigo:sync-state:v1";

export function loadQueue() {
  try { const value = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}
export function saveQueue(queue) { localStorage.setItem(KEY, JSON.stringify(queue)); }
export function loadSyncState() {
  try {
    const value = JSON.parse(localStorage.getItem(STATE_KEY) ?? "null");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}
export function saveSyncState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
export { KEY as SYNC_QUEUE_STORAGE_KEY };
export { STATE_KEY as SYNC_STATE_STORAGE_KEY };

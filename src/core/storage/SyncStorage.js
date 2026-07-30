const KEY = "abrigo:sync-queue:v1";

export function loadQueue() {
  try { const value = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}
export function saveQueue(queue) { localStorage.setItem(KEY, JSON.stringify(queue)); }
export { KEY as SYNC_QUEUE_STORAGE_KEY };

const KEY = "abrigo:backup:v1";
export function saveBackup(backup) { localStorage.setItem(KEY, JSON.stringify(backup)); }
export function loadBackup() { try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; } }
export { KEY as BACKUP_STORAGE_KEY };

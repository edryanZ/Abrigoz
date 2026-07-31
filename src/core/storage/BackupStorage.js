import { storage } from "./storage.js";

const KEY = "abrigo:backup:v1";
export function saveBackup(backup) { return storage.set(KEY, backup); }
export function loadBackup() { return storage.get(KEY); }
export { KEY as BACKUP_STORAGE_KEY };

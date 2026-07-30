import { loadBackup, saveBackup } from "../storage/BackupStorage";
import { storage } from "../storage/storage";
import {
  SYNC_QUEUE_STORAGE_KEY,
  SYNC_STATE_STORAGE_KEY,
} from "../storage/SyncStorage";

const EXCLUDED_KEYS = new Set([
  "abrigo:backup:v1",
  "abrigo:device:v1",
  SYNC_QUEUE_STORAGE_KEY,
  SYNC_STATE_STORAGE_KEY,
]);

function collectModules() {
  return storage.keys()
    .filter((key) => key.startsWith("abrigo:") && !EXCLUDED_KEYS.has(key))
    .reduce((modules, key) => {
      modules[key] = storage.get(key);
      return modules;
    }, {});
}

export function createBackup(modules = collectModules(), metadata = {}) {
  const backup = { version: 1, createdAt: new Date().toISOString(), metadata, modules };
  if (!validateBackup(backup)) throw new Error("Backup inválido.");
  saveBackup(backup);
  return backup;
}
export function validateBackup(value) {
  return Boolean(
    value &&
    value.version === 1 &&
    typeof value.createdAt === "string" &&
    value.metadata &&
    typeof value.metadata === "object" &&
    value.modules &&
    typeof value.modules === "object" &&
    !Array.isArray(value.modules)
  );
}
export function loadLocalBackup() { const backup = loadBackup(); return validateBackup(backup) ? backup : null; }
export function restoreBackup(backup) {
  if (!validateBackup(backup)) throw new Error("Backup remoto inválido.");

  Object.entries(backup.modules).forEach(([key, value]) => {
    if (key.startsWith("abrigo:") && !EXCLUDED_KEYS.has(key)) {
      storage.set(key, value);
    }
  });

  saveBackup(backup);
  return backup;
}

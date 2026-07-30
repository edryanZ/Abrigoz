import { loadBackup, saveBackup } from "../storage/BackupStorage";
import { storage } from "../storage/storage";
import {
  SYNC_QUEUE_STORAGE_KEY,
  SYNC_STATE_STORAGE_KEY,
} from "../storage/SyncStorage";

const EXCLUDED_KEYS = new Set([
  "abrigo:backup:v1",
  "abrigo:device:v1",
  "abrigo:sync",
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

function buildBackup(modules, metadata) {
  const backup = { version: 1, createdAt: new Date().toISOString(), metadata, modules };
  if (!validateBackup(backup)) throw new Error("Backup inválido.");
  return backup;
}

function hasSensitiveStructure(value) {
  if (!value || typeof value !== "object") return false;

  return Object.entries(value).some(([key, nestedValue]) => {
    const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, "");
    if ([
      "keyhash",
      "synckey",
      "syncstate",
      "supabaseurl",
      "supabaseanonkey",
      "servicerolekey",
      "credentials",
    ].includes(normalizedKey)) {
      return true;
    }

    return hasSensitiveStructure(nestedValue);
  });
}

export function createBackup(modules = collectModules(), metadata = {}) {
  const backup = buildBackup(modules, metadata);
  saveBackup(backup);
  return backup;
}

export function createLocalExportBackup() {
  const backup = buildBackup(
    collectModules(),
    { exportedAt: new Date().toISOString(), source: "local" }
  );

  if (hasSensitiveStructure(backup)) {
    throw new Error("O backup contém dados internos e não pode ser exportado.");
  }

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

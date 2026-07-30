import { loadBackup, saveBackup } from "../storage/BackupStorage";

export function createBackup(modules = {}, metadata = {}) {
  const backup = { version: 1, createdAt: new Date().toISOString(), metadata, modules };
  if (!validateBackup(backup)) throw new Error("Backup inválido.");
  saveBackup(backup);
  return backup;
}
export function validateBackup(value) {
  return Boolean(value && value.version === 1 && typeof value.createdAt === "string" && value.metadata && value.modules);
}
export function loadLocalBackup() { const backup = loadBackup(); return validateBackup(backup) ? backup : null; }

import {
  decryptJson,
  encryptJson,
  ENCRYPTION_PURPOSES,
  validateEncryptedEnvelope,
} from "../crypto/CryptoService.js";
import { loadBackup } from "../storage/BackupStorage.js";
import { storage } from "../storage/storage.js";
import {
  SYNC_QUEUE_STORAGE_KEY,
  SYNC_STATE_STORAGE_KEY,
} from "../storage/SyncStorage.js";

const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 6 * 1024 * 1024;
const MAX_MODULES = 100;
const MAX_DEPTH = 32;
const STORAGE_KEY_PATTERN = /^abrigo:[A-Za-z0-9:_-]{1,120}$/;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const SENSITIVE_FIELDS = new Set([
  "keyhash",
  "synckey",
  "cryptokey",
  "supabaseurl",
  "supabaseanonkey",
  "servicerolekey",
  "credentials",
  "deviceid",
  "syncstate",
  "syncqueue",
]);
const EXCLUDED_KEYS = new Set([
  "abrigo:backup:v1",
  "abrigo:device:v1",
  "abrigo:sync",
  SYNC_QUEUE_STORAGE_KEY,
  SYNC_STATE_STORAGE_KEY,
  "abrigo:analytics-consent:v1",
  "abrigo:search-preferences:v1",
]);

function prepareModuleForBackup(key, value) {
  if (key === "abrigo:share-capsules:v1" && Array.isArray(value?.items)) {
    return {
      version: 1,
      items: value.items.map(({ id, createdAt, expiresAt, revokedAt }) => ({
        id, createdAt, expiresAt, revokedAt,
      })),
    };
  }
  return value;
}

function isSensitiveStorageKey(key) {
  if (EXCLUDED_KEYS.has(key)) return true;
  const segments = key.toLowerCase().split(/[-_:\s]+/);
  const normalizedKey = key.toLowerCase().replace(/[-_:\s]/g, "");
  return segments.includes("key") || [
    "chave",
    "hash",
    "recovery",
    "syncstate",
    "syncqueue",
    "device",
    "supabase",
    "credential",
    "secret",
  ].some((term) => normalizedKey.includes(term));
}

function assertSafeStructure(value, depth = 0, seen = new Set()) {
  if (depth > MAX_DEPTH) throw new Error("Backup excede o limite permitido.");
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) throw new Error("Backup inválido.");
  seen.add(value);
  for (const key of Object.keys(value)) {
    const normalizedKey = key.toLowerCase().replace(/[-_:\s]/g, "");
    if (FORBIDDEN_KEYS.has(key) || SENSITIVE_FIELDS.has(normalizedKey)) {
      throw new Error("Backup inválido.");
    }
    assertSafeStructure(value[key], depth + 1, seen);
  }
  seen.delete(value);
}

function serializedSize(value) {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function collectModules({ includeLegacyAssistantHistory = true } = {}) {
  return storage.keys()
    .filter((key) =>
      STORAGE_KEY_PATTERN.test(key) && !isSensitiveStorageKey(key)
      && (includeLegacyAssistantHistory || key !== "abrigo:ai-history:v1"))
    .reduce((modules, key) => {
      modules[key] = prepareModuleForBackup(key, storage.get(key));
      return modules;
    }, {});
}

function buildBackup(modules, metadata) {
  const backup = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    metadata,
    modules,
  };
  if (!validateBackup(backup)) throw new Error("Backup inválido.");
  return backup;
}

export function validateBackup(value) {
  if (
    !value
    || typeof value !== "object"
    || Array.isArray(value)
    || Object.keys(value).some((key) =>
      !["version", "createdAt", "metadata", "modules"].includes(key))
    || value.version !== BACKUP_VERSION
    || typeof value.createdAt !== "string"
    || Number.isNaN(Date.parse(value.createdAt))
    || !value.metadata
    || typeof value.metadata !== "object"
    || Array.isArray(value.metadata)
    || !value.modules
    || typeof value.modules !== "object"
    || Array.isArray(value.modules)
    || Object.keys(value.modules).length > MAX_MODULES
    || serializedSize(value) > MAX_BACKUP_BYTES
  ) {
    return false;
  }

  try {
    assertSafeStructure(value);
    return Object.keys(value.modules).every((key) =>
      STORAGE_KEY_PATTERN.test(key) && !isSensitiveStorageKey(key));
  } catch {
    return false;
  }
}

export function createBackup(modules = collectModules(), metadata = {}) {
  return buildBackup(modules, metadata);
}

export function createLocalExportBackup() {
  return buildBackup(
    collectModules({ includeLegacyAssistantHistory: false }),
    { exportedAt: new Date().toISOString(), source: "local" }
  );
}

export async function createEncryptedLocalBackup(cryptoKey) {
  const backup = createLocalExportBackup();
  return encryptJson(
    backup,
    cryptoKey,
    ENCRYPTION_PURPOSES.BACKUP_EXPORT
  );
}

function snapshotLocalModules() {
  return storage.keys()
    .filter((key) =>
      STORAGE_KEY_PATTERN.test(key) && !isSensitiveStorageKey(key))
    .reduce((snapshot, key) => {
      snapshot[key] = storage.get(key);
      return snapshot;
    }, {});
}

function replaceLocalModules(modules) {
  storage.keys()
    .filter((key) =>
      STORAGE_KEY_PATTERN.test(key) && !isSensitiveStorageKey(key))
    .forEach((key) => storage.remove(key));

  for (const [key, value] of Object.entries(modules)) {
    if (!storage.set(key, value)) {
      throw new Error("Não foi possível gravar o backup.");
    }
    if (JSON.stringify(storage.get(key)) !== JSON.stringify(value)) {
      throw new Error("Não foi possível confirmar o backup.");
    }
  }
}

export function restoreBackup(backup) {
  if (!validateBackup(backup)) throw new Error("Backup inválido.");
  const snapshot = snapshotLocalModules();
  try {
    replaceLocalModules(backup.modules);
    return backup;
  } catch {
    try {
      replaceLocalModules(snapshot);
    } catch {
      throw new Error("Não foi possível restaurar os dados com segurança.");
    }
    throw new Error("A restauração foi cancelada sem alterar seus dados.");
  }
}

export async function decryptBackupEnvelope(envelope, cryptoKey, purpose) {
  const backup = await decryptJson(envelope, cryptoKey, purpose);
  if (!validateBackup(backup)) throw new Error("Backup protegido inválido.");
  return backup;
}

export async function restoreEncryptedBackup(envelope, cryptoKey) {
  const backup = await decryptBackupEnvelope(
    envelope,
    cryptoKey,
    ENCRYPTION_PURPOSES.BACKUP_EXPORT
  );
  return restoreBackup(backup);
}

export function inspectBackupDocument(document) {
  if (
    validateEncryptedEnvelope(
      document,
      ENCRYPTION_PURPOSES.BACKUP_EXPORT
    )
  ) {
    return { format: "encrypted", valid: true };
  }
  if (validateBackup(document)) {
    return { format: "legacy", valid: true, categories: summarizeBackup(document) };
  }
  return { format: "invalid", valid: false };
}

const BACKUP_CATEGORY_LABELS = Object.freeze({
  "abrigo:diary": "Reflexões",
  "abrigo:letters": "Cartas",
  "abrigo:events": "Meu Dia",
  "abrigo:personal-favorites:v2": "Coisas que fazem bem",
  "abrigo:future-capsules:v1": "Cápsulas",
  "abrigo:memory-preferences:v1": "Preferências de memórias",
  "abrigo:personalization:v1": "Preferências do Meu Abrigo",
  "abrigo:accessibility:v1": "Preferências de acessibilidade",
});

export function summarizeBackup(backup) {
  if (!validateBackup(backup)) return [];
  const labels = Object.keys(backup.modules).map((key) => BACKUP_CATEGORY_LABELS[key] ?? (
    key.includes("goal") ? "Intenções"
      : key.includes("habit") ? "Pequenos Cuidados"
        : key.replace(/^abrigo:/, "Dados do Abrigo")
  ));
  return [...new Set(labels)].slice(0, 30);
}

export function loadLocalBackup() {
  const backup = loadBackup();
  return validateBackup(backup) ? backup : null;
}

export {
  MAX_BACKUP_BYTES,
  isSensitiveStorageKey,
};

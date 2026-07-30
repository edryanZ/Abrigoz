import {
  deleteCryptoKeys,
  loadCryptoKeys,
  saveCryptoKeys,
} from "../crypto/CryptoKeyStorage";
import {
  decryptJson,
  deriveEncryptionKey,
  encryptJson,
  ENCRYPTION_PURPOSES,
  isCryptoSupported,
  validateEncryptedEnvelope,
} from "../crypto/CryptoService";
import AbrigoRepository from "../repository/AbrigoRepository";
import {
  clearSyncState,
  loadSyncState,
  saveSyncState,
} from "../storage/SyncStorage";
import {
  createBackup,
  createEncryptedLocalBackup,
  inspectBackupDocument,
  restoreBackup,
  restoreEncryptedBackup,
  validateBackup,
} from "./BackupManager";
import { getDevice, markDeviceSynced } from "./DeviceService";
import { enqueue, getQueue, processQueue as processNext } from "./SyncQueue";
import { migrateRemoteLegacyBackup } from "./RemoteBackupMigration";
import {
  generateAbrigoKey,
  hashAbrigoKey,
  isValidAbrigoKey,
  isValidKeyHash,
} from "./AbrigoKey";

const VALID_STATES = new Set([
  "idle",
  "pending",
  "encrypting",
  "syncing",
  "success",
  "key_required",
  "legacy_pending",
  "migrating",
  "offline",
  "unavailable",
  "secure_unavailable",
  "error",
]);

let initialized = false;
let processingPromise = null;
let rotating = false;
let activeMaterial = null;
const initialSyncState = loadSyncState();
let status = {
  state: "idle",
  protection: initialSyncState.keyHash ? "key_required" : "local",
  lastSyncAt: initialSyncState.lastSyncAt ?? null,
  pending: getQueue().length,
  error: null,
};
const listeners = new Set();

function getKeyHash() {
  const keyHash = loadSyncState().keyHash;
  return isValidKeyHash(keyHash) ? keyHash : null;
}

function getPublicStatus() {
  const connected = Boolean(getKeyHash());
  return {
    ...status,
    connection: connected ? "connected" : "disconnected",
    connected,
    pending: getQueue().length,
  };
}

function setStatus(nextState, details = {}) {
  status = {
    ...status,
    ...details,
    state: VALID_STATES.has(nextState) ? nextState : "error",
    pending: getQueue().length,
  };
  listeners.forEach((listener) => {
    try { listener(getPublicStatus()); } catch { /* Observer isolated. */ }
  });
}

function persistConnection({
  keyHash,
  abrigoId,
  lastSyncAt = status.lastSyncAt,
}) {
  const current = loadSyncState();
  return saveSyncState({
    keyHash,
    abrigoId: abrigoId ?? current.abrigoId ?? null,
    lastSyncAt,
  });
}

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

async function deriveKeyMaterial(originalKey) {
  if (!isValidAbrigoKey(originalKey)) {
    throw new Error("Chave do Abrigo inválida.");
  }
  const keyHash = await hashAbrigoKey(originalKey);
  const [remoteSync, backupExport] = await Promise.all([
    deriveEncryptionKey(originalKey, ENCRYPTION_PURPOSES.REMOTE_SYNC),
    deriveEncryptionKey(originalKey, ENCRYPTION_PURPOSES.BACKUP_EXPORT),
  ]);
  return { keyHash, remoteSync, backupExport };
}

async function activateKeyMaterial(material) {
  activeMaterial = material;
  try {
    await saveCryptoKeys(material.keyHash, material);
    return "active";
  } catch {
    return "session_only";
  }
}

async function getActiveMaterial(keyHash = getKeyHash()) {
  if (!keyHash) return null;
  if (activeMaterial?.keyHash === keyHash) return activeMaterial;
  const stored = await loadCryptoKeys(keyHash);
  if (!stored) return null;
  activeMaterial = { keyHash, ...stored };
  return activeMaterial;
}

function connectionDetails(abrigo, keyHash, lastSyncAt) {
  return {
    keyHash,
    abrigoId: abrigo.id,
    lastSyncAt: lastSyncAt ?? abrigo.last_sync_at ?? null,
  };
}

async function encryptRemoteBackup(backup, remoteSyncKey) {
  setStatus("encrypting", { error: null });
  return encryptJson(
    backup,
    remoteSyncKey,
    ENCRYPTION_PURPOSES.REMOTE_SYNC
  );
}

async function completeRemoteSync(keyHash, backup, material) {
  const envelope = await encryptRemoteBackup(backup, material.remoteSync);
  const device = getDevice();
  setStatus("syncing");
  await AbrigoRepository.saveBackup(keyHash, envelope);
  await AbrigoRepository.registerDevice(keyHash, device);
  const syncedAt = new Date().toISOString();
  await AbrigoRepository.updateLastSync(keyHash, device.id, syncedAt);
  markDeviceSynced();
  persistConnection({ keyHash, lastSyncAt: syncedAt });
  return syncedAt;
}

async function validateRemotePayload(remote, material) {
  if (!remote?.payload) return { format: "empty", backup: null };
  if (
    validateEncryptedEnvelope(
      remote.payload,
      ENCRYPTION_PURPOSES.REMOTE_SYNC
    )
  ) {
    const backup = await decryptJson(
      remote.payload,
      material.remoteSync,
      ENCRYPTION_PURPOSES.REMOTE_SYNC
    );
    if (!validateBackup(backup)) throw new Error("invalid-backup");
    return { format: "encrypted", backup };
  }
  if (validateBackup(remote.payload)) {
    return { format: "legacy", backup: remote.payload };
  }
  throw new Error("invalid-backup");
}

export const SyncService = {
  async initialize() {
    if (initialized) return this.getStatus();
    initialized = true;
    const storedState = loadSyncState();
    status = { ...status, lastSyncAt: storedState.lastSyncAt ?? null };

    if (!isCryptoSupported()) {
      setStatus(storedState.keyHash ? "secure_unavailable" : "idle", {
        protection: storedState.keyHash ? "unavailable" : "local",
      });
      return this.getStatus();
    }
    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
      return this.getStatus();
    }
    if (isOffline()) {
      setStatus("offline");
      return this.getStatus();
    }

    if (storedState.keyHash) {
      const material = await getActiveMaterial(storedState.keyHash);
      if (!material) {
        setStatus("key_required", { protection: "key_required" });
        return this.getStatus();
      }
      setStatus(getQueue().length ? "pending" : "idle", {
        protection: "active",
      });
    } else {
      setStatus("idle", { protection: "local" });
    }

    if (getQueue().length > 0) void this.processQueue();
    return this.getStatus();
  },

  async processQueue() {
    if (processingPromise) return processingPromise;
    processingPromise = (async () => {
      const keyHash = getKeyHash();
      if (!AbrigoRepository.isAvailable()) {
        setStatus("unavailable");
        return this.getStatus();
      }
      if (!isCryptoSupported()) {
        setStatus("secure_unavailable", { protection: "unavailable" });
        return this.getStatus();
      }
      if (isOffline()) {
        setStatus("offline");
        return this.getStatus();
      }
      if (!keyHash) {
        setStatus(getQueue().length ? "pending" : "idle", {
          protection: "local",
        });
        return this.getStatus();
      }
      const material = await getActiveMaterial(keyHash);
      if (!material) {
        setStatus("key_required", { protection: "key_required" });
        return this.getStatus();
      }

      setStatus("encrypting", { error: null, protection: "active" });
      try {
        while (getQueue().length > 0) {
          await processNext(async (operation) => {
            const backup = createBackup(undefined, {
              operation: {
                module: operation.module,
                action: operation.action,
                recordId: operation.recordId,
                timestamp: operation.timestamp,
              },
            });
            const syncedAt = await completeRemoteSync(
              keyHash,
              backup,
              material
            );
            setStatus("syncing", { lastSyncAt: syncedAt });
          });
        }
        setStatus("success", { error: null, protection: "active" });
      } catch {
        setStatus(isOffline() ? "offline" : "error", {
          error: "Não foi possível concluir a sincronização protegida. A alteração foi mantida.",
        });
      }
      return this.getStatus();
    })();

    try {
      return await processingPromise;
    } finally {
      processingPromise = null;
    }
  },

  async syncNow() {
    enqueue({
      module: "all",
      action: "manual",
      recordId: null,
      timestamp: new Date().toISOString(),
    });
    setStatus("pending", { error: null });
    return this.processQueue();
  },

  async createRemoteAbrigo(originalKey) {
    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
      throw new Error("Sincronização remota indisponível.");
    }
    if (!isCryptoSupported()) {
      setStatus("secure_unavailable", { protection: "unavailable" });
      throw new Error("Sincronização segura indisponível.");
    }

    setStatus("encrypting", { error: null, protection: "preparing" });
    try {
      const material = await deriveKeyMaterial(originalKey);
      const abrigo = await AbrigoRepository.createAbrigo(material.keyHash);
      if (!abrigo?.id) throw new Error("invalid-remote-abrigo");
      const backup = createBackup(undefined, { source: "initial-sync" });
      const envelope = await encryptRemoteBackup(backup, material.remoteSync);
      await AbrigoRepository.saveBackup(material.keyHash, envelope);
      await AbrigoRepository.registerDevice(material.keyHash, getDevice());
      const protection = await activateKeyMaterial(material);
      persistConnection(connectionDetails(abrigo, material.keyHash));
      setStatus("success", { protection, error: null });
      return abrigo;
    } catch {
      setStatus("error", {
        protection: "local",
        error: "Não foi possível criar o Abrigo protegido.",
      });
      throw new Error("Não foi possível criar o Abrigo protegido.");
    }
  },

  async connectByKey(originalKey) {
    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
      throw new Error("Sincronização remota indisponível.");
    }
    setStatus("encrypting", { error: null, protection: "preparing" });
    try {
      const material = await deriveKeyMaterial(originalKey);
      const abrigo = await AbrigoRepository.findAbrigoByKeyHash(
        material.keyHash
      );
      if (!abrigo?.id) throw new Error("not-found");
      const remote = await AbrigoRepository.getBackup(material.keyHash);
      let validation = await validateRemotePayload(remote, material);
      if (validation.format === "legacy") {
        setStatus("migrating", { protection: "legacy_pending" });
        const migration = await migrateRemoteLegacyBackup({
          keyHash: material.keyHash,
          remoteSyncKey: material.remoteSync,
          remoteBackup: remote,
        });
        validation = {
          format: "encrypted",
          backup: migration.backup,
        };
      }
      await AbrigoRepository.registerDevice(material.keyHash, getDevice());
      const persistedProtection = await activateKeyMaterial(material);
      persistConnection(connectionDetails(abrigo, material.keyHash));
      setStatus("success", { protection: persistedProtection, error: null });
      return { ...abrigo, backupFormat: validation.format };
    } catch {
      setStatus("error", {
        protection: "key_required",
        error: "Não foi possível conectar com esta Chave do Abrigo.",
      });
      throw new Error("Não foi possível conectar com esta Chave do Abrigo.");
    }
  },

  async restoreByKey(originalKey) {
    setStatus("encrypting", { error: null, protection: "preparing" });
    try {
      const material = await deriveKeyMaterial(originalKey);
      const abrigo = await AbrigoRepository.findAbrigoByKeyHash(
        material.keyHash
      );
      if (!abrigo?.id) throw new Error("not-found");
      const remote = await AbrigoRepository.getBackup(material.keyHash);
      let validation = await validateRemotePayload(remote, material);
      if (validation.format === "legacy") {
        setStatus("migrating", { protection: "legacy_pending" });
        const migration = await migrateRemoteLegacyBackup({
          keyHash: material.keyHash,
          remoteSyncKey: material.remoteSync,
          remoteBackup: remote,
        });
        validation = {
          format: "encrypted",
          backup: migration.backup,
        };
      }
      if (!validation.backup) throw new Error("empty-backup");
      restoreBackup(validation.backup);
      const protection = await activateKeyMaterial(material);
      const device = getDevice();
      await AbrigoRepository.registerDevice(material.keyHash, device);
      const syncedAt = new Date().toISOString();
      await AbrigoRepository.updateLastSync(
        material.keyHash,
        device.id,
        syncedAt
      );
      markDeviceSynced();
      persistConnection(connectionDetails(
        abrigo,
        material.keyHash,
        syncedAt
      ));
      setStatus("success", { protection, lastSyncAt: syncedAt, error: null });
      return validation.backup;
    } catch {
      setStatus("error", {
        protection: "key_required",
        error: "Não foi possível restaurar o backup protegido.",
      });
      throw new Error("Não foi possível restaurar o backup protegido.");
    }
  },

  async rotateAbrigoKey() {
    if (rotating) throw new Error("A troca da chave já está em andamento.");
    if (!AbrigoRepository.isAvailable() || isOffline()) {
      throw new Error("Conecte-se à internet para trocar a chave.");
    }
    const currentKeyHash = getKeyHash();
    const currentConnection = loadSyncState();
    const currentMaterial = await getActiveMaterial(currentKeyHash);
    if (!currentKeyHash || !currentMaterial) {
      setStatus("key_required", { protection: "key_required" });
      throw new Error("Sua Chave do Abrigo é necessária antes da troca.");
    }

    rotating = true;
    try {
      const syncResult = await this.processQueue();
      if (
        syncResult.pending > 0
        || ["error", "offline", "unavailable"].includes(syncResult.state)
      ) {
        throw new Error("pending-sync");
      }

      const backup = createBackup(undefined, { source: "key-rotation" });
      const previousRemote = await AbrigoRepository.getBackup(currentKeyHash);
      if (
        previousRemote?.payload
        && !validateEncryptedEnvelope(
          previousRemote.payload,
          ENCRYPTION_PURPOSES.REMOTE_SYNC
        )
      ) {
        throw new Error("legacy-backup");
      }
      const rollbackEnvelope = previousRemote?.payload
        ?? await encryptRemoteBackup(backup, currentMaterial.remoteSync);
      const originalKey = generateAbrigoKey();
      const newMaterial = await deriveKeyMaterial(originalKey);
      const newEnvelope = await encryptRemoteBackup(
        backup,
        newMaterial.remoteSync
      );

      await AbrigoRepository.rotateAbrigoKeyWithBackup(
        currentKeyHash,
        newMaterial.keyHash,
        newEnvelope
      );

      try {
        const protection = await activateKeyMaterial(newMaterial);
        persistConnection({
          keyHash: newMaterial.keyHash,
          abrigoId: currentConnection.abrigoId,
          lastSyncAt: status.lastSyncAt,
        });
        await deleteCryptoKeys(currentKeyHash);
        setStatus("success", { protection, error: null });
        return originalKey;
      } catch {
        await AbrigoRepository.rotateAbrigoKeyWithBackup(
          newMaterial.keyHash,
          currentKeyHash,
          rollbackEnvelope
        );
        await deleteCryptoKeys(newMaterial.keyHash);
        activeMaterial = currentMaterial;
        persistConnection({
          keyHash: currentKeyHash,
          abrigoId: currentConnection.abrigoId,
          lastSyncAt: status.lastSyncAt,
        });
        throw new Error("local-persistence");
      }
    } catch {
      setStatus("error", {
        protection: "active",
        error: "Não foi possível trocar a Chave do Abrigo com segurança.",
      });
      throw new Error("Não foi possível trocar a Chave do Abrigo com segurança.");
    } finally {
      rotating = false;
    }
  },

  async createProtectedLocalBackup(originalKey = null) {
    const cryptoKey = originalKey
      ? await deriveEncryptionKey(
        originalKey,
        ENCRYPTION_PURPOSES.BACKUP_EXPORT
      )
      : (await getActiveMaterial())?.backupExport ?? null;
    if (!cryptoKey) {
      throw new Error("Sua Chave do Abrigo é necessária para proteger o backup.");
    }
    return createEncryptedLocalBackup(cryptoKey);
  },

  async restoreLocalBackup(document, originalKey = null, allowLegacy = false) {
    const inspection = inspectBackupDocument(document);
    if (!inspection.valid) throw new Error("Arquivo de backup inválido.");
    if (inspection.format === "legacy") {
      if (!allowLegacy) throw new Error("Este é um backup antigo sem criptografia.");
      return { backup: restoreBackup(document), legacy: true };
    }
    const cryptoKey = originalKey
      ? await deriveEncryptionKey(
        originalKey,
        ENCRYPTION_PURPOSES.BACKUP_EXPORT
      )
      : (await getActiveMaterial())?.backupExport ?? null;
    if (!cryptoKey) throw new Error("Sua Chave do Abrigo é necessária.");
    return {
      backup: await restoreEncryptedBackup(document, cryptoKey),
      legacy: false,
    };
  },

  async disconnect() {
    const keyHash = getKeyHash();
    if (keyHash) await deleteCryptoKeys(keyHash);
    activeMaterial = null;
    clearSyncState();
    setStatus(getQueue().length ? "pending" : "idle", {
      protection: "local",
      lastSyncAt: null,
      error: null,
    });
    return this.getStatus();
  },

  getStatus() {
    return getPublicStatus();
  },

  subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    listener(this.getStatus());
    return () => listeners.delete(listener);
  },
};

export default SyncService;

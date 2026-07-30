import AbrigoRepository from "../repository/AbrigoRepository";
import { loadSyncState, saveSyncState } from "../storage/SyncStorage";
import { createBackup, restoreBackup, validateBackup } from "./BackupManager";
import { getDevice, markDeviceSynced } from "./DeviceService";
import { enqueue, getQueue, processQueue as processNext } from "./SyncQueue";
import {
  generateAbrigoKey,
  hashAbrigoKey,
  isValidKeyHash,
} from "./AbrigoKey";

const VALID_STATES = new Set([
  "idle",
  "pending",
  "syncing",
  "success",
  "offline",
  "unavailable",
  "error",
]);

let initialized = false;
let processingPromise = null;
let rotating = false;
let status = {
  state: "idle",
  lastSyncAt: loadSyncState().lastSyncAt ?? null,
  pending: getQueue().length,
  error: null,
};
const listeners = new Set();

function setStatus(nextState, details = {}) {
  status = {
    ...status,
    ...details,
    state: VALID_STATES.has(nextState) ? nextState : "error",
    pending: getQueue().length,
  };
  listeners.forEach((listener) => {
    try { listener({ ...status }); } catch { /* Observers do not control sync. */ }
  });
}

function getKeyHash() {
  const keyHash = loadSyncState().keyHash;
  return isValidKeyHash(keyHash) ? keyHash : null;
}

function persistConnection(keyHash, lastSyncAt = status.lastSyncAt) {
  saveSyncState({ keyHash, lastSyncAt });
}

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

async function completeRemoteSync(keyHash, backup) {
  const device = getDevice();
  await AbrigoRepository.saveBackup(keyHash, backup);
  await AbrigoRepository.registerDevice(keyHash, device);

  const syncedAt = new Date().toISOString();
  await AbrigoRepository.updateLastSync(keyHash, device.id, syncedAt);

  markDeviceSynced();
  persistConnection(keyHash, syncedAt);
  return syncedAt;
}

export const SyncService = {
  initialize() {
    if (initialized) return this.getStatus();
    initialized = true;

    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
    } else if (isOffline()) {
      setStatus("offline");
    } else if (getQueue().length > 0) {
      setStatus("pending");
      void this.processQueue();
    } else {
      setStatus("idle");
    }

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
      if (isOffline()) {
        setStatus("offline");
        return this.getStatus();
      }
      if (!keyHash) {
        setStatus(getQueue().length ? "pending" : "idle");
        return this.getStatus();
      }

      setStatus("syncing", { error: null });

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
              deviceId: getDevice().id,
            });
            const syncedAt = await completeRemoteSync(keyHash, backup);
            setStatus("syncing", { lastSyncAt: syncedAt });
          });
        }

        setStatus("success", { error: null });
      } catch {
        setStatus(isOffline() ? "offline" : "error", {
          error: "Não foi possível sincronizar agora. A alteração foi mantida para nova tentativa.",
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

  async createRemoteAbrigo(keyHash) {
    if (!isValidKeyHash(keyHash)) throw new Error("Identificador do Abrigo inválido.");
    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
      throw new Error("Sincronização remota indisponível.");
    }

    setStatus("syncing", { error: null });
    try {
      const abrigo = await AbrigoRepository.createAbrigo(keyHash);
      await AbrigoRepository.registerDevice(keyHash, getDevice());
      persistConnection(keyHash);
      setStatus("success");
      return abrigo;
    } catch {
      setStatus("error", { error: "Não foi possível criar o Abrigo remoto." });
      throw new Error("Não foi possível criar o Abrigo remoto.");
    }
  },

  async connectByKeyHash(keyHash) {
    if (!isValidKeyHash(keyHash)) throw new Error("Identificador do Abrigo inválido.");
    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
      throw new Error("Sincronização remota indisponível.");
    }

    setStatus("syncing", { error: null });
    try {
      const abrigo = await AbrigoRepository.findAbrigoByKeyHash(keyHash);
      if (!abrigo) throw new Error("not-found");
      await AbrigoRepository.registerDevice(keyHash, getDevice());
      persistConnection(keyHash, abrigo.last_sync_at ?? null);
      setStatus("success", { lastSyncAt: abrigo.last_sync_at ?? null });
      return abrigo;
    } catch {
      setStatus("error", { error: "Não foi possível conectar a este Abrigo." });
      throw new Error("Não foi possível conectar a este Abrigo.");
    }
  },

  async restoreByKeyHash(keyHash) {
    await this.connectByKeyHash(keyHash);
    setStatus("syncing", { error: null });

    try {
      const remote = await AbrigoRepository.getBackup(keyHash);
      if (!remote?.payload || !validateBackup(remote.payload)) {
        throw new Error("invalid-backup");
      }

      const backup = restoreBackup(remote.payload);
      const device = getDevice();
      const syncedAt = new Date().toISOString();
      await AbrigoRepository.updateLastSync(keyHash, device.id, syncedAt);
      markDeviceSynced();
      persistConnection(keyHash, syncedAt);
      setStatus("success", { lastSyncAt: syncedAt });
      return backup;
    } catch {
      setStatus("error", { error: "Não foi possível restaurar o backup." });
      throw new Error("Não foi possível restaurar o backup.");
    }
  },

  async rotateAbrigoKey() {
    if (rotating) {
      throw new Error("A troca da chave já está em andamento.");
    }
    if (!AbrigoRepository.isAvailable()) {
      setStatus("unavailable");
      throw new Error("Sincronização remota indisponível.");
    }
    if (isOffline()) {
      setStatus("offline");
      throw new Error("Conecte-se à internet para trocar a chave.");
    }

    const currentKeyHash = getKeyHash();
    if (!currentKeyHash) {
      throw new Error("Nenhum Abrigo sincronizado está conectado.");
    }

    rotating = true;

    try {
      const syncResult = await this.processQueue();
      if (
        syncResult.pending > 0 ||
        ["error", "offline", "unavailable"].includes(syncResult.state)
      ) {
        throw new Error(
          "Não foi possível sincronizar as alterações antes da troca."
        );
      }

      const originalKey = generateAbrigoKey();
      const newKeyHash = await hashAbrigoKey(originalKey);

      setStatus("syncing", { error: null });
      await AbrigoRepository.rotateAbrigoKey(currentKeyHash, newKeyHash);

      try {
        persistConnection(newKeyHash, status.lastSyncAt);
      } catch {
        await AbrigoRepository.rotateAbrigoKey(newKeyHash, currentKeyHash);
        persistConnection(currentKeyHash, status.lastSyncAt);
        throw new Error("Não foi possível salvar a nova chave neste dispositivo.");
      }

      setStatus("success", { error: null });
      return originalKey;
    } catch {
      setStatus("error", {
        error: "Não foi possível trocar a Chave do Abrigo.",
      });
      throw new Error("Não foi possível trocar a Chave do Abrigo.");
    } finally {
      rotating = false;
    }
  },

  getStatus() {
    return {
      ...status,
      connected: Boolean(getKeyHash()),
      pending: getQueue().length,
    };
  },

  subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    listener(this.getStatus());
    return () => listeners.delete(listener);
  },
};

export default SyncService;

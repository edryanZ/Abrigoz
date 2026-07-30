import AbrigoRepository from "../repository/AbrigoRepository";
import { loadSyncState, saveSyncState } from "../storage/SyncStorage";
import { createBackup, restoreBackup, validateBackup } from "./BackupManager";
import { getDevice, markDeviceSynced } from "./DeviceService";
import { enqueue, getQueue, processQueue as processNext } from "./SyncQueue";
import { isValidKeyHash } from "./AbrigoKey";

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
let processing = false;
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
    if (processing) return this.getStatus();

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

    processing = true;
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
    } finally {
      processing = false;
    }

    return this.getStatus();
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

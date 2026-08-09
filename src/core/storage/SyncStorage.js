import { isPersonalWorkspace } from "../privacy/WorkspaceModeService.js";

const KEY = "abrigo:sync-queue:v1";
const STATE_KEY = "abrigo:sync-state:v1";
const STATE_VERSION = 1;

function getLocalStorage() {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

export function loadQueue() {
  if (!isPersonalWorkspace()) return [];
  try {
    const value = JSON.parse(getLocalStorage()?.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveQueue(queue) {
  if (!isPersonalWorkspace()) return;
  getLocalStorage()?.setItem(KEY, JSON.stringify(queue));
}

export function loadSyncState() {
  if (!isPersonalWorkspace()) return {};
  try {
    const value = JSON.parse(
      getLocalStorage()?.getItem(STATE_KEY) ?? "null"
    );

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return {
      version: STATE_VERSION,
      keyHash: typeof value.keyHash === "string" ? value.keyHash : null,
      abrigoId: typeof value.abrigoId === "string" ? value.abrigoId : null,
      lastSyncAt:
        typeof value.lastSyncAt === "string" ? value.lastSyncAt : null,
    };
  } catch {
    return {};
  }
}

export function saveSyncState(state) {
  if (!isPersonalWorkspace()) throw new Error("Sincronização indisponível neste espaço.");
  const target = getLocalStorage();
  if (!target) {
    throw new Error("Armazenamento local indisponível.");
  }

  const persistedState = {
    version: STATE_VERSION,
    keyHash: state.keyHash,
    abrigoId: state.abrigoId ?? null,
    lastSyncAt: state.lastSyncAt ?? null,
  };

  target.setItem(STATE_KEY, JSON.stringify(persistedState));

  const saved = loadSyncState();
  if (
    saved.keyHash !== persistedState.keyHash ||
    saved.abrigoId !== persistedState.abrigoId ||
    saved.lastSyncAt !== persistedState.lastSyncAt
  ) {
    throw new Error("Não foi possível confirmar a conexão neste dispositivo.");
  }

  return saved;
}

export function clearSyncState() {
  if (!isPersonalWorkspace()) return;
  getLocalStorage()?.removeItem(STATE_KEY);
}
export { KEY as SYNC_QUEUE_STORAGE_KEY };
export { STATE_KEY as SYNC_STATE_STORAGE_KEY };

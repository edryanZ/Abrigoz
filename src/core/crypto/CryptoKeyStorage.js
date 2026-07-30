import { isValidKeyHash } from "../sync/AbrigoKey";

const DATABASE_NAME = "abrigo-secure-material";
const DATABASE_VERSION = 1;
const STORE_NAME = "crypto-keys";
const RECORD_VERSION = 1;

export function isSecureKeyStorageSupported() {
  return typeof indexedDB !== "undefined";
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!isSecureKeyStorageSupported()) {
      reject(new Error("Armazenamento seguro indisponível."));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "keyHash" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Armazenamento seguro indisponível."));
  });
}

function runTransaction(mode, action) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = action(store);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(new Error("Armazenamento seguro indisponível."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  }));
}

function isNonExtractableCryptoKey(value) {
  return typeof CryptoKey !== "undefined"
    && value instanceof CryptoKey
    && value.extractable === false
    && value.algorithm?.name === "AES-GCM"
    && value.usages.length === 2
    && value.usages.includes("encrypt")
    && value.usages.includes("decrypt");
}

export async function saveCryptoKeys(keyHash, keys) {
  if (
    !isValidKeyHash(keyHash)
    || !isNonExtractableCryptoKey(keys?.remoteSync)
    || !isNonExtractableCryptoKey(keys?.backupExport)
  ) {
    throw new Error("Material de proteção inválido.");
  }

  await runTransaction("readwrite", (store) => store.put({
    keyHash,
    version: RECORD_VERSION,
    remoteSync: keys.remoteSync,
    backupExport: keys.backupExport,
    updatedAt: new Date().toISOString(),
  }));
  return true;
}

export async function loadCryptoKeys(keyHash) {
  if (!isValidKeyHash(keyHash)) return null;
  try {
    const record = await runTransaction("readonly", (store) =>
      store.get(keyHash));
    if (
      record?.version !== RECORD_VERSION
      || record.keyHash !== keyHash
      || !isNonExtractableCryptoKey(record.remoteSync)
      || !isNonExtractableCryptoKey(record.backupExport)
    ) {
      return null;
    }
    return {
      remoteSync: record.remoteSync,
      backupExport: record.backupExport,
    };
  } catch {
    return null;
  }
}

export async function deleteCryptoKeys(keyHash) {
  if (!isValidKeyHash(keyHash) || !isSecureKeyStorageSupported()) return false;
  try {
    await runTransaction("readwrite", (store) => store.delete(keyHash));
    return true;
  } catch {
    return false;
  }
}

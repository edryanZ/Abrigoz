import { listCachedTracks, clearAudioCache } from "../music/AudioCacheService.js";
import { storage } from "../storage/storage.js";

function localStorageBytes() {
  return storage.keys().reduce((total, key) => {
    let value;
    try {
      value = globalThis.localStorage?.getItem(key) ?? "";
    } catch {
      return total;
    }
    return total + new Blob([key, value]).size;
  }, 0);
}

async function storageEstimate() {
  try { return await navigator.storage?.estimate?.() ?? null; }
  catch { return null; }
}

export async function getStorageSummary() {
  const estimate = await storageEstimate();
  const cacheNames = typeof caches === "undefined" ? [] : await caches.keys();
  return {
    usage: estimate?.usage ?? localStorageBytes(),
    quota: estimate?.quota ?? null,
    localData: localStorageBytes(),
    offlineTracks: (await listCachedTracks()).length,
    publicCaches: cacheNames.filter((name) => !name.startsWith("abrigo-audio")).length,
  };
}

export async function clearPublicAssetCaches() {
  if (typeof caches === "undefined") return 0;
  const names = (await caches.keys()).filter((name) => !name.startsWith("abrigo-audio"));
  await Promise.all(names.map((name) => caches.delete(name)));
  return names.length;
}

export async function clearRebuildableData() {
  const audioCleared = await clearAudioCache();
  const publicCount = await clearPublicAssetCaches();
  return { audioCleared, publicCount };
}

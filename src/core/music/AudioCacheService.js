const CACHE_NAME = "abrigo-audio-v1";
const MAX_TRACKS = 6;

const available = () => typeof caches !== "undefined";

export async function cacheTrack(url) {
  if (!available()) return false;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível preparar esta faixa para uso offline.");
  const cache = await caches.open(CACHE_NAME);
  await cache.put(url, response);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_TRACKS))
    .map((request) => cache.delete(request)));
  return true;
}

export async function isTrackCached(url) {
  if (!available()) return false;
  return Boolean(await (await caches.open(CACHE_NAME)).match(url));
}

export async function listCachedTracks() {
  if (!available()) return [];
  return (await (await caches.open(CACHE_NAME)).keys()).map((request) => request.url);
}

export async function clearAudioCache() {
  return available() ? caches.delete(CACHE_NAME) : false;
}

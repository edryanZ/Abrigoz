import { storage } from "../storage/storage.js";

const KEY = "abrigo:music-preferences:v2";
const DEFAULTS = Object.freeze({
  version: 2, enabled: true, volume: 0.4, trackId: null, position: 0,
  rememberVolume: true, rememberTrack: true, rememberPosition: true,
  shuffle: false, repeat: "none", timerDefault: 0, miniPlayer: true,
  mediaSession: true,
});

export function loadMusicPreferences() {
  const saved = storage.get(KEY);
  if (saved?.version === 2) return { ...DEFAULTS, ...saved, playing: false };
  const legacyVolume = Number(storage.get("abrigo:volume"));
  const legacyPosition = Number(storage.get("abrigo:time"));
  const migrated = {
    ...DEFAULTS,
    volume: Number.isFinite(legacyVolume) ? legacyVolume : DEFAULTS.volume,
    position: Number.isFinite(legacyPosition) ? legacyPosition : 0,
  };
  storage.set(KEY, migrated);
  return migrated;
}

export function saveMusicPreferences(input) {
  const current = loadMusicPreferences();
  const next = { ...current, ...input, version: 2 };
  next.volume = Math.min(1, Math.max(0, Number(next.volume) || 0));
  next.position = Math.max(0, Number(next.position) || 0);
  next.repeat = ["none", "track", "list"].includes(next.repeat) ? next.repeat : "none";
  delete next.playing;
  storage.set(KEY, next);
  return next;
}

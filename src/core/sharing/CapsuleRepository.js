import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const EXPIRY = { hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 };

async function hash(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function load() {
  const value = storage.get(STORAGE_KEYS.SHARE_CAPSULES);
  return value?.version === 1 && Array.isArray(value.items) ? value.items : [];
}

function save(items) {
  storage.set(STORAGE_KEYS.SHARE_CAPSULES, { version: 1, items: items.slice(-30) });
}

export async function createLocalCapsule(envelope, expiry = "day", permanent = false) {
  const id = crypto.randomUUID();
  const tokenBytes = crypto.getRandomValues(new Uint8Array(24));
  const token = [...tokenBytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  tokenBytes.fill(0);
  const expiresAt = permanent ? null : new Date(Date.now() + (EXPIRY[expiry] ?? EXPIRY.day)).toISOString();
  const record = {
    id, createdAt: new Date().toISOString(), expiresAt, revokedAt: null,
    tokenHash: await hash(token), envelope,
  };
  save([...load(), record]);
  return { ...record, token };
}

export function revokeCapsule(id) {
  save(load().map((item) => item.id === id
    ? { ...item, revokedAt: new Date().toISOString() } : item));
}

export function cleanupExpiredCapsules() {
  const now = Date.now();
  const current = load();
  const active = current.filter((item) => !item.expiresAt || Date.parse(item.expiresAt) > now);
  save(active);
  return current.length - active.length;
}

export function listCapsules() {
  return load().map((item) => ({
    id: item.id,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
    revokedAt: item.revokedAt,
  }));
}

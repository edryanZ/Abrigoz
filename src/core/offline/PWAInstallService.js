import STORAGE_KEYS from "../constants/storageKeys.js";
import { storage } from "../storage/storage.js";

const listeners = new Set();
let installEvent = null;

function state() {
  const value = storage.get(STORAGE_KEYS.INSTALL_PROMPT);
  return value?.version === 1 ? value : { version: 1, dismissed: false, installed: false };
}

function notify() {
  const available = Boolean(installEvent) && !state().dismissed && !state().installed;
  listeners.forEach((listener) => listener(available));
}

export function captureInstallPrompt(event) {
  event.preventDefault();
  installEvent = event;
  notify();
}

export function dismissInstallPrompt() {
  storage.set(STORAGE_KEYS.INSTALL_PROMPT, { ...state(), version: 1, dismissed: true, dismissedAt: new Date().toISOString() });
  notify();
}

export async function requestInstall() {
  if (!installEvent) return false;
  const event = installEvent;
  await event.prompt();
  const choice = await event.userChoice;
  if (choice?.outcome === "accepted") {
    storage.set(STORAGE_KEYS.INSTALL_PROMPT, { version: 1, dismissed: false, installed: true });
  }
  installEvent = null;
  notify();
  return choice?.outcome === "accepted";
}

export function subscribeInstallAvailability(listener) {
  listeners.add(listener);
  listener(Boolean(installEvent) && !state().dismissed && !state().installed);
  return () => listeners.delete(listener);
}

export function markInstalled() {
  installEvent = null;
  storage.set(STORAGE_KEYS.INSTALL_PROMPT, { version: 1, dismissed: false, installed: true });
  notify();
}

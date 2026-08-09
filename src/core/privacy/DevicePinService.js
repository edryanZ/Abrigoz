const PIN_KEY = "abrigo:device-pin:v1";
const DEFAULT_ITERATIONS = 210_000;
const encoder = new TextEncoder();
const lockListeners = new Set();

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function readConfig() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(PIN_KEY) ?? "null");
    if (!value || value.version !== 1 || value.algorithm !== "PBKDF2-SHA-256") return null;
    return value;
  } catch {
    return null;
  }
}

function writeConfig(config) {
  globalThis.localStorage?.setItem(PIN_KEY, JSON.stringify(config));
}

function assertPin(pin) {
  if (!/^\d{4,12}$/.test(String(pin))) {
    throw new Error("Use um PIN de 4 a 12 números.");
  }
}

async function derive(pin, salt, iterations = DEFAULT_ITERATIONS) {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto indisponível neste dispositivo.");
  const material = await crypto.subtle.importKey(
    "raw", encoder.encode(String(pin)), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2", salt, iterations, hash: "SHA-256",
  }, material, 256);
  return new Uint8Array(bits);
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export function getPinConfiguration() {
  const config = readConfig();
  return config ? {
    enabled: true,
    autoLock: config.autoLock ?? "reopen",
    timeoutMinutes: Number(config.timeoutMinutes) || 5,
  } : { enabled: false, autoLock: "never", timeoutMinutes: 5 };
}

export async function verifyDevicePin(pin) {
  const config = readConfig();
  if (!config) return true;
  try {
    const derived = await derive(pin, base64ToBytes(config.salt), config.iterations);
    return equalBytes(derived, base64ToBytes(config.verifier));
  } catch {
    return false;
  }
}

export async function enableDevicePin(pin, options = {}) {
  assertPin(pin);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const verifier = await derive(pin, salt);
  writeConfig({
    version: 1,
    algorithm: "PBKDF2-SHA-256",
    iterations: DEFAULT_ITERATIONS,
    salt: bytesToBase64(salt),
    verifier: bytesToBase64(verifier),
    autoLock: options.autoLock ?? "reopen",
    timeoutMinutes: Number(options.timeoutMinutes) || 5,
  });
  return getPinConfiguration();
}

export async function changeDevicePin(currentPin, nextPin) {
  if (!await verifyDevicePin(currentPin)) throw new Error("PIN atual incorreto.");
  const config = getPinConfiguration();
  return enableDevicePin(nextPin, config);
}

export async function disableDevicePin(currentPin) {
  if (!await verifyDevicePin(currentPin)) throw new Error("PIN atual incorreto.");
  globalThis.localStorage?.removeItem(PIN_KEY);
  return true;
}

export function updateDevicePinAutoLock(autoLock, timeoutMinutes = 5) {
  const config = readConfig();
  if (!config) throw new Error("Ative o PIN antes de configurar o bloqueio automático.");
  const valid = ["never", "minutes", "reopen"];
  if (!valid.includes(autoLock)) throw new Error("Opção de bloqueio inválida.");
  writeConfig({ ...config, autoLock, timeoutMinutes: Math.max(1, Math.min(120, Number(timeoutMinutes) || 5)) });
  return getPinConfiguration();
}

export function requestDeviceLock() {
  lockListeners.forEach((listener) => listener());
}

export function subscribeDeviceLock(listener) {
  lockListeners.add(listener);
  return () => lockListeners.delete(listener);
}

export { PIN_KEY as DEVICE_PIN_STORAGE_KEY };

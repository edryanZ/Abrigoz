const KEY_PATTERN = /^[A-Z0-9]{16,128}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAbrigoKey() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Geração segura de chave indisponível neste dispositivo.");
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const characters = Array.from(
    bytes,
    (byte) => KEY_ALPHABET[byte % KEY_ALPHABET.length]
  ).join("");

  return `ABR-${characters.match(/.{1,4}/g).join("-")}`;
}

export function normalizeAbrigoKey(value) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKC")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
}

export function isValidAbrigoKey(value) {
  return KEY_PATTERN.test(normalizeAbrigoKey(value));
}

export function isValidKeyHash(value) {
  return typeof value === "string" && HASH_PATTERN.test(value);
}

export async function hashAbrigoKey(value) {
  const normalizedKey = normalizeAbrigoKey(value);

  if (!isValidAbrigoKey(normalizedKey)) {
    throw new Error("Formato da Chave do Abrigo inválido.");
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error("SHA-256 indisponível neste dispositivo.");
  }

  const bytes = new TextEncoder().encode(normalizedKey);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

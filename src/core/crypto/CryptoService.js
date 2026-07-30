import {
  isValidAbrigoKey,
  normalizeAbrigoKey,
} from "../sync/AbrigoKey";
import { decodeBase64Url, encodeBase64Url } from "./Base64Url";

export const ENCRYPTED_FORMAT = "abrigo-encrypted";
export const ENCRYPTED_VERSION = 1;
export const ENCRYPTION_ALGORITHM = "AES-GCM";
export const KEY_DERIVATION = "HKDF-SHA-256";
export const ENCRYPTION_PURPOSES = Object.freeze({
  REMOTE_SYNC: "remote-sync",
  BACKUP_EXPORT: "backup-export",
});

const PURPOSE_CONTEXTS = {
  [ENCRYPTION_PURPOSES.REMOTE_SYNC]: "abrigo:data-encryption:v1",
  [ENCRYPTION_PURPOSES.BACKUP_EXPORT]: "abrigo:backup-export:v1",
};
const HKDF_SALT = "abrigo:hkdf-salt:v1";
const IV_LENGTH = 12;
const MAX_PLAINTEXT_BYTES = 6 * 1024 * 1024;
const MAX_CIPHERTEXT_BYTES = MAX_PLAINTEXT_BYTES + 32;
const MAX_DEPTH = 32;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export function isCryptoSupported() {
  return Boolean(
    globalThis.crypto?.subtle
    && globalThis.crypto?.getRandomValues
    && typeof TextEncoder !== "undefined"
    && typeof TextDecoder !== "undefined"
  );
}

function assertPurpose(purpose) {
  if (!PURPOSE_CONTEXTS[purpose]) {
    throw new Error("Finalidade de proteção inválida.");
  }
}

function assertSafeValue(value, depth = 0, seen = new Set()) {
  if (depth > MAX_DEPTH) throw new Error("Dados excedem o limite permitido.");
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) throw new Error("Dados inválidos.");
  seen.add(value);

  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error("Dados inválidos.");
    assertSafeValue(value[key], depth + 1, seen);
  }
  seen.delete(value);
}

function authenticatedHeader(envelope) {
  return encoder.encode(JSON.stringify({
    format: envelope.format,
    version: envelope.version,
    purpose: envelope.purpose,
    algorithm: envelope.algorithm,
    keyDerivation: envelope.keyDerivation,
    createdAt: envelope.createdAt,
  }));
}

export function validateEncryptedEnvelope(envelope, expectedPurpose = null) {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
    return false;
  }

  const exactKeys = [
    "format",
    "version",
    "purpose",
    "algorithm",
    "keyDerivation",
    "iv",
    "ciphertext",
    "createdAt",
  ];
  const keys = Object.keys(envelope);
  if (
    keys.length !== exactKeys.length
    || keys.some((key) => !exactKeys.includes(key))
    || envelope.format !== ENCRYPTED_FORMAT
    || envelope.version !== ENCRYPTED_VERSION
    || !PURPOSE_CONTEXTS[envelope.purpose]
    || (expectedPurpose && envelope.purpose !== expectedPurpose)
    || envelope.algorithm !== ENCRYPTION_ALGORITHM
    || envelope.keyDerivation !== KEY_DERIVATION
    || typeof envelope.createdAt !== "string"
    || Number.isNaN(Date.parse(envelope.createdAt))
  ) {
    return false;
  }

  try {
    const iv = decodeBase64Url(envelope.iv);
    const ciphertext = decodeBase64Url(envelope.ciphertext);
    return iv.length === IV_LENGTH
      && ciphertext.length > 16
      && ciphertext.length <= MAX_CIPHERTEXT_BYTES;
  } catch {
    return false;
  }
}

export async function deriveEncryptionKey(abrigoKey, purpose) {
  assertPurpose(purpose);
  if (!isCryptoSupported()) {
    throw new Error("Proteção criptográfica indisponível neste dispositivo.");
  }

  const normalizedKey = normalizeAbrigoKey(abrigoKey);
  if (!isValidAbrigoKey(normalizedKey)) {
    throw new Error("Chave do Abrigo inválida.");
  }

  try {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(normalizedKey),
      "HKDF",
      false,
      ["deriveKey"]
    );
    return await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: encoder.encode(HKDF_SALT),
        info: encoder.encode(PURPOSE_CONTEXTS[purpose]),
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  } catch {
    throw new Error("Não foi possível preparar a proteção dos dados.");
  }
}

export async function encryptJson(value, cryptoKey, purpose) {
  assertPurpose(purpose);
  assertSafeValue(value);

  let plaintext;
  try {
    plaintext = encoder.encode(JSON.stringify(value));
  } catch {
    throw new Error("Não foi possível preparar os dados.");
  }
  if (!plaintext.length || plaintext.length > MAX_PLAINTEXT_BYTES) {
    throw new Error("Os dados excedem o limite permitido.");
  }

  const envelope = {
    format: ENCRYPTED_FORMAT,
    version: ENCRYPTED_VERSION,
    purpose,
    algorithm: ENCRYPTION_ALGORITHM,
    keyDerivation: KEY_DERIVATION,
    iv: "",
    ciphertext: "",
    createdAt: new Date().toISOString(),
  };
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  try {
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
        additionalData: authenticatedHeader(envelope),
        tagLength: 128,
      },
      cryptoKey,
      plaintext
    );
    envelope.iv = encodeBase64Url(iv);
    envelope.ciphertext = encodeBase64Url(ciphertext);
    return envelope;
  } catch {
    throw new Error("Não foi possível proteger os dados.");
  } finally {
    plaintext.fill(0);
  }
}

export async function decryptJson(envelope, cryptoKey, expectedPurpose) {
  if (!validateEncryptedEnvelope(envelope, expectedPurpose)) {
    throw new Error("Conteúdo protegido inválido.");
  }

  const iv = decodeBase64Url(envelope.iv);
  const ciphertext = decodeBase64Url(envelope.ciphertext);
  let plaintext;

  try {
    plaintext = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
        additionalData: authenticatedHeader(envelope),
        tagLength: 128,
      },
      cryptoKey,
      ciphertext
    );
    const parsed = JSON.parse(decoder.decode(plaintext));
    assertSafeValue(parsed);
    return parsed;
  } catch {
    throw new Error("Não foi possível abrir o conteúdo protegido.");
  } finally {
    if (plaintext) new Uint8Array(plaintext).fill(0);
  }
}

export const createEncryptedEnvelope = encryptJson;

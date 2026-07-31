import { decodeBase64Url, encodeBase64Url } from "../crypto/Base64Url.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptCapsule(content) {
  if (!crypto?.subtle || !crypto?.getRandomValues) {
    throw new Error("Proteção local indisponível neste dispositivo.");
  }
  const rawKey = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt"]);
  const plaintext = encoder.encode(JSON.stringify(content));
  try {
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    return {
      envelope: {
        type: "abrigo-shared-capsule", version: 1, algorithm: "AES-GCM",
        iv: encodeBase64Url(iv), ciphertext: encodeBase64Url(ciphertext),
      },
      key: encodeBase64Url(rawKey),
    };
  } finally {
    rawKey.fill(0);
    plaintext.fill(0);
  }
}

export async function decryptCapsule(envelope, encodedKey) {
  if (envelope?.type !== "abrigo-shared-capsule" || envelope?.version !== 1) {
    throw new Error("Cápsula inválida.");
  }
  try {
    const rawKey = decodeBase64Url(encodedKey);
    const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt({
      name: "AES-GCM", iv: decodeBase64Url(envelope.iv),
    }, key, decodeBase64Url(envelope.ciphertext));
    rawKey.fill(0);
    return JSON.parse(decoder.decode(plaintext));
  } catch (error) {
    throw new Error("Não foi possível abrir a cápsula.", { cause: error });
  }
}

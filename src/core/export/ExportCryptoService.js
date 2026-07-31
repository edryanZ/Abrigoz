import { encodeBase64Url } from "../crypto/Base64Url.js";

export async function protectExport(document, passphrase) {
  if (String(passphrase).length < 8) throw new Error("Use uma senha com pelo menos 8 caracteres.");
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({
    name: "PBKDF2", hash: "SHA-256", salt, iterations: 210000,
  }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key,
    encoder.encode(JSON.stringify(document)));
  return {
    type: "abrigo-protected-export", version: 1, algorithm: "AES-GCM",
    derivation: "PBKDF2-SHA-256", iterations: 210000,
    salt: encodeBase64Url(salt), iv: encodeBase64Url(iv),
    ciphertext: encodeBase64Url(ciphertext),
  };
}

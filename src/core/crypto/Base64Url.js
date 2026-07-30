const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_ENCODED_LENGTH = 12 * 1024 * 1024;

export function encodeBase64Url(value) {
  const bytes = value instanceof Uint8Array
    ? value
    : new Uint8Array(value);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, index + chunkSize)
    );
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeBase64Url(value) {
  if (
    typeof value !== "string"
    || !value
    || value.length > MAX_ENCODED_LENGTH
    || !BASE64_URL_PATTERN.test(value)
  ) {
    throw new Error("Conteúdo protegido inválido.");
  }

  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  let binary;
  try {
    binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + padding);
  } catch {
    throw new Error("Conteúdo protegido inválido.");
  }

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

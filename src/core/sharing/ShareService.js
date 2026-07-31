import { downloadJsonFile } from "../sync/BrowserDownload.js";
import { encryptCapsule } from "./CapsuleCryptoService.js";
import { createLocalCapsule } from "./CapsuleRepository.js";

export function prepareShareSelection(input, options = {}) {
  const fields = {
    title: String(input.title ?? "Conteúdo do Abrigo").slice(0, 120),
    text: String(input.text ?? "").slice(0, 20000),
  };
  if (!options.hideDate && input.date) fields.date = String(input.date);
  if (!options.hideMood && input.mood) fields.mood = String(input.mood);
  if (!options.hideTags && Array.isArray(input.tags)) fields.tags = input.tags.map(String).slice(0, 20);
  return fields;
}

export function sharePreview(selection) {
  return [selection.title, selection.date, selection.mood,
    selection.tags?.join(", "), selection.text].filter(Boolean).join("\n\n");
}

export async function shareUsingDevice(selection, confirmed = false) {
  if (!confirmed) throw new Error("Confirme a prévia antes de compartilhar.");
  const text = sharePreview(selection);
  if (navigator.share) {
    await navigator.share({ title: selection.title, text });
    return "shared";
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

export async function createEncryptedLocalCapsule(selection, expiry, permanentConfirmed) {
  if (expiry === "forever" && !permanentConfirmed) {
    throw new Error("Confirme uma cápsula sem prazo.");
  }
  const protectedContent = await encryptCapsule(selection);
  const record = await createLocalCapsule(
    protectedContent.envelope, expiry, expiry === "forever"
  );
  const file = {
    ...protectedContent.envelope, expiresAt: record.expiresAt,
    localId: record.id,
  };
  downloadJsonFile(file, `abrigo-capsula-${new Date().toISOString().slice(0, 10)}.json`);
  return { id: record.id, key: protectedContent.key, token: record.token, expiresAt: record.expiresAt };
}

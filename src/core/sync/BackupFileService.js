import { MAX_BACKUP_BYTES } from "./BackupManager";

const MAX_FILE_BYTES = Math.ceil(MAX_BACKUP_BYTES * 1.6);

export async function readBackupFile(file) {
  if (
    !file
    || typeof file.text !== "function"
    || !Number.isFinite(file.size)
    || file.size <= 0
    || file.size > MAX_FILE_BYTES
  ) {
    throw new Error("O arquivo é inválido ou excede o limite permitido.");
  }

  let text;
  try {
    text = await file.text();
  } catch {
    throw new Error("Não foi possível ler o arquivo.");
  }
  if (new TextEncoder().encode(text).length > MAX_FILE_BYTES) {
    throw new Error("O arquivo excede o limite permitido.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("O arquivo não contém um backup válido.");
  }
}

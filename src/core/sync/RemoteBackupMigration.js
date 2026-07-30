import {
  decryptJson,
  encryptJson,
  ENCRYPTION_PURPOSES,
  validateEncryptedEnvelope,
} from "../crypto/CryptoService";
import AbrigoRepository from "../repository/AbrigoRepository";
import { validateBackup } from "./BackupManager";

function sameBackup(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export async function migrateRemoteLegacyBackup({
  keyHash,
  remoteSyncKey,
  remoteBackup,
}) {
  const payload = remoteBackup?.payload;
  if (
    validateEncryptedEnvelope(
      payload,
      ENCRYPTION_PURPOSES.REMOTE_SYNC
    )
  ) {
    const backup = await decryptJson(
      payload,
      remoteSyncKey,
      ENCRYPTION_PURPOSES.REMOTE_SYNC
    );
    if (!validateBackup(backup)) throw new Error("Backup remoto inválido.");
    return { migrated: false, backup, envelope: payload };
  }

  if (!validateBackup(payload)) {
    throw new Error("Backup remoto antigo inválido.");
  }

  const envelope = await encryptJson(
    payload,
    remoteSyncKey,
    ENCRYPTION_PURPOSES.REMOTE_SYNC
  );
  await AbrigoRepository.saveBackup(keyHash, envelope);
  const confirmed = await AbrigoRepository.getBackup(keyHash);
  if (
    !validateEncryptedEnvelope(
      confirmed?.payload,
      ENCRYPTION_PURPOSES.REMOTE_SYNC
    )
  ) {
    throw new Error("Não foi possível confirmar a migração protegida.");
  }

  const confirmedBackup = await decryptJson(
    confirmed.payload,
    remoteSyncKey,
    ENCRYPTION_PURPOSES.REMOTE_SYNC
  );
  if (!validateBackup(confirmedBackup) || !sameBackup(payload, confirmedBackup)) {
    throw new Error("Não foi possível confirmar a migração protegida.");
  }

  return {
    migrated: true,
    backup: confirmedBackup,
    envelope: confirmed.payload,
  };
}

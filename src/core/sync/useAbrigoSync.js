import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getDevice } from "./DeviceService";
import { inspectBackupDocument } from "./BackupManager";
import { readBackupFile } from "./BackupFileService";
import {
  createDatedFilename,
  downloadJsonFile,
} from "./BrowserDownload";
import {
  generateAbrigoKey,
  isValidAbrigoKey,
} from "./AbrigoKey";
import SyncService from "./SyncService";

const MESSAGE_TIMEOUT = 8000;

export const SYNC_STATE_LABELS = {
  idle: "Pronto",
  pending: "Alterações pendentes",
  encrypting: "Preparando proteção",
  syncing: "Sincronizando",
  success: "Sincronizado",
  key_required: "Chave necessária",
  legacy_pending: "Migração de segurança pendente",
  migrating: "Protegendo backup antigo",
  offline: "Sem conexão",
  unavailable: "Serviço indisponível",
  secure_unavailable: "Sincronização segura indisponível",
  error: "Erro de sincronização",
};

function safeMessage(error, fallback) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

export function useAbrigoSync() {
  const [status, setStatus] = useState(() => SyncService.getStatus());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [revealedKey, setRevealedKey] = useState("");
  const messageTimer = useRef(null);
  const revealedKeyRef = useRef("");
  const device = useMemo(() => getDevice(), []);

  const clearMessage = useCallback(() => {
    window.clearTimeout(messageTimer.current);
    setMessage(null);
  }, []);

  const showMessage = useCallback((type, text) => {
    window.clearTimeout(messageTimer.current);
    setMessage({ type, text });
    messageTimer.current = window.setTimeout(
      () => setMessage(null),
      MESSAGE_TIMEOUT
    );
  }, []);

  const clearRevealedKey = useCallback(() => {
    revealedKeyRef.current = "";
    setRevealedKey("");
  }, []);

  const revealKey = useCallback((key) => {
    revealedKeyRef.current = key;
    setRevealedKey(key);
  }, []);

  useEffect(() => {
    const unsubscribe = SyncService.subscribe(setStatus);
    return () => {
      unsubscribe();
      window.clearTimeout(messageTimer.current);
      revealedKeyRef.current = "";
    };
  }, []);

  const run = useCallback(async (operation, successText, fallbackError) => {
    if (busy) return null;
    setBusy(true);
    clearMessage();

    try {
      const result = await operation();
      showMessage("success", successText);
      return result;
    } catch (error) {
      showMessage("error", safeMessage(error, fallbackError));
      return null;
    } finally {
      setBusy(false);
    }
  }, [busy, clearMessage, showMessage]);

  const createRemoteAbrigo = useCallback(async () => {
    if (busy) return null;
    setBusy(true);
    clearMessage();

    try {
      const originalKey = generateAbrigoKey();
      const abrigo = await SyncService.createRemoteAbrigo(originalKey);
      revealKey(originalKey);
      showMessage(
        "success",
        "Abrigo sincronizado criado. Guarde sua chave antes de continuar."
      );
      return abrigo;
    } catch (error) {
      showMessage(
        "error",
        safeMessage(error, "Não foi possível criar o Abrigo sincronizado.")
      );
      return null;
    } finally {
      setBusy(false);
    }
  }, [busy, clearMessage, revealKey, showMessage]);

  const handleTypedKey = useCallback(async (key, restore) => {
    if (!isValidAbrigoKey(key)) {
      showMessage("error", "Digite uma Chave do Abrigo válida.");
      return null;
    }

    return run(
      async () => {
        return restore
          ? SyncService.restoreByKey(key)
          : SyncService.connectByKey(key);
      },
      restore
        ? "Backup restaurado neste dispositivo."
        : "Este dispositivo foi conectado ao Abrigo.",
      restore
        ? "Não foi possível restaurar este Abrigo."
        : "Não foi possível conectar este dispositivo."
    );
  }, [run, showMessage]);

  const syncNow = useCallback(() => run(
    async () => {
      const result = await SyncService.syncNow();
      if (["error", "offline", "unavailable"].includes(result.state)) {
        throw new Error(
          result.error ?? "Não foi possível concluir a sincronização."
        );
      }
      return result;
    },
    "Sincronização solicitada.",
    "Não foi possível sincronizar agora."
  ), [run]);

  const copyRevealedKey = useCallback(async () => {
    const key = revealedKeyRef.current;
    if (!key) return false;

    try {
      await navigator.clipboard.writeText(key);
      showMessage("success", "Chave copiada.");
      return true;
    } catch {
      showMessage("error", "Não foi possível copiar automaticamente.");
      return false;
    }
  }, [showMessage]);

  const downloadRecoveryFile = useCallback(() => {
    const key = revealedKeyRef.current;
    if (!key) {
      showMessage("error", "A chave não está mais disponível nesta tela.");
      return null;
    }

    try {
      const recoveryDocument = {
        type: "abrigo-recovery-key",
        version: 1,
        createdAt: new Date().toISOString(),
        key,
      };
      const filename = createDatedFilename(
        "abrigo-chave-recuperacao",
        "abrigo.json"
      );
      downloadJsonFile(recoveryDocument, filename);
      showMessage("success", "Arquivo de recuperação baixado.");
      return filename;
    } catch (error) {
      showMessage(
        "error",
        safeMessage(error, "Não foi possível baixar o arquivo de recuperação.")
      );
      return null;
    }
  }, [showMessage]);

  const rotateAbrigoKey = useCallback(async () => {
    if (busy) return null;
    setBusy(true);
    clearMessage();

    try {
      const originalKey = await SyncService.rotateAbrigoKey();
      revealKey(originalKey);
      showMessage(
        "success",
        "Sua nova chave foi criada. Guarde-a antes de continuar."
      );
      return originalKey;
    } catch (error) {
      showMessage(
        "error",
        safeMessage(error, "Não foi possível gerar uma nova chave.")
      );
      return null;
    } finally {
      setBusy(false);
    }
  }, [busy, clearMessage, revealKey, showMessage]);

  const exportLocalBackup = useCallback((originalKey = null) => run(
    async () => {
      const backup = await SyncService.createProtectedLocalBackup(
        originalKey || null
      );
      const filename = createDatedFilename(
        "abrigo-backup-protegido",
        "abrigo.json"
      );
      downloadJsonFile(backup, filename);
      return filename;
    },
    "Backup protegido exportado.",
    "Não foi possível exportar o backup protegido."
  ), [run]);

  const inspectBackupFile = useCallback(async (file) => {
    try {
      const document = await readBackupFile(file);
      return inspectBackupDocument(document);
    } catch (error) {
      showMessage("error", safeMessage(error, "Arquivo de backup inválido."));
      return { format: "invalid", valid: false };
    }
  }, [showMessage]);

  const restoreLocalBackup = useCallback(
    (file, originalKey = null, allowLegacy = false) => run(
      async () => {
        const document = await readBackupFile(file);
        return SyncService.restoreLocalBackup(
          document,
          originalKey || null,
          allowLegacy
        );
      },
      "Backup restaurado com segurança.",
      "Não foi possível restaurar este backup."
    ),
    [run]
  );

  return {
    status,
    busy: busy || ["encrypting", "migrating", "syncing"].includes(status.state),
    message,
    device,
    revealedKey,
    connected: status.connected,
    createRemoteAbrigo,
    connectByKey: (key) => handleTypedKey(key, false),
    restoreByKey: (key) => handleTypedKey(key, true),
    syncNow,
    rotateAbrigoKey,
    exportLocalBackup,
    inspectBackupFile,
    restoreLocalBackup,
    copyRevealedKey,
    downloadRecoveryFile,
    clearMessage,
    clearRevealedKey,
  };
}

export default useAbrigoSync;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getDevice } from "./DeviceService";
import {
  generateAbrigoKey,
  hashAbrigoKey,
  isValidAbrigoKey,
} from "./AbrigoKey";
import SyncService from "./SyncService";

const MESSAGE_TIMEOUT = 8000;

export const SYNC_STATE_LABELS = {
  idle: "Pronto",
  pending: "Alterações pendentes",
  syncing: "Sincronizando",
  success: "Sincronizado",
  offline: "Sem conexão",
  unavailable: "Serviço indisponível",
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
    setRevealedKey("");
  }, []);

  const revealKey = useCallback((key) => {
    setRevealedKey(key);
  }, []);

  useEffect(() => {
    const unsubscribe = SyncService.subscribe(setStatus);
    return () => {
      unsubscribe();
      window.clearTimeout(messageTimer.current);
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
      const keyHash = await hashAbrigoKey(originalKey);
      const abrigo = await SyncService.createRemoteAbrigo(keyHash);
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
        const keyHash = await hashAbrigoKey(key);
        return restore
          ? SyncService.restoreByKeyHash(keyHash)
          : SyncService.connectByKeyHash(keyHash);
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
    if (!revealedKey) return false;

    try {
      await navigator.clipboard.writeText(revealedKey);
      showMessage("success", "Chave copiada.");
      return true;
    } catch {
      showMessage("error", "Não foi possível copiar automaticamente.");
      return false;
    }
  }, [revealedKey, showMessage]);

  return {
    status,
    busy: busy || status.state === "syncing",
    message,
    device,
    revealedKey,
    connected: status.connected,
    createRemoteAbrigo,
    connectByKey: (key) => handleTypedKey(key, false),
    restoreByKey: (key) => handleTypedKey(key, true),
    syncNow,
    copyRevealedKey,
    clearMessage,
    clearRevealedKey,
  };
}

export default useAbrigoSync;

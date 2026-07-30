import "./SyncSettings.css";

import { useState } from "react";
import {
  FaCloud,
  FaDownload,
  FaKey,
  FaMobileAlt,
  FaRedoAlt,
  FaSyncAlt,
} from "react-icons/fa";

import { SYNC_STATE_LABELS, useAbrigoSync } from "../../../core/sync/useAbrigoSync";
import PrivacyNotice from "../../../shared/componentes/PrivacyNotice";
import RecoveryKeyPanel from "../../../shared/componentes/RecoveryKeyPanel";
import GlassCard from "../../../shared/ui/GlassCard";

function formatSyncDate(value) {
  if (!value) return "Ainda não sincronizado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ainda não sincronizado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function SyncSettings() {
  const sync = useAbrigoSync();
  const [typedKey, setTypedKey] = useState("");
  const [showRotateConfirmation, setShowRotateConfirmation] = useState(false);
  const [backupKey, setBackupKey] = useState("");
  const [backupFile, setBackupFile] = useState(null);
  const [backupInspection, setBackupInspection] = useState(null);
  const [legacyConfirmed, setLegacyConfirmed] = useState(false);

  async function handleKeyAction(action) {
    const succeeded = action === "restore"
      ? await sync.restoreByKey(typedKey)
      : await sync.connectByKey(typedKey);

    setTypedKey("");
    if (succeeded) {
      if (action === "restore") {
        window.setTimeout(() => window.location.reload(), 600);
      }
    }
  }

  async function handleRotateKey() {
    const newKey = await sync.rotateAbrigoKey();
    if (newKey) setShowRotateConfirmation(false);
  }

  async function handleBackupFile(file) {
    setBackupFile(file);
    setLegacyConfirmed(false);
    if (!file) {
      setBackupInspection(null);
      return;
    }
    setBackupInspection(await sync.inspectBackupFile(file));
  }

  async function handleProtectedExport() {
    await sync.exportLocalBackup(backupKey);
    setBackupKey("");
  }

  async function handleLocalRestore() {
    if (!backupFile) return;
    const restored = await sync.restoreLocalBackup(
      backupFile,
      backupKey,
      legacyConfirmed
    );
    setBackupKey("");
    if (restored) {
      setBackupFile(null);
      setBackupInspection(null);
      setLegacyConfirmed(false);
      window.setTimeout(() => window.location.reload(), 600);
    }
  }

  async function handleDisconnect() {
    if (!window.confirm(
      "Desconectar este dispositivo? Seus dados locais continuarão aqui."
    )) return;
    await sync.disconnect();
  }

  return (
    <GlassCard className="sync-settings" hover={false}>
      <div className="sync-settings__heading">
        <span className="sync-settings__icon" aria-hidden="true">
          <FaCloud />
        </span>
        <div>
          <h3>Sincronização do Abrigo</h3>
          <p>
            A sincronização é opcional. Seu Abrigo continua funcionando
            somente neste dispositivo se você preferir.
          </p>
        </div>
      </div>
      <PrivacyNotice />

      <dl className="sync-settings__status">
        <div>
          <dt>Conexão do Abrigo</dt>
          <dd>
            {sync.status.connection === "connected"
              ? "Abrigo sincronizado conectado"
              : "Somente neste dispositivo"}
          </dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <span
              className={`sync-state sync-state--${sync.status.state}`}
              aria-live="polite"
            >
              {SYNC_STATE_LABELS[sync.status.state] ?? "Desconhecido"}
            </span>
          </dd>
        </div>
        <div>
          <dt>Última sincronização</dt>
          <dd>{formatSyncDate(sync.status.lastSyncAt)}</dd>
        </div>
        <div>
          <dt>Alterações pendentes</dt>
          <dd>{sync.status.pending}</dd>
        </div>
        <div>
          <dt>Dispositivo</dt>
          <dd className="sync-settings__device">
            <FaMobileAlt aria-hidden="true" />
            {sync.device.name}
          </dd>
        </div>
      </dl>

      {(sync.message || sync.status.error) && (
        <div
          className={`sync-message sync-message--${sync.message?.type ?? "error"}`}
          role={sync.message?.type === "error" ? "alert" : "status"}
        >
          {sync.message?.text ?? sync.status.error}
        </div>
      )}

      {sync.revealedKey ? (
        <RecoveryKeyPanel
          recoveryKey={sync.revealedKey}
          busy={sync.busy}
          onCopy={sync.copyRevealedKey}
          onDownload={sync.downloadRecoveryFile}
          onConfirm={sync.clearRevealedKey}
          onCancel={sync.clearRevealedKey}
        />
      ) : (
        <>
          {showRotateConfirmation && (
            <section
              className="sync-rotate-confirmation"
              aria-labelledby="sync-rotate-title"
            >
              <h4 id="sync-rotate-title">Gerar uma nova chave?</h4>
              <p>
                A chave anterior deixará de funcionar imediatamente depois da
                confirmação. Antes da troca, tentaremos sincronizar todas as
                alterações pendentes.
              </p>
              <div className="sync-actions">
                <button
                  type="button"
                  className="config-button secondary"
                  onClick={() => setShowRotateConfirmation(false)}
                  disabled={sync.busy}
                >
                  Manter chave atual
                </button>
                <button
                  type="button"
                  className="config-button danger"
                  onClick={() => void handleRotateKey()}
                  disabled={sync.busy}
                >
                  {sync.busy ? "Trocando chave..." : "Confirmar nova chave"}
                </button>
              </div>
            </section>
          )}

          <div className="sync-actions">
            <button
              type="button"
              className="config-button"
              onClick={sync.syncNow}
              disabled={sync.busy || !sync.connected}
            >
              <FaSyncAlt aria-hidden="true" />
              {sync.busy ? "Aguarde..." : "Sincronizar agora"}
            </button>

            {!sync.connected && (
              <button
                type="button"
                className="config-button secondary"
                onClick={sync.createRemoteAbrigo}
                disabled={sync.busy}
              >
                <FaKey aria-hidden="true" />
                Criar meu Abrigo sincronizado
              </button>
            )}

            {sync.connected && (
              <>
                <button
                  type="button"
                  className="config-button secondary"
                  onClick={() => setShowRotateConfirmation(true)}
                  disabled={sync.busy || showRotateConfirmation}
                >
                  <FaRedoAlt aria-hidden="true" />
                  Gerar nova chave
                </button>
                <button
                  type="button"
                  className="config-button secondary"
                  onClick={() => void handleDisconnect()}
                  disabled={sync.busy}
                >
                  Desconectar este dispositivo
                </button>
              </>
            )}

            <button
              type="button"
              className="config-button secondary"
              onClick={() => void handleProtectedExport()}
              disabled={sync.busy}
            >
              <FaDownload aria-hidden="true" />
              Exportar backup protegido
            </button>
          </div>

          <form
            className="sync-connect"
            onSubmit={(event) => {
              event.preventDefault();
              void handleKeyAction("connect");
            }}
          >
            <div className="sync-connect__heading">
              <h4>Usar uma Chave do Abrigo</h4>
              <p>
                A chave é validada e transformada em SHA-256 neste dispositivo
                antes de qualquer comunicação remota.
              </p>
            </div>

            <label htmlFor="sync-abrigo-key">Chave do Abrigo</label>
            <input
              id="sync-abrigo-key"
              className="sync-key-input"
              type="password"
              value={typedKey}
              onChange={(event) => setTypedKey(event.target.value)}
              placeholder="ABR-••••-••••-••••-••••"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              disabled={sync.busy}
            />

            <div className="sync-actions">
              <button
                type="submit"
                className="config-button secondary"
                disabled={sync.busy || !typedKey.trim()}
              >
                Conectar dispositivo
              </button>
              <button
                type="button"
                className="config-button secondary"
                onClick={() => void handleKeyAction("restore")}
                disabled={sync.busy || !typedKey.trim()}
              >
                Restaurar backup
              </button>
            </div>
          </form>

          <section
            className="sync-backup-protection"
            aria-labelledby="sync-backup-title"
          >
            <div className="sync-connect__heading">
              <h4 id="sync-backup-title">Backup protegido</h4>
              <p>
                O arquivo exportado contém somente um envelope criptografado.
                Se a proteção não estiver disponível neste navegador, informe
                sua Chave do Abrigo apenas para esta operação.
              </p>
            </div>

            <label htmlFor="sync-backup-key">
              Chave do Abrigo, quando solicitada
            </label>
            <input
              id="sync-backup-key"
              className="sync-key-input"
              type="password"
              value={backupKey}
              onChange={(event) => setBackupKey(event.target.value)}
              autoComplete="off"
              spellCheck="false"
              disabled={sync.busy}
            />

            <label htmlFor="sync-backup-file">Arquivo de backup</label>
            <input
              id="sync-backup-file"
              className="sync-file-input"
              type="file"
              accept=".json,.abrigo.json,application/json"
              onChange={(event) =>
                void handleBackupFile(event.target.files?.[0] ?? null)}
              disabled={sync.busy}
            />

            {backupInspection?.format === "legacy" && (
              <div className="sync-legacy-warning" role="alert">
                <strong>Backup antigo sem criptografia</strong>
                <p>
                  O arquivo será validado e restaurado somente após sua
                  confirmação. Novas exportações usarão sempre proteção.
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={legacyConfirmed}
                    onChange={(event) =>
                      setLegacyConfirmed(event.target.checked)}
                  />
                  Confirmo que desejo restaurar este backup antigo
                </label>
              </div>
            )}

            {backupInspection?.format === "encrypted" && (
              <p className="sync-protected-file" role="status">
                Backup protegido reconhecido.
              </p>
            )}

            <button
              type="button"
              className="config-button secondary"
              onClick={() => void handleLocalRestore()}
              disabled={
                sync.busy
                || !backupFile
                || !backupInspection?.valid
                || (
                  backupInspection.format === "legacy"
                  && !legacyConfirmed
                )
              }
            >
              Restaurar arquivo selecionado
            </button>
          </section>
        </>
      )}
    </GlassCard>
  );
}

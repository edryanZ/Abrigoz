import "./SyncSettings.css";

import { useState } from "react";
import {
  FaCloud,
  FaCopy,
  FaKey,
  FaMobileAlt,
  FaSyncAlt,
} from "react-icons/fa";

import { SYNC_STATE_LABELS, useAbrigoSync } from "../../../core/sync/useAbrigoSync";
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

  async function handleKeyAction(action) {
    const succeeded = action === "restore"
      ? await sync.restoreByKey(typedKey)
      : await sync.connectByKey(typedKey);

    if (succeeded) {
      setTypedKey("");
      if (action === "restore") {
        window.setTimeout(() => window.location.reload(), 600);
      }
    }
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

      <dl className="sync-settings__status">
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

      {sync.revealedKey && (
        <div className="sync-key-reveal" role="status">
          <div>
            <strong>Sua Chave do Abrigo</strong>
            <p>
              Guarde esta chave em um lugar seguro. Ela não poderá ser
              recuperada depois.
            </p>
          </div>
          <output className="sync-key-reveal__value">
            {sync.revealedKey}
          </output>
          <div className="sync-actions">
            <button
              type="button"
              className="config-button"
              onClick={sync.copyRevealedKey}
              disabled={sync.busy}
            >
              <FaCopy aria-hidden="true" />
              Copiar chave
            </button>
            <button
              type="button"
              className="config-button secondary"
              onClick={sync.clearRevealedKey}
            >
              Já guardei
            </button>
          </div>
        </div>
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
    </GlassCard>
  );
}

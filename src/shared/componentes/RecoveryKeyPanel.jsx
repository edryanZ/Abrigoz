import "./RecoveryKeyPanel.css";

import { useState } from "react";
import {
  FaCheck,
  FaCopy,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function RecoveryKeyPanel({
  recoveryKey,
  busy = false,
  onCopy,
  onDownload,
  onConfirm,
  onCancel,
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (!recoveryKey) return null;

  function handleCancel() {
    const shouldDiscard = window.confirm(
      "Esta chave deixará de aparecer. Cancele somente se você tiver certeza."
    );
    if (shouldDiscard) onCancel?.();
  }

  return (
    <section
      className="recovery-key-panel"
      aria-labelledby="recovery-key-title"
    >
      <div className="recovery-key-panel__heading">
        <FaExclamationTriangle aria-hidden="true" />
        <div>
          <h2 id="recovery-key-title">Guarde sua Chave do Abrigo</h2>
          <p>
            Esta chave será mostrada somente agora e não poderá ser
            recuperada depois.
          </p>
        </div>
      </div>

      <div className="recovery-key-panel__warning" role="alert">
        Qualquer pessoa com esta chave ou com o arquivo de recuperação poderá
        acessar seu Abrigo. Não compartilhe com quem você não confia.
      </div>

      <output className="recovery-key-panel__value">
        {recoveryKey}
      </output>

      <div className="recovery-key-panel__actions">
        <button
          type="button"
          className="recovery-key-button recovery-key-button--secondary"
          onClick={onCopy}
          disabled={busy}
        >
          <FaCopy aria-hidden="true" />
          Copiar chave
        </button>
        <button
          type="button"
          className="recovery-key-button recovery-key-button--secondary"
          onClick={onDownload}
          disabled={busy}
        >
          <FaDownload aria-hidden="true" />
          Baixar arquivo de recuperação
        </button>
      </div>

      <label className="recovery-key-confirmation">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          disabled={busy}
        />
        <span>Guardei minha chave em um local seguro</span>
      </label>

      <button
        type="button"
        className="recovery-key-button recovery-key-button--confirm"
        onClick={onConfirm}
        disabled={busy || !confirmed}
      >
        <FaCheck aria-hidden="true" />
        Confirmar e continuar
      </button>

      {onCancel && (
        <button
          type="button"
          className="recovery-key-button recovery-key-button--ghost"
          onClick={handleCancel}
          disabled={busy}
        >
          Cancelar e apagar a chave da tela
        </button>
      )}
    </section>
  );
}

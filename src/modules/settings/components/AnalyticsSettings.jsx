import { useState } from "react";

import { getAnalyticsConsent } from "../../../core/analytics/AnalyticsConsentService";

export default function AnalyticsSettings() {
  const [enabled, setEnabled] = useState(getAnalyticsConsent);
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState("");

  async function changeConsent(event) {
    const next = event.target.checked;
    const previous = enabled;
    setChanging(true);
    setMessage("");
    try {
      const { setAnalyticsConsent } = await import("../../../core/analytics/AnalyticsService");
      await setAnalyticsConsent(next);
      setEnabled(next);
      setMessage(next
        ? "As contagens anônimas estão ativadas."
        : "As contagens anônimas foram desativadas.");
    } catch {
      setEnabled(previous);
      setMessage("Não foi possível alterar essa preferência agora.");
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="analytics-settings">
      <h3>Métricas anônimas</h3>
      <p>
        As métricas anônimas ficam ativadas por padrão para ajudar a entender
        o uso e o funcionamento do Abrigo. Elas registram apenas contagens
        genéricas, como abertura de páginas, categoria de dispositivo e versão
        do aplicativo.
      </p>
      <label>
        <input type="checkbox" checked={enabled} disabled={changing}
          onChange={changeConsent} />
        Permitir métricas anônimas para ajudar a melhorar o Abrigo
      </label>
      <small>
        Não são enviados nome, textos pessoais, humor, Chave do Abrigo, backup,
        pesquisas ou conteúdo dos módulos. Você pode desativar esta opção a
        qualquer momento.
      </small>
      {message && <small role="status">{message}</small>}
    </div>
  );
}

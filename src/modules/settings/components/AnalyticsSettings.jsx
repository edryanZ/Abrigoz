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
        ? "Obrigado. As contagens anônimas estão ativadas."
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
      <p>O Abrigo pode enviar contagens anônimas de funcionamento, como abertura de páginas e erros técnicos seguros, para ajudar a melhorar o aplicativo. Nenhum texto pessoal, humor, Chave do Abrigo ou conteúdo dos seus módulos é enviado.</p>
      <label>
        <input type="checkbox" checked={enabled} disabled={changing}
          onChange={changeConsent} />
        Permitir métricas anônimas para ajudar a melhorar o Abrigo
      </label>
      <small>Não há publicidade, venda de dados ou criação de perfil individual. A mesma pessoa pode abrir mais de uma sessão.</small>
      {message && <small role="status">{message}</small>}
    </div>
  );
}

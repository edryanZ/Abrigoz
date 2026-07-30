import { useState } from "react";

import {
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "../../../core/analytics/AnalyticsService";

export default function AnalyticsSettings() {
  const [enabled, setEnabled] = useState(getAnalyticsConsent);
  return (
    <div className="analytics-settings">
      <h3>Métricas anônimas</h3>
      <p>O Abrigo pode enviar contagens anônimas de funcionamento, como abertura de páginas e erros técnicos seguros, para ajudar a melhorar o aplicativo. Nenhum texto pessoal, humor, Chave do Abrigo ou conteúdo dos seus módulos é enviado.</p>
      <label>
        <input type="checkbox" checked={enabled} onChange={async (event) => {
          const next = event.target.checked;
          setEnabled(next);
          await setAnalyticsConsent(next);
        }} />
        Permitir métricas anônimas para ajudar a melhorar o Abrigo
      </label>
      <small>Não há publicidade, venda de dados ou criação de perfil individual. A mesma pessoa pode abrir mais de uma sessão.</small>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  hasSeenAnalyticsNotice,
  persistAnalyticsNoticeSeen,
} from "../../core/analytics/AnalyticsConsentService";
import ROUTES from "../../core/constants/routes";

export default function AnalyticsNotice() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(() => !hasSeenAnalyticsNotice());

  if (!visible) return null;

  function closeNotice() {
    persistAnalyticsNoticeSeen();
    setVisible(false);
  }

  function configure() {
    persistAnalyticsNoticeSeen();
    setVisible(false);
    navigate(`${ROUTES.SETTINGS}#metricas`);
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Aviso sobre métricas anônimas"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "1rem",
        transform: "translateX(-50%)",
        width: "min(92vw, 620px)",
        zIndex: 10000,
        padding: "1rem",
        borderRadius: "18px",
        background: "rgba(15, 23, 42, 0.94)",
        color: "#fff",
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.28)",
        backdropFilter: "blur(16px)",
      }}
    >
      <strong style={{ display: "block", marginBottom: ".45rem" }}>
        Métricas anônimas
      </strong>

      <p style={{ margin: 0, lineHeight: 1.5 }}>
        O Abrigo usa contagens anônimas de uso e funcionamento para ajudar a
        melhorar o aplicativo. Não enviamos textos pessoais, humor, Chave do
        Abrigo, backups ou conteúdo dos seus módulos. Você pode desativar essas
        métricas a qualquer momento em Configurações.
      </p>

      <div
        style={{
          display: "flex",
          gap: ".65rem",
          flexWrap: "wrap",
          marginTop: ".85rem",
        }}
      >
        <button type="button" onClick={closeNotice}>
          Entendi
        </button>

        <button type="button" onClick={configure}>
          Configurar
        </button>
      </div>
    </aside>
  );
}
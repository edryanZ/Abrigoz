import "./PrivacyToggle.css";

import usePrivacyMode from "../../core/privacy/usePrivacyMode";

export default function PrivacyToggle({ compact = false }) {
  const { enabled, toggle } = usePrivacyMode();
  return (
    <button type="button" className="privacy-toggle" aria-pressed={enabled}
      aria-label={enabled ? "Desativar modo privacidade" : "Ativar modo privacidade"}
      onClick={toggle}>
      {enabled ? "👁️ Mostrar conteúdo" : "🕶️ Ocultar conteúdo"}{compact ? "" : " pessoal"}
    </button>
  );
}

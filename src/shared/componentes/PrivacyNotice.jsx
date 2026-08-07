import "./PrivacyNotice.css";

import { useState } from "react";
import { FaShieldAlt } from "react-icons/fa";

import { useAbrigoSync } from "../../core/sync/useAbrigoSync";

const PROTECTION_MESSAGES = {
  active: {
    title: "Protegido e sincronizado",
    text: "Suas coisas continuam suas. O conteúdo é protegido antes de sair deste dispositivo.",
  },
  session_only: {
    title: "Proteção ativa nesta sessão",
    text: "Seus dados podem ser sincronizados com proteção agora. A Chave do Abrigo poderá ser solicitada novamente neste navegador.",
  },
  key_required: {
    title: "Chave necessária",
    text: "Seus dados locais continuam disponíveis, mas sua Chave do Abrigo é necessária para sincronizar com proteção.",
  },
  legacy_pending: {
    title: "Migração de segurança pendente",
    text: "Encontramos um backup antigo. Ele será criptografado antes da próxima sincronização segura.",
  },
  unavailable: {
    title: "Proteção indisponível",
    text: "Este navegador não oferece agora os recursos necessários para uma sincronização segura. Seus dados locais continuam disponíveis.",
  },
  preparing: {
    title: "Preparando proteção",
    text: "Estamos preparando a criptografia antes de qualquer envio.",
  },
  local: {
    title: "Guardado neste dispositivo",
    text: "Suas coisas permanecem aqui enquanto a sincronização estiver desativada.",
  },
};

export default function PrivacyNotice({ compact = false }) {
  const sync = useAbrigoSync();
  const [expanded, setExpanded] = useState(false);
  const details = PROTECTION_MESSAGES[sync.status.protection]
    ?? PROTECTION_MESSAGES.local;

  return (
    <aside className={`privacy-notice ${compact ? "is-compact" : ""}`}>
      <FaShieldAlt aria-hidden="true" />
      <div>
        <strong>{details.title}</strong>
        {!compact && <p>{details.text}</p>}
        {expanded && (
          <p className="privacy-notice__details">
            Quando a sincronização protegida está ativa, o Abrigo criptografa
            o conteúdo antes do envio. O servidor recebe o conteúdo
            criptografado e não recebe sua Chave do Abrigo. A criptografia
            reduz muito a exposição, mas a segurança também depende de manter
            sua chave e seu dispositivo protegidos.
          </p>
        )}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? "Ocultar explicação" : "Como funciona?"}
        </button>
      </div>
    </aside>
  );
}

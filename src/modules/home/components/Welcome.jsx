import "./Welcome.css";

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FaCloud,
  FaCopy,
  FaKey,
  FaMobileAlt,
  FaShieldAlt,
} from "react-icons/fa";

import ROUTES from "../../../core/constants/routes";
import { useAbrigoSync } from "../../../core/sync/useAbrigoSync";

import Ceu from "../../../shared/componentes/Ceu";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { useUser } from "../../../shared/contexts/UserContext";
import Container from "../../../shared/ui/Container";
import GlassCard from "../../../shared/ui/GlassCard";

export default function Welcome() {
  const { greeting } = useTheme();
  const { user, createUser } = useUser();
  const sync = useAbrigoSync();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [typedKey, setTypedKey] = useState("");
  const [step, setStep] = useState("choices");
  const [localMessage, setLocalMessage] = useState("");

  if (user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  function requireName() {
    const trimmedName = name.trim();
    if (trimmedName) return trimmedName;
    setLocalMessage("Digite como você gostaria de ser chamado.");
    return null;
  }

  function startLocalOnly() {
    const trimmedName = requireName();
    if (!trimmedName) return;

    createUser(trimmedName);
    navigate(ROUTES.HOME, { replace: true });
  }

  async function createSynchronizedAbrigo() {
    const trimmedName = requireName();
    if (!trimmedName) return;

    setLocalMessage("");
    const created = await sync.createRemoteAbrigo();
    if (created) setStep("created");
  }

  async function restoreAbrigo() {
    setLocalMessage("");
    const restored = await sync.restoreByKey(typedKey);
    if (!restored) return;

    setTypedKey("");
    window.location.replace(ROUTES.HOME);
  }

  async function finishCreatedAbrigo() {
    const trimmedName = requireName();
    if (!trimmedName) return;

    createUser(trimmedName);
    await sync.syncNow();
    sync.clearRevealedKey();
    navigate(ROUTES.HOME, { replace: true });
  }

  return (
    <>
      <Ceu />
      <Container>
        <main className="welcome-page">
          <GlassCard className="welcome-card" hover={false}>
            <div className="welcome-icon" aria-hidden="true">
              <FaShieldAlt />
            </div>

            <div className="welcome-content">
              <span className="welcome-eyebrow">{greeting}</span>
              <h1>Bem-vindo ao Abrigo</h1>
              <p>
                Um espaço seu, acolhedor e privado. Você decide se quer
                começar somente neste dispositivo ou ativar a sincronização.
              </p>
            </div>

            {step !== "created" && (
              <div className="welcome-name">
                <label htmlFor="welcome-name">
                  Como você gostaria de ser chamado?
                </label>
                <input
                  id="welcome-name"
                  className="welcome-input"
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  maxLength={40}
                  onChange={(event) => {
                    setName(event.target.value);
                    setLocalMessage("");
                  }}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            )}

            {(localMessage || sync.message || sync.status.error) && (
              <div
                className={`welcome-alert welcome-alert--${
                  sync.message?.type ?? "error"
                }`}
                role={sync.message?.type === "success" ? "status" : "alert"}
              >
                {localMessage || sync.message?.text || sync.status.error}
              </div>
            )}

            {step === "choices" && (
              <div className="welcome-paths" aria-label="Formas de começar">
                <button
                  type="button"
                  className="welcome-path"
                  onClick={startLocalOnly}
                  disabled={sync.busy}
                >
                  <FaMobileAlt aria-hidden="true" />
                  <span>
                    <strong>Começar somente neste dispositivo</strong>
                    <small>
                      Use o Abrigo normalmente sem configurar sincronização.
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="welcome-path welcome-path--primary"
                  onClick={() => void createSynchronizedAbrigo()}
                  disabled={sync.busy}
                >
                  <FaCloud aria-hidden="true" />
                  <span>
                    <strong>Criar meu Abrigo sincronizado</strong>
                    <small>
                      Gere uma chave segura para usar em outros dispositivos.
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="welcome-path"
                  onClick={() => setStep("restore")}
                  disabled={sync.busy}
                >
                  <FaKey aria-hidden="true" />
                  <span>
                    <strong>Restaurar com minha Chave do Abrigo</strong>
                    <small>
                      Recupere o backup de um Abrigo já sincronizado.
                    </small>
                  </span>
                </button>
              </div>
            )}

            {step === "restore" && (
              <form
                className="welcome-restore"
                onSubmit={(event) => {
                  event.preventDefault();
                  void restoreAbrigo();
                }}
              >
                <div>
                  <h2>Restaurar seu Abrigo</h2>
                  <p>
                    A chave será transformada em SHA-256 neste dispositivo.
                    Ela não será armazenada nem enviada em sua forma original.
                  </p>
                </div>
                <label htmlFor="welcome-abrigo-key">Chave do Abrigo</label>
                <input
                  id="welcome-abrigo-key"
                  className="welcome-input welcome-key-input"
                  type="password"
                  value={typedKey}
                  onChange={(event) => setTypedKey(event.target.value)}
                  placeholder="ABR-••••-••••-••••-••••"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  disabled={sync.busy}
                  autoFocus
                />
                <div className="welcome-actions">
                  <button
                    type="button"
                    className="welcome-button welcome-button--secondary"
                    onClick={() => {
                      setTypedKey("");
                      setStep("choices");
                    }}
                    disabled={sync.busy}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="welcome-button"
                    disabled={sync.busy || !typedKey.trim()}
                  >
                    {sync.busy ? "Restaurando..." : "Restaurar Abrigo"}
                  </button>
                </div>
              </form>
            )}

            {step === "created" && sync.revealedKey && (
              <div className="welcome-created" role="status">
                <div>
                  <h2>Guarde sua Chave do Abrigo</h2>
                  <p>
                    Esta é a única vez que ela será mostrada. Guarde-a em um
                    lugar seguro: a chave não poderá ser recuperada depois.
                  </p>
                </div>

                <output className="welcome-key-value">
                  {sync.revealedKey}
                </output>

                <button
                  type="button"
                  className="welcome-button welcome-button--secondary"
                  onClick={sync.copyRevealedKey}
                >
                  <FaCopy aria-hidden="true" />
                  Copiar chave
                </button>

                <button
                  type="button"
                  className="welcome-button"
                  onClick={() => void finishCreatedAbrigo()}
                  disabled={sync.busy}
                >
                  {sync.busy
                    ? "Preparando seu Abrigo..."
                    : "Guardei minha chave e quero continuar"}
                </button>
              </div>
            )}
          </GlassCard>
        </main>
      </Container>
    </>
  );
}

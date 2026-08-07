import "./Welcome.css";

import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FaCloud,
  FaKey,
  FaMobileAlt,
  FaShieldAlt,
} from "react-icons/fa";

import ROUTES from "../../../core/constants/routes";
import { useAbrigoSync } from "../../../core/sync/useAbrigoSync";

import RecoveryKeyPanel from "../../../shared/componentes/RecoveryKeyPanel";
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
  const [step, setStep] = useState("intro");
  const [localMessage, setLocalMessage] = useState("");

  const clearRevealedKey = sync.clearRevealedKey;
  useEffect(() => () => clearRevealedKey(), [clearRevealedKey]);

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
      <Container>
        <div className="welcome-page">
          <GlassCard className="welcome-card" hover={false}>
            <div className="welcome-icon" aria-hidden="true">
              <FaShieldAlt />
            </div>

            <div className="welcome-content">
              <span className="welcome-eyebrow">{greeting}</span>
              <h1>Bem-vindo ao Abrigo</h1>
              <p>
                Um espaço digital de acolhimento, reflexão e motivação leve.
                Você pode entrar sem configurar nada além do seu nome.
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

            {step === "intro" && (
              <div className="welcome-paths" aria-label="Começar no Abrigo">
                <button
                  type="button"
                  className="welcome-path welcome-path--primary"
                  onClick={startLocalOnly}
                  disabled={sync.busy}
                >
                  <FaMobileAlt aria-hidden="true" />
                  <span>
                    <strong>Entrar no meu Abrigo</strong>
                    <small>Comece neste dispositivo, no seu tempo.</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="welcome-path"
                  onClick={() => setStep("data")}
                  disabled={sync.busy}
                >
                  <FaKey aria-hidden="true" />
                  <span>
                    <strong>Já usa o Abrigo? Recuperar meus dados</strong>
                    <small>Use sua Chave do Abrigo ou prepare a sincronização se quiser.</small>
                  </span>
                </button>
              </div>
            )}

            {step === "data" && (
              <div className="welcome-paths" aria-label="Dados e sincronização opcionais">
                <div className="welcome-content">
                  <h2>Dados e sincronização</h2>
                  <p>Esta parte é opcional. Você pode voltar e usar o Abrigo somente neste dispositivo.</p>
                </div>
                <button
                  type="button"
                  className="welcome-path"
                  onClick={() => setStep("restore")}
                  disabled={sync.busy}
                >
                  <FaKey aria-hidden="true" />
                  <span>
                    <strong>Restaurar com minha Chave do Abrigo</strong>
                    <small>Traga de volta um Abrigo que já foi sincronizado.</small>
                  </span>
                </button>
                <button type="button" className="welcome-path"
                  onClick={() => void createSynchronizedAbrigo()} disabled={sync.busy}>
                  <FaCloud aria-hidden="true" />
                  <span><strong>Criar sincronização para este Abrigo</strong>
                    <small>Receba uma chave de recuperação para guardar em segurança.</small></span>
                </button>
                <button type="button" className="welcome-button welcome-button--secondary"
                  onClick={() => setStep("intro")} disabled={sync.busy}>Voltar</button>
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
                    Sua chave é usada com segurança neste dispositivo para localizar
                    seu Abrigo. O texto original não fica guardado aqui.
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
                      setStep("data");
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

            {step === "created" && (
              <RecoveryKeyPanel
                recoveryKey={sync.revealedKey}
                busy={sync.busy}
                onCopy={sync.copyRevealedKey}
                onDownload={sync.downloadRecoveryFile}
                onConfirm={() => void finishCreatedAbrigo()}
              />
            )}
          </GlassCard>
        </div>
      </Container>
    </>
  );
}

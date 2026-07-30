import "./Configuracoes.css";

import {
  FaUser,
  FaPalette,
  FaMusic,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";

import Container from "../../shared/ui/Container";
import Section from "../../shared/ui/Section";
import GlassCard from "../../shared/ui/GlassCard";

import { useTheme } from "../../shared/contexts/ThemeContext";
import { useUser } from "../../shared/contexts/UserContext";
import { storage } from "../../core/storage/storage";
import SyncSettings from "./components/SyncSettings";
import PrivacyToggle from "../../shared/componentes/PrivacyToggle";
import AnalyticsSettings from "./components/AnalyticsSettings";

export default function Configuracoes() {
  const { greeting } = useTheme();

  const {
    name,
    updateUser,
    clearUser,
  } = useUser();

  function alterarNome() {
    const novoNome = prompt(
      "Como você gostaria de ser chamado?",
      name
    );

    if (!novoNome) return;

    if (!novoNome.trim()) return;

    updateUser({
      name: novoNome.trim(),
    });
  }

  function redefinirAbrigo() {
    const confirmar = window.confirm(
      "Deseja realmente apagar todos os dados do Abrigo?"
    );

    if (!confirmar) return;

    // Remove o usuário
    clearUser();

    // Remove todos os outros dados do Abrigo
    storage.removeMany([
      "abrigo_streak",
      "abrigo_statistics",
      "abrigo_moods",
      "abrigo_achievements",
    ]);

    // Recarrega o app
    window.location.replace("/");
  }

  return (
    <>
      <Ceu />

      <Navbar />

      <Container>
        <main className="configuracoes-page">
          <PageHeader
            greeting={greeting}
            title="Configurações"
            subtitle="Personalize sua experiência no Abrigo."
          />

          <Section
            title="Sincronização"
            subtitle="Proteja e leve seu Abrigo para outros dispositivos quando quiser."
          >
            <SyncSettings />
          </Section>

          <Section layout="grid">
            <GlassCard className="config-card">
              <h3>🕶️ Privacidade visual</h3>
              <p>Oculta rapidamente textos pessoais na tela. Não substitui o bloqueio do dispositivo e não impede capturas de tela.</p>
              <PrivacyToggle />
            </GlassCard>
            <GlassCard className="config-card">
              <AnalyticsSettings />
            </GlassCard>
            <GlassCard className="config-card">
              <h3>
                <FaUser />
                Perfil
              </h3>

              <p>
                <strong>Nome:</strong> {name || "Visitante"}
              </p>

              <button
                className="config-button"
                onClick={alterarNome}
              >
                Alterar nome
              </button>
            </GlassCard>

            <GlassCard className="config-card">
              <h3>
                <FaPalette />
                Aparência
              </h3>

              <p>
                O tema muda automaticamente conforme o período do dia.
              </p>
            </GlassCard>

            <GlassCard className="config-card">
              <h3>
                <FaMusic />
                Música
              </h3>

              <p>
                Em breve você poderá controlar músicas,
                sons ambientes e volume.
              </p>
            </GlassCard>

            <GlassCard className="config-card">
              <h3>
                <FaInfoCircle />
                Aplicativo
              </h3>

              <p>
                <strong>Versão:</strong> Abrigo 2.0
              </p>
            </GlassCard>

            <GlassCard className="config-card">
              <h3>
                <FaTrashAlt />
                Dados
              </h3>

              <p>
                Apaga seu perfil e reinicia o Abrigo como
                se fosse o primeiro acesso.
              </p>

              <button
                className="config-button danger"
                onClick={redefinirAbrigo}
              >
                Redefinir Abrigo
              </button>
            </GlassCard>
          </Section>
        </main>
      </Container>
    </>
  );
}

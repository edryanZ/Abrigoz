import "./Configuracoes.css";

import {
  FaUser,
  FaPalette,
  FaMusic,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";

import Ceu from "../../components/Ceu";
import Navbar from "../../components/Navbar";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import GlassCard from "../../components/GlassCard";

import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

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
    localStorage.removeItem("abrigo_streak");
    localStorage.removeItem("abrigo_statistics");
    localStorage.removeItem("abrigo_moods");
    localStorage.removeItem("abrigo_achievements");

    // Recarrega o app
    window.location.replace("/");
  }

  return (
    <>
      <Ceu />

      <Navbar />

      <Container>
        <PageHeader
          greeting={greeting}
          title="Configurações"
          subtitle="Personalize sua experiência no Abrigo."
        />

        <Section>
          <GlassCard>
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

          <GlassCard>
            <h3>
              <FaPalette />
              Aparência
            </h3>

            <p>
              O tema muda automaticamente conforme o período do dia.
            </p>
          </GlassCard>

          <GlassCard>
            <h3>
              <FaMusic />
              Música
            </h3>

            <p>
              Em breve você poderá controlar músicas,
              sons ambientes e volume.
            </p>
          </GlassCard>

          <GlassCard>
            <h3>
              <FaInfoCircle />
              Aplicativo
            </h3>

            <p>
              <strong>Versão:</strong> Abrigo 2.0
            </p>
          </GlassCard>

          <GlassCard>
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
      </Container>
    </>
  );
}
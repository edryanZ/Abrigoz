import "./Calendario.css";

import { useTheme } from "../context/ThemeContext";

import Ceu from "../components/Ceu";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import Divider from "../components/Divider";
import GlassCard from "../components/GlassCard";
import CalendarioGrid from "../components/CalendarioGrid";

export default function Calendario() {
  const { greeting } = useTheme();

  return (
    <>
      <Ceu />

      <Navbar />

      <Container>
        <PageHeader
          greeting={`${greeting} 📅`}
          title="Momentos Especiais"
          subtitle="Explore datas importantes, mensagens, músicas, cartas e lembranças guardadas no Abrigo."
        />

        <Section>
          <GlassCard className="calendario-card">
            <CalendarioGrid />
          </GlassCard>
        </Section>

        <Divider />

        <footer className="page-footer">
          <p>✨ Abrigo 2.0 • Cada data guarda uma lembrança.</p>
        </footer>
      </Container>
    </>
  );
}
import "./Calendario.css";

import { useTheme } from "../../shared/contexts/ThemeContext";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";

import Container from "../../shared/ui/Container";
import Section from "../../shared/ui/Section";
import Divider from "../../shared/ui/Divider";
import GlassCard from "../../shared/ui/GlassCard";

import CalendarioGrid from "./components/CalendarioGrid";

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
import "./Lar.css";

import { useTheme } from "../../shared/contexts/ThemeContext";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";

import Container from "../../shared/ui/Container";
import PageHeader from "../../shared/componentes/PageHeader";
import Section from "../../shared/ui/Section";
import Divider from "../../shared/ui/Divider";

import FraseDoDia from "../../shared/componentes/FraseDoDia";

import Welcome from "./components/Welcome";
import MoodSelector from "./components/MoodSelector";
import DailyLetter from "./components/DailyLetter";
import StreakCard from "./components/StreakCard";
export default function Lar() {
  const { greeting } = useTheme();

  return (
    <>
      <Ceu />

      <Navbar />

      <Container>
        <PageHeader
          greeting={greeting}
          title="Bem-vindo ao Abrigo"
          subtitle="Um lugar para desacelerar, guardar lembranças e encontrar um pouco de paz."
        />

        <Section>
          <Welcome />
        </Section>

        <Section>
          <MoodSelector />
        </Section>

        <Section>
          <DailyLetter />
        </Section>

        <Section
          title="Frase do Dia"
          subtitle="Uma pequena mensagem para acompanhar você hoje."
        >
          <FraseDoDia />
        </Section>

        <Divider />

        <Section
          title="Sua Jornada"
          subtitle="Cada visita deixa uma pequena marca no seu Abrigo."
        >
          <StreakCard />
        </Section>

        <footer className="page-footer">
          <p>✨ Abrigo 2.0 • Feito para acolher.</p>
        </footer>
      </Container>
    </>
  );
}
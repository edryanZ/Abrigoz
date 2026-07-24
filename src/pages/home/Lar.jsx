import "./Lar.css";

import { useTheme } from "../../context/ThemeContext";

import Ceu from "../../components/Ceu";
import Navbar from "../../components/Navbar";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import Divider from "../../components/Divider";
import FraseDoDia from "../../components/FraseDoDia";

import WelcomeCard from "./Welcome";
import MoodSelector from "./MoodSelector";
import DailyLetter from "./DailyLetter";
import StreakCard from "./StreakCard";

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
          <WelcomeCard />
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
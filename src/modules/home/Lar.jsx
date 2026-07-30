import "./Lar.css";

import { useTheme } from "../../shared/contexts/ThemeContext";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";

import Container from "../../shared/ui/Container";
import PageHeader from "../../shared/componentes/PageHeader";
import Section from "../../shared/ui/Section";
import Divider from "../../shared/ui/Divider";

import FraseDoDia from "../../shared/componentes/FraseDoDia";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";

import MoodSelector from "./components/MoodSelector";
import DailyLetter from "./components/DailyLetter";
import DashboardGrid from "./components/DashboardGrid";
import CompanionCard from "./components/CompanionCard";
import TodayCenter from "./components/TodayCenter";
import PrivacyToggle from "../../shared/componentes/PrivacyToggle";
import DashboardCustomizer from "./components/DashboardCustomizer";
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
        <PrivacyNotice compact />
        <PrivacyToggle compact />
        <DashboardCustomizer />

        <TodayCenter />

        <Section>
          <MoodSelector />
        </Section>

        <DashboardGrid />

        <Section>
          <CompanionCard />
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

        <footer className="page-footer">
          <p>✨ Abrigo 2.0 • Feito para acolher.</p>
        </footer>
      </Container>
    </>
  );
}

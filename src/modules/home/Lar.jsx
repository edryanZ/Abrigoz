import "./Lar.css";

import { useEffect, useState } from "react";
import { useTheme } from "../../shared/contexts/ThemeContext";

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
import { loadDashboardPreferences } from "../../core/intelligence/DashboardIntelligence";
import { APP } from "../../core/constants/app";
import { JourneyProvider } from "../../shared/contexts/JourneyContext";

function LarContent() {
  const { greeting } = useTheme();
  const [dashboard, setDashboard] = useState(loadDashboardPreferences);
  useEffect(() => {
    const update = (event) => setDashboard(event.detail);
    window.addEventListener("abrigo:dashboard-preferences", update);
    return () => window.removeEventListener("abrigo:dashboard-preferences", update);
  }, []);
  const visible = (id) => !dashboard.hidden.includes(id);
  const order = (id) => dashboard.order.indexOf(id);

  return (
    <>
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

        <div className="smart-dashboard">
          {visible("today") && <div style={{ order: order("today") }}><TodayCenter /></div>}

          <div style={{ order: order("today") }}>
            <Section><MoodSelector /></Section>
          </div>

          {visible("organization") && <div style={{ order: order("organization") }}>
            <DashboardGrid />
          </div>}

          {visible("companion") && <div style={{ order: order("companion") }}>
            <Section><CompanionCard /></Section>
          </div>}
        </div>

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
          <p>{APP.NAME} — criado por {APP.AUTHOR}</p>
        </footer>
      </Container>
    </>
  );
}

export default function Lar() {
  return <JourneyProvider><LarContent /></JourneyProvider>;
}

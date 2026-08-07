import "./Lar.css";

import { Link } from "react-router-dom";

import { getDailyCare, getDailyMoment, getDailyReflection } from "../../core/emotional/DailyEmotionalService";
import ROUTES from "../../core/constants/routes";
import { APP } from "../../core/constants/app";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";
import { JourneyProvider } from "../../shared/contexts/JourneyContext";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useUser } from "../../shared/contexts/UserContext";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import MoodSelector from "./components/MoodSelector";
import { usePersonalization } from "../../core/atmosphere/usePersonalization";
import MonthlyRitual from "../../shared/componentes/MonthlyRitual";

function LarContent() {
  const { greeting } = useTheme();
  const { name } = useUser();
  const personalization = usePersonalization();
  const moment = getDailyMoment();
  const care = getDailyCare();
  const reflection = getDailyReflection();

  return <>
    <Navbar />
    <Container>
      <PageHeader
        greeting={greeting}
        title={name ? `Que bom ter você aqui, ${name}.` : "Que bom ter você aqui."}
        subtitle="Seu espaço para respirar, guardar o que importa e seguir no seu ritmo."
      />
      <PrivacyNotice compact />

      <div className="home-emotional" aria-label="Seu Lar no Abrigo">
        {personalization.preferences.personalPhrase && <p className="home-personal-phrase">
          “{personalization.preferences.personalPhrase}”
        </p>}
        <MoodSelector />
        <MonthlyRitual />

        <div className="home-emotional__grid">
          <GlassCard className="home-gentle-card" hover={false}>
            <span className="home-gentle-card__eyebrow">Momento do Dia</span>
            <h2>{moment.message}</h2>
            <p>{moment.invitation}</p>
            <Link to={ROUTES.MOMENT}>Ficar um pouco com este momento</Link>
          </GlassCard>

          <GlassCard className="home-gentle-card" hover={false}>
            <span className="home-gentle-card__eyebrow">Um pequeno cuidado</span>
            <h2>{care.text}</h2>
            <p>Talvez caiba no seu dia. Se não couber, tudo bem também.</p>
            <Link to={ROUTES.HABITS}>Ver Pequenos Cuidados</Link>
          </GlassCard>

          {personalization.preferences.showReflectionsOnHome && personalization.preferences.introspectiveContent &&
          <GlassCard className="home-gentle-card home-gentle-card--wide" hover={false}>
            <span className="home-gentle-card__eyebrow">Uma pergunta para hoje</span>
            <h2>{reflection.question}</h2>
            <p>Você não precisa responder agora. A pergunta pode apenas acompanhar o seu dia.</p>
            <Link to={ROUTES.DIARY}>Ir para Reflexões</Link>
          </GlassCard>}
        </div>
      </div>

      <footer className="page-footer">
        <p>{APP.NAME} — criado por {APP.AUTHOR}</p>
      </footer>
    </Container>
  </>;
}

export default function Lar() {
  return <JourneyProvider><LarContent /></JourneyProvider>;
}

import "./MomentoDoDia.css";

import { useState } from "react";
import { FaHeart } from "react-icons/fa";

import { getDailyMoment } from "../../core/emotional/DailyEmotionalService";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

export default function MomentoDoDia() {
  const [carried, setCarried] = useState(false);
  const [moment] = useState(getDailyMoment);

  return <>
    <Navbar />
    <Container>
      <div className="daily-moment-page">
        <PageHeader title="Momento do Dia"
          subtitle="Uma palavra para encontrar você aqui, sem pedir nada em troca." />
        <GlassCard className="daily-moment-card" hover={false}>
          <span className="daily-moment-category">{moment.category}</span>
          <blockquote>“{moment.message}”</blockquote>
          <div className="daily-moment-invitation">
            <span>Um pequeno convite</span>
            <p>{moment.invitation}</p>
          </div>
          <button type="button" onClick={() => setCarried(true)} disabled={carried}>
            <FaHeart aria-hidden="true" /> {carried ? "Vai comigo hoje" : "Levar comigo"}
          </button>
        </GlassCard>
        <p className="daily-moment-note">Este momento fica igual durante o dia e muda amanhã.</p>
      </div>
    </Container>
  </>;
}

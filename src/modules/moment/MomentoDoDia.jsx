import "./MomentoDoDia.css";

import { useState } from "react";
import { FaHeart } from "react-icons/fa";

import { getDailyMoment, getSpontaneousCare } from "../../core/emotional/DailyEmotionalService";
import { saveWellbeingMoment } from "../../core/memory/WellbeingMemoryService";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import { downloadShareCard } from "../../core/sharing/ShareImageService";

export default function MomentoDoDia() {
  const [carried, setCarried] = useState(false);
  const [saved, setSaved] = useState(false);
  const [moment] = useState(getDailyMoment);
  const [spontaneousCare] = useState(getSpontaneousCare);
  const [shareMessage, setShareMessage] = useState("");

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
          <button type="button" className="secondary" disabled={saved} onClick={() => {
            saveWellbeingMoment({ title: moment.message, description: moment.invitation, source: "daily-moment" });
            setSaved(true);
          }}>{saved ? "Momento guardado" : "Guardar este momento"}</button>
          <button type="button" className="secondary" onClick={async () => {
            try {
              await downloadShareCard({ title: "Momento do Dia", text: moment.message }, { skyInspired: true });
              setShareMessage("Cartão criado no seu dispositivo.");
            } catch { setShareMessage("Não foi possível criar o cartão agora."); }
          }}>Compartilhar como imagem</button>
        </GlassCard>
        {shareMessage && <p role="status" className="daily-moment-note">{shareMessage}</p>}
        {spontaneousCare && <p className="daily-moment-care">Se couber agora: {spontaneousCare.text}</p>}
        <p className="daily-moment-note">Este momento fica igual durante o dia e muda amanhã.</p>
      </div>
    </Container>
  </>;
}

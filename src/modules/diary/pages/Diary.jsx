import "../styles/Diary.css";

import { useMemo, useState } from "react";

import { getDailyReflection } from "../../../core/emotional/DailyEmotionalService";
import { saveWellbeingMoment } from "../../../core/memory/WellbeingMemoryService";
import Navbar from "../../../shared/componentes/Navbar";
import PageHeader from "../../../shared/componentes/PageHeader";
import PrivacyNotice from "../../../shared/componentes/PrivacyNotice";
import Container from "../../../shared/ui/Container";
import GlassCard from "../../../shared/ui/GlassCard";
import DiarySearch from "../components/DiarySearch";
import DiaryTimeline from "../components/DiaryTimeline";
import useDiary from "../hooks/useDiary";

export default function Diary() {
  const diary = useDiary();
  const [reflection] = useState(getDailyReflection);
  const existing = useMemo(() => diary.entries.find((entry) =>
    entry.reflectionDate === reflection.dateKey), [diary.entries, reflection.dateKey]);
  const [answer, setAnswer] = useState(() => existing?.content ?? "");
  const [message, setMessage] = useState("");

  function saveReflection() {
    const content = answer.trim();
    if (!content) return;
    diary.save({
      ...(existing ?? {}),
      title: reflection.question,
      content: content.slice(0, 6000),
      reflectionDate: reflection.dateKey,
      promptId: reflection.id,
      mood: existing?.mood ?? "",
      tags: existing?.tags ?? [],
      favorite: existing?.favorite ?? false,
    });
    setMessage("Sua resposta ficou guardada no seu Abrigo.");
  }

  return <>
    <Navbar />
    <Container>
      <div className="diary-page reflections-page">
        <PageHeader title="Reflexões"
          subtitle="Uma pergunta por dia. Responder é sempre opcional." />
        <PrivacyNotice compact />
        <GlassCard className="reflection-today" hover={false}>
          <span>Para refletir hoje</span>
          <h2>{reflection.question}</h2>
          <label htmlFor="reflection-answer">Se quiser guardar uma resposta</label>
          <textarea id="reflection-answer" rows="5" maxLength="6000" value={answer}
            placeholder="Escreva somente se tiver vontade."
            onChange={(event) => { setAnswer(event.target.value); setMessage(""); }} />
          <div className="reflection-actions">
            <button type="button" disabled={!answer.trim()} onClick={saveReflection}>
              Guardar uma resposta
            </button>
            <button type="button" className="secondary" onClick={() => {
              setAnswer("");
              setMessage("Tudo bem. Nada foi guardado.");
            }}>Hoje não quero escrever</button>
            <button type="button" className="secondary" onClick={() => {
              saveWellbeingMoment({ title: reflection.question, source: "reflection" });
              setMessage("Este momento ficou em Coisas que fazem bem.");
            }}>Guardar este momento</button>
          </div>
          {message && <p role="status" className="reflection-message">{message}</p>}
        </GlassCard>

        <section className="reflection-history" aria-labelledby="reflection-history-title">
          <div><h2 id="reflection-history-title">O que já ficou guardado</h2>
            <p>Suas entradas antigas continuam aqui, do jeito que foram guardadas.</p></div>
          <DiarySearch value={diary.query} onChange={diary.setQuery} />
          <DiaryTimeline entries={diary.filtered} />
        </section>
      </div>
    </Container>
  </>;
}

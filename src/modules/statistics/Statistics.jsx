import "./Statistics.css";

import { useEffect, useMemo, useState } from "react";

import { readLocalData } from "../../core/intelligence/LocalDataSource";
import { subscribe } from "../../core/sync/EventBus";
import { SYNC_EVENT } from "../../core/sync/emitSync";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import { getGentleMemory, getSameDayMemory, hideGentleMemory, isMemoryHidden, loadMemoryPreferences } from "../../core/memory/MemoryService";
import { buildAbstractMemoryMap, buildSymbolicConstellation } from "../../core/memory/MemoryMapService";

function newest(items, fields) {
  return [...items].sort((a, b) => {
    const dateA = fields.map((field) => a?.[field]).find(Boolean) ?? "";
    const dateB = fields.map((field) => b?.[field]).find(Boolean) ?? "";
    return String(dateB).localeCompare(String(dateA));
  })[0] ?? null;
}

function buildRetrospective(data) {
  const reflection = newest(data.diary, ["updatedAt", "createdAt", "date", "data"]);
  const favorite = newest(data.favorites, ["updatedAt", "createdAt"]);
  const intention = newest(data.goals, ["updatedAt", "createdAt"]);
  const care = newest(data.habits, ["updatedAt", "createdAt", "startDate"]);
  const hasAnything = data.diary.length || data.favorites.length || data.goals.length
    || data.habits.length || data.calendar.length || data.moods.length;

  const memories = [
    reflection && { title: "Uma reflexão que ficou", text: reflection.title ?? reflection.titulo ?? "Uma resposta guardada no seu tempo." },
    favorite && { title: "Algo que faz bem", text: favorite.title ?? "Algo que você escolheu deixar por perto." },
    intention && { title: "Uma intenção presente", text: intention.title ?? "Uma intenção que fez parte da sua jornada." },
    care && { title: "Um cuidado que apareceu", text: care.name ?? "Um pequeno cuidado que você guardou." },
  ].filter(Boolean).slice(0, 3);

  const marks = [];
  if (data.diary.length) marks.push("Você guardou sua primeira reflexão.");
  if (data.favorites.length) marks.push("Você começou a reunir coisas que fazem bem.");
  if (data.goals.length) marks.push("Uma intenção encontrou espaço por aqui.");
  if (data.habits.length) marks.push("Você registrou um pequeno cuidado consigo.");
  if (data.calendar.length) marks.push("Seus dias também ganharam um lugar no Abrigo.");

  return { hasAnything: Boolean(hasAnything), memories, marks: marks.slice(-3) };
}

export default function Statistics() {
  const [data, setData] = useState(readLocalData);
  const [, setMemoryRevision] = useState(0);
  useEffect(() => subscribe(SYNC_EVENT, () => setData(readLocalData())), []);
  const retrospective = useMemo(() => buildRetrospective(data), [data]);
  const gentleMemory = getGentleMemory(new Date(), data);
  const sameDayMemory = getSameDayMemory(new Date(), data);
  const memoriesEnabled = loadMemoryPreferences().enabled;
  const memoryMap = useMemo(() => memoriesEnabled
    ? buildAbstractMemoryMap(data).filter((marker) => !isMemoryHidden(marker.id)) : [], [data, memoriesEnabled]);
  const constellation = useMemo(() => memoriesEnabled && memoryMap.length
    ? buildSymbolicConstellation(data) : [], [data, memoriesEnabled, memoryMap]);

  return <>
    <Navbar />
    <Container>
      <PageHeader
        title="Retrospectiva"
        subtitle="Um olhar para o que fez parte do seu caminho — sem notas, metas de desempenho ou comparações."
      />
      <div className="retrospective-page">
        {gentleMemory && <GlassCard className="retrospective-memory" hover={false}>
          <span>Uma lembrança que reapareceu</span><h2>{gentleMemory.title}</h2>
          {gentleMemory.text && <p>{gentleMemory.text}</p>}
          <button type="button" onClick={() => {
            hideGentleMemory(gentleMemory.id); setMemoryRevision((value) => value + 1);
          }}>Não mostrar isso novamente</button>
        </GlassCard>}
        {sameDayMemory && sameDayMemory.id !== gentleMemory?.id && <GlassCard className="retrospective-memory" hover={false}>
          <span>Este dia, outro ano</span><h2>{sameDayMemory.title}</h2>
          {sameDayMemory.text && <p>{sameDayMemory.text}</p>}
          <button type="button" onClick={() => {
            hideGentleMemory(sameDayMemory.id); setMemoryRevision((value) => value + 1);
          }}>Não mostrar isso novamente</button>
        </GlassCard>}
        {!retrospective.hasAnything ? <GlassCard className="retrospective-empty" hover={false}>
          <h2>Seu caminho pode começar pequeno</h2>
          <p>Quando você guardar uma reflexão, uma intenção ou algo que faz bem, algumas lembranças poderão reaparecer aqui com delicadeza.</p>
        </GlassCard> : <>
          {retrospective.memories.length > 0 ? <section aria-labelledby="retrospective-memories">
            <h2 id="retrospective-memories">Coisas que passaram por aqui</h2>
            <div className="retrospective-grid">
              {retrospective.memories.map((item) => <GlassCard key={`${item.title}:${item.text}`} hover={false}>
                <span>Da sua jornada</span><h3>{item.title}</h3><p>{item.text}</p>
              </GlassCard>)}
            </div>
          </section> : <GlassCard className="retrospective-empty" hover={false}>
            <h2>A retrospectiva vai ganhando forma aos poucos</h2>
            <p>Ainda não há muita coisa por aqui. Com o tempo, pequenos momentos podem aparecer nesta retrospectiva.</p>
          </GlassCard>}

          {retrospective.marks.length > 0 && <GlassCard className="retrospective-marks" hover={false}>
            <h2>Marcos</h2>
            <p>Não são conquistas para cumprir. São apenas sinais de coisas que, em algum momento, encontraram espaço no Abrigo.</p>
            <ul>{retrospective.marks.map((mark) => <li key={mark}>{mark}</li>)}</ul>
          </GlassCard>}
          {memoryMap.length > 0 && <section aria-labelledby="memory-map-title">
            <h2 id="memory-map-title">Mapa de memórias</h2>
            <GlassCard className="memory-map" hover={false}>
              <p>Um mapa abstrato, sem localização e sem medir seu caminho. Toque nos pontos para reconhecer o tipo e a data.</p>
              <div className="memory-map__field" role="group" aria-label="Pontos abstratos de memórias">
                {memoryMap.map((marker) => <button key={marker.id} type="button"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  aria-label={`${marker.type}, ${marker.date}`} title={`${marker.type} · ${marker.date}`} />)}
              </div>
            </GlassCard>
          </section>}
          {constellation.length > 0 && <section aria-labelledby="memory-constellation-title">
            <h2 id="memory-constellation-title">Constelação de memórias</h2>
            <GlassCard className="memory-constellation" hover={false}>
              <p>Uma paisagem simbólica inspirada no céu do Abrigo. As estrelas não contam memórias, pontos ou conquistas.</p>
              <div className="memory-constellation__sky" aria-hidden="true">
                {constellation.map((star) => <i key={star.id} style={{ left: `${star.x}%`, top: `${star.y}%` }} />)}
              </div>
            </GlassCard>
          </section>}
        </>}
      </div>
    </Container>
  </>;
}

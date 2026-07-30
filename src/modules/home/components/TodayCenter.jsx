import { useState } from "react";
import { Link } from "react-router-dom";

import {
  getLocalSummary,
  getMemories,
  getTodayOverview,
  hideMemory,
} from "../../../core/intelligence/DashboardIntelligence";
import usePrivacyMode from "../../../core/privacy/usePrivacyMode";
import GlassCard from "../../../shared/ui/GlassCard";

export default function TodayCenter() {
  const [today] = useState(getTodayOverview);
  const [summary] = useState(() => getLocalSummary("week"));
  const [memories, setMemories] = useState(getMemories);
  const { enabled: privacy } = usePrivacyMode();
  const hide = (id) => {
    hideMemory(id);
    setMemories((items) => items.filter((item) => item.id !== id));
  };
  return (
    <section className="today-center" aria-labelledby="today-title">
      <GlassCard className="today-center__hero">
        <p className="dashboard-card__eyebrow">Hoje no Abrigo</p>
        <h2 id="today-title">{today.greeting}</h2>
        <div className="today-center__counts">
          <span>{today.events.length} evento(s)</span>
          <span>{today.habitsCompleted} de {today.habits.length} hábito(s)</span>
          <span>{today.priorityGoals.length} meta(s) em destaque</span>
        </div>
        {today.nextEvent && <p>{privacy
          ? "Próximo: Evento privado"
          : `Próximo: ${today.nextEvent.title}${today.nextEvent.time ? ` às ${today.nextEvent.time}` : ""}`}</p>}
        <div className="quick-actions" aria-label="Ações rápidas">
          <Link to="/diario">Escrever</Link><Link to="/calendario">Novo evento</Link>
          <Link to="/favoritos">Favorito</Link><Link to="/metas">Meta</Link>
          <Link to="/habitos">Hábito</Link><Link to="/pesquisa">Pesquisar</Link>
        </div>
      </GlassCard>
      <GlassCard>
        <p className="dashboard-card__eyebrow">Resumo semanal</p>
        <h2>Seu ritmo recente</h2>
        <p>{summary.message}</p>
        <ul><li>{summary.habitsCompleted} hábitos concluídos</li>
          <li>{summary.goalsCompleted} metas concluídas</li>
          <li>{summary.diaryDays} dias com Diário</li></ul>
        <Link to="/estatisticas">Ver estatísticas</Link>
      </GlassCard>
      <GlassCard>
        <p className="dashboard-card__eyebrow">Memórias deste dia</p>
        <h2>Algo guardado nesta data</h2>
        {memories.length ? <ul>{memories.map((memory) => <li key={memory.id}>
          <span>{privacy ? "Memória protegida" : memory.title} · {memory.date}</span>
          <button type="button" onClick={() => hide(memory.id)}>Ocultar</button>
        </li>)}</ul> : <p>Nenhuma memória antiga para hoje — e tudo bem.</p>}
      </GlassCard>
    </section>
  );
}

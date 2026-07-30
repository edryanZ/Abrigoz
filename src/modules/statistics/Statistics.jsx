import "./Statistics.css";

import { useEffect, useMemo, useState } from "react";

import { readLocalData } from "../../core/intelligence/LocalDataSource";
import { buildMomentMap, calculateStatistics } from "../../core/intelligence/StatisticsEngine";
import { resolvePeriod } from "../../core/intelligence/localDates";
import { subscribe } from "../../core/sync/EventBus";
import { SYNC_EVENT } from "../../core/sync/emitSync";
import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import ActivityMap from "./components/ActivityMap";

const PERIODS = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  month: "Mês atual",
  year: "Ano atual",
  all: "Todo o período",
};

export default function Statistics() {
  const [periodKind, setPeriodKind] = useState("30d");
  const [data, setData] = useState(readLocalData);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mapModule, setMapModule] = useState("all");

  useEffect(() => subscribe(SYNC_EVENT, () => setData(readLocalData())), []);
  const period = useMemo(() => resolvePeriod(periodKind), [periodKind]);
  const stats = useMemo(() => calculateStatistics(data, period), [data, period]);
  const moments = useMemo(() => buildMomentMap(data, year, mapModule), [data, year, mapModule]);

  return (
    <>
      <Ceu />
      <Navbar />
      <Container>
        <PageHeader title="Estatísticas" subtitle="Um olhar gentil para a sua própria jornada." />
        <main className="statistics-page">
          <label className="statistics-period">
            Período
            <select value={periodKind} onChange={(event) => setPeriodKind(event.target.value)}>
              {Object.entries(PERIODS).map(([value, label]) =>
                <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <section className="statistics-grid" aria-label="Resumo do período">
            <GlassCard><span>Dias ativos</span><strong>{stats.general.activeDays}</strong>
              <small>Dias com alguma atividade registrada.</small></GlassCard>
            <GlassCard><span>Hábitos</span><strong>{stats.habits.rate}%</strong>
              <small>{stats.habits.completed} de {stats.habits.planned} previstos.</small></GlassCard>
            <GlassCard><span>Metas</span><strong>{stats.goals.averageProgress}%</strong>
              <small>Média simples do progresso das metas.</small></GlassCard>
            <GlassCard><span>Calendário</span><strong>{stats.calendar.total}</strong>
              <small>Eventos iniciados no período escolhido.</small></GlassCard>
            <GlassCard><span>Diário</span><strong>{stats.diary.days}</strong>
              <small>Dias diferentes com registros.</small></GlassCard>
            <GlassCard><span>Favoritos</span><strong>{stats.favorites.added}</strong>
              <small>Itens guardados neste período.</small></GlassCard>
          </section>

          <GlassCard className="statistics-comparison">
            <h2>Comparação com seu período anterior</h2>
            {stats.general.comparison === null
              ? <p>Quando houver pelo menos três dias ativos em cada período, mostramos uma comparação cuidadosa.</p>
              : <p>Foram {Math.abs(stats.general.comparison)} dia(s) ativo(s) {
                stats.general.comparison >= 0 ? "a mais" : "a menos"} que no período anterior. Descanso também faz parte.</p>}
          </GlassCard>

          <ActivityMap moments={moments} year={year} setYear={setYear}
            module={mapModule} setModule={setMapModule} />
        </main>
      </Container>
    </>
  );
}
